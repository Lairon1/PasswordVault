import React from 'react';
import {Text} from 'ink';
import {TextInput} from '../components/TextInput.js';
import {useAppState} from '../hooks/useAppState.js';
import {useLocale} from '../hooks/useLocale.js';

export function MasterPasswordScreen() {
    const {pop, setMasterPassword, showNotification} = useAppState();
    const {t} = useLocale();

    return (
        <>
            <Text bold>{t('master.title')}</Text>
            <Text dimColor>{'─'.repeat(30)}</Text>
            <Text dimColor>{t('master.description')}</Text>
            <Text dimColor>{t('master.escapeBack')}</Text>
            <TextInput
                prompt={t('master.password')}
                mask
                onSubmit={(value) => {
                    if (value) {
                        setMasterPassword(value);
                        showNotification(t('master.set'));
                    }
                    pop();
                }}
                onCancel={pop}
            />
        </>
    );
}
