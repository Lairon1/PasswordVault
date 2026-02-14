import React from 'react';
import {Text} from 'ink';
import {SelectList} from '../components/SelectList.js';
import {useAppState} from '../hooks/useAppState.js';
import {useLocale} from '../hooks/useLocale.js';

const languageLabels: Record<string, string> = {
    en: 'English',
    ru: 'Русский',
};

export function SettingsScreen() {
    const {pop} = useAppState();
    const {t, language, setLanguage} = useLocale();

    const nextLang = language === 'en' ? 'ru' : 'en';

    const items = [
        {label: `${t('settings.language')}: ${languageLabels[language] ?? language}`, value: 'language'},
        {label: '─'.repeat(20), value: '', separator: true},
        {label: t('settings.back'), value: 'back'},
    ];

    return (
        <>
            <Text bold>{t('settings.title')}</Text>
            <Text dimColor>{'─'.repeat(30)}</Text>
            <SelectList
                items={items}
                onSelect={(item) => {
                    if (item.value === 'language') {
                        setLanguage(nextLang);
                    } else if (item.value === 'back') {
                        pop();
                    }
                }}
                onEscape={pop}
            />
        </>
    );
}
