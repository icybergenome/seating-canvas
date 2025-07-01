import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Seat } from '@/components';
import { useVenueStore } from '@/store/venue-store';
import type { Seat as SeatType, Section, Row } from '@/types/venue';

// Mock the store
jest.mock('@/store/venue-store');
jest.mock('@/hooks/use-keyboard-navigation', () => ({
  useKeyboardNavigation: () => ({
    setFocusedSeat: jest.fn(),
  }),
}));

const mockUseVenueStore = useVenueStore as jest.MockedFunction<typeof useVenueStore>;

const mockSeat: SeatType = {
  id: 'A-1-01',
  col: 1,
  x: 50,
  y: 40,
  priceTier: 1,
  status: 'available',
};

const mockSection: Section = {
  id: 'A',
  label: 'Lower Bowl A',
  transform: { x: 0, y: 0, scale: 1 },
  rows: [],
};

const mockRow: Row = {
  index: 1,
  seats: [mockSeat],
};

describe('Seat Component', () => {
  const mockSelectSeat = jest.fn();
  const mockDeselectSeat = jest.fn();
  const mockSetFocusedSeat = jest.fn();
  const mockIsSeatSelected = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseVenueStore.mockReturnValue({
      venue: null,
      selectedSeats: [],
      focusedSeat: null,
      isLoading: false,
      error: null,
      maxSeats: 8,
      heatMapMode: false,
      setVenue: jest.fn(),
      selectSeat: mockSelectSeat,
      deselectSeat: mockDeselectSeat,
      clearSelection: jest.fn(),
      setFocusedSeat: mockSetFocusedSeat,
      setLoading: jest.fn(),
      setError: jest.fn(),
      toggleHeatMap: jest.fn(),
      getTotalPrice: jest.fn(() => 0),
      isSeatSelected: mockIsSeatSelected,
      canSelectMoreSeats: jest.fn(() => true),
      findAdjacentSeats: jest.fn(() => []),
    });
  });

  it('renders seat with correct aria-label', () => {
    mockIsSeatSelected.mockReturnValue(false);
    
    render(
      <Seat
        seat={mockSeat}
        section={mockSection}
        row={mockRow}
      />
    );

    const seatButton = screen.getByLabelText('Seat 1, Row 1, Lower Bowl A, available');
    expect(seatButton).toBeInTheDocument();
  });

  it('calls selectSeat when available seat is clicked', () => {
    mockIsSeatSelected.mockReturnValue(false);
    
    render(
      <Seat
        seat={mockSeat}
        section={mockSection}
        row={mockRow}
      />
    );

    const seatButton = screen.getByTestId('seat-A-1-01');
    fireEvent.click(seatButton);

    expect(mockSelectSeat).toHaveBeenCalledWith(mockSeat, mockSection, mockRow);
  });

  it('calls deselectSeat when selected seat is clicked', () => {
    mockIsSeatSelected.mockReturnValue(true);
    
    render(
      <Seat
        seat={mockSeat}
        section={mockSection}
        row={mockRow}
      />
    );

    const seatButton = screen.getByTestId('seat-A-1-01');
    fireEvent.click(seatButton);

    expect(mockDeselectSeat).toHaveBeenCalledWith('A-1-01');
  });

  it('is disabled when seat is not available', () => {
    const soldSeat = { ...mockSeat, status: 'sold' as const };
    mockIsSeatSelected.mockReturnValue(false);
    
    render(
      <Seat
        seat={soldSeat}
        section={mockSection}
        row={mockRow}
      />
    );

    const seatButton = screen.getByTestId('seat-A-1-01');
    expect(seatButton).toBeDisabled();
  });

  it('shows selected state correctly', () => {
    mockIsSeatSelected.mockReturnValue(true);
    
    render(
      <Seat
        seat={mockSeat}
        section={mockSection}
        row={mockRow}
      />
    );

    const seatButton = screen.getByTestId('seat-A-1-01');
    expect(seatButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows heat map colors when heat map mode is enabled', () => {
    mockIsSeatSelected.mockReturnValue(false);
    
    render(
      <Seat
        seat={mockSeat}
        section={mockSection}
        row={mockRow}
        heatMapMode={true}
      />
    );

    const seatButton = screen.getByTestId('seat-A-1-01');
    expect(seatButton).toHaveStyle({ backgroundColor: 'var(--price-tier-1)' });
  });
});
