import crypto from 'node:crypto';
import { makeSession, encrypt as tfEncrypt, decrypt as tfDecrypt } from 'twofish-ts';
import type { CryptoStrategy } from '../сrypto.strategy.js';
import {AlgorithmType} from "../../dto/algorithm.type.js";

const SALT_LEN = 16;
const KEY_LEN = 32;
const BLOCK_LEN = 16;
const NONCE_LEN = 16;
const HMAC_LEN = 32;

function deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.scryptSync(password, salt, KEY_LEN, { N: 16384, r: 8, p: 1 });
}

/**
 * Twofish в режиме CTR (Counter Mode).
 * Для каждого блока шифруется nonce + counter, результат XOR-ится с plaintext.
 */
function twofishCtr(key: Uint8Array, nonce: Uint8Array, input: Uint8Array): Uint8Array {
    const session = makeSession(key);
    const output = new Uint8Array(input.length);
    const counterBlock = new Uint8Array(BLOCK_LEN);
    const encryptedCounter = new Uint8Array(BLOCK_LEN);

    // Первые 12 байт — nonce, последние 4 — counter (big-endian)
    counterBlock.set(nonce.subarray(0, 12));

    const blockCount = Math.ceil(input.length / BLOCK_LEN);

    for (let i = 0; i < blockCount; i++) {
        // Записываем counter в последние 4 байта (big-endian)
        counterBlock[12] = (i >>> 24) & 0xff;
        counterBlock[13] = (i >>> 16) & 0xff;
        counterBlock[14] = (i >>> 8) & 0xff;
        counterBlock[15] = i & 0xff;

        tfEncrypt(counterBlock, 0, encryptedCounter, 0, session);

        const offset = i * BLOCK_LEN;
        const remaining = Math.min(BLOCK_LEN, input.length - offset);
        for (let j = 0; j < remaining; j++) {
            output[offset + j] = input[offset + j] ^ encryptedCounter[j];
        }
    }

    return output;
}

export class TwofishCryptoStrategy implements CryptoStrategy {

    async encrypt(content: string, password: string): Promise<string> {
        const salt = crypto.randomBytes(SALT_LEN);
        const key = deriveKey(password, salt);
        const nonce = crypto.randomBytes(NONCE_LEN);
        const plaintext = Buffer.from(content, 'utf8');

        const encrypted = twofishCtr(new Uint8Array(key), new Uint8Array(nonce), new Uint8Array(plaintext));

        // HMAC для аутентификации (CTR не обеспечивает целостность)
        const hmac = crypto.createHmac('sha256', key)
            .update(nonce)
            .update(encrypted)
            .digest();

        // salt(16) + nonce(16) + hmac(32) + ciphertext
        return Buffer.concat([salt, nonce, hmac, Buffer.from(encrypted)]).toString('base64');
    }

    async decrypt(content: string, password: string): Promise<string> {
        const data = Buffer.from(content, 'base64');

        const salt = data.subarray(0, SALT_LEN);
        const nonce = data.subarray(SALT_LEN, SALT_LEN + NONCE_LEN);
        const storedHmac = data.subarray(SALT_LEN + NONCE_LEN, SALT_LEN + NONCE_LEN + HMAC_LEN);
        const encrypted = data.subarray(SALT_LEN + NONCE_LEN + HMAC_LEN);

        const key = deriveKey(password, salt);

        // Проверка целостности
        const computedHmac = crypto.createHmac('sha256', key)
            .update(nonce)
            .update(encrypted)
            .digest();
        if (!crypto.timingSafeEqual(storedHmac, computedHmac)) {
            throw new Error('HMAC verification failed: data is corrupted or wrong password');
        }

        const decrypted = twofishCtr(new Uint8Array(key), new Uint8Array(nonce), new Uint8Array(encrypted));
        return Buffer.from(decrypted).toString('utf8');
    }

    getCryptoAlgorithmType(): AlgorithmType {
        return AlgorithmType.TWOFISH_CTR;
    }
}
