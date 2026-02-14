import React from 'react';
import {Box, Text} from 'ink';
import {useAppState} from '../hooks/useAppState.js';

export function Notification() {
    const {notification} = useAppState();

    if (!notification) return null;

    return (
        <Box marginTop={1}>
            <Text color="yellow">{notification}</Text>
        </Box>
    );
}
