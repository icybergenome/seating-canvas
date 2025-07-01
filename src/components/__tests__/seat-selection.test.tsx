import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SeatSelection } from '@/components';
import { useVenueStore } from '@/store/venue-store';
import type { SelectedSeat } from '@/types/venue';

jest.mock('@/store/venue-store');

const mockUseVenueStore = useVenueStore as jest.MockedFunction<typeof useVenueStore>;

const mockSelectedSeat: SelectedSeat = {
  seat: {
    id: 'A-1-01',
    col: 1,
    x: 50,
    y: 40,
    priceTier: 1,
    status: 'available',
  },
  section: {
    id: 'A',
    label: 'Lower Bowl A',
    transform: { x: 0, y: 0, scale: 1 },
    rows: [],
  },
  row: {
    index: 1,
    seats: [],
  },
  price: 150,
};

describe('SeatSelection Component', () => {
  const mockClearSelection = jest.fn();
  const mockFindAdjacentSeats = jest.fn();
  const mockSelectSeat = jest.fn();
  const mockGetTotalPrice = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows empty state when no seats are selected', () => {
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
      deselectSeat: jest.fn(),
      clearSelection: mockClearSelection,
      setFocusedSeat: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      toggleHeatMap: jest.fn(),
      getTotalPrice: mockGetTotalPrice.mockReturnValue(0),
      isSeatSelected: jest.fn(),
      canSelectMoreSeats: jest.fn(() => true),
      findAdjacentSeats: mockFindAdjacentSeats,
    });

    render(<SeatSelection />);

    expect(screen.getByText('No seats selected yet')).toBeInTheDocument();
    expect(screen.getByText('0 / 8')).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('displays selected seats correctly', () => {
    mockGetTotalPrice.mockReturnValue(150);
    
    mockUseVenueStore.mockReturnValue({
      venue: null,
      selectedSeats: [mockSelectedSeat],
      focusedSeat: null,
      isLoading: false,
      error: null,
      maxSeats: 8,
      heatMapMode: false,
      setVenue: jest.fn(),
      selectSeat: mockSelectSeat,
      deselectSeat: jest.fn(),
      clearSelection: mockClearSelection,
      setFocusedSeat: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      toggleHeatMap: jest.fn(),
      getTotalPrice: mockGetTotalPrice,
      isSeatSelected: jest.fn(),
      canSelectMoreSeats: jest.fn(() => true),
      findAdjacentSeats: mockFindAdjacentSeats,
    });

    render(<SeatSelection />);

    expect(screen.getByText('1 / 8')).toBeInTheDocument();
    expect(screen.getAllByText('$150.00')).toHaveLength(2); // One in total, one in seat list
    expect(screen.getByText('Lower Bowl A')).toBeInTheDocument();
    expect(screen.getByText('Row 1, Seat 1')).toBeInTheDocument();
    expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument();
  });

  it('calls clearSelection when clear button is clicked', () => {
    mockGetTotalPrice.mockReturnValue(150);
    
    mockUseVenueStore.mockReturnValue({
      venue: null,
      selectedSeats: [mockSelectedSeat],
      focusedSeat: null,
      isLoading: false,
      error: null,
      maxSeats: 8,
      heatMapMode: false,
      setVenue: jest.fn(),
      selectSeat: mockSelectSeat,
      deselectSeat: jest.fn(),
      clearSelection: mockClearSelection,
      setFocusedSeat: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      toggleHeatMap: jest.fn(),
      getTotalPrice: mockGetTotalPrice,
      isSeatSelected: jest.fn(),
      canSelectMoreSeats: jest.fn(() => true),
      findAdjacentSeats: mockFindAdjacentSeats,
    });

    render(<SeatSelection />);

    const clearButton = screen.getByLabelText('Clear all selections');
    fireEvent.click(clearButton);

    expect(mockClearSelection).toHaveBeenCalled();
  });

  it('finds adjacent seats when find button is clicked', async () => {
    const mockAdjacentSeats: SelectedSeat[] = [
      {
        seat: { id: 'seat-1', col: 1, x: 10, y: 10, status: 'available', priceTier: 1 },
        section: { 
          id: 'section-1', 
          label: 'Section A', 
          transform: { x: 0, y: 0, scale: 1 },
          rows: []
        },
        row: { index: 1, seats: [] },
        price: 50,
      },
      {
        seat: { id: 'seat-2', col: 2, x: 20, y: 10, status: 'available', priceTier: 1 },
        section: { 
          id: 'section-1', 
          label: 'Section A', 
          transform: { x: 0, y: 0, scale: 1 },
          rows: []
        },
        row: { index: 1, seats: [] },
        price: 50,
      },
    ];
    
    mockFindAdjacentSeats.mockReturnValue(mockAdjacentSeats);
    
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
      deselectSeat: jest.fn(),
      clearSelection: mockClearSelection,
      setFocusedSeat: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      toggleHeatMap: jest.fn(),
      getTotalPrice: mockGetTotalPrice.mockReturnValue(0),
      isSeatSelected: jest.fn(),
      canSelectMoreSeats: jest.fn(() => true),
      findAdjacentSeats: mockFindAdjacentSeats,
    });

    render(<SeatSelection />);

    const findButton = screen.getByText('Find');
    fireEvent.click(findButton);

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(mockFindAdjacentSeats).toHaveBeenCalledWith(2); // default count
      expect(mockClearSelection).toHaveBeenCalled();
      expect(mockSelectSeat).toHaveBeenCalledTimes(2); // should select both seats
    });
  });
});
