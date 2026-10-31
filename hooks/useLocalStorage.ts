"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { decodeStorage, encodeStorage } from "@/lib/storage";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validate: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>, boolean, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);
  const [safeToSave, setSafeToSave] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key);
      if (saved !== null) {
        // Browser-only reads happen after hydration so server and client markup match.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValue(decodeStorage(saved, validate));
      }
      setSafeToSave(true);
    } catch (error) {
      console.error(`Could not load "${key}" from local storage.`, error);
      setStorageError(true);
    } finally {
      setLoaded(true);
    }
  }, [key, validate]);

  useEffect(() => {
    if (!loaded || !safeToSave) return;
    try {
      window.localStorage.setItem(key, encodeStorage(value));
    } catch (error) {
      console.error(`Could not save "${key}" to local storage.`, error);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Show storage failures to the user.
      setStorageError(true);
    }
  }, [key, loaded, safeToSave, value]);

  return [value, setValue, loaded, storageError];
}
