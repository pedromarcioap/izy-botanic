'use client';

import { useState, useEffect, useCallback } from 'react';

// Helper to check if we are in a browser environment
const isBrowser = typeof window !== 'undefined';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Pass a function to useState so this logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isBrowser) {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (!isBrowser) {
        console.warn('Attempted to set localStorage value in a non-browser environment.');
        return;
      }
      try {
        setStoredValue((prev) => {
          // Allow value to be a function so we have the same API as useState
          const valueToStore = value instanceof Function ? value(prev) : value;
          // Save to local storage
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    },
    [key]
  );

  // Listen for changes from other tabs/windows
  useEffect(() => {
    if (!isBrowser) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea === window.localStorage && event.key === key) {
        try {
          if (event.newValue !== null) {
            const newValue = JSON.parse(event.newValue);
            // Check if the value has actually changed to prevent infinite loops
            if (JSON.stringify(storedValue) !== JSON.stringify(newValue)) {
              setStoredValue(newValue);
            }
          } else {
            // The value was removed from localStorage
            setStoredValue(initialValue);
          }
        } catch (error) {
          console.warn(`Error parsing storage event value for key “${key}”:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue, storedValue]);

  return [storedValue, setValue];
}
