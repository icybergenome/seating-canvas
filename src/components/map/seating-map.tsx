'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { useVenueStore } from '@/store/venue-store';
import { useVenueData, type VenueType } from '@/hooks/use-venue-data';
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { Seat } from '../seating/seat';
import { CanvasSeatingMap } from './canvas-seating-map';
import { SeatingMapHeader } from './seating-map-header';
import { SeatingMapSidebar } from './seating-map-sidebar';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ErrorMessage } from '../ui/error-message';
import { PerformanceMonitor } from '../monitoring/performance-monitor';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { VIEWPORT_CONFIG, CANVAS_CONFIG } from '@/lib/constants';
import type { Seat as SeatType, Section, Row } from '@/types/venue';

/**
 * Main seating map component with responsive design and performance optimizations
 * Features canvas rendering for large venues, mobile bottom sheet, and desktop sidebar
 * @author Bilal S.
 */
export function SeatingMap() {
  const [venueType, setVenueType] = useState<VenueType>('default');
  const { venue, isLoading, error } = useVenueData(venueType);
  const { heatMapMode, focusedSeat, setFocusedSeat } = useVenueStore();
  const isMobile = useMobileDetection(); // Use the custom hook
  useKeyboardNavigation(); // Initialize keyboard navigation
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedSeatDetails, setSelectedSeatDetails] = useState<{
    seat: SeatType;
    section: Section;
    row: Row;
  } | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  // Handle seat click for details
  const handleSeatClick = useCallback((seat: SeatType, section: Section, row: Row) => {
    setSelectedSeatDetails({ seat, section, row });
  }, []);

  // Handle closing the bottom sheet/sidebar
  const handleCloseSeatDetails = useCallback(() => {
    setSelectedSeatDetails(null);
    setFocusedSeat(null);
  }, [setFocusedSeat]);

  // Handle zoom
  const handleZoom = useCallback((delta: number) => {
    setZoom(prevZoom => {
      const newZoom = Math.max(VIEWPORT_CONFIG.MIN_ZOOM, Math.min(VIEWPORT_CONFIG.MAX_ZOOM, prevZoom + delta));
      return newZoom;
    });
  }, []);

  // Handle pan
  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    setPan(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -VIEWPORT_CONFIG.ZOOM_STEP : VIEWPORT_CONFIG.ZOOM_STEP;
    handleZoom(delta);
  }, [handleZoom]);

  // Mouse drag for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      handlePan(
        e.clientX - dragStart.x - pan.x,
        e.clientY - dragStart.y - pan.y
      );
    }
  }, [isDragging, dragStart, pan, handlePan]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
      setIsDragging(true);
    }
  }, [pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      handlePan(
        touch.clientX - dragStart.x - pan.x,
        touch.clientY - dragStart.y - pan.y
      );
    } else if (e.touches.length === 2) {
      // Pinch zoom logic would go here
      // For now, we'll keep it simple
    }
  }, [isDragging, dragStart, pan, handlePan]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Reset view
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '0':
            e.preventDefault();
            resetView();
            break;
          case '=':
          case '+':
            e.preventDefault();
            handleZoom(VIEWPORT_CONFIG.ZOOM_STEP_LARGE);
            break;
          case '-':
            e.preventDefault();
            handleZoom(-VIEWPORT_CONFIG.ZOOM_STEP_LARGE);
            break;
          case 'p':
            e.preventDefault();
            setShowPerformanceMonitor(prev => !prev);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleZoom, resetView]);

  // Add wheel event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!venue) {
    // Start of the app, loading false, error false, venue empty
    return <></>;
  }

  // Calculate total seats for performance indicators
  const totalSeats = venue.sections.reduce((total, section) => 
    total + section.rows.reduce((rowTotal, row) => 
      rowTotal + row.seats.length, 0), 0);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Performance Monitor - show for large venues or when manually toggled */}
      {(totalSeats > 1000 || showPerformanceMonitor) && (
        <PerformanceMonitor isVisible={showPerformanceMonitor || totalSeats > 1000} />
      )}
      {/* Header with controls */}
      <SeatingMapHeader
        venue={venue}
        zoom={zoom}
        onZoomIn={() => handleZoom(VIEWPORT_CONFIG.ZOOM_STEP_LARGE)}
        onZoomOut={() => handleZoom(-VIEWPORT_CONFIG.ZOOM_STEP_LARGE)}
        onResetView={resetView}
        venueType={venueType}
        onVenueTypeChange={setVenueType}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Seating map - full width on mobile, flex-1 on desktop */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={containerRef}
            className="seat-map-container w-full h-full overflow-auto relative bg-gray-100 dark:bg-gray-800"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div
              style={{
                width: venue.map.width,
                height: venue.map.height,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'top left',
                position: 'relative',
                margin: '50px',
              }}
            >
              {/* Use Canvas for large venues (15000+ seats), DOM for smaller ones */}
              {(() => {
                const totalSeats = venue.sections.reduce((total, section) => 
                  total + section.rows.reduce((rowTotal, row) => 
                    rowTotal + row.seats.length, 0), 0);
                
                if (totalSeats > CANVAS_CONFIG.CANVAS_THRESHOLD) {
                  return (
                    <CanvasSeatingMap
                      venue={venue}
                      heatMapMode={heatMapMode}
                      onSeatClick={handleSeatClick}
                      zoom={zoom}
                      pan={pan}
                      isDragging={isDragging}
                    />
                  );
                } else {
                  return venue.sections.map((section) =>
                    section.rows.map((row) =>
                      row.seats.map((seat) => (
                        <Seat
                          key={seat.id}
                          seat={seat}
                          section={section}
                          row={row}
                          heatMapMode={heatMapMode}
                          onSeatClick={handleSeatClick}
                        />
                      ))
                    )
                  );
                }
              })()}
            </div>
          </div>
        </div>

        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <SeatingMapSidebar
            selectedSeatDetails={selectedSeatDetails}
            focusedSeat={focusedSeat}
            onCloseSeatDetails={handleCloseSeatDetails}
          />
        </div>
      </div>

      {/* Mobile Sheet - only shown on mobile when there's selected seat details */}
      {isMobile && selectedSeatDetails && (
        <Sheet open={true} onOpenChange={(open) => !open && handleCloseSeatDetails()}>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>
                Seat Details
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-auto mt-4">
              <SeatingMapSidebar
                selectedSeatDetails={selectedSeatDetails}
                focusedSeat={focusedSeat}
                onCloseSeatDetails={handleCloseSeatDetails}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
