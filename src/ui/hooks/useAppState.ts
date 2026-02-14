import React, {createContext, useCallback, useContext, useMemo, useRef, useState} from 'react';
import {VaultService} from '../../service/vault.service.js';
import {Vault, VaultCollection, VaultContent} from '../../dto/vault.dto.js';

export type Screen =
    | { type: 'main-menu' }
    | { type: 'vault-browser'; collection: VaultCollection }
    | { type: 'vault-detail'; vault: Vault; content: VaultContent }
    | { type: 'create-vault' }
    | { type: 'master-password' }
    | { type: 'password-prompt'; vault: Vault; onSuccess: (content: VaultContent) => void }
    | { type: 'password-generator' };

interface AppState {
    screenStack: Screen[];
    masterPassword: string | null;
    notification: string | null;
    vaultService: VaultService;
    push: (screen: Screen) => void;
    pop: () => void;
    replaceTop: (screen: Screen) => void;
    setMasterPassword: (password: string) => void;
    showNotification: (message: string) => void;
}

const AppStateContext = createContext<AppState | null>(null);

export function useAppState(): AppState {
    const ctx = useContext(AppStateContext);
    if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
    return ctx;
}

export { AppStateContext };

export function useAppStateProvider(vaultService: VaultService): AppState {
    const [screenStack, setScreenStack] = useState<Screen[]>([{type: 'main-menu'}]);
    const [masterPassword, setMasterPasswordState] = useState<string | null>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const push = useCallback((screen: Screen) => {
        setScreenStack(prev => [...prev, screen]);
    }, []);

    const pop = useCallback(() => {
        setScreenStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
    }, []);

    const replaceTop = useCallback((screen: Screen) => {
        setScreenStack(prev => prev.length > 1 ? [...prev.slice(0, -1), screen] : [screen]);
    }, []);

    const setMasterPassword = useCallback((password: string) => {
        setMasterPasswordState(password);
    }, []);

    const showNotification = useCallback((message: string) => {
        setNotification(message);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setNotification(null), 2000);
    }, []);

    return useMemo(() => ({
        screenStack,
        masterPassword,
        notification,
        vaultService,
        push,
        pop,
        replaceTop,
        setMasterPassword,
        showNotification,
    }), [screenStack, masterPassword, notification, vaultService, push, pop, replaceTop, setMasterPassword, showNotification]);
}
