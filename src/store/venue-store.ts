import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type Venue,
  type SelectedSeat,
  type Seat,
  type Section,
  type Row,
} from '@/types/venue';
import { PRICE_TIERS, STORAGE_KEYS, SELECTION_CONFIG } from '@/lib/constants';

/**
 * Venue store state interface
 * @author Bilal S.
 */
interface VenueState {
  venue: Venue | null;
  selectedSeats: SelectedSeat[];
  focusedSeat: string | null;
  isLoading: boolean;
  error: string | null;
  maxSeats: number;
  heatMapMode: boolean;
}

/**
 * Venue store actions interface
 * @author Bilal S.
 */
interface VenueActions {
  setVenue: (venue: Venue) => void;
  selectSeat: (seat: Seat, section: Section, row: Row) => void;
  deselectSeat: (seatId: string) => void;
  clearSelection: () => void;
  setFocusedSeat: (seatId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleHeatMap: () => void;
  getTotalPrice: () => number;
  isSeatSelected: (seatId: string) => boolean;
  canSelectMoreSeats: () => boolean;
  findAdjacentSeats: (count: number) => SelectedSeat[];
}

type VenueStore = VenueState & VenueActions;

/**
 * Zustand store for managing venue state, seat selection, and UI interactions
 * Includes persistence for selected seats and preferences
 * @author Bilal S.
 */
export const useVenueStore = create<VenueStore>()(
  persist(
    (set, get) => ({
      // State
      venue: null,
      selectedSeats: [],
      focusedSeat: null,
      isLoading: false,
      error: null,
      maxSeats: SELECTION_CONFIG.MAX_SELECTED_SEATS,
      heatMapMode: false,

      // Actions
      setVenue: (venue) => set({ venue, error: null }),

      selectSeat: (seat, section, row) => {
        const state = get();
        
        // Check if seat is already selected
        if (state.isSeatSelected(seat.id)) return;
        
        // Check if we can select more seats
        if (!state.canSelectMoreSeats()) return;
        
        // Check if seat is available
        if (seat.status !== 'available') return;

        const price = PRICE_TIERS[seat.priceTier as keyof typeof PRICE_TIERS]?.price || 0;
        const selectedSeat: SelectedSeat = {
          seat,
          section,
          row,
          price,
        };

        set({
          selectedSeats: [...state.selectedSeats, selectedSeat],
        });
      },

      deselectSeat: (seatId) => {
        const state = get();
        set({
          selectedSeats: state.selectedSeats.filter(
            (selectedSeat) => selectedSeat.seat.id !== seatId
          ),
        });
      },

      clearSelection: () => set({ selectedSeats: [] }),

      setFocusedSeat: (seatId) => set({ focusedSeat: seatId }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      toggleHeatMap: () => {
        const state = get();
        set({ heatMapMode: !state.heatMapMode });
      },

      getTotalPrice: () => {
        const state = get();
        return state.selectedSeats.reduce(
          (total, selectedSeat) => total + selectedSeat.price,
          0
        );
      },

      isSeatSelected: (seatId) => {
        const state = get();
        return state.selectedSeats.some(
          (selectedSeat) => selectedSeat.seat.id === seatId
        );
      },

      canSelectMoreSeats: () => {
        const state = get();
        return state.selectedSeats.length < state.maxSeats;
      },

      findAdjacentSeats: (count) => {
        const state = get();
        if (!state.venue || count <= 0) return [];

        // Get currently selected seat IDs to exclude them from search
        const selectedSeatIds = new Set(state.selectedSeats.map(s => s.seat.id));

        // Find the first available group of consecutive seats
        for (const section of state.venue.sections) {
          for (const row of section.rows) {
            // Get all available seats in this row that are not already selected, sorted by column
            const availableSeats = row.seats
              .filter((seat) => seat.status === 'available' && !selectedSeatIds.has(seat.id))
              .sort((a, b) => a.col - b.col)
              .map((seat) => ({
                seat,
                section,
                row,
                price: PRICE_TIERS[seat.priceTier as keyof typeof PRICE_TIERS]?.price || 0,
              }));

            // Look for consecutive seats in this row
            if (availableSeats.length >= count) {
              for (let i = 0; i <= availableSeats.length - count; i++) {
                const consecutiveSeats = availableSeats.slice(i, i + count);
                
                // Check if seats are truly consecutive (column numbers are sequential)
                const isConsecutive = consecutiveSeats.every(
                  (seatData, index) =>
                    index === 0 ||
                    seatData.seat.col === consecutiveSeats[index - 1].seat.col + 1
                );

                if (isConsecutive && consecutiveSeats.length === count) {
                  return consecutiveSeats;
                }
              }
            }
          }
        }

        // If no consecutive seats found, return empty array
        return [];
      },
    }),
    {
      name: STORAGE_KEYS.SELECTED_SEATS,
      partialize: (state) => ({
        selectedSeats: state.selectedSeats,
      }),
    }
  )
);
