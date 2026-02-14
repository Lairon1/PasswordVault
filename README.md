# PasswordVault

![img.png](img.png)

**PasswordVault** is a terminal-based password manager written in TypeScript. The application allows you to securely store passwords, logins, TOTP secrets, and arbitrary data in encrypted vaults organized into hierarchical collections. Four encryption algorithms are supported: AES-256-GCM, ChaCha20-Poly1305, Twofish-CTR, and Blowfish-CBC.

### Features

- Create and manage password vaults with hierarchical collection structure
- Encrypt each vault with an individual password and chosen algorithm
- Generate TOTP codes (two-factor authentication) directly in the terminal
- Master password for quick decryption without re-entering credentials
- Copy login, password, and TOTP code to clipboard
- Built-in password generator with configurable length and character set
- Multilingual UI — English and Russian with language selection on first launch and switching in settings
- Cross-platform (Windows, macOS, Linux)

---

## Installation

### Requirements

- [Node.js](https://nodejs.org/) version 18 or higher
- npm (bundled with Node.js)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/PasswordVault.git
cd PasswordVault

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Run the application
npm start
```

### Global installation as a CLI command

To use the application as a `pwd` command from anywhere in the terminal:

```bash
npm install -g .
```

After that, the application is available via:

```bash
pwd
```

### Available scripts

| Command         | Description                        |
|-----------------|------------------------------------|
| `npm run build` | Compile TypeScript to JavaScript   |
| `npm start`     | Run the compiled application       |
| `npm run run`   | Build and run in one command       |
| `npm run dev`   | Watch mode                         |

---

## Data storage

Encrypted files and configuration are stored in a platform-specific directory:

| Platform | Path                                            |
|----------|-------------------------------------------------|
| Windows  | `%APPDATA%\PasswordVault\`                      |
| macOS    | `~/Library/Application Support/PasswordVault/`  |
| Linux    | `~/.config/PasswordVault/`                      |

- Vaults are saved as `.crypto` files in the `vault/` subdirectory
- Settings (selected language) are saved in `config.json`

---

## Localization (i18n)

The application supports two interface languages:

| Language | Code |
|----------|------|
| English  | `en` |
| Russian  | `ru` |

- A language selection screen is shown on first launch
- Language can be switched at any time via **Menu → Settings**
- The choice is persisted in `config.json` and applied on next launch
- All UI strings are stored in JSON files (`src/i18n/ru.json`, `src/i18n/en.json`)

---

## Architecture and technologies

### Tech stack

| Technology        | Purpose                                     |
|-------------------|---------------------------------------------|
| TypeScript        | Strictly typed development language          |
| React 19          | Terminal UI component framework              |
| Ink 6             | React renderer for the terminal              |
| Awilix            | Dependency Injection container               |
| Node.js Crypto    | AES-256-GCM, ChaCha20-Poly1305, Blowfish    |
| twofish-ts        | Twofish algorithm implementation             |
| Figlet            | ASCII art logo                               |

### Project structure

```
src/
├── index.tsx                   # CLI application entry point
├── container.ts                # DI container setup (Awilix)
├── i18n/                       # Localization files
│   ├── ru.json                 # Russian UI strings
│   └── en.json                 # English UI strings
├── dto/                        # Data Transfer Objects
│   ├── vault.dto.ts            # Vault, VaultCollection, VaultContent
│   └── algorithm.type.ts       # Encryption algorithm enum
├── error/                      # Custom errors
│   ├── vault.errors.ts
│   └── crypto-file.errors.ts
├── service/                    # Service layer
│   ├── vault.service.ts        # VaultService interface
│   ├── crypto-file.service.ts  # CryptoFileService interface
│   ├── config.service.ts       # ConfigService interface (settings)
│   ├── locale.service.ts       # LocaleService interface (i18n)
│   ├── password-generation.service.ts
│   └── impl/                   # Service implementations
├── strategy/                   # Encryption strategies (Strategy Pattern)
│   ├── сrypto.strategy.ts      # Base CryptoStrategy interface
│   └── impl/                   # AES, ChaCha20, Twofish, Blowfish
├── ui/                         # Terminal interface
│   ├── App.tsx                 # Main component, screen stack
│   ├── components/             # SelectList, TextInput, Notification, LeftPanel
│   ├── hooks/                  # useAppState, useClipboard, useLocale
│   └── screens/                # Application screens (9 total)
└── utils/
    └── app.utils.ts            # Utilities: paths, TOTP generation
```

### Architectural patterns

- **Strategy Pattern** — each encryption algorithm implements a unified `CryptoStrategy` interface with `encrypt`/`decrypt` methods, making it easy to add new algorithms
- **Dependency Injection** — services and strategies are registered in an Awilix container and injected via constructor
- **Screen Stack Navigation** — screen navigation is implemented via a stack, similar to mobile applications

### Encryption algorithms

All algorithms use **Scrypt** for key derivation (N=16384, r=8, p=1), providing resistance against GPU/ASIC attacks.

| Algorithm           | Mode | Authentication    | Key length | Nonce/IV  |
|---------------------|------|-------------------|------------|-----------|
| AES-256-GCM         | GCM  | Built-in (AEAD)   | 256 bit    | 12 bytes  |
| ChaCha20-Poly1305   | AEAD | Built-in (AEAD)   | 256 bit    | 12 bytes  |
| Twofish-CTR         | CTR  | HMAC-SHA256       | 256 bit    | 16 bytes  |
| Blowfish-CBC        | CBC  | HMAC-SHA256       | 256 bit    | 8 bytes   |

### Encrypted file format

```json
{
  "appTag": "PASSWORD_VAULT_ENCRYPTED_FILE",
  "algorithm": "AES-256-GCM",
  "securedData": "<base64-encoded encrypted data>"
}
```

The `securedData` field contains encoded: salt, nonce/IV, authentication tag (or HMAC), and ciphertext.

---

## Author

Developed by **0xLairon1**
