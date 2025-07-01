'use client';

import { SeatDetails } from '../seating/seat-details';
import { SeatSelection } from '../seating/seat-selection';
import type { Seat, Section, Row } from '@/types/venue';

interface SeatingMapSidebarProps {
  selectedSeatDetails: {
    seat: Seat;
    section: Section;
    row: Row;
  } | null;
  focusedSeat: string | null;
  onCloseSeatDetails: () => void;
}

export function SeatingMapSidebar({ 
  selectedSeatDetails, 
  focusedSeat, 
  onCloseSeatDetails 
}: SeatingMapSidebarProps) {
  return (
    <div className="w-full lg:w-80 bg-white dark:bg-gray-800 lg:border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Seat Selection Summary */}
      <div className="flex-shrink-0">
        <SeatSelection />
      </div>
      
      {/* Seat Details */}
      {selectedSeatDetails && (
        <div className="flex-1 overflow-auto max-h-[50vh] lg:max-h-none">
          <SeatDetails
            seat={selectedSeatDetails.seat}
            section={selectedSeatDetails.section}
            row={selectedSeatDetails.row}
            onClose={onCloseSeatDetails}
          />
        </div>
      )}
      
      {/* Focused seat info for keyboard navigation */}
      {focusedSeat && !selectedSeatDetails && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Focused: {focusedSeat}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Press Enter to select/deselect
          </p>
        </div>
      )}
    </div>
  );
}
