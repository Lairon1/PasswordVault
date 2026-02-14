import React, {useState, useEffect, useCallback} from 'react';
import {Text} from 'ink';
import {TextInput} from '../components/TextInput.js';
import {SelectList, SelectListItem} from '../components/SelectList.js';
import {useAppState} from '../hooks/useAppState.js';
import {useLocale} from '../hooks/useLocale.js';
import {AlgorithmType} from '../../dto/algorithm.type.js';
import {VaultCollection} from '../../dto/vault.dto.js';

type EditMode =
    | { type: 'navigate' }
    | { type: 'edit'; field: string }
    | { type: 'select-collection' }
    | { type: 'new-collection' }
    | { type: 'select-algorithm' }
    | { type: 'add-extra-key' }
    | { type: 'add-extra-value'; key: string }
    | { type: 'saving' }
    | { type: 'error'; message: string };

const algorithmItems: SelectListItem[] = [
    {label: AlgorithmType.AES_256_GCM, value: AlgorithmType.AES_256_GCM},
    {label: AlgorithmType.CHA_CHA20_POLY1305, value: AlgorithmType.CHA_CHA20_POLY1305},
    {label: AlgorithmType.TWOFISH_CTR, value: AlgorithmType.TWOFISH_CTR},
    {label: AlgorithmType.BLOWFISH_CBC, value: AlgorithmType.BLOWFISH_CBC},
];

export function CreateVaultScreen() {
    const {pop, replaceTop, vaultService, showNotification} = useAppState();
    const {t} = useLocale();

    const [mode, setMode] = useState<EditMode>({type: 'navigate'});
    const [name, setName] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [totpSecret, setTotpSecret] = useState('');
    const [extraData, setExtraData] = useState<Record<string, string>>({});
    const [selectedCollection, setSelectedCollection] = useState<VaultCollection | null>(null);
    const [algorithm, setAlgorithm] = useState<AlgorithmType>(AlgorithmType.AES_256_GCM);
    const [encryptPassword, setEncryptPassword] = useState('');
    const [rootCollection, setRootCollection] = useState<VaultCollection | null>(null);
    const [inputKey, setInputKey] = useState(0);

    useEffect(() => {
        vaultService.loadRootVaultCollection().then(setRootCollection).catch(() => {});
    }, [vaultService]);

    const nextInput = useCallback(() => setInputKey(prev => prev + 1), []);

    const collectionLabel = selectedCollection
        ? (selectedCollection === rootCollection ? t('create.root') : selectedCollection.collectionName)
        : t('create.root');

    const validate = (): string | null => {
        if (!name) return t('create.nameRequired');
        if (!login && !password && !totpSecret && Object.keys(extraData).length === 0) {
            return t('create.dataRequired');
        }
        if (!encryptPassword) return t('create.encryptPasswordRequired');
        return null;
    };

    const save = useCallback(async () => {
        const err = validate();
        if (err) {
            showNotification(err);
            return;
        }
        setMode({type: 'saving'});
        try {
            const parentCollection = selectedCollection || rootCollection!;
            const vaultContent = {
                login: login || undefined,
                password: password || undefined,
                totpSecret: totpSecret || undefined,
                extraData: Object.keys(extraData).length > 0 ? extraData : undefined,
            };
            const vault = {name, parentCollection};
            const savedVault = await vaultService.saveOrCreateVault(vault, vaultContent, algorithm, encryptPassword);
            showNotification(t('create.created'));
            replaceTop({type: 'vault-detail', vault: savedVault, content: vaultContent});
        } catch (e) {
            setMode({type: 'error', message: e instanceof Error ? e.message : t('create.unknownError')});
        }
    }, [name, login, password, totpSecret, extraData, selectedCollection, rootCollection, algorithm, encryptPassword, vaultService, showNotification, replaceTop, t]);

    const collectCollections = (col: VaultCollection): SelectListItem[] => {
        const result: SelectListItem[] = [];
        for (const child of col.childCollections) {
            result.push({label: `📁 ${child.collectionName}`, value: child.collectionName});
            for (const nested of collectCollections(child)) {
                result.push({label: `  ${nested.label}`, value: `${child.collectionName}/${nested.value}`});
            }
        }
        return result;
    };

    const findCollection = (col: VaultCollection, path: string): VaultCollection | null => {
        const parts = path.split('/');
        let current = col;
        for (const part of parts) {
            const found = current.childCollections.find(c => c.collectionName === part);
            if (!found) return null;
            current = found;
        }
        return current;
    };

    const ns = t('create.notSet');

    const formItems: SelectListItem[] = [
        {label: `${t('create.fieldName')}: ${name || ns}`, value: 'name'},
        {label: `${t('create.fieldLogin')}: ${login || ns}`, value: 'login'},
        {label: `${t('create.fieldPassword')}: ${password ? '********' : ns}`, value: 'password'},
        {label: `${t('create.fieldTotp')}: ${totpSecret || ns}`, value: 'totp'},
    ];

    for (const [key, val] of Object.entries(extraData)) {
        formItems.push({label: `  ✕ ${key}: ${val}`, value: `remove-extra:${key}`, color: 'yellow'});
    }
    formItems.push({label: t('create.addExtra'), value: 'add-extra'});

    formItems.push({label: '─'.repeat(20), value: '', separator: true});
    formItems.push({label: `${t('create.collection')}: 📁 ${collectionLabel}`, value: 'collection'});
    formItems.push({label: `${t('create.algorithm')}: ${algorithm}`, value: 'algorithm'});
    formItems.push({label: `${t('create.fieldEncryptPassword')}: ${encryptPassword ? '********' : ns}`, value: 'encrypt-password'});
    formItems.push({label: '─'.repeat(20), value: '', separator: true});
    formItems.push({label: t('create.save'), value: 'save', color: 'green'});
    formItems.push({label: t('create.back'), value: 'back'});

    const handleFormSelect = useCallback((item: SelectListItem) => {
        switch (item.value) {
            case 'name':
            case 'login':
            case 'totp':
                nextInput();
                setMode({type: 'edit', field: item.value});
                break;
            case 'password':
            case 'encrypt-password':
                nextInput();
                setMode({type: 'edit', field: item.value});
                break;
            case 'add-extra':
                nextInput();
                setMode({type: 'add-extra-key'});
                break;
            case 'collection':
                setMode({type: 'select-collection'});
                break;
            case 'algorithm':
                setMode({type: 'select-algorithm'});
                break;
            case 'save':
                save();
                break;
            case 'back':
                pop();
                break;
            default:
                if (item.value.startsWith('remove-extra:')) {
                    const key = item.value.slice(13);
                    setExtraData(prev => {
                        const next = {...prev};
                        delete next[key];
                        return next;
                    });
                }
                break;
        }
    }, [nextInput, save, pop]);

    const getFieldValue = (field: string): string => {
        switch (field) {
            case 'name': return name;
            case 'login': return login;
            case 'password': return password;
            case 'totp': return totpSecret;
            case 'encrypt-password': return encryptPassword;
            default: return '';
        }
    };

    const setFieldValue = (field: string, value: string) => {
        switch (field) {
            case 'name': setName(value); break;
            case 'login': setLogin(value); break;
            case 'password': setPassword(value); break;
            case 'totp': setTotpSecret(value); break;
            case 'encrypt-password': setEncryptPassword(value); break;
        }
    };

    const fieldPrompt = (field: string): string => {
        switch (field) {
            case 'name': return t('create.fieldName');
            case 'login': return t('create.fieldLogin');
            case 'password': return t('create.fieldPassword');
            case 'totp': return t('create.fieldTotp');
            case 'encrypt-password': return t('create.fieldEncryptPassword');
            default: return '';
        }
    };

    const isMaskField = (field: string) => field === 'password' || field === 'encrypt-password';

    // --- Render based on mode ---

    if (mode.type === 'saving') {
        return <Text color="yellow">{t('create.saving')}</Text>;
    }

    if (mode.type === 'error') {
        return (
            <>
                <Text color="red">{t('create.error')}: {mode.message}</Text>
                <SelectList items={[
                    {label: t('create.retry'), value: 'retry'},
                    {label: t('create.back'), value: 'back'},
                ]} onSelect={(item) => {
                    if (item.value === 'retry') save();
                    else pop();
                }} onEscape={pop} />
            </>
        );
    }

    if (mode.type === 'edit') {
        return (
            <>
                <Text bold>{t('create.title')}</Text>
                <Text dimColor>{t('create.editField')}</Text>
                <TextInput
                    key={inputKey}
                    prompt={fieldPrompt(mode.field)}
                    mask={isMaskField(mode.field)}
                    initialValue={getFieldValue(mode.field)}
                    onSubmit={(v) => {
                        setFieldValue(mode.field, v);
                        setMode({type: 'navigate'});
                    }}
                    onCancel={() => setMode({type: 'navigate'})}
                />
            </>
        );
    }

    if (mode.type === 'add-extra-key') {
        return (
            <>
                <Text bold>{t('create.title')}</Text>
                <Text dimColor>{t('create.extraKeyPrompt')}</Text>
                <TextInput
                    key={inputKey}
                    prompt={t('create.key')}
                    onSubmit={(v) => {
                        if (!v) { setMode({type: 'navigate'}); return; }
                        nextInput();
                        setMode({type: 'add-extra-value', key: v});
                    }}
                    onCancel={() => setMode({type: 'navigate'})}
                />
            </>
        );
    }

    if (mode.type === 'add-extra-value') {
        return (
            <>
                <Text bold>{t('create.title')}</Text>
                <Text dimColor>{t('create.extraValuePrompt', {key: mode.key})}</Text>
                <TextInput
                    key={inputKey}
                    prompt={t('create.value')}
                    onSubmit={(v) => {
                        setExtraData(prev => ({...prev, [mode.key]: v}));
                        setMode({type: 'navigate'});
                    }}
                    onCancel={() => setMode({type: 'navigate'})}
                />
            </>
        );
    }

    if (mode.type === 'select-collection') {
        const collectionItems: SelectListItem[] = [
            {label: t('create.rootCollection'), value: 'root'},
            ...(rootCollection ? collectCollections(rootCollection) : []),
            {label: t('create.newCollection'), value: 'new'},
            {label: t('create.cancel'), value: 'cancel'},
        ];
        return (
            <>
                <Text bold>{t('create.title')}</Text>
                <Text dimColor>{t('create.selectCollection')}</Text>
                <SelectList items={collectionItems} onSelect={(item) => {
                    if (item.value === 'cancel') {
                        setMode({type: 'navigate'});
                    } else if (item.value === 'root') {
                        setSelectedCollection(rootCollection);
                        setMode({type: 'navigate'});
                    } else if (item.value === 'new') {
                        nextInput();
                        setMode({type: 'new-collection'});
                    } else {
                        const found = rootCollection ? findCollection(rootCollection, item.value) : null;
                        setSelectedCollection(found);
                        setMode({type: 'navigate'});
                    }
                }} onEscape={() => setMode({type: 'navigate'})} />
            </>
        );
    }

    if (mode.type === 'new-collection') {
        return (
            <>
                <Text bold>{t('create.title')}</Text>
                <Text dimColor>{t('create.newCollectionName')}</Text>
                <TextInput
                    key={inputKey}
                    prompt={t('create.collectionName')}
                    onSubmit={async (v) => {
                        if (!v) { setMode({type: 'select-collection'}); return; }
                        try {
                            const newCol = await vaultService.createVaultCollection({
                                collectionName: v,
                                childCollections: [],
                                vaults: [],
                                parentCollection: rootCollection || undefined,
                            });
                            setSelectedCollection(newCol);
                            setMode({type: 'navigate'});
                        } catch {
                            showNotification(t('create.collectionError'));
                            setMode({type: 'select-collection'});
                        }
                    }}
                    onCancel={() => setMode({type: 'select-collection'})}
                />
            </>
        );
    }

    if (mode.type === 'select-algorithm') {
        const items: SelectListItem[] = [
            ...algorithmItems,
            {label: t('create.cancel'), value: 'cancel'},
        ];
        return (
            <>
                <Text bold>{t('create.title')}</Text>
                <Text dimColor>{t('create.selectAlgorithm')}</Text>
                <SelectList items={items} onSelect={(item) => {
                    if (item.value === 'cancel') {
                        setMode({type: 'navigate'});
                    } else {
                        setAlgorithm(item.value as AlgorithmType);
                        setMode({type: 'navigate'});
                    }
                }} onEscape={() => setMode({type: 'navigate'})} />
            </>
        );
    }

    // Default: navigate mode — show the form
    return (
        <>
            <Text bold>{t('create.title')}</Text>
            <Text dimColor>{'─'.repeat(30)}</Text>
            <SelectList items={formItems} onSelect={handleFormSelect} onEscape={pop} />
        </>
    );
}
