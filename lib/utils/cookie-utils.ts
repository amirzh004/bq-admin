export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

const isProduction = process.env.NODE_ENV === 'production';

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
    
    if (options.secure && isProduction) {
      cookieString += '; secure';
    }
    
    if (options.sameSite) {
      const sameSiteValue = isProduction ? options.sameSite : 'lax';
      cookieString += `; samesite=${sameSiteValue}`;
    }
    
    document.cookie = cookieString;
  },
  
  remove: (name: string): void => {
    if (!isBrowser()) return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
};

export const storageOperations = {
  get: (key: string): string | null => {
    if (!isBrowser()) return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Error accessing localStorage:', e);
      return null;
    }
  },
  
  set: (key: string, value: string): void => {
    if (!isBrowser()) return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Error accessing localStorage:', e);
    }
  },
  
  remove: (key: string): void => {
    if (!isBrowser()) return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error accessing localStorage:', e);
    }
  }
};