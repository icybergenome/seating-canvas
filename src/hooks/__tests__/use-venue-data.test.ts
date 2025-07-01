import { renderHook, waitFor } from '@testing-library/react';
import { useVenueData } from '../use-venue-data';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const mockVenueData = {
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
            {
              id: 'A1',
              col: 1,
              x: 100,
              y: 200,
              priceTier: 1,
              status: 'available' as const,
            },
          ],
        },
      ],
    },
  ],
};

describe('useVenueData', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // Clear any existing venue data
    localStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should load venue data successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockVenueData,
    } as Response);

    const { result } = renderHook(() => useVenueData('default'));

    // Initial state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.venue).toBe(null);
    expect(result.current.error).toBe(null);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.venue).toEqual(mockVenueData);
    expect(result.current.error).toBe(null);
    expect(mockFetch).toHaveBeenCalledWith('/venue.json');
  });

  it('should handle fetch errors', async () => {
    const errorMessage = 'Network error';
    mockFetch.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useVenueData('default'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.venue).toBe(null);
  });

  it('should handle HTTP errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    const { result } = renderHook(() => useVenueData('default'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch venue: 404');
    expect(result.current.venue).toBe(null);
  });

  it('should handle JSON parsing errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    } as unknown as Response);

    const { result } = renderHook(() => useVenueData('default'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Invalid JSON');
    expect(result.current.venue).toBe(null);
  });

  it('should use different URLs for different venue types', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockVenueData,
    } as Response);

    const { result } = renderHook(() => useVenueData('large'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith('/large-venue.json');
  });
});
