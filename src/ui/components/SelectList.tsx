import React, {useState, useEffect, useRef} from 'react';
import {Box, Text, useInput} from 'ink';

export interface SelectListItem {
    label: string;
    value: string;
    color?: string;
    separator?: boolean;
}

interface SelectListProps {
    items: SelectListItem[];
    onSelect: (item: SelectListItem) => void;
    onEscape?: () => void;
    isActive?: boolean;
}

export function SelectList({items, onSelect, onEscape, isActive = true}: SelectListProps) {
    const selectableIndices = items.map((item, i) => item.separator ? -1 : i).filter(i => i !== -1);
    const [selectedPos, setSelectedPos] = useState(0);
    const itemsRef = useRef(items);
    const onSelectRef = useRef(onSelect);
    const onEscapeRef = useRef(onEscape);
    const selectedPosRef = useRef(selectedPos);
    const selectableIndicesRef = useRef(selectableIndices);

    itemsRef.current = items;
    onSelectRef.current = onSelect;
    onEscapeRef.current = onEscape;
    selectedPosRef.current = selectedPos;
    selectableIndicesRef.current = selectableIndices;

    useEffect(() => {
        if (selectedPos >= selectableIndices.length && selectableIndices.length > 0) {
            setSelectedPos(selectableIndices.length - 1);
        }
    }, [selectableIndices.length, selectedPos]);

    useInput((_input, key) => {
        const indices = selectableIndicesRef.current;
        if (indices.length === 0) return;

        if (key.escape && onEscapeRef.current) {
            onEscapeRef.current();
            return;
        }
        if (key.upArrow) {
            setSelectedPos(prev => (prev - 1 + indices.length) % indices.length);
        }
        if (key.downArrow) {
            setSelectedPos(prev => (prev + 1) % indices.length);
        }
        if (key.return) {
            const idx = indices[selectedPosRef.current];
            onSelectRef.current(itemsRef.current[idx]);
        }
    }, {isActive});

    const selectedIndex = selectableIndices[selectedPos] ?? -1;

    return (
        <Box flexDirection="column">
            {items.map((item, index) => {
                if (item.separator) {
                    return <Text key={`sep-${index}`} dimColor>{item.label}</Text>;
                }
                const isSelected = index === selectedIndex;
                const color = item.color || undefined;
                return (
                    <Text key={item.value + index}>
                        {isSelected
                            ? <Text color={color || 'green'} bold>{'> '}{item.label}</Text>
                            : <Text color={color}>{'  '}{item.label}</Text>
                        }
                    </Text>
                );
            })}
        </Box>
    );
}
