// Helper function to check if running in browser
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Safe cookie operations
export const cookieOperations = {
  get: (name: string): string | undefined => {
    if (!isBrowser()) return undefined;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue ? decodeURIComponent(cookieValue) : undefined;
    }
    return undefined;
  },
  
  set: (name: string, value: string, options: { expires?: number; secure?: boolean; sameSite?: 'strict' | 'lax' } = {}): void => {
    if (!isBrowser()) return;
    
    let cookieString = `${name}=${encodeURIComponent(value)}; path=/`;
    
    if (options.expires) {
      const date = new Date();
      date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
      cookieString += `; expires=${date.toUTCString()}`;
    }
    
    // For development, only set secure flag in production
    if (options.secure && isProduction) {
      cookieString += '; secure';
    }
    
    // For development, use lax instead of strict
    if (options.sameSite) {
      const sameSiteValue = isProduction ? options.sameSite : 'lax';
      cookieString += `; samesite=${sameSiteValue}`;
    }
    
    document.cookie = cookieString;
    
    // Debug logging in development
    if (!isProduction) {
    }
  },
  
  remove: (name: string): void => {
    if (!isBrowser()) return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
};

// Safe localStorage operations
export const storageOperations = {
  get: (key: string): string | null => {
    if (!isBrowser()) return null;
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      console.error('Error accessing localStorage:', e);
      return null;
    }
  },
  
  set: (key: string, value: string): void => {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(key, value);
    
    } catch (e) {
      console.error('Error accessing localStorage:', e);
    }
  },
  
  remove: (key: string): void => {
    if (!isBrowser()) return;
    try {
      window.localStorage.removeItem(key);
      
    } catch (e) {
      console.error('Error accessing localStorage:', e);
    }
  }
};
