'use client';

import { VenueControls } from '../controls/venue-controls';
import type { Venue } from '@/types/venue';
import type { VenueType } from '@/hooks/use-venue-data';

interface SeatingMapHeaderProps {
  venue: Venue;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  venueType: VenueType;
  onVenueTypeChange: (type: VenueType) => void;
}

export function SeatingMapHeader({ 
  venue, 
  zoom, 
  onZoomIn, 
  onZoomOut, 
  onResetView,
  venueType,
  onVenueTypeChange
}: SeatingMapHeaderProps) {
  const totalSeats = venue.sections.reduce((total, section) => 
    total + section.rows.reduce((rowTotal, row) => 
      rowTotal + row.seats.length, 0), 0);

  return (
    <div className="flex-shrink-0 p-4 border-b bg-white dark:bg-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {venue.name}
            </h1>
            <select
              value={venueType}
              onChange={(e) => onVenueTypeChange(e.target.value as VenueType)}
              className="px-3 py-1 text-sm border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              aria-label="Select venue size for testing"
            >
              <option value="default">Default Venue ({venue.venueId === 'arena-01' ? '~30 seats' : 'Unknown'})</option>
              <option value="large">Large Venue (~10K seats)</option>
            </select>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {totalSeats.toLocaleString()} seats • Select up to 8 seats • Use mouse wheel to zoom • Drag to pan • Ctrl/Cmd+P for performance monitor
          </p>
          {totalSeats > 1000 && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              ⚡ Canvas rendering active for optimal performance
            </p>
          )}
        </div>
        <VenueControls 
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onResetView={onResetView}
          zoom={zoom}
        />
      </div>
    </div>
  );
}
