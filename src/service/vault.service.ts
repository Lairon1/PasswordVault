import {Vault, VaultCollection, VaultContent} from "../dto/vault.dto.js";
import {AlgorithmType} from "../dto/algorithm.type.js";

export interface VaultService {

    /**
     * Загрузить VaultCollection.
     * Загруженный VaultCollection будет из рут папки для коллекций и с названием vault
     * Так же он будет содержать все коллекции и хранилища которые вложены в него.
     */
    loadRootVaultCollection(): Promise<VaultCollection>

    /**
     * Расшифровать хранилище.
     *
     * @param vault Само хранилище для дешифрования.
     * @param password Пароль для дешифрования.
     */
    decryptVault(vault: Vault, password: string): Promise<VaultContent>

    /**
     * Создать или сохранить хранилище паролей.
     * Так же если не существует Vault.parentCollection то создаст их
     * По сути создает файл
     *
     * @param vault Хранилище
     * @param vaultContent Контент хранилища
     * @param algorithm Алгоритм шифрования
     * @param password Пароль для шифрования
     */
    saveOrCreateVault(vault: Vault, vaultContent: VaultContent, algorithm: AlgorithmType, password: string): Promise<Vault>

    /**
     * Создать новую коллекцию
     * Если в vaultCollection.parentCollection будут не существующие коллекции то создаст и их
     * Но не создает сами хранилища VaultCollection.vaults
     * По сути создает папку
     *
     * @param vaultCollection коллекция.
     */
    createVaultCollection(vaultCollection: VaultCollection): Promise<VaultCollection>

    /**
     * Удалить хранилище.
     * @param vault Хранилище
     */
    deleteVault(vault: Vault): Promise<boolean>

    /**
     * Рекурсивно удалить коллекцию хранилищ и все хранилища
     * @param vaultCollection коллекция
     */
    deleteVaultCollection(vaultCollection: VaultCollection): Promise<boolean>

}