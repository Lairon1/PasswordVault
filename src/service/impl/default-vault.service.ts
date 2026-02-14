import {VaultService} from "../vault.service.js";
import {Vault, VaultCollection, VaultContent} from "../../dto/vault.dto.js";
import {AlgorithmType} from "../../dto/algorithm.type.js";
import {CryptoFileService} from "../crypto-file.service.js";
import {AppUtils} from "../../utils/app.utils.js";
import {readdir, mkdir, unlink, rm} from "node:fs/promises";
import path from "node:path";
import {
    VaultCollectionCreateError,
    VaultCollectionDeleteError,
    VaultCollectionNotFoundError,
    VaultDecryptError,
    VaultDeleteError,
    VaultLoadError,
    VaultNotFoundError
} from "../../error/vault.errors.js";

const FILE_EXT = ".crypto"

export class DefaultVaultService implements VaultService {

    private readonly vaultPath: string = path.join(AppUtils.getAppDataPath(), "vault")

    constructor(
        private readonly cryptoFileService: CryptoFileService
    ) {
    }

    async createVaultCollection(vaultCollection: VaultCollection): Promise<VaultCollection> {
        const vaultCollectionFilePath = this.getVaultCollectionFilePath(vaultCollection);
        try {
            await mkdir(vaultCollectionFilePath, {recursive: true});
        } catch (e) {
            throw new VaultCollectionCreateError(vaultCollection.collectionName, e instanceof Error ? e : undefined);
        }
        for (let childCollection of vaultCollection.childCollections) {
            await this.createVaultCollection(childCollection);
        }
        return vaultCollection;
    }

    async decryptVault(vault: Vault, password: string): Promise<VaultContent> {
        let raw: string;
        try {
            raw = await this.cryptoFileService.readFile(this.getVaultFilePath(vault), password);
        } catch (e) {
            throw new VaultDecryptError(vault.name, e instanceof Error ? e : undefined);
        }
        try {
            return JSON.parse(raw) as VaultContent;
        } catch (e) {
            throw new VaultDecryptError(vault.name, e instanceof Error ? e : undefined);
        }
    }

    async deleteVault(vault: Vault): Promise<boolean> {
        const vaultFilePath = this.getVaultFilePath(vault);
        try {
            await unlink(vaultFilePath);
        } catch (e: any) {
            if (e?.code === "ENOENT") {
                throw new VaultNotFoundError(vault.name);
            }
            throw new VaultDeleteError(vault.name, e instanceof Error ? e : undefined);
        }
        return true;
    }

    async deleteVaultCollection(vaultCollection: VaultCollection): Promise<boolean> {
        const collectionPath = this.getVaultCollectionFilePath(vaultCollection);
        try {
            await rm(collectionPath, {recursive: true});
        } catch (e: any) {
            if (e?.code === "ENOENT") {
                throw new VaultCollectionNotFoundError(vaultCollection.collectionName);
            }
            throw new VaultCollectionDeleteError(vaultCollection.collectionName, e instanceof Error ? e : undefined);
        }
        return true;
    }

    async saveOrCreateVault(vault: Vault, vaultContent: VaultContent, algorithm: AlgorithmType, password: string): Promise<Vault> {
        let vaultFilePath = this.getVaultFilePath(vault);
        await this.cryptoFileService.saveFile(vaultFilePath, JSON.stringify(vaultContent), algorithm, password);
        return vault;
    }

    async loadRootVaultCollection(): Promise<VaultCollection> {
        try {
            await mkdir(this.vaultPath, {recursive: true});
        } catch (e) {
            throw new VaultLoadError(this.vaultPath, e instanceof Error ? e : undefined);
        }
        let collection = await this.loadVaultCollection(this.vaultPath);
        collection.collectionName = "RootCollection";
        return collection;
    }

    private async loadVaultCollection(collectionPath: string): Promise<VaultCollection> {
        const collection = {
            collectionName: path.basename(collectionPath),
            childCollections: [],
            vaults: [],
            parentCollection: undefined,
        } as VaultCollection;

        let entries;
        try {
            entries = await readdir(collectionPath, {withFileTypes: true});
        } catch (e: any) {
            if (e?.code === "ENOENT") {
                throw new VaultCollectionNotFoundError(collectionPath);
            }
            throw new VaultLoadError(collectionPath, e instanceof Error ? e : undefined);
        }

        for (let dir of entries.filter(e => e.isDirectory())) {
            let childCollection = await this.loadVaultCollection(path.join(collectionPath, dir.name));
            childCollection.parentCollection = collection;
            collection.childCollections.push(childCollection);
        }
        for (let file of entries.filter(e => e.isFile())) {
            if (!file.name.endsWith(FILE_EXT)) {
                continue;
            }
            let childVault = this.loadVault(path.join(collectionPath, file.name));
            childVault.parentCollection = collection;
            collection.vaults.push(childVault);
        }
        return collection;
    }

    private loadVault(vaultPath: string): Vault {
        return {
            name: path.basename(vaultPath).replace(FILE_EXT, ""),
            parentCollection: {} as VaultCollection,
        } as Vault;
    }

    private getVaultFilePath(vault: Vault): string {
        return path.join(this.getVaultCollectionFilePath(vault.parentCollection), vault.name + FILE_EXT);
    }

    private getVaultCollectionFilePath(vaultCollection: VaultCollection): string {
        const parts: string[] = [];
        let current: VaultCollection | undefined = vaultCollection;
        while (current?.parentCollection) {
            parts.unshift(current.collectionName);
            current = current.parentCollection;
        }
        return path.join(this.vaultPath, ...parts);
    }

}