import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../ui/theme-provider';
import { VenueControls } from '../controls/venue-controls';

// Mock the venue store
jest.mock('@/store/venue-store', () => ({
  useVenueStore: () => ({
    heatMapMode: false,
    toggleHeatMap: jest.fn(),
  }),
}));

const MockVenueControlsWithProvider = () => (
  <ThemeProvider>
    <VenueControls
      onZoomIn={jest.fn()}
      onZoomOut={jest.fn()}
      onResetView={jest.fn()}
      zoom={1}
    />
  </ThemeProvider>
);

describe('Theme Switching', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document classes
    document.documentElement.className = '';
  });

  it('should toggle between light and dark themes', () => {
    render(<MockVenueControlsWithProvider />);
    
    const themeButton = screen.getByLabelText(/switch to dark mode/i);
    expect(themeButton).toBeInTheDocument();
    
    // Click to switch to dark mode
    fireEvent.click(themeButton);
    
    // Check if dark class was added to html element
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    // Check if button text changed
    const lightModeButton = screen.getByLabelText(/switch to light mode/i);
    expect(lightModeButton).toBeInTheDocument();
    
    // Click to switch back to light mode
    fireEvent.click(lightModeButton);
    
    // Check if dark class was removed
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should persist theme preference in localStorage', () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });

    render(<MockVenueControlsWithProvider />);
    
    const themeButton = screen.getByLabelText(/switch to dark mode/i);
    
    // Switch to dark mode
    fireEvent.click(themeButton);
    
    // Check if preference was saved
    expect(localStorageMock.setItem).toHaveBeenCalledWith('ui-theme', 'dark');
  });
});
