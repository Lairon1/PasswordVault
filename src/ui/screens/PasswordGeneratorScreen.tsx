import React, {useState, useCallback, useEffect, useRef} from 'react';
import {Box, Text, useInput} from 'ink';
import {useAppState} from '../hooks/useAppState.js';
import {useClipboard} from '../hooks/useClipboard.js';
import {container} from '../../container.js';
import {PasswordGenerationService} from '../../service/password-generation.service.js';

const passwordService = container.resolve<PasswordGenerationService>('passwordGenerationService');

interface GeneratorSettings {
    length: number;
    useUpper: boolean;
    useLower: boolean;
    useDigits: boolean;
    useSpecial: boolean;
}

type MenuItem =
    | { type: 'action'; label: string; value: string }
    | { type: 'separator' }
    | { type: 'length'; label: string }
    | { type: 'toggle'; label: string; key: keyof Omit<GeneratorSettings, 'length'> }
    | { type: 'exit'; label: string };

function buildMenuItems(settings: GeneratorSettings): MenuItem[] {
    return [
        {type: 'action', label: 'Скопировать пароль', value: 'copy'},
        {type: 'action', label: 'Перегенерировать пароль', value: 'regenerate'},
        {type: 'separator'},
        {type: 'length', label: `Длина пароля: ${settings.length}`},
        {type: 'toggle', label: `Заглавные символы: ${settings.useUpper ? 'вкл' : 'выкл'}`, key: 'useUpper'},
        {type: 'toggle', label: `Строчные символы: ${settings.useLower ? 'вкл' : 'выкл'}`, key: 'useLower'},
        {type: 'toggle', label: `Числа: ${settings.useDigits ? 'вкл' : 'выкл'}`, key: 'useDigits'},
        {type: 'toggle', label: `Специальные символы: ${settings.useSpecial ? 'вкл' : 'выкл'}`, key: 'useSpecial'},
        {type: 'separator'},
        {type: 'exit', label: 'Выход (Esc)'},
    ];
}

function getSelectableIndices(items: MenuItem[]): number[] {
    return items.map((item, i) => item.type === 'separator' ? -1 : i).filter(i => i !== -1);
}

function generate(settings: GeneratorSettings): string {
    try {
        return passwordService.generatePassword(
            settings.length,
            settings.useUpper,
            settings.useLower,
            settings.useDigits,
            settings.useSpecial,
        );
    } catch {
        return '---';
    }
}

export function PasswordGeneratorScreen() {
    const {pop, showNotification} = useAppState();
    const {copyToClipboard} = useClipboard();

    const [settings, setSettings] = useState<GeneratorSettings>({
        length: 30,
        useUpper: true,
        useLower: true,
        useDigits: true,
        useSpecial: true,
    });

    const [password, setPassword] = useState('');
    const [selectedPos, setSelectedPos] = useState(0);
    const [editingLength, setEditingLength] = useState(false);
    const [lengthInput, setLengthInput] = useState('');

    const passwordRef = useRef(password);
    passwordRef.current = password;

    const menuItems = buildMenuItems(settings);
    const selectableIndices = getSelectableIndices(menuItems);

    const regenerate = useCallback((s: GeneratorSettings) => {
        setPassword(generate(s));
    }, []);

    useEffect(() => {
        regenerate(settings);
    }, [settings, regenerate]);

    const handleExit = useCallback(() => {
        setPassword('');
        passwordRef.current = '';
        pop();
    }, [pop]);

    useInput((input, key) => {
        if (editingLength) {
            if (key.escape) {
                setEditingLength(false);
                setLengthInput('');
                return;
            }
            if (key.return) {
                const num = parseInt(lengthInput, 10);
                if (!isNaN(num)) {
                    const clamped = Math.max(3, Math.min(100, num));
                    setSettings(prev => ({...prev, length: clamped}));
                }
                setEditingLength(false);
                setLengthInput('');
                return;
            }
            if (key.backspace || key.delete) {
                setLengthInput(prev => prev.slice(0, -1));
                return;
            }
            if (/^\d$/.test(input)) {
                setLengthInput(prev => prev + input);
            }
            return;
        }

        if (key.escape) {
            handleExit();
            return;
        }

        if (key.upArrow) {
            setSelectedPos(prev => (prev - 1 + selectableIndices.length) % selectableIndices.length);
            return;
        }
        if (key.downArrow) {
            setSelectedPos(prev => (prev + 1) % selectableIndices.length);
            return;
        }

        const currentItemIndex = selectableIndices[selectedPos];
        const currentItem = menuItems[currentItemIndex];

        if (currentItem.type === 'length') {
            if (key.leftArrow) {
                setSettings(prev => ({...prev, length: Math.max(3, prev.length - 1)}));
                return;
            }
            if (key.rightArrow) {
                setSettings(prev => ({...prev, length: Math.min(100, prev.length + 1)}));
                return;
            }
            if (/^\d$/.test(input)) {
                setEditingLength(true);
                setLengthInput(input);
                return;
            }
        }

        if (key.return) {
            switch (currentItem.type) {
                case 'action':
                    if (currentItem.value === 'copy') {
                        copyToClipboard(passwordRef.current);
                    } else if (currentItem.value === 'regenerate') {
                        regenerate(settings);
                    }
                    break;
                case 'length':
                    setEditingLength(true);
                    setLengthInput(String(settings.length));
                    break;
                case 'toggle':
                    setSettings(prev => ({...prev, [currentItem.key]: !prev[currentItem.key]}));
                    break;
                case 'exit':
                    handleExit();
                    break;
            }
        }
    });

    const selectedIndex = selectableIndices[selectedPos] ?? -1;

    return (
        <>
            <Text bold>Генератор паролей</Text>
            <Text dimColor>{'─'.repeat(30)}</Text>
            <Box marginBottom={1}>
                <Text color="cyan" bold>{password}</Text>
            </Box>
            <Box flexDirection="column">
                {menuItems.map((item, index) => {
                    if (item.type === 'separator') {
                        return <Text key={`sep-${index}`} dimColor>{'─'.repeat(20)}</Text>;
                    }

                    const isSelected = index === selectedIndex;
                    let label = '';
                    if (item.type === 'length' && editingLength && isSelected) {
                        label = `Длина пароля: ${lengthInput}█`;
                    } else if (item.type === 'length') {
                        label = item.label + (isSelected ? '  ◄ ►' : '');
                    } else {
                        label = item.label;
                    }

                    return (
                        <Text key={index}>
                            {isSelected
                                ? <Text color="green" bold>{'> '}{label}</Text>
                                : <Text>{'  '}{label}</Text>
                            }
                        </Text>
                    );
                })}
            </Box>
        </>
    );
}