import React, {useState} from 'react';
import {Text} from 'ink';
import {TextInput} from '../components/TextInput.js';
import {useAppState} from '../hooks/useAppState.js';
import {Vault, VaultContent} from '../../dto/vault.dto.js';

interface PasswordPromptScreenProps {
    vault: Vault;
    onSuccess: (content: VaultContent) => void;
}

export function PasswordPromptScreen({vault, onSuccess}: PasswordPromptScreenProps) {
    const {pop, replaceTop, vaultService} = useAppState();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [key, setKey] = useState(0);

    const handleSubmit = async (password: string) => {
        if (!password) return;
        setLoading(true);
        setError(null);
        try {
            const content = await vaultService.decryptVault(vault, password);
            replaceTop({type: 'vault-detail', vault, content});
        } catch {
            setError('Неверный пароль. Попробуйте снова.');
            setKey(prev => prev + 1);
            setLoading(false);
        }
    };

    if (loading) {
        return <Text color="yellow">Расшифровка...</Text>;
    }

    return (
        <>
            <Text bold>🔒 Пароль для {vault.name}</Text>
            <Text dimColor>{'─'.repeat(30)}</Text>
            <Text dimColor>Назад — Escape</Text>
            {error && <Text color="red">{error}</Text>}
            <TextInput
                key={key}
                prompt="Пароль"
                mask
                onSubmit={handleSubmit}
                onCancel={pop}
            />
        </>
    );
}
