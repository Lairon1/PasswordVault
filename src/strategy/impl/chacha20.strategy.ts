import crypto from 'node:crypto';
import type { CryptoStrategy } from '../сrypto.strategy.js';
import {AlgorithmType} from "../../dto/algorithm.type.js";

const ALGORITHM = 'chacha20-poly1305';
const SALT_LEN = 16;
const KEY_LEN = 32;
const NONCE_LEN = 12;
const TAG_LEN = 16;

function deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.scryptSync(password, salt, KEY_LEN, { N: 16384, r: 8, p: 1 });
}

export class ChaCha20CryptoStrategy implements CryptoStrategy {

    async encrypt(content: string, password: string): Promise<string> {
        const salt = crypto.randomBytes(SALT_LEN);
        const key = deriveKey(password, salt);
        const nonce = crypto.randomBytes(NONCE_LEN);

        const cipher = crypto.createCipheriv(ALGORITHM, key, nonce, {
            authTagLength: TAG_LEN,
        });
        const encrypted = Buffer.concat([cipher.update(content, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();

        // salt(16) + nonce(12) + tag(16) + ciphertext
        return Buffer.concat([salt, nonce, tag, encrypted]).toString('base64');
    }

    async decrypt(content: string, password: string): Promise<string> {
        const data = Buffer.from(content, 'base64');

        const salt = data.subarray(0, SALT_LEN);
        const nonce = data.subarray(SALT_LEN, SALT_LEN + NONCE_LEN);
        const tag = data.subarray(SALT_LEN + NONCE_LEN, SALT_LEN + NONCE_LEN + TAG_LEN);
        const encrypted = data.subarray(SALT_LEN + NONCE_LEN + TAG_LEN);

        const key = deriveKey(password, salt);
        const decipher = crypto.createDecipheriv(ALGORITHM, key, nonce, {
            authTagLength: TAG_LEN,
        });
        decipher.setAuthTag(tag);

        return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
    }

    getCryptoAlgorithmType(): AlgorithmType {
        return AlgorithmType.CHA_CHA20_POLY1305;
    }
}
