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
  pan: { x: number; y: number };
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
  pan,
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

    // Convert canvas coordinates to world coordinates
    const worldX = (canvasX - pan.x) / zoom;
    const worldY = (canvasY - pan.y) / zoom;

    // Find seat at position
    for (const seatInfo of seatData.current) {
      const seatLeft = seatInfo.x - SEAT_SIZE / 2;
      const seatTop = seatInfo.y - SEAT_SIZE / 2;
      const seatRight = seatLeft + SEAT_SIZE;
      const seatBottom = seatTop + SEAT_SIZE;

      if (worldX >= seatLeft && worldX <= seatRight && 
          worldY >= seatTop && worldY <= seatBottom) {
        return seatInfo;
      }
    }
    return null;
  }, [pan, zoom, SEAT_SIZE]);

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

  // Optimized rendering function with frustum culling for 15,000+ seats
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up transformation matrix
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Frustum culling - only render visible seats for better performance
    const viewportBounds = {
      left: -pan.x / zoom - CANVAS_CONFIG.CULLING_BUFFER,
      top: -pan.y / zoom - CANVAS_CONFIG.CULLING_BUFFER,
      right: (-pan.x + canvas.width) / zoom + CANVAS_CONFIG.CULLING_BUFFER,
      bottom: (-pan.y + canvas.height) / zoom + CANVAS_CONFIG.CULLING_BUFFER,
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
      
      // Level-of-detail rendering based on zoom and seat count
      const seatCount = seats.length;
      
      // At very low zoom or high seat count, use optimized rendering
      if (zoom < VIEWPORT_CONFIG.LOD_ZOOM_THRESHOLD_ULTRA || seatCount > CANVAS_CONFIG.LOD_ULTRA_THRESHOLD) {
        // Ultra-low detail: single pixel points
        seats.forEach(seatInfo => {
          ctx.fillRect(seatInfo.x, seatInfo.y, 2, 2);
        });
      } else if (zoom < VIEWPORT_CONFIG.LOD_ZOOM_THRESHOLD_LOW || seatCount > CANVAS_CONFIG.LOD_LOW_THRESHOLD) {
        // Low detail: simple rectangles
        seats.forEach(seatInfo => {
          const x = seatInfo.x - SEAT_SIZE / 2;
          const y = seatInfo.y - SEAT_SIZE / 2;
          ctx.fillRect(x, y, SEAT_SIZE, SEAT_SIZE);
        });
      } else {
        // High detail: rounded rectangles with proper size
        ctx.beginPath();
        seats.forEach(seatInfo => {
          const x = seatInfo.x - SEAT_SIZE / 2;
          const y = seatInfo.y - SEAT_SIZE / 2;
          ctx.roundRect(x, y, SEAT_SIZE, SEAT_SIZE, 2);
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
        const x = focusedSeatInfo.x - SEAT_SIZE / 2 - 2;
        const y = focusedSeatInfo.y - SEAT_SIZE / 2 - 2;
        if (zoom > VIEWPORT_CONFIG.LOD_ZOOM_THRESHOLD_LOW) {
          ctx.roundRect(x, y, SEAT_SIZE + 4, SEAT_SIZE + 4, 4);
        } else {
          ctx.rect(x, y, SEAT_SIZE + 4, SEAT_SIZE + 4);
        }
        ctx.stroke();
      }
    }

    ctx.restore();
  }, [pan, zoom, heatMapMode, isSeatSelected, focusedSeat, SEAT_SIZE]);

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
      className="w-full h-full"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onClick={handleCanvasClick}
    />
  );
}
