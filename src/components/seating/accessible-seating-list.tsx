'use client';

import { useRef, useEffect, useState } from 'react';
import { useVenueStore } from '@/store/venue-store';
import type { Seat as SeatType, Section, Row } from '@/types/venue';

interface AccessibleSeatingListProps {
  seats: Array<{
    seat: SeatType;
    section: Section;
    row: Row;
  }>;
  onSeatClick: (seat: SeatType, section: Section, row: Row) => void;
}

export function AccessibleSeatingList({ seats, onSeatClick }: AccessibleSeatingListProps) {
  const { isSeatSelected, focusedSeat, setFocusedSeat } = useVenueStore();
  const listRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });

  // Virtual scrolling for performance with large seat lists
  const ITEM_HEIGHT = 40;
  const VISIBLE_ITEMS = 20;

  useEffect(() => {
    const container = listRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const start = Math.floor(scrollTop / ITEM_HEIGHT);
      const end = Math.min(start + VISIBLE_ITEMS, seats.length);
      setVisibleRange({ start, end });
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [seats.length]);

  const visibleSeats = seats.slice(visibleRange.start, visibleRange.end);
  const totalHeight = seats.length * ITEM_HEIGHT;
  const offsetY = visibleRange.start * ITEM_HEIGHT;

  return (
    <div className="sr-only" aria-label="Accessible seating list">
      <h3 className="text-lg font-semibold mb-4">Available Seats</h3>
      <div 
        ref={listRef}
        className="h-80 overflow-auto border rounded"
        style={{ height: `${VISIBLE_ITEMS * ITEM_HEIGHT}px` }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleSeats.map(({ seat, section, row }) => {
              const isSelected = isSeatSelected(seat.id);
              const isFocused = focusedSeat === seat.id;
              
              return (
                <button
                  key={seat.id}
                  className={`w-full p-2 text-left border-b hover:bg-gray-100 focus:bg-blue-100 ${
                    isSelected ? 'bg-blue-200' : ''
                  } ${isFocused ? 'ring-2 ring-blue-500' : ''}`}
                  style={{ height: ITEM_HEIGHT }}
                  onClick={() => onSeatClick(seat, section, row)}
                  onFocus={() => setFocusedSeat(seat.id)}
                  aria-pressed={isSelected}
                  aria-label={`Seat ${seat.col}, Row ${row.index}, ${section.label}, ${seat.status}`}
                >
                  <div className="text-sm font-medium">
                    {section.label} - Row {row.index}, Seat {seat.col}
                  </div>
                  <div className="text-xs text-gray-600">
                    Status: {seat.status} | Price Tier: {seat.priceTier}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
