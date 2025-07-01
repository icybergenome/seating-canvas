'use client';

import { useVenueStore } from '@/store/venue-store';
import { useTheme } from '../ui/theme-provider';
import { ZoomIn, ZoomOut, RotateCcw, Palette, Moon, Sun } from 'lucide-react';
import { VIEWPORT_CONFIG } from '@/lib/constants';

interface VenueControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  zoom: number;
}

export function VenueControls({ onZoomIn, onZoomOut, onResetView, zoom }: VenueControlsProps) {
  const { heatMapMode, toggleHeatMap } = useVenueStore();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark' || (theme === 'system' && 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Zoom Controls */}
      <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
        <button
          onClick={onZoomOut}
          disabled={zoom <= VIEWPORT_CONFIG.MIN_ZOOM}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
        
        <div className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-x border-gray-200 dark:border-gray-600 min-w-[60px] text-center" data-testid="zoom-percentage">
          {Math.round(zoom * 100)}%
        </div>
        
        <button
          onClick={onZoomIn}
          disabled={zoom >= 3}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Reset View */}
      <button
        onClick={onResetView}
        className="p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        aria-label="Reset view"
        title="Reset zoom and pan (Ctrl/Cmd + 0)"
      >
        <RotateCcw className="w-4 h-4 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Heat Map Toggle */}
      <button
        onClick={toggleHeatMap}
        className={`p-2 rounded-lg border transition-colors ${
          heatMapMode
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
        }`}
        aria-label={heatMapMode ? 'Hide price heat map' : 'Show price heat map'}
        title="Toggle price heat map"
      >
        <Palette className="w-4 h-4" />
      </button>

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title="Toggle dark mode"
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        ) : (
          <Moon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Keyboard Shortcuts Info */}
      <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 ml-2">
        <div>Shortcuts:</div>
        <div>Ctrl/Cmd + 0: Reset</div>
        <div>Ctrl/Cmd + ±: Zoom</div>
      </div>
    </div>
  );
}
