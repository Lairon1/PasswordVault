import React, {useCallback, useState} from 'react';
import {Text} from 'ink';
import {SelectList, SelectListItem} from '../components/SelectList.js';
import {useAppState} from '../hooks/useAppState.js';
import {useLocale} from '../hooks/useLocale.js';
import {VaultCollection} from '../../dto/vault.dto.js';

interface VaultBrowserScreenProps {
    collection: VaultCollection;
}

export function VaultBrowserScreen({collection}: VaultBrowserScreenProps) {
    const {push, pop, vaultService, masterPassword, showNotification} = useAppState();
    const {t} = useLocale();
    const [loading, setLoading] = useState(false);
    const [confirmDeleteCollection, setConfirmDeleteCollection] = useState(false);

    const isRoot = !collection.parentCollection;

    const items: SelectListItem[] = [
        ...collection.childCollections.map(c => ({
            label: `📁 ${c.collectionName}`,
            value: `col:${c.collectionName}`,
        })),
        ...(collection.vaults.length > 0  && collection.childCollections.length > 0 ? [{label: '─'.repeat(20), value: '', separator: true}] : []),
        ...collection.vaults.map(v => ({
            label: `🔑 ${v.name}`,
            value: `vault:${v.name}`,
        })),
    ];

    if (!isRoot) {
        items.push({label: '─'.repeat(20), value: '', separator: true});
        items.push({label: t('browser.deleteCollection'), value: 'delete-collection', color: 'red'});
    }

    items.push({label: '─'.repeat(20), value: '', separator: true});
    items.push({label: t('browser.back'), value: 'back'});

    const handleDeleteCollection = useCallback(async () => {
        setLoading(true);
        try {
            await vaultService.deleteVaultCollection(collection);
            showNotification(t('browser.collectionDeleted'));
            pop();
        } catch {
            showNotification(t('browser.deleteError'));
            setLoading(false);
            setConfirmDeleteCollection(false);
        }
    }, [collection, vaultService, pop, showNotification, t]);

    const handleSelect = useCallback(async (item: SelectListItem) => {
        if (item.value === 'back') {
            pop();
            return;
        }

        if (item.value === 'delete-collection') {
            setConfirmDeleteCollection(true);
            return;
        }

        if (item.value.startsWith('col:')) {
            const col = collection.childCollections.find(
                c => `col:${c.collectionName}` === item.value
            );
            if (col) push({type: 'vault-browser', collection: col});
            return;
        }

        if (item.value.startsWith('vault:')) {
            const vault = collection.vaults.find(
                v => `vault:${v.name}` === item.value
            );
            if (!vault) return;

            if (masterPassword) {
                setLoading(true);
                try {
                    const content = await vaultService.decryptVault(vault, masterPassword);
                    push({type: 'vault-detail', vault, content});
                    return;
                } catch {
                    // master password failed, fall through to password prompt
                } finally {
                    setLoading(false);
                }
            }

            push({
                type: 'password-prompt',
                vault,
                onSuccess: (content) => {
                    push({type: 'vault-detail', vault, content});
                },
            });
        }
    }, [collection, push, pop, vaultService, masterPassword]);

    if (loading) {
        return <Text color="yellow">{t('browser.loading')}</Text>;
    }

    if (confirmDeleteCollection) {
        const hasContent = collection.childCollections.length > 0 || collection.vaults.length > 0;
        return (
            <>
                <Text bold color="red">{t('browser.confirmDeleteCollection', {name: collection.collectionName})}</Text>
                {hasContent && <Text color="yellow">{t('browser.hasNestedContent')}</Text>}
                <Text dimColor>{t('browser.irreversible')}</Text>
                <SelectList
                    items={[
                        {label: t('browser.no'), value: 'no'},
                        {label: t('browser.yesDelete'), value: 'yes', color: 'red'},
                    ]}
                    onSelect={(item) => {
                        if (item.value === 'yes') handleDeleteCollection();
                        else setConfirmDeleteCollection(false);
                    }}
                    onEscape={() => setConfirmDeleteCollection(false)}
                />
            </>
        );
    }

    return (
        <>
            <Text bold>📁 {collection.collectionName}</Text>
            <Text dimColor>{'─'.repeat(30)}</Text>
            <SelectList items={items} onSelect={handleSelect} onEscape={pop} />
        </>
    );
}
