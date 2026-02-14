export interface LocaleService {
    setLanguage(lang: string): void;
    getLanguage(): string;
    t(key: string, params?: Record<string, string | number>): string;
}
