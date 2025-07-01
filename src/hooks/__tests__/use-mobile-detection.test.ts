import { renderHook } from '@testing-library/react';
import { useMobileDetection } from '../use-mobile-detection';

// Mock window.innerWidth
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

describe('useMobileDetection', () => {
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('should return true for mobile screen sizes', () => {
    mockInnerWidth(800);
    
    const { result } = renderHook(() => useMobileDetection());
    
    expect(result.current).toBe(true);
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('should return false for desktop screen sizes', () => {
    mockInnerWidth(1200);
    
    const { result } = renderHook(() => useMobileDetection());
    
    expect(result.current).toBe(false);
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('should use custom breakpoint', () => {
    mockInnerWidth(800);
    
    const { result } = renderHook(() => useMobileDetection(900));
    
    expect(result.current).toBe(true);
  });

  it('should return false when width equals breakpoint', () => {
    mockInnerWidth(1024);
    
    const { result } = renderHook(() => useMobileDetection(1024));
    
    expect(result.current).toBe(false);
  });

  it('should cleanup event listener on unmount', () => {
    mockInnerWidth(800);
    
    const { unmount } = renderHook(() => useMobileDetection());
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
