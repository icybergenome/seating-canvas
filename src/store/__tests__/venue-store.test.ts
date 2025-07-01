import { renderHook, act } from '@testing-library/react'
import { useVenueStore } from '../venue-store'
import type { Venue } from '../../types/venue'

// Mock venue data
const mockVenue: Venue = {
  venueId: 'venue-1',
  name: 'Test Venue',
  map: {
    width: 1000,
    height: 800
  },
  sections: [
    {
      id: 'orch',
      label: 'Orchestra',
      transform: { x: 0, y: 0, scale: 1 },
      rows: [
        {
          index: 0,
          seats: [
            {
              id: 'A1',
              col: 1,
              x: 100,
              y: 200,
              priceTier: 1,
              status: 'available'
            },
            {
              id: 'A2',
              col: 2,
              x: 120,
              y: 200,
              priceTier: 1,
              status: 'available'
            },
            {
              id: 'A3',
              col: 3,
              x: 140,
              y: 200,
              priceTier: 1,
              status: 'sold'
            }
          ]
        },
        {
          index: 1,
          seats: [
            {
              id: 'B1',
              col: 1,
              x: 100,
              y: 220,
              priceTier: 2,
              status: 'available'
            }
          ]
        }
      ]
    }
  ]
}

describe('VenueStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useVenueStore())
    act(() => {
      result.current.setVenue({
        venueId: 'test',
        name: 'Test',
        map: { width: 100, height: 100 },
        sections: []
      })
      result.current.clearSelection()
      result.current.setError(null)
      result.current.setLoading(false)
    })
  })

  describe('venue data management', () => {
    it('should set venue data correctly', () => {
      const { result } = renderHook(() => useVenueStore())
      
      act(() => {
        result.current.setVenue(mockVenue)
      })

      expect(result.current.venue).toEqual(mockVenue)
    })

    it('should handle loading state', () => {
      const { result } = renderHook(() => useVenueStore())
      
      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.isLoading).toBe(true)

      act(() => {
        result.current.setLoading(false)
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('should handle error state', () => {
      const { result } = renderHook(() => useVenueStore())
      const errorMessage = 'Failed to load venue data'
      
      act(() => {
        result.current.setError(errorMessage)
      })

      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('seat selection', () => {
    it('should select available seats', () => {
      const { result } = renderHook(() => useVenueStore())
      
      act(() => {
        result.current.setVenue(mockVenue)
      })

      const seat = mockVenue.sections[0].rows[0].seats[0]
      const section = mockVenue.sections[0]
      const row = mockVenue.sections[0].rows[0]
      
      act(() => {
        result.current.selectSeat(seat, section, row)
      })

      expect(result.current.selectedSeats).toHaveLength(1)
      expect(result.current.selectedSeats[0].seat.id).toBe('A1')
    })

    it('should not select sold seats', () => {
      const { result } = renderHook(() => useVenueStore())
      
      act(() => {
        result.current.setVenue(mockVenue)
      })

      const soldSeat = mockVenue.sections[0].rows[0].seats[2] // A3 - sold
      const section = mockVenue.sections[0]
      const row = mockVenue.sections[0].rows[0]
      
      act(() => {
        result.current.selectSeat(soldSeat, section, row)
      })

      expect(result.current.selectedSeats).toHaveLength(0)
    })

    it('should not select already selected seats', () => {
      const { result } = renderHook(() => useVenueStore())
      
      act(() => {
        result.current.setVenue(mockVenue)
      })

      const seat = mockVenue.sections[0].rows[0].seats[0]
      const section = mockVenue.sections[0]
      const row = mockVenue.sections[0].rows[0]
      
      // Select seat twice
      act(() => {
        result.current.selectSeat(seat, section, row)
        result.current.selectSeat(seat, section, row)
      })

      expect(result.current.selectedSeats).toHaveLength(1)
    })

    it('should limit selection to 8 seats', () => {
      const { result } = renderHook(() => useVenueStore())
      
      // Create venue with 10 available seats
      const venueWithManySeats: Venue = {
        ...mockVenue,
        sections: [
          {
            ...mockVenue.sections[0],
            rows: [
              {
                index: 0,
                seats: Array.from({ length: 10 }, (_, i) => ({
                  id: `SEAT${i + 1}`,
                  col: i + 1,
                  x: 100 + (i * 20),
                  y: 200,
                  priceTier: 1,
                  status: 'available' as const
                }))
              }
            ]
          }
        ]
      }
      
      act(() => {
        result.current.setVenue(venueWithManySeats)
      })

      const section = venueWithManySeats.sections[0]
      const row = venueWithManySeats.sections[0].rows[0]

      // Try to select 10 seats
      venueWithManySeats.sections[0].rows[0].seats.forEach(seat => {
        act(() => {
          result.current.selectSeat(seat, section, row)
        })
      })

      expect(result.current.selectedSeats).toHaveLength(8)
    })

    it('should clear all selected seats', () => {
      const { result } = renderHook(() => useVenueStore())
      
      act(() => {
        result.current.setVenue(mockVenue)
      })

      const seat1 = mockVenue.sections[0].rows[0].seats[0]
      const seat2 = mockVenue.sections[0].rows[0].seats[1]
      const section = mockVenue.sections[0]
      const row = mockVenue.sections[0].rows[0]

      // Select multiple seats
      act(() => {
        result.current.selectSeat(seat1, section, row)
        result.current.selectSeat(seat2, section, row)
      })

      expect(result.current.selectedSeats).toHaveLength(2)

      // Clear selection
      act(() => {
        result.current.clearSelection()
      })

      expect(result.current.selectedSeats).toHaveLength(0)
    })

    it('should deselect specific seats', () => {
      const { result } = renderHook(() => useVenueStore())
      
      act(() => {
        result.current.setVenue(mockVenue)
      })

      const seat = mockVenue.sections[0].rows[0].seats[0]
      const section = mockVenue.sections[0]
      const row = mockVenue.sections[0].rows[0]

      // Select seat
      act(() => {
        result.current.selectSeat(seat, section, row)
      })
      expect(result.current.selectedSeats).toHaveLength(1)

      // Deselect seat
      act(() => {
        result.current.deselectSeat(seat.id)
      })
      expect(result.current.selectedSeats).toHaveLength(0)
    })
  })

  describe('total price calculation', () => {
    it('should calculate total price of selected seats', () => {
      const { result } = renderHook(() => useVenueStore())
      
      act(() => {
        result.current.setVenue(mockVenue)
      })

      const seat1 = mockVenue.sections[0].rows[0].seats[0] // priceTier 1
      const seat2 = mockVenue.sections[0].rows[1].seats[0] // priceTier 2
      const section = mockVenue.sections[0]
      const row1 = mockVenue.sections[0].rows[0]
      const row2 = mockVenue.sections[0].rows[1]

      act(() => {
        result.current.selectSeat(seat1, section, row1)
        result.current.selectSeat(seat2, section, row2)
      })

      const totalPrice = result.current.getTotalPrice()
      expect(totalPrice).toBeGreaterThan(0)
    })

    it('should return 0 when no seats selected', () => {
      const { result } = renderHook(() => useVenueStore())
      
      act(() => {
        result.current.setVenue(mockVenue)
      })

      expect(result.current.getTotalPrice()).toBe(0)
    })
  })

  describe('seat status checks', () => {
    it('should check if seat is selected', () => {
      const { result } = renderHook(() => useVenueStore())
      
      act(() => {
        result.current.setVenue(mockVenue)
      })

      const seat = mockVenue.sections[0].rows[0].seats[0]
      const section = mockVenue.sections[0]
      const row = mockVenue.sections[0].rows[0]

      expect(result.current.isSeatSelected('A1')).toBe(false)

      act(() => {
        result.current.selectSeat(seat, section, row)
      })

      expect(result.current.isSeatSelected('A1')).toBe(true)
    })

    it('should check if can select more seats', () => {
      const { result } = renderHook(() => useVenueStore())
      
      act(() => {
        result.current.setVenue(mockVenue)
      })

      expect(result.current.canSelectMoreSeats()).toBe(true)

      // Fill up to max seats (8)
      const section = mockVenue.sections[0]
      const row = mockVenue.sections[0].rows[0]
      const seat = mockVenue.sections[0].rows[0].seats[0]

      // Mock selecting 8 seats by directly setting state
      act(() => {
        const selectedSeats = Array.from({ length: 8 }, (_, i) => ({
          seat: { ...seat, id: `SEAT${i + 1}` },
          section,
          row,
          price: 100
        }))
        result.current.setVenue({
          ...mockVenue,
          sections: [{
            ...mockVenue.sections[0],
            rows: [{
              ...mockVenue.sections[0].rows[0],
              seats: selectedSeats.map(s => s.seat)
            }]
          }]
        })
        // Manually set selected seats for this test
        result.current.clearSelection()
        selectedSeats.forEach(seatData => {
          result.current.selectSeat(seatData.seat, seatData.section, seatData.row)
        })
      })

      expect(result.current.canSelectMoreSeats()).toBe(false)
    })
  })

  describe('heat map mode', () => {
    it('should toggle heat map mode', () => {
      const { result } = renderHook(() => useVenueStore())
      
      expect(result.current.heatMapMode).toBe(false)
      
      act(() => {
        result.current.toggleHeatMap()
      })

      expect(result.current.heatMapMode).toBe(true)

      act(() => {
        result.current.toggleHeatMap()
      })

      expect(result.current.heatMapMode).toBe(false)
    })
  })

  describe('focused seat', () => {
    it('should set focused seat', () => {
      const { result } = renderHook(() => useVenueStore())
      
      act(() => {
        result.current.setFocusedSeat('A1')
      })

      expect(result.current.focusedSeat).toBe('A1')

      act(() => {
        result.current.setFocusedSeat(null)
      })

      expect(result.current.focusedSeat).toBe(null)
    })
  })

  describe('adjacent seats finder', () => {
    it('should find adjacent seats', () => {
      const { result } = renderHook(() => useVenueStore())
      
      act(() => {
        result.current.setVenue(mockVenue)
      })

      const adjacentSeats = result.current.findAdjacentSeats(2)
      expect(adjacentSeats.length).toBeGreaterThanOrEqual(0)
      expect(adjacentSeats.length).toBeLessThanOrEqual(2)
      
      // If seats were found, they should be consecutive
      if (adjacentSeats.length === 2) {
        const seat1 = adjacentSeats[0].seat
        const seat2 = adjacentSeats[1].seat
        expect(seat2.col).toBe(seat1.col + 1)
      }
    })

    it('should exclude already selected seats from adjacent search', () => {
      const { result } = renderHook(() => useVenueStore())
      
      const venueWithConsecutiveSeats = {
        venueId: 'test',
        name: 'Test Venue',
        map: { width: 100, height: 100 },
        sections: [{
          id: 'A',
          label: 'Section A',
          transform: { x: 0, y: 0, scale: 1 },
          rows: [{
            index: 1,
            seats: [
              { id: 'A-1-1', col: 1, x: 10, y: 10, priceTier: 1, status: 'available' as const },
              { id: 'A-1-2', col: 2, x: 20, y: 10, priceTier: 1, status: 'available' as const },
              { id: 'A-1-3', col: 3, x: 30, y: 10, priceTier: 1, status: 'available' as const },
            ]
          }]
        }]
      }
      
      act(() => {
        result.current.setVenue(venueWithConsecutiveSeats)
      })

      // Select the middle seat
      act(() => {
        result.current.selectSeat(
          venueWithConsecutiveSeats.sections[0].rows[0].seats[1],
          venueWithConsecutiveSeats.sections[0],
          venueWithConsecutiveSeats.sections[0].rows[0]
        )
      })

      // Now try to find 3 adjacent seats - should fail because one is already selected
      const adjacentSeats = result.current.findAdjacentSeats(3)
      expect(adjacentSeats).toHaveLength(0)

      // But finding 2 adjacent seats should still work (seats 1 and 3 are not consecutive)
      const twoAdjacentSeats = result.current.findAdjacentSeats(2)
      expect(twoAdjacentSeats).toHaveLength(0) // Because seats 1 and 3 are not consecutive
    })

    it('should return empty array when no venue loaded', () => {
      const { result } = renderHook(() => useVenueStore())
      
      act(() => {
        result.current.setVenue({
          venueId: 'empty',
          name: 'Empty',
          map: { width: 100, height: 100 },
          sections: []
        })
      })

      const adjacentSeats = result.current.findAdjacentSeats(2)
      expect(adjacentSeats).toHaveLength(0)
    })
  })
})
