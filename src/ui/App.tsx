import React from 'react';
import {Box, useInput} from 'ink';
import {container} from '../container.js';
import {VaultService} from '../service/vault.service.js';
import {AppStateContext, useAppStateProvider} from './hooks/useAppState.js';
import {LeftPanel} from './components/LeftPanel.js';
import {Notification} from './components/Notification.js';
import {MainMenuScreen} from './screens/MainMenuScreen.js';
import {VaultBrowserScreen} from './screens/VaultBrowserScreen.js';
import {VaultDetailScreen} from './screens/VaultDetailScreen.js';
import {CreateVaultScreen} from './screens/CreateVaultScreen.js';
import {MasterPasswordScreen} from './screens/MasterPasswordScreen.js';
import {PasswordPromptScreen} from './screens/PasswordPromptScreen.js';
import {PasswordGeneratorScreen} from './screens/PasswordGeneratorScreen.js';

const vaultService = container.resolve<VaultService>('vaultService');

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
    return <AppContent />;
}
