'use client';

import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Loading Venue
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we load the seating map...
        </p>
      </div>
    </div>
  );
}
