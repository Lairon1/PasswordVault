import React, {useState, useRef, useCallback} from 'react';
import {Box, Text, useInput} from 'ink';

interface TextInputProps {
    prompt: string;
    mask?: boolean;
    initialValue?: string;
    onSubmit: (value: string) => void;
    onCancel?: () => void;
    isActive?: boolean;
}

export function TextInput({prompt, mask = false, initialValue = '', onSubmit, onCancel, isActive = true}: TextInputProps) {
    const [value, setValue] = useState(initialValue);
    const valueRef = useRef(initialValue);

    const updateValue = useCallback((fn: (prev: string) => string) => {
        setValue(prev => {
            const next = fn(prev);
            valueRef.current = next;
            return next;
        });
    }, []);

    useInput((input, key) => {
        if (key.return) {
            onSubmit(valueRef.current);
            return;
        }
        if (key.escape) {
            if (onCancel) onCancel();
            return;
        }
        if (key.backspace || key.delete) {
            updateValue(prev => prev.slice(0, -1));
            return;
        }
        if (key.upArrow || key.downArrow || key.leftArrow || key.rightArrow || key.tab) {
            return;
        }
        if (input && !key.ctrl && !key.meta) {
            updateValue(prev => prev + input);
        }
    }, {isActive});

    const displayValue = mask ? '*'.repeat(value.length) : value;

    return (
        <Box>
            <Text>{prompt}: </Text>
            <Text color="green">{displayValue}</Text>
            <Text color="gray">{'█'}</Text>
        </Box>
    );
}
