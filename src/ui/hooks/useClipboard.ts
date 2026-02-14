import {useCallback} from 'react';
import {execSync} from 'node:child_process';
import {useAppState} from './useAppState.js';

export function useClipboard() {
    const {showNotification} = useAppState();

    const copyToClipboard = useCallback((text: string) => {
        try {
            const platform = process.platform;
            if (platform === 'win32') {
                execSync('clip', {input: text});
            } else if (platform === 'darwin') {
                execSync('pbcopy', {input: text});
            } else {
                execSync('xclip -selection clipboard', {input: text});
            }
            showNotification('Скопировано в буфер обмена');
        } catch {
            showNotification('Ошибка копирования в буфер обмена');
        }
    }, [showNotification]);

    return {copyToClipboard};
}
