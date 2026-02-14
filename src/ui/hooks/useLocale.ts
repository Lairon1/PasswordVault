import React, {createContext, useContext} from 'react';

export interface LocaleContextValue {
    t: (key: string, params?: Record<string, string | number>) => string;
    language: string;
    setLanguage: (lang: string) => void;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale(): LocaleContextValue {
    const ctx = useContext(LocaleContext);
    if (!ctx) throw new Error('useLocale must be used within LocaleContext.Provider');
    return ctx;
}
