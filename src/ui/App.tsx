import React, {useState, useEffect, useCallback} from 'react';
import {Box, useInput} from 'ink';
import {container} from '../container.js';
import {VaultService} from '../service/vault.service.js';
import {ConfigService, AppConfig} from '../service/config.service.js';
import {LocaleService} from '../service/locale.service.js';
import {AppStateContext, useAppStateProvider} from './hooks/useAppState.js';
import {LocaleContext, LocaleContextValue} from './hooks/useLocale.js';
import {LeftPanel} from './components/LeftPanel.js';
import {Notification} from './components/Notification.js';
import {MainMenuScreen} from './screens/MainMenuScreen.js';
import {VaultBrowserScreen} from './screens/VaultBrowserScreen.js';
import {VaultDetailScreen} from './screens/VaultDetailScreen.js';
import {CreateVaultScreen} from './screens/CreateVaultScreen.js';
import {MasterPasswordScreen} from './screens/MasterPasswordScreen.js';
import {PasswordPromptScreen} from './screens/PasswordPromptScreen.js';
import {PasswordGeneratorScreen} from './screens/PasswordGeneratorScreen.js';
import {LanguageSelectionScreen} from './screens/LanguageSelectionScreen.js';
import {SettingsScreen} from './screens/SettingsScreen.js';

const vaultService = container.resolve<VaultService>('vaultService');
const configService = container.resolve<ConfigService>('configService');
const localeService = container.resolve<LocaleService>('localeService');

function AppContent() {
    const appState = useAppStateProvider(vaultService);
    const stackDepth = appState.screenStack.length;
    const currentScreen = appState.screenStack[stackDepth - 1];

    // Persistent useInput keeps stdin in raw mode during screen transitions,
    // preventing the dead zone where no useInput is subscribed.
    useInput(() => {});

    const screenKey = `${stackDepth}-${currentScreen.type}`;

    const renderScreen = () => {
        switch (currentScreen.type) {
            case 'main-menu':
                return <MainMenuScreen key={screenKey} />;
            case 'vault-browser':
                return <VaultBrowserScreen key={screenKey} collection={currentScreen.collection} />;
            case 'vault-detail':
                return <VaultDetailScreen key={screenKey} vault={currentScreen.vault} content={currentScreen.content} />;
            case 'create-vault':
                return <CreateVaultScreen key={screenKey} />;
            case 'master-password':
                return <MasterPasswordScreen key={screenKey} />;
            case 'password-prompt':
                return <PasswordPromptScreen key={screenKey} vault={currentScreen.vault} onSuccess={currentScreen.onSuccess} />;
            case 'password-generator':
                return <PasswordGeneratorScreen key={screenKey} />;
            case 'settings':
                return <SettingsScreen key={screenKey} />;
        }
    };

    return (
        <AppStateContext.Provider value={appState}>
            <Box borderStyle="round" borderColor="green" flexDirection="row">
                <LeftPanel />
                <Box
                    flexDirection="column"
                    width="55%"
                    paddingY={1}
                    paddingX={2}
                    borderStyle="single"
                    borderLeft
                    borderTop={false}
                    borderBottom={false}
                    borderRight={false}
                    borderColor="gray"
                >
                    {renderScreen()}
                    <Notification />
                </Box>
            </Box>
        </AppStateContext.Provider>
    );
}

export function App() {
    const [initState, setInitState] = useState<'loading' | 'select-language' | 'ready'>('loading');
    const [language, setLanguageState] = useState('en');

    useEffect(() => {
        configService.loadConfig().then((config) => {
            if (config?.language) {
                localeService.setLanguage(config.language);
                setLanguageState(config.language);
                setInitState('ready');
            } else {
                setInitState('select-language');
            }
        });
    }, []);

    const handleLanguageSelect = useCallback(async (lang: string) => {
        localeService.setLanguage(lang);
        setLanguageState(lang);
        await configService.saveConfig({language: lang});
        setInitState('ready');
    }, []);

    const setLanguage = useCallback(async (lang: string) => {
        localeService.setLanguage(lang);
        setLanguageState(lang);
        await configService.saveConfig({language: lang});
    }, []);

    const localeContextValue: LocaleContextValue = {
        t: (key, params) => localeService.t(key, params),
        language,
        setLanguage,
    };

    if (initState === 'loading') {
        return null;
    }

    if (initState === 'select-language') {
        return (
            <Box borderStyle="round" borderColor="green" flexDirection="row">
                <LeftPanel />
                <Box
                    flexDirection="column"
                    width="55%"
                    paddingY={1}
                    paddingX={2}
                    borderStyle="single"
                    borderLeft
                    borderTop={false}
                    borderBottom={false}
                    borderRight={false}
                    borderColor="gray"
                >
                    <LanguageSelectionScreen onSelect={handleLanguageSelect} />
                </Box>
            </Box>
        );
    }

    return (
        <LocaleContext.Provider value={localeContextValue}>
            <AppContent />
        </LocaleContext.Provider>
    );
}
