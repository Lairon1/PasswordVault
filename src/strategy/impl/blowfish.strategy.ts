import crypto from 'node:crypto';
import type { CryptoService } from '../сrypto.strategy.js';

const ALGORITHM = 'bf-cbc';
const SALT_LEN = 16;
const KEY_LEN = 32;
const IV_LEN = 8; // Blowfish block size = 64 bit
const HMAC_LEN = 32;

function deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.scryptSync(password, salt, KEY_LEN, { N: 16384, r: 8, p: 1 });
}

export class BlowfishCryptoService implements CryptoService {

    async encrypt(content: string, password: string): Promise<string> {
        const salt = crypto.randomBytes(SALT_LEN);
        const key = deriveKey(password, salt);
        const iv = crypto.randomBytes(IV_LEN);

        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        const encrypted = Buffer.concat([cipher.update(content, 'utf8'), cipher.final()]);

        // HMAC для проверки целостности (Blowfish-CBC не имеет встроенной аутентификации)
        const hmac = crypto.createHmac('sha256', key).update(iv).update(encrypted).digest();

        // salt(16) + iv(8) + hmac(32) + ciphertext
        return Buffer.concat([salt, iv, hmac, encrypted]).toString('base64');
    }

    async decrypt(content: string, password: string): Promise<string> {
        const data = Buffer.from(content, 'base64');

        const salt = data.subarray(0, SALT_LEN);
        const iv = data.subarray(SALT_LEN, SALT_LEN + IV_LEN);
        const storedHmac = data.subarray(SALT_LEN + IV_LEN, SALT_LEN + IV_LEN + HMAC_LEN);
        const encrypted = data.subarray(SALT_LEN + IV_LEN + HMAC_LEN);

        const key = deriveKey(password, salt);

        // Проверка целостности
        const computedHmac = crypto.createHmac('sha256', key).update(iv).update(encrypted).digest();
        if (!crypto.timingSafeEqual(storedHmac, computedHmac)) {
            throw new Error('HMAC verification failed: data is corrupted or wrong password');
        }

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
    }

    getCryptoAlgorithmName(): string {
        return 'Blowfish-CBC';
    }
}
