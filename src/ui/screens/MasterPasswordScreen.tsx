import React from 'react';
import {Text} from 'ink';
import {TextInput} from '../components/TextInput.js';
import {useAppState} from '../hooks/useAppState.js';

export function MasterPasswordScreen() {
    const {pop, setMasterPassword, showNotification} = useAppState();

    return (
        <>
            <Text bold>Мастер пароль</Text>
            <Text dimColor>{'─'.repeat(30)}</Text>
            <Text dimColor>Введите мастер пароль для автоматической расшифровки</Text>
            <Text dimColor>Escape — назад</Text>
            <TextInput
                prompt="Пароль"
                mask
                onSubmit={(value) => {
                    if (value) {
                        setMasterPassword(value);
                        showNotification('Мастер пароль установлен');
                    }
                    pop();
                }}
                onCancel={pop}
            />
        </>
    );
}
