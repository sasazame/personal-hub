import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Type assertion to avoid TypeScript issues
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial value when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    expect(result.current[0]).toBe('initial');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
  });

  it('should return stored value when localStorage has data', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify('stored-value'));
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    expect(result.current[0]).toBe('stored-value');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
  });

  it('should handle boolean values correctly', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(true));
    
    const { result } = renderHook(() => useLocalStorage('test-boolean', false));
    
    expect(result.current[0]).toBe(true);
  });

  it('should update localStorage when value changes', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('new-value');
    });
    
    expect(result.current[0]).toBe('new-value');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'));
  });

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));
    
    expect(result.current[0]).toBe('fallback');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error reading localStorage key "test-key":',
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });

  it('should handle setItem errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage setItem error');
    });
    
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('new-value');
    });
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error setting localStorage key "test-key":',
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });

  it('should work with complex objects', () => {
    const complexObject = { name: 'test', collapsed: true, settings: { theme: 'dark' } };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(complexObject));
    
    const { result } = renderHook(() => useLocalStorage('complex-key', {}));
    
    expect(result.current[0]).toEqual(complexObject);
  });

  it('should handle SSR environment (no window)', () => {
    // Temporarily remove window
    const originalWindow = global.window;
    // @ts-expect-error - Intentionally deleting window for SSR testing
    delete global.window;
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'ssr-default'));
    
    expect(result.current[0]).toBe('ssr-default');
    
    // Restore window
    global.window = originalWindow;
  });
});