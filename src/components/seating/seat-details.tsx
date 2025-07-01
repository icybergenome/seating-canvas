'use client';

import { useVenueStore } from '@/store/venue-store';
import { PRICE_TIERS, SELECTION_CONFIG } from '@/lib/constants';
import { X, ShoppingCart, Trash2 } from 'lucide-react';
import type { Seat, Section, Row } from '@/types/venue';

interface SeatDetailsProps {
  seat: Seat;
  section: Section;
  row: Row;
  onClose: () => void;
}

export function SeatDetails({ seat, section, row, onClose }: SeatDetailsProps) {
  const { selectSeat, deselectSeat, isSeatSelected, canSelectMoreSeats } = useVenueStore();
  
  const isSelected = isSeatSelected(seat.id);
  const canSelect = seat.status === 'available' && (canSelectMoreSeats() || isSelected);
  const priceTier = PRICE_TIERS[seat.priceTier as keyof typeof PRICE_TIERS];

  const handleToggleSelection = () => {
    if (isSelected) {
      deselectSeat(seat.id);
    } else if (canSelect) {
      selectSeat(seat, section, row);
    }
  };

  const getStatusColor = () => {
    switch (seat.status) {
      case 'available':
        return 'text-green-600 dark:text-green-400';
      case 'reserved':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'sold':
        return 'text-red-600 dark:text-red-400';
      case 'held':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusText = () => {
    if (isSelected) return 'Selected';
    return seat.status.charAt(0).toUpperCase() + seat.status.slice(1);
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Seat Details
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          aria-label="Close seat details"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Seat Information */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Section:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {section.label}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Row:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {row.index}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Seat:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {seat.col}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <p className={`font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </p>
            </div>
          </div>
        </div>

        {/* Price Information */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-600 dark:text-gray-400 text-sm">Price:</span>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${priceTier?.price || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {priceTier?.label} tier
              </p>
            </div>
            <div 
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: priceTier?.color }}
              aria-label={`${priceTier?.label} price tier`}
            />
          </div>
        </div>

        {/* Action Button */}
        {seat.status === 'available' && (
          <button
            onClick={handleToggleSelection}
            disabled={!canSelect && !isSelected}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isSelected
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : canSelect
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSelected ? (
              <span className="flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" />
                Remove from Selection
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                {canSelect ? 'Add to Selection' : `Selection Full (${SELECTION_CONFIG.MAX_SELECTED_SEATS} max)`}
              </span>
            )}
          </button>
        )}

        {seat.status !== 'available' && (
          <div className="text-center py-2 px-4 bg-gray-100 dark:bg-gray-600 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This seat is not available for selection
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
