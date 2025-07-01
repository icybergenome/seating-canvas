/**
 * Application Constants
 * 
 * Centralized location for all application constants to ensure consistency
 * and maintainability across the codebase.
 * @author Bilal S.
 */

// ============ COLORS ============

/**
 * Seat status colors for Canvas rendering
 */
export const SEAT_COLORS = {
  available: '#10b981',
  reserved: '#f59e0b', 
  sold: '#ef4444',
  held: '#8b5cf6',
  selected: '#3b82f6',
  focused: '#1d4ed8',
  priceTier1: '#10b981',
  priceTier2: '#3b82f6',
  priceTier3: '#8b5cf6',
} as const;

/**
 * CSS custom property colors for DOM rendering
 */
export const SEAT_STATUS_COLORS = {
  available: 'var(--seat-available)',
  reserved: 'var(--seat-reserved)',
  sold: 'var(--seat-sold)',
  held: 'var(--seat-held)',
} as const;

// ============ RENDERING ============

/**
 * Canvas rendering configuration
 */
export const CANVAS_CONFIG = {
  SEAT_SIZE: 12,
  CULLING_BUFFER: 100, // Extra pixels around viewport for culling
  CANVAS_THRESHOLD: 1000, // Seat count threshold to switch to Canvas
  LOD_ULTRA_THRESHOLD: 2000, // Seat count for ultra-low detail
  LOD_LOW_THRESHOLD: 1000, // Seat count for low detail
} as const;

/**
 * Zoom and pan configuration
 */
export const VIEWPORT_CONFIG = {
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 3.0,
  ZOOM_STEP: 0.1,
  ZOOM_STEP_LARGE: 0.2,
  LOD_ZOOM_THRESHOLD_LOW: 0.8,
  LOD_ZOOM_THRESHOLD_ULTRA: 0.5,
} as const;

// ============ INTERACTION ============

/**
 * Seat selection configuration
 */
export const SELECTION_CONFIG = {
  MAX_SELECTED_SEATS: 8,
} as const;

/**
 * Performance monitoring thresholds
 */
export const PERFORMANCE_CONFIG = {
  TARGET_FPS: 60,
  WARNING_FPS: 30,
  CRITICAL_FPS: 15,
  TARGET_RENDER_TIME_MS: 16, // 60 FPS = 16.67ms per frame
  WARNING_RENDER_TIME_MS: 33, // 30 FPS
} as const;

/**
 * Hover tooltip configuration
 */
export const HOVER_CONFIG = {
  DEBOUNCE_FAST: 50,        // ms for <1000 visible seats
  DEBOUNCE_SLOW: 100,       // ms for >1000 visible seats
  DISABLE_THRESHOLD: 5000,  // visible seats to disable hover
  TOOLTIP_OFFSET: 10,       // px from cursor
  PERFORMANCE_GATE: 1000,   // seat count threshold for slower debounce
} as const;

// ============ VENUE DATA ============

/**
 * Available venue files for testing
 */
export const VENUE_FILES = {
  default: '/venue.json',
  large: '/large-venue.json',
} as const;

/**
 * Price tier configuration
 */
export interface PriceTier {
  tier: number;
  price: number;
  label: string;
  color: string;
}

export const PRICE_TIERS: Record<number, PriceTier> = {
  1: { tier: 1, price: 150, label: 'Premium', color: '#10b981' },
  2: { tier: 2, price: 100, label: 'Standard', color: '#3b82f6' },
  3: { tier: 3, price: 75, label: 'Economy', color: '#8b5cf6' },
} as const;

// ============ STORAGE ============

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  SELECTED_SEATS: 'event-seating-selected-seats',
  VENUE_DATA: 'event-seating-venue-data',
  THEME: 'event-seating-theme',
} as const;

// ============ KEYBOARD SHORTCUTS ============

/**
 * Keyboard navigation keys
 */
export const KEYBOARD_KEYS = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown', 
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
} as const;

/**
 * Keyboard shortcuts with modifiers
 */
export const KEYBOARD_SHORTCUTS = {
  RESET_VIEW: '0',
  ZOOM_IN: ['=', '+'],
  ZOOM_OUT: ['-'],
  TOGGLE_PERFORMANCE: 'p',
} as const;

// ============ ACCESSIBILITY ============

/**
 * ARIA and accessibility configuration
 */
export const ACCESSIBILITY_CONFIG = {
  SEAT_SELECTION_ANNOUNCE_DELAY: 100, // ms
  FOCUS_OUTLINE_WIDTH: 2, // px
  HIGH_CONTRAST_THRESHOLD: 3.0, // WCAG contrast ratio
} as const;

// ============ ANIMATION ============

/**
 * Animation and transition configuration
 */
export const ANIMATION_CONFIG = {
  THEME_TRANSITION_DURATION: '0.2s',
  HOVER_TRANSITION_DURATION: '0.15s',
  FOCUS_TRANSITION_DURATION: '0.1s',
} as const;

// ============ TYPE EXPORTS ============

export type SeatColor = keyof typeof SEAT_COLORS;
export type VenueType = keyof typeof VENUE_FILES;
export type PriceTierKey = keyof typeof PRICE_TIERS;
export type StorageKey = keyof typeof STORAGE_KEYS;
