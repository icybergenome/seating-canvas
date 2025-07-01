import { render, screen } from '@testing-library/react'
import { SeatingMap } from '../map/seating-map'
import { useVenueData } from '../../hooks/use-venue-data'

// Mock the hooks
jest.mock('../../hooks/use-venue-data')

const mockUseVenueData = useVenueData as jest.MockedFunction<typeof useVenueData>

const mockVenue = {
  venueId: 'test-venue',
  name: 'Test Venue',
  map: { width: 1000, height: 800 },
  sections: [
    {
      id: 'orch',
      label: 'Orchestra',
      transform: { x: 100, y: 200, scale: 1 },
      rows: [
        {
          index: 0,
          seats: [
            {
              id: 'A1',
              col: 1,
              x: 10,
              y: 10,
              priceTier: 1,
              status: 'available' as const
            },
            {
              id: 'A2',
              col: 2,
              x: 30,
              y: 10,
              priceTier: 1,
              status: 'sold' as const
            }
          ]
        }
      ]
    }
  ]
}

describe('SeatingMap', () => {
  beforeEach(() => {
    mockUseVenueData.mockReturnValue({
      venue: mockVenue,
      isLoading: false,
      error: null,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state', () => {
    mockUseVenueData.mockReturnValue({
      venue: null,
      isLoading: true,
      error: null,
    })

    render(<SeatingMap />)
    expect(screen.getByText('Loading Venue')).toBeInTheDocument()
  })

  it('should render error state with retry button', () => {
    mockUseVenueData.mockReturnValue({
      venue: null,
      isLoading: false,
      error: 'Failed to load venue',
    })

    render(<SeatingMap />)
    
    expect(screen.getByText('Failed to load venue')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('should render venue when loaded', () => {
    render(<SeatingMap />)
    
    // Check that venue name is displayed
    expect(screen.getByText('Test Venue')).toBeInTheDocument()
    
    // Check that seats are rendered instead of section labels
    expect(screen.getByRole('button', { name: /Seat 1, Row 0, Orchestra, available/i })).toBeInTheDocument()
  })

  it('should render seats', () => {
    render(<SeatingMap />)
    
    // Check if seats are rendered with their actual aria-labels
    expect(screen.getByRole('button', { name: /Seat 1, Row 0, Orchestra, available/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Seat 2, Row 0, Orchestra, sold/i })).toBeInTheDocument()
  })

  it('should show venue name in title', () => {
    render(<SeatingMap />)
    
    expect(screen.getByText('Test Venue')).toBeInTheDocument()
  })
})
