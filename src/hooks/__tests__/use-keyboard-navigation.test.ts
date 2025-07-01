import { renderHook } from '@testing-library/react'
import { useKeyboardNavigation } from '../use-keyboard-navigation'
import { useVenueStore } from '../../store/venue-store'
import type { Venue } from '../../types/venue'

// Mock the store
jest.mock('../../store/venue-store')

const mockUseVenueStore = useVenueStore as jest.MockedFunction<typeof useVenueStore>

const mockVenue: Venue = {
  venueId: 'test-venue',
  name: 'Test Venue',
  map: { width: 1000, height: 800 },
  sections: [
    {
      id: 'orch',
      label: 'Orchestra',
      transform: { x: 0, y: 0, scale: 1 },
      rows: [
        {
          index: 0,
          seats: [
            { id: 'A1', col: 1, x: 10, y: 10, priceTier: 1, status: 'available' },
            { id: 'A2', col: 2, x: 30, y: 10, priceTier: 1, status: 'available' },
            { id: 'A3', col: 3, x: 50, y: 10, priceTier: 1, status: 'available' }
          ]
        },
        {
          index: 1,
          seats: [
            { id: 'B1', col: 1, x: 10, y: 30, priceTier: 1, status: 'available' },
            { id: 'B2', col: 2, x: 30, y: 30, priceTier: 1, status: 'available' },
            { id: 'B3', col: 3, x: 50, y: 30, priceTier: 1, status: 'available' }
          ]
        }
      ]
    }
  ]
}

describe('useKeyboardNavigation', () => {
  const mockSetFocusedSeat = jest.fn()
  const mockSelectSeat = jest.fn()
  const mockDeselectSeat = jest.fn()
  const mockIsSeatSelected = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseVenueStore.mockReturnValue({
      venue: mockVenue,
      focusedSeat: null,
      setFocusedSeat: mockSetFocusedSeat,
      selectSeat: mockSelectSeat,
      deselectSeat: mockDeselectSeat,
      isSeatSelected: mockIsSeatSelected,
      // Other store properties (not used in this hook)
      selectedSeats: [],
      isLoading: false,
      error: null,
      maxSeats: 8,
      heatMapMode: false,
      setVenue: jest.fn(),
      clearSelection: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      toggleHeatMap: jest.fn(),
      getTotalPrice: jest.fn(),
      canSelectMoreSeats: jest.fn(),
      findAdjacentSeats: jest.fn(),
    })
  })

  it('should return focused seat and setFocusedSeat from store', () => {
    const { result } = renderHook(() => useKeyboardNavigation())
    
    expect(result.current.focusedSeat).toBe(null)
    expect(result.current.setFocusedSeat).toBe(mockSetFocusedSeat)
  })

  it('should handle arrow key navigation - right', () => {
    mockUseVenueStore.mockReturnValue({
      venue: mockVenue,
      focusedSeat: 'A1',
      setFocusedSeat: mockSetFocusedSeat,
      selectSeat: mockSelectSeat,
      deselectSeat: mockDeselectSeat,
      isSeatSelected: mockIsSeatSelected,
      selectedSeats: [],
      isLoading: false,
      error: null,
      maxSeats: 8,
      heatMapMode: false,
      setVenue: jest.fn(),
      clearSelection: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      toggleHeatMap: jest.fn(),
      getTotalPrice: jest.fn(),
      canSelectMoreSeats: jest.fn(),
      findAdjacentSeats: jest.fn(),
    })

    renderHook(() => useKeyboardNavigation())

    // Simulate ArrowRight key press
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
    document.dispatchEvent(event)

    expect(mockSetFocusedSeat).toHaveBeenCalledWith('A2')
  })

  it('should handle arrow key navigation - down', () => {
    mockUseVenueStore.mockReturnValue({
      venue: mockVenue,
      focusedSeat: 'A1',
      setFocusedSeat: mockSetFocusedSeat,
      selectSeat: mockSelectSeat,
      deselectSeat: mockDeselectSeat,
      isSeatSelected: mockIsSeatSelected,
      selectedSeats: [],
      isLoading: false,
      error: null,
      maxSeats: 8,
      heatMapMode: false,
      setVenue: jest.fn(),
      clearSelection: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      toggleHeatMap: jest.fn(),
      getTotalPrice: jest.fn(),
      canSelectMoreSeats: jest.fn(),
      findAdjacentSeats: jest.fn(),
    })

    renderHook(() => useKeyboardNavigation())

    // Simulate ArrowDown key press
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
    document.dispatchEvent(event)

    expect(mockSetFocusedSeat).toHaveBeenCalledWith('B1')
  })

  it('should handle Enter key for seat selection', () => {
    mockUseVenueStore.mockReturnValue({
      venue: mockVenue,
      focusedSeat: 'A1',
      setFocusedSeat: mockSetFocusedSeat,
      selectSeat: mockSelectSeat,
      deselectSeat: mockDeselectSeat,
      isSeatSelected: mockIsSeatSelected.mockReturnValue(false),
      selectedSeats: [],
      isLoading: false,
      error: null,
      maxSeats: 8,
      heatMapMode: false,
      setVenue: jest.fn(),
      clearSelection: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      toggleHeatMap: jest.fn(),
      getTotalPrice: jest.fn(),
      canSelectMoreSeats: jest.fn(),
      findAdjacentSeats: jest.fn(),
    })

    renderHook(() => useKeyboardNavigation())

    // Simulate Enter key press
    const event = new KeyboardEvent('keydown', { key: 'Enter' })
    document.dispatchEvent(event)

    expect(mockSelectSeat).toHaveBeenCalledWith(
      mockVenue.sections[0].rows[0].seats[0],
      mockVenue.sections[0],
      mockVenue.sections[0].rows[0]
    )
  })

  it('should handle Space key for seat selection', () => {
    mockUseVenueStore.mockReturnValue({
      venue: mockVenue,
      focusedSeat: 'A1',
      setFocusedSeat: mockSetFocusedSeat,
      selectSeat: mockSelectSeat,
      deselectSeat: mockDeselectSeat,
      isSeatSelected: mockIsSeatSelected.mockReturnValue(false),
      selectedSeats: [],
      isLoading: false,
      error: null,
      maxSeats: 8,
      heatMapMode: false,
      setVenue: jest.fn(),
      clearSelection: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      toggleHeatMap: jest.fn(),
      getTotalPrice: jest.fn(),
      canSelectMoreSeats: jest.fn(),
      findAdjacentSeats: jest.fn(),
    })

    renderHook(() => useKeyboardNavigation())

    // Simulate Space key press
    const event = new KeyboardEvent('keydown', { key: ' ' })
    document.dispatchEvent(event)

    expect(mockSelectSeat).toHaveBeenCalledWith(
      mockVenue.sections[0].rows[0].seats[0],
      mockVenue.sections[0],
      mockVenue.sections[0].rows[0]
    )
  })

  it('should handle Escape key to clear focus', () => {
    mockUseVenueStore.mockReturnValue({
      venue: mockVenue,
      focusedSeat: 'A1',
      setFocusedSeat: mockSetFocusedSeat,
      selectSeat: mockSelectSeat,
      deselectSeat: mockDeselectSeat,
      isSeatSelected: mockIsSeatSelected,
      selectedSeats: [],
      isLoading: false,
      error: null,
      maxSeats: 8,
      heatMapMode: false,
      setVenue: jest.fn(),
      clearSelection: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      toggleHeatMap: jest.fn(),
      getTotalPrice: jest.fn(),
      canSelectMoreSeats: jest.fn(),
      findAdjacentSeats: jest.fn(),
    })

    renderHook(() => useKeyboardNavigation())

    // Simulate Escape key press
    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(event)

    expect(mockSetFocusedSeat).toHaveBeenCalledWith(null)
  })

  it('should deselect already selected seat', () => {
    mockUseVenueStore.mockReturnValue({
      venue: mockVenue,
      focusedSeat: 'A1',
      setFocusedSeat: mockSetFocusedSeat,
      selectSeat: mockSelectSeat,
      deselectSeat: mockDeselectSeat,
      isSeatSelected: mockIsSeatSelected.mockReturnValue(true),
      selectedSeats: [],
      isLoading: false,
      error: null,
      maxSeats: 8,
      heatMapMode: false,
      setVenue: jest.fn(),
      clearSelection: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      toggleHeatMap: jest.fn(),
      getTotalPrice: jest.fn(),
      canSelectMoreSeats: jest.fn(),
      findAdjacentSeats: jest.fn(),
    })

    renderHook(() => useKeyboardNavigation())

    // Simulate Enter key press on already selected seat
    const event = new KeyboardEvent('keydown', { key: 'Enter' })
    document.dispatchEvent(event)

    expect(mockDeselectSeat).toHaveBeenCalledWith('A1')
    expect(mockSelectSeat).not.toHaveBeenCalled()
  })

  it('should not navigate when no venue is loaded', () => {
    mockUseVenueStore.mockReturnValue({
      venue: null,
      focusedSeat: null,
      setFocusedSeat: mockSetFocusedSeat,
      selectSeat: mockSelectSeat,
      deselectSeat: mockDeselectSeat,
      isSeatSelected: mockIsSeatSelected,
      selectedSeats: [],
      isLoading: false,
      error: null,
      maxSeats: 8,
      heatMapMode: false,
      setVenue: jest.fn(),
      clearSelection: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      toggleHeatMap: jest.fn(),
      getTotalPrice: jest.fn(),
      canSelectMoreSeats: jest.fn(),
      findAdjacentSeats: jest.fn(),
    })

    renderHook(() => useKeyboardNavigation())

    // Simulate ArrowRight key press
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
    document.dispatchEvent(event)

    expect(mockSetFocusedSeat).not.toHaveBeenCalled()
  })

  it('should ignore non-navigation keys', () => {
    renderHook(() => useKeyboardNavigation())

    // Simulate 'a' key press
    const event = new KeyboardEvent('keydown', { key: 'a' })
    document.dispatchEvent(event)

    expect(mockSetFocusedSeat).not.toHaveBeenCalled()
    expect(mockSelectSeat).not.toHaveBeenCalled()
  })
})
