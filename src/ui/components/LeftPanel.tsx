import React from 'react';
import {Box, Text} from 'ink';
import figlet from 'figlet';

const logo = figlet.textSync('PwdVault', {horizontalLayout: 'default'});

export function LeftPanel() {
    return (
        <Box flexDirection="column" flexShrink={0} padding={1}>
            <Text bold color="green">{'  Developed by 0xLairon1'}</Text>
            <Box marginTop={1}>
                <Text color="cyan">{logo}</Text>
            </Box>
            <Box marginTop={1}>
                <Text> Your secure <Text bold color="green">password manager</Text></Text>
            </Box>
            <Text dimColor> AES-256 · ChaCha20 · Twofish · Blowfish</Text>
        </Box>
    );
}
