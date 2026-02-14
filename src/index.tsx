import React, {useState} from 'react';
import {Box, Text, useInput} from 'ink';
import figlet from 'figlet';
import {container} from './container.js';
import {CryptoFileService} from "./service/crypto-file.service.js";
import path from "node:path";
import {AlgorithmType} from "./dto/algorithm.type.js";
import {VaultService} from "./service/vault.service.js";
import {VaultCollection} from "./dto/vault.dto.js";
const logo = figlet.textSync('PwdVault', {horizontalLayout: 'default'});

const menuItems = [
    {label: 'Encrypt password', value: 'encrypt'},
    {label: 'Decrypt password', value: 'decrypt'},
    {label: 'List passwords', value: 'list'},
    {label: 'Settings', value: 'settings'},
    {label: 'Exit', value: 'exit'},
];

function App() {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useInput((_input, key) => {
        if (key.upArrow) {
            setSelectedIndex(prev => (prev - 1 + menuItems.length) % menuItems.length);
        }
        if (key.downArrow) {
            setSelectedIndex(prev => (prev + 1) % menuItems.length);
        }
    });

    return (
        <Box borderStyle="round" borderColor="green" flexDirection="row">
            {/* Left panel */}
            <Box flexDirection="column" width="45%" padding={1}>
                <Text bold color="green">{'  Developed by 0xLairon1'}</Text>
                <Box marginTop={1}>
                    <Text color="cyan">{logo}</Text>
                </Box>
                <Box marginTop={1}>
                    <Text> Your secure <Text bold color="green">password manager</Text></Text>
                </Box>
                <Text dimColor> AES-256 · ChaCha20 · Twofish · Blowfish</Text>
            </Box>

            {/* Right panel */}
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
                <Text bold>Menu</Text>
                <Text dimColor>{'─'.repeat(30)}</Text>
                <Box flexDirection="column" marginTop={1}>
                    {menuItems.map((item, index) => (
                        <Text key={item.value}>
                            {index === selectedIndex
                                ? <Text color="green" bold>{'> '}{item.label}</Text>
                                : <Text>{'  '}{item.label}</Text>
                            }
                        </Text>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}



async function test(){
    let vaultService = container.resolve<VaultService>("vaultService");

    let root = await vaultService.loadRootVaultCollection();

    console.log(printVaultTree(root));

}

function printVaultTree(collection: VaultCollection, indent: string = "", isLast: boolean = true, isRoot: boolean = true): string {
    let result: string;
    let childIndent: string;

    if (isRoot) {
        result = collection.collectionName + "/\n";
        childIndent = "";
    } else {
        result = indent + (isLast ? "└── " : "├── ") + collection.collectionName + "/\n";
        childIndent = indent + (isLast ? "    " : "│   ");
    }

    const children: { type: "collection" | "vault"; value: any }[] = [
        ...collection.childCollections.map(c => ({type: "collection" as const, value: c})),
        ...collection.vaults.map(v => ({type: "vault" as const, value: v})),
    ];

    children.forEach((child, i) => {
        const last = i === children.length - 1;
        if (child.type === "collection") {
            result += printVaultTree(child.value, childIndent, last, false);
        } else {
            result += childIndent + (last ? "└── " : "├── ") + child.value.name + "\n";
        }
    });

    return result;
}

test()
// render(<App />);