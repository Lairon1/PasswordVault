import React, {useState, useCallback} from 'react';
import {Text, useApp} from 'ink';
import {SelectList, SelectListItem} from '../components/SelectList.js';
import {useAppState} from '../hooks/useAppState.js';

const menuItems: SelectListItem[] = [
    {label: 'Хранилище', value: 'browse'},
    {label: 'Создать хранилище', value: 'create'},
    {label: 'Ввести мастер пароль', value: 'master'},
    {label: 'Выход (Esc)', value: 'exit'},
];

export function MainMenuScreen() {
    const {push, vaultService, showNotification} = useAppState();
    const {exit} = useApp();
    const [loading, setLoading] = useState(false);

    const handleSelect = useCallback(async (item: SelectListItem) => {
        switch (item.value) {
            case 'browse': {
                setLoading(true);
                try {
                    const root = await vaultService.loadRootVaultCollection();
                    push({type: 'vault-browser', collection: root});
                } catch {
                    showNotification('Ошибка загрузки хранилища');
                } finally {
                    setLoading(false);
                }
                break;
            }
            case 'create':
                push({type: 'create-vault'});
                break;
            case 'master':
                push({type: 'master-password'});
                break;
            case 'exit':
                exit();
                break;
        }
    }, [push, vaultService, exit, showNotification]);

    if (loading) {
        return <Text color="yellow">Загрузка...</Text>;
    }

    return (
        <>
            <Text bold>Меню</Text>
            <Text dimColor>{'─'.repeat(30)}</Text>
            <SelectList items={menuItems} onSelect={handleSelect} onEscape={exit} />
        </>
    );
}
