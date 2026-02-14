import {CryptoFileService} from "../crypto-file.service.js";
import {AlgorithmType} from "../../dto/algorithm.type.js";
import {CryptoStrategy} from "../../strategy/сrypto.strategy.js";
import {
    CryptoFileAlgorithmStrategyNotFoundError,
    CryptoFileNotEncryptedError,
    CryptoFileReadError,
    CryptoFileWriteError
} from "../../error/crypto-file.errors.js";
import {mkdir, readFile, writeFile} from "node:fs/promises";
import nodePath from "node:path";

const APP_TAG = "PASSWORD_VAULT_ENCRYPTED_FILE"

export class DefaultCryptoFileService implements CryptoFileService {

    constructor(
        private readonly cryptoStrategies: CryptoStrategy[]
    ) {
    }

    async saveFile(path: string, data: string, algorithm: AlgorithmType, password: string): Promise<void> {
        let cryptoStrategy = this.cryptoStrategies
            .find(cryptoStrategy => cryptoStrategy.getCryptoAlgorithmType() === algorithm);
        if (!cryptoStrategy) {
            throw new CryptoFileAlgorithmStrategyNotFoundError(algorithm);
        }
        let securedData = await cryptoStrategy.encrypt(data, password);

        const fileContent = {
            appTag: APP_TAG,
            algorithm: algorithm,
            securedData: securedData
        } as EncryptedFileContent

        try {
            await mkdir(nodePath.dirname(path), {recursive: true});
            await writeFile(path, JSON.stringify(fileContent));
        } catch (e) {
            throw new CryptoFileWriteError(path, e instanceof Error ? e : undefined);
        }
    }

    async readFile(path: string, password: string): Promise<string> {
        let content: string;
        try {
            content = await readFile(path, {encoding: "utf-8"});
        } catch (e) {
            throw new CryptoFileReadError(path, e instanceof Error ? e : undefined);
        }

        if (!this.isEncryptedContent(content)) {
            throw new CryptoFileNotEncryptedError(path);
        }

        const fileContent = JSON.parse(content) as EncryptedFileContent;

        let cryptoStrategy = this.cryptoStrategies
            .find(cryptoStrategy => cryptoStrategy.getCryptoAlgorithmType() === fileContent.algorithm);
        if (!cryptoStrategy) {
            throw new CryptoFileAlgorithmStrategyNotFoundError(fileContent.algorithm);
        }

        return cryptoStrategy.decrypt(fileContent.securedData, password);
    }

    async isEncrypted(path: string): Promise<boolean> {
        let content: string;
        try {
            content = await readFile(path, {encoding: "utf-8"});
        } catch (e) {
            return false;
        }
        return this.isEncryptedContent(content);
    }

    private isEncryptedContent(content: string): boolean {
        try {
            const parsed = JSON.parse(content);
            return parsed.appTag === APP_TAG
                && typeof parsed.algorithm === "string"
                && typeof parsed.securedData === "string";
        } catch (e) {
            return false;
        }
    }

}

interface EncryptedFileContent {
    appTag: string;
    algorithm: AlgorithmType;
    securedData: string;
}