export class VaultError extends Error {

    constructor(message: string, cause?: Error) {
        super(cause ? `${message} ${cause.name}: ${cause.message}` : message);
        Object.setPrototypeOf(this, VaultError.prototype);
    }

}

export class VaultNotFoundError extends VaultError {

    constructor(vaultName: string) {
        super(`Vault "${vaultName}" not found`);
        Object.setPrototypeOf(this, VaultNotFoundError.prototype);
    }

}

export class VaultCollectionNotFoundError extends VaultError {

    constructor(collectionName: string) {
        super(`Vault collection "${collectionName}" not found`);
        Object.setPrototypeOf(this, VaultCollectionNotFoundError.prototype);
    }

}

export class VaultCollectionCreateError extends VaultError {

    constructor(collectionName: string, cause?: Error) {
        super(`Failed to create vault collection "${collectionName}"`, cause);
        Object.setPrototypeOf(this, VaultCollectionCreateError.prototype);
    }

}

export class VaultDeleteError extends VaultError {

    constructor(vaultName: string, cause?: Error) {
        super(`Failed to delete vault "${vaultName}"`, cause);
        Object.setPrototypeOf(this, VaultDeleteError.prototype);
    }

}

export class VaultCollectionDeleteError extends VaultError {

    constructor(collectionName: string, cause?: Error) {
        super(`Failed to delete vault collection "${collectionName}"`, cause);
        Object.setPrototypeOf(this, VaultCollectionDeleteError.prototype);
    }

}

export class VaultDecryptError extends VaultError {

    constructor(vaultName: string, cause?: Error) {
        super(`Failed to decrypt vault "${vaultName}"`, cause);
        Object.setPrototypeOf(this, VaultDecryptError.prototype);
    }

}

export class VaultLoadError extends VaultError {

    constructor(path: string, cause?: Error) {
        super(`Failed to load vault collection at "${path}"`, cause);
        Object.setPrototypeOf(this, VaultLoadError.prototype);
    }

}