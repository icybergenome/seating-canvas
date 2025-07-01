'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useVenueStore } from '@/store/venue-store';
import { SEAT_COLORS, CANVAS_CONFIG, VIEWPORT_CONFIG } from '@/lib/constants';
import type { Seat as SeatType, Section, Row, Venue } from '@/types/venue';

interface CanvasSeatingMapProps {
  venue: Venue;
  heatMapMode: boolean;
  onSeatClick: (seat: SeatType, section: Section, row: Row) => void;
  zoom: number;
  isDragging: boolean;
}

/**
 * High-performance Canvas-based seating map component for large venues
 * Implements frustum culling and batch rendering for 60 FPS performance
 * @author Bilal S.
 */
export function CanvasSeatingMap({
  venue,
  heatMapMode,
  onSeatClick,
  zoom,
  isDragging
}: CanvasSeatingMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const { isSeatSelected, focusedSeat } = useVenueStore();

  // Seat rendering constants from centralized config
  const SEAT_SIZE = CANVAS_CONFIG.SEAT_SIZE;
  
  // Color palette for performance

  // Convert seat data to flat array for performance
  const seatData = useRef<Array<{
    id: string;
    x: number;
    y: number;
    status: string;
    priceTier: number;
    section: Section;
    row: Row;
    seat: SeatType;
  }>>([]);

  // Initialize seat data
  useEffect(() => {
    const seats: typeof seatData.current = [];
    venue.sections.forEach(section => {
      section.rows.forEach(row => {
        row.seats.forEach(seat => {
          seats.push({
            id: seat.id,
            x: seat.x + section.transform.x,
            y: seat.y + section.transform.y,
            status: seat.status,
            priceTier: seat.priceTier,
            section,
            row,
            seat,
          });
        });
      });
    });
    seatData.current = seats;
  }, [venue]);

  // Hit testing for click detection
  const getSeatAtPosition = useCallback((canvasX: number, canvasY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    // Since canvas is now inside the transformed container, coordinates are simpler
    const worldX = canvasX;
    const worldY = canvasY;

    // Calculate dynamic seat size for hit testing (same as rendering)
    const effectiveSeatSize = Math.max(SEAT_SIZE * zoom, 8); // Minimum 8px for easier clicking
    
    // Use the same sizing logic as rendering for consistent hit testing
    let hitTestSize = effectiveSeatSize;
    if (zoom < VIEWPORT_CONFIG.LOD_ZOOM_THRESHOLD_ULTRA) {
      // Ultra-low detail: use minimum size but make it easier to click
      hitTestSize = Math.max(effectiveSeatSize * 0.6, 8);
    }

    // Find seat at position
    for (const seatInfo of seatData.current) {
      const seatLeft = seatInfo.x - hitTestSize / 2;
      const seatTop = seatInfo.y - hitTestSize / 2;
      const seatRight = seatLeft + hitTestSize;
      const seatBottom = seatTop + hitTestSize;

      if (worldX >= seatLeft && worldX <= seatRight && 
          worldY >= seatTop && worldY <= seatBottom) {
        return seatInfo;
      }
    }
    return null;
  }, [SEAT_SIZE, zoom]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    const seatInfo = getSeatAtPosition(canvasX, canvasY);
    if (seatInfo && (seatInfo.status === 'available' || isSeatSelected(seatInfo.id))) {
      onSeatClick(seatInfo.seat, seatInfo.section, seatInfo.row);
    }
  }, [getSeatAtPosition, onSeatClick, isSeatSelected]);

  // Handle canvas wheel events for zoom (prevent default to avoid page scroll)
  const handleCanvasWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Let the parent container handle zoom
  }, []);

  // Optimized rendering function with frustum culling for 15,000+ seats
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // No transformation needed since parent container handles pan/zoom
    ctx.save();

    // Simple viewport bounds for culling (canvas coordinates)
    const viewportBounds = {
      left: -CANVAS_CONFIG.CULLING_BUFFER,
      top: -CANVAS_CONFIG.CULLING_BUFFER,
      right: canvas.width + CANVAS_CONFIG.CULLING_BUFFER,
      bottom: canvas.height + CANVAS_CONFIG.CULLING_BUFFER,
    };

    // Filter visible seats for performance
    const visibleSeats = seatData.current.filter(seatInfo => {
      return seatInfo.x >= viewportBounds.left &&
             seatInfo.x <= viewportBounds.right &&
             seatInfo.y >= viewportBounds.top &&
             seatInfo.y <= viewportBounds.bottom;
    });

    // Batch rendering by color to minimize state changes
    const seatsByColor = new Map<string, typeof visibleSeats>();

    visibleSeats.forEach(seatInfo => {
      let color: string;
      
      if (isSeatSelected(seatInfo.id)) {
        color = SEAT_COLORS.selected;
      } else if (focusedSeat === seatInfo.id) {
        color = SEAT_COLORS.focused;
      } else if (heatMapMode) {
        color = SEAT_COLORS[`priceTier${seatInfo.priceTier}` as keyof typeof SEAT_COLORS];
      } else {
        color = SEAT_COLORS[seatInfo.status as keyof typeof SEAT_COLORS] || SEAT_COLORS.available;
      }

      if (!seatsByColor.has(color)) {
        seatsByColor.set(color, []);
      }
      seatsByColor.get(color)!.push(seatInfo);
    });

    // Use efficient rendering techniques for large numbers
    seatsByColor.forEach((seats, color) => {
      ctx.fillStyle = color;
      
      // Calculate dynamic seat size based on zoom level to maintain visibility
      const effectiveSeatSize = Math.max(SEAT_SIZE * zoom, 6); // Increased minimum to 6px for better visibility
      
      // At very low zoom, use smaller but still visible seats
      if (zoom < VIEWPORT_CONFIG.LOD_ZOOM_THRESHOLD_ULTRA) {
        // Ultra-low detail: small but visible rectangles (minimum 6x6px)
        const minSize = Math.max(effectiveSeatSize * 0.7, 6); // Increased minimum and ratio
        seats.forEach(seatInfo => {
          const x = seatInfo.x - minSize / 2;
          const y = seatInfo.y - minSize / 2;
          ctx.fillRect(x, y, minSize, minSize);
        });
      } else if (zoom < VIEWPORT_CONFIG.LOD_ZOOM_THRESHOLD_LOW) {
        // Low detail: simple rectangles with dynamic sizing
        seats.forEach(seatInfo => {
          const x = seatInfo.x - effectiveSeatSize / 2;
          const y = seatInfo.y - effectiveSeatSize / 2;
          ctx.fillRect(x, y, effectiveSeatSize, effectiveSeatSize);
        });
      } else {
        // High detail: rounded rectangles with proper size
        ctx.beginPath();
        seats.forEach(seatInfo => {
          const x = seatInfo.x - effectiveSeatSize / 2;
          const y = seatInfo.y - effectiveSeatSize / 2;
          ctx.roundRect(x, y, effectiveSeatSize, effectiveSeatSize, Math.max(2 * zoom, 1));
        });
        ctx.fill();
      }
    });

    // Draw focused seat outline only if visible
    if (focusedSeat) {
      const focusedSeatInfo = visibleSeats.find(s => s.id === focusedSeat);
      if (focusedSeatInfo) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2 / zoom, 1); // Maintain visibility at all zoom levels
        ctx.beginPath();
        
        // Use the same dynamic sizing as the seats
        const effectiveSeatSize = Math.max(SEAT_SIZE * zoom, 6);
        const outlineSize = zoom < VIEWPORT_CONFIG.LOD_ZOOM_THRESHOLD_ULTRA ? 
          Math.max(effectiveSeatSize * 0.7, 6) : effectiveSeatSize;
        
        const x = focusedSeatInfo.x - outlineSize / 2 - 2;
        const y = focusedSeatInfo.y - outlineSize / 2 - 2;
        
        if (zoom > VIEWPORT_CONFIG.LOD_ZOOM_THRESHOLD_LOW) {
          ctx.roundRect(x, y, outlineSize + 4, outlineSize + 4, Math.max(4 * zoom, 2));
        } else {
          ctx.rect(x, y, outlineSize + 4, outlineSize + 4);
        }
        ctx.stroke();
      }
    }

    ctx.restore();
  }, [heatMapMode, isSeatSelected, focusedSeat, zoom, SEAT_SIZE]);

  // Animation loop for smooth 60fps rendering
  useEffect(() => {
    const animate = () => {
      render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{ 
        cursor: isDragging ? 'grabbing' : 'grab',
        pointerEvents: 'auto' // Ensure canvas receives pointer events but doesn't block scrolling
      }}
      onClick={handleCanvasClick}
      onWheel={handleCanvasWheel}
    />
  );
}
