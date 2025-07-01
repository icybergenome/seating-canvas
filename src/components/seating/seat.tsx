'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { useVenueStore } from '@/store/venue-store';
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';
import type { Seat as SeatType, Section, Row } from '@/types/venue';

interface SeatProps {
  seat: SeatType;
  section: Section;
  row: Row;
  heatMapMode?: boolean;
  onSeatClick?: (seat: SeatType, section: Section, row: Row) => void;
}

export const Seat = memo(function Seat({
  seat,
  section,
  row,
  heatMapMode = false,
  onSeatClick,
}: SeatProps) {
  const { 
    isSeatSelected, 
    selectSeat, 
    deselectSeat, 
    focusedSeat, 
    setFocusedSeat 
  } = useVenueStore();
  
  const { setFocusedSeat: setKeyboardFocus } = useKeyboardNavigation();
  
  const isSelected = isSeatSelected(seat.id);
  const isFocused = focusedSeat === seat.id;
  const isAvailable = seat.status === 'available';
  const isInteractive = isAvailable || isSelected;

  const handleClick = () => {
    if (!isInteractive) return;
    
    if (isSelected) {
      deselectSeat(seat.id);
    } else {
      selectSeat(seat, section, row);
    }
    
    onSeatClick?.(seat, section, row);
  };

  const handleFocus = () => {
    setFocusedSeat(seat.id);
    setKeyboardFocus(seat.id);
  };

  const handleMouseEnter = () => {
    if (isInteractive) {
      setFocusedSeat(seat.id);
    }
  };

  const getSeatColor = () => {
    if (isSelected) return 'var(--seat-selected)';
    if (heatMapMode) return `var(--price-tier-${seat.priceTier})`;
    
    switch (seat.status) {
      case 'available':
        return 'var(--seat-available)';
      case 'reserved':
        return 'var(--seat-reserved)';
      case 'sold':
        return 'var(--seat-sold)';
      case 'held':
        return 'var(--seat-held)';
      default:
        return 'var(--seat-available)';
    }
  };

  const getAriaLabel = () => {
    const sectionName = section.label;
    const rowNumber = row.index;
    const seatNumber = seat.col;
    const status = isSelected ? 'selected' : seat.status;
    
    return `Seat ${seatNumber}, Row ${rowNumber}, ${sectionName}, ${status}`;
  };

  return (
    <button
      className={cn(
        'seat-focus-ring',
        'absolute w-3 h-3 rounded-sm border transition-all duration-200',
        'hover:scale-110 focus:scale-110',
        {
          'cursor-pointer': isInteractive,
          'cursor-not-allowed opacity-60': !isInteractive,
          'ring-2 ring-white ring-offset-2 ring-offset-blue-500': isFocused,
          'border-white border-2': isSelected,
          'border-gray-400': !isSelected,
        }
      )}
      style={{
        left: `${seat.x + section.transform.x}px`,
        top: `${seat.y + section.transform.y}px`,
        backgroundColor: getSeatColor(),
        transform: `scale(${section.transform.scale})`,
      }}
      onClick={handleClick}
      onFocus={handleFocus}
      onMouseEnter={handleMouseEnter}
      disabled={!isInteractive}
      aria-label={getAriaLabel()}
      aria-pressed={isSelected}
      tabIndex={isInteractive ? 0 : -1}
      data-seat-id={seat.id}
      data-testid={`seat-${seat.id}`}
    />
  );
});
