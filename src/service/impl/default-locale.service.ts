import {LocaleService} from '../locale.service.js';
import ru from '../../i18n/ru.json' with { type: 'json' };
import en from '../../i18n/en.json' with { type: 'json' };

type Messages = Record<string, string>;

const locales: Record<string, Messages> = {ru, en};

export class DefaultLocaleService implements LocaleService {
    private language: string = 'en';

    setLanguage(lang: string): void {
        this.language = lang;
    }

    getLanguage(): string {
        return this.language;
    }

    t(key: string, params?: Record<string, string | number>): string {
        const messages = locales[this.language] || locales['en'];
        let value = messages[key] ?? key;
        if (params) {
            for (const [k, v] of Object.entries(params)) {
                value = value.split(`{{${k}}}`).join(String(v));
            }
        }
        return value;
    }
}
