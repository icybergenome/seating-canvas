'use client';

import { useState, useEffect } from 'react';
import { VENUE_FILES } from '@/lib/constants';
import type { Venue } from '@/types/venue';

export type VenueType = keyof typeof VENUE_FILES;

/**
 * Custom hook for fetching and managing venue data
 * Provides loading states, error handling, and automatic refetching when venue type changes
 * @author Bilal S.
 * @param venueType - The type of venue to load (default, large, etc.)
 * @returns Object containing venue data, loading state, and error state
 */
export function useVenueData(venueType: VenueType = 'default') {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(VENUE_FILES[venueType]);
        if (!response.ok) {
          throw new Error(`Failed to fetch venue: ${response.status}`);
        }

        const data = await response.json();
        setVenue(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load venue data');
        setVenue(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenue();
  }, [venueType]);

  return { venue, isLoading, error };
}
