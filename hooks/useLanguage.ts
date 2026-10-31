"use client";

import { useMemo } from "react";
import { translations } from "@/lib/translations";
import { isLanguage, LANGUAGE_STORAGE_KEY } from "@/lib/storage";
import { useLocalStorage } from "./useLocalStorage";
import type { Language } from "@/types/game";

export function useLanguage() {
  const [savedLanguage, setSavedLanguage, loaded, storageError] =
    useLocalStorage<Language | null>(LANGUAGE_STORAGE_KEY, null, isLanguage);
  const language = savedLanguage ?? "en";
  const text = useMemo(() => translations[language], [language]);

  return {
    language,
    text,
    loaded,
    storageError,
    hasSelectedLanguage: savedLanguage !== null,
    chooseLanguage: setSavedLanguage,
  };
}
