import React from 'react';
import {Text} from 'ink';
import {SelectList} from '../components/SelectList.js';

interface LanguageSelectionScreenProps {
    onSelect: (lang: string) => void;
}

export function LanguageSelectionScreen({onSelect}: LanguageSelectionScreenProps) {
    return (
        <>
            <Text bold>Select language / Выберите язык</Text>
            <Text dimColor>{'─'.repeat(30)}</Text>
            <SelectList
                items={[
                    {label: 'English', value: 'en'},
                    {label: 'Русский', value: 'ru'},
                ]}
                onSelect={(item) => onSelect(item.value)}
            />
        </>
    );
}
