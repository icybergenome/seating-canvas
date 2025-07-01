'use client';

import { useVenueStore } from '@/store/venue-store';
import { Trash2, Users, DollarSign, Search } from 'lucide-react';
import { useState } from 'react';

export function SeatSelection() {
  const { 
    selectedSeats, 
    getTotalPrice, 
    clearSelection, 
    findAdjacentSeats,
    selectSeat,
    maxSeats
  } = useVenueStore();
  
  const [adjacentCount, setAdjacentCount] = useState(2);
  const [adjacentSearchStatus, setAdjacentSearchStatus] = useState<'idle' | 'searching' | 'found' | 'not-found'>('idle');
  const totalPrice = getTotalPrice();

  const handleFindAdjacent = () => {
    setAdjacentSearchStatus('searching');
    
    // Small delay to show searching state
    setTimeout(() => {
      const adjacentSeats = findAdjacentSeats(adjacentCount);
      
      if (adjacentSeats.length > 0) {
        // Clear current selection and select the adjacent seats
        clearSelection();
        adjacentSeats.forEach(({ seat, section, row }) => {
          selectSeat(seat, section, row);
        });
        setAdjacentSearchStatus('found');
      } else {
        setAdjacentSearchStatus('not-found');
      }
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setAdjacentSearchStatus('idle');
      }, 3000);
    }, 100);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Your Selection
        </h2>
        {selectedSeats.length > 0 && (
          <button
            onClick={clearSelection}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600 dark:text-red-400"
            aria-label="Clear all selections"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Selection Summary */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Seats Selected:
            </span>
          </div>
          <span className="font-medium text-gray-900 dark:text-white" data-testid="seat-count">
            {selectedSeats.length} / {maxSeats}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total:
            </span>
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>

      {/* Adjacent Seat Finder */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Find Adjacent Seats
        </label>
        <div className="flex gap-2">
          <select
            value={adjacentCount}
            onChange={(e) => setAdjacentCount(Number(e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            disabled={adjacentSearchStatus === 'searching'}
          >
            {Array.from({ length: maxSeats }, (_, i) => i + 1).map((count) => (
              <option key={count} value={count}>
                {count} seat{count !== 1 ? 's' : ''}
              </option>
            ))}
          </select>
          <button
            onClick={handleFindAdjacent}
            disabled={adjacentSearchStatus === 'searching'}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              adjacentSearchStatus === 'searching'
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : adjacentSearchStatus === 'found'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : adjacentSearchStatus === 'not-found'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            {adjacentSearchStatus === 'searching' && 'Searching...'}
            {adjacentSearchStatus === 'found' && 'Found!'}
            {adjacentSearchStatus === 'not-found' && 'None Found'}
            {adjacentSearchStatus === 'idle' && 'Find'}
          </button>
        </div>
        
        {/* Status message */}
        {adjacentSearchStatus === 'not-found' && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            No {adjacentCount} adjacent seats available. Try a smaller number.
          </p>
        )}
        {adjacentSearchStatus === 'found' && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Found {adjacentCount} adjacent seats and selected them!
          </p>
        )}
      </div>

      {/* Selected Seats List */}
      {selectedSeats.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Selected Seats
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedSeats.map(({ seat, section, row, price }) => (
              <div
                key={seat.id}
                className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {section.label}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Row {row.index}, Seat {seat.col}
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatPrice(price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSeats.length === 0 && (
        <div className="text-center py-6">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No seats selected yet
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Click on available seats to select them
          </p>
        </div>
      )}

      {selectedSeats.length > 0 && (
        <button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
          Proceed to Checkout
        </button>
      )}
    </div>
  );
}
