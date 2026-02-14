import React, {useState, useCallback} from 'react';
import {Text, useApp} from 'ink';
import {SelectList, SelectListItem} from '../components/SelectList.js';
import {useAppState} from '../hooks/useAppState.js';
import {useLocale} from '../hooks/useLocale.js';

export function MainMenuScreen() {
    const {push, vaultService, showNotification} = useAppState();
    const {exit} = useApp();
    const {t} = useLocale();
    const [loading, setLoading] = useState(false);

    const menuItems: SelectListItem[] = [
        {label: t('menu.browse'), value: 'browse'},
        {label: t('menu.create'), value: 'create'},
        {label: t('menu.master'), value: 'master'},
        {label: t('menu.generate'), value: 'generate'},
        {label: '─'.repeat(20), value: '', separator: true},
        {label: t('menu.settings'), value: 'settings'},
        {label: t('menu.exit'), value: 'exit'},
    ];

    const handleSelect = useCallback(async (item: SelectListItem) => {
        switch (item.value) {
            case 'browse': {
                setLoading(true);
                try {
                    const root = await vaultService.loadRootVaultCollection();
                    push({type: 'vault-browser', collection: root});
                } catch {
                    showNotification(t('menu.loadError'));
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
            case 'generate':
                push({type: 'password-generator'});
                break;
            case 'settings':
                push({type: 'settings'});
                break;
            case 'exit':
                exit();
                break;
        }
    }, [push, vaultService, exit, showNotification, t]);

    if (loading) {
        return <Text color="yellow">{t('menu.loading')}</Text>;
    }

    return (
        <>
            <Text bold>{t('menu.title')}</Text>
            <Text dimColor>{'─'.repeat(30)}</Text>
            <SelectList items={menuItems} onSelect={handleSelect} onEscape={exit} />
        </>
    );
}
