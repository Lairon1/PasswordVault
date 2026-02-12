import React from 'react';
import { render, Text, Box } from 'ink';
import figlet from 'figlet';

const title = figlet.textSync('PasswordVault', { horizontalLayout: 'default' });

function App() {
    return (
        <Box flexDirection="column" padding={1}>
            <Text color="cyan">{title}</Text>
            <Text>Welcome to <Text bold color="green">PasswordVault</Text></Text>
        </Box>
    );
}

render(<App />);