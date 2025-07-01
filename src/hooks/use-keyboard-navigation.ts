import { useEffect, useCallback } from 'react';
import { useVenueStore } from '@/store/venue-store';

/**
 * Custom hook for keyboard navigation within the seating map
 * Provides arrow key navigation, seat selection/deselection with Enter/Space,
 * and escape key to clear focus
 * @author Bilal S.
 */
export function useKeyboardNavigation() {
  const {
    venue,
    focusedSeat,
    setFocusedSeat,
    selectSeat,
    deselectSeat,
    isSeatSelected,
  } = useVenueStore();

  const findNextSeat = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      if (!venue || !focusedSeat) return null;

      // Find current seat position
      let currentSeat = null;
      let currentSection = null;
      let currentRow = null;

      for (const section of venue.sections) {
        for (const row of section.rows) {
          const seat = row.seats.find((s) => s.id === focusedSeat);
          if (seat) {
            currentSeat = seat;
            currentSection = section;
            currentRow = row;
            break;
          }
        }
        if (currentSeat) break;
      }

      if (!currentSeat || !currentSection || !currentRow) return null;

      switch (direction) {
        case 'left': {
          // Find seat to the left (previous column in same row)
          const prevSeat = currentRow.seats.find(
            (s) => s.col === currentSeat.col - 1
          );
          return prevSeat?.id || null;
        }
        case 'right': {
          // Find seat to the right (next column in same row)
          const nextSeat = currentRow.seats.find(
            (s) => s.col === currentSeat.col + 1
          );
          return nextSeat?.id || null;
        }
        case 'up': {
          // Find seat in previous row (same column)
          const prevRowIndex = currentRow.index - 1;
          const prevRow = currentSection.rows.find(
            (r) => r.index === prevRowIndex
          );
          const upSeat = prevRow?.seats.find(
            (s) => s.col === currentSeat.col
          );
          return upSeat?.id || null;
        }
        case 'down': {
          // Find seat in next row (same column)
          const nextRowIndex = currentRow.index + 1;
          const nextRow = currentSection.rows.find(
            (r) => r.index === nextRowIndex
          );
          const downSeat = nextRow?.seats.find(
            (s) => s.col === currentSeat.col
          );
          return downSeat?.id || null;
        }
        default:
          return null;
      }
    },
    [venue, focusedSeat]
  );

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!venue) return;

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          const upSeat = findNextSeat('up');
          if (upSeat) setFocusedSeat(upSeat);
          break;
        case 'ArrowDown':
          event.preventDefault();
          const downSeat = findNextSeat('down');
          if (downSeat) setFocusedSeat(downSeat);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          const leftSeat = findNextSeat('left');
          if (leftSeat) setFocusedSeat(leftSeat);
          break;
        case 'ArrowRight':
          event.preventDefault();
          const rightSeat = findNextSeat('right');
          if (rightSeat) setFocusedSeat(rightSeat);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedSeat) {
            // Find the seat data
            for (const section of venue.sections) {
              for (const row of section.rows) {
                const seat = row.seats.find((s) => s.id === focusedSeat);
                if (seat) {
                  if (isSeatSelected(seat.id)) {
                    deselectSeat(seat.id);
                  } else if (seat.status === 'available') {
                    selectSeat(seat, section, row);
                  }
                  return;
                }
              }
            }
          }
          break;
        case 'Escape':
          event.preventDefault();
          setFocusedSeat(null);
          break;
      }
    },
    [
      venue,
      focusedSeat,
      findNextSeat,
      setFocusedSeat,
      selectSeat,
      deselectSeat,
      isSeatSelected,
    ]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return {
    focusedSeat,
    setFocusedSeat,
  };
}
