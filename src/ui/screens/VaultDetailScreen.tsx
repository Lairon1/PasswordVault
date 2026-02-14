import React, {useState, useEffect, useCallback} from 'react';
import {Text} from 'ink';
import {SelectList, SelectListItem} from '../components/SelectList.js';
import {useAppState} from '../hooks/useAppState.js';
import {useClipboard} from '../hooks/useClipboard.js';
import {useLocale} from '../hooks/useLocale.js';
import {Vault, VaultContent} from '../../dto/vault.dto.js';
import {AppUtils} from '../../utils/app.utils.js';

interface VaultDetailScreenProps {
    vault: Vault;
    content: VaultContent;
}

export function VaultDetailScreen({vault, content}: VaultDetailScreenProps) {
    const {pop, vaultService, showNotification} = useAppState();
    const {copyToClipboard} = useClipboard();
    const {t} = useLocale();
    const [totpCode, setTotpCode] = useState<string>('');
    const [totpRemaining, setTotpRemaining] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        if (!content.totpSecret) return;

        const period = 30;
        const update = () => {
            setTotpCode(AppUtils.generateTOTP(content.totpSecret!, period));
            setTotpRemaining(period - Math.floor(Date.now() / 1000) % period);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [content.totpSecret]);

    const handleDelete = useCallback(async () => {
        setDeleting(true);
        try {
            await vaultService.deleteVault(vault);
            showNotification(t('detail.vaultDeleted'));
            pop();
        } catch {
            showNotification(t('detail.deleteError'));
            setDeleting(false);
            setConfirmDelete(false);
        }
    }, [vault, vaultService, pop, showNotification, t]);

    const items: SelectListItem[] = [];

    if (content.login) {
        items.push({label: `${t('detail.login')}: ${content.login}`, value: 'login'});
    }
    if (content.password) {
        items.push({label: `${t('detail.password')}: ********`, value: 'password'});
    }
    if (content.totpSecret) {
        items.push({label: t('detail.totp', {code: totpCode, remaining: totpRemaining}), value: 'totp'});
    }

    if (content.extraData) {
        items.push({label: '─'.repeat(20), value: '', separator: true});
        for (const [key, val] of Object.entries(content.extraData)) {
            items.push({label: `${key}: ${val}`, value: `extra:${key}`});
        }
    }

    items.push({label: '─'.repeat(20), value: '', separator: true});
    items.push({label: t('detail.deleteVault'), value: 'delete', color: 'red'});
    items.push({label: '─'.repeat(20), value: '', separator: true});
    items.push({label: t('detail.back'), value: 'back'});

    const handleSelect = useCallback(async (item: SelectListItem) => {
        switch (item.value) {
            case 'login':
                copyToClipboard(content.login!);
                break;
            case 'password':
                copyToClipboard(content.password!);
                break;
            case 'totp':
                copyToClipboard(totpCode);
                break;
            case 'delete':
                setConfirmDelete(true);
                break;
            case 'back':
                pop();
                break;
            default:
                if (item.value.startsWith('extra:')) {
                    const key = item.value.slice(6);
                    copyToClipboard(content.extraData![key]);
                }
                break;
        }
    }, [content, totpCode, pop, copyToClipboard]);

    if (deleting) {
        return <Text color="yellow">{t('detail.deleting')}</Text>;
    }

    if (confirmDelete) {
        return (
            <>
                <Text bold color="red">{t('detail.confirmDelete', {name: vault.name})}</Text>
                <Text dimColor>{t('detail.irreversible')}</Text>
                <SelectList
                    items={[
                        {label: t('detail.no'), value: 'no'},
                        {label: t('detail.yesDelete'), value: 'yes', color: 'red'},
                    ]}
                    onSelect={(item) => {
                        if (item.value === 'yes') handleDelete();
                        else setConfirmDelete(false);
                    }}
                    onEscape={() => setConfirmDelete(false)}
                />
            </>
        );
    }

    return (
        <>
            <Text bold>🔑 {vault.name}</Text>
            <Text dimColor>{'─'.repeat(30)}</Text>
            <SelectList items={items} onSelect={handleSelect} onEscape={pop} />
        </>
    );
}
