import path from "node:path";
import {createHmac} from "node:crypto";

export class AppUtils {

    static getAppDataPath(): string {
        const platform = process.platform;
        switch (platform) {
            case "win32":
                return path.join(process.env.APPDATA!, "PasswordVault");
            case "darwin":
                return path.join(process.env.HOME!, "Library", "Application Support", "PasswordVault");
            default:
                return path.join(process.env.HOME!, ".config", "PasswordVault");
        }
    }

    static generateTOTP(secret: string, period: number = 30, digits: number = 6): string {
        const key = this.base32Decode(secret);
        const counter = Math.floor(Date.now() / 1000 / period);

        const counterBuffer = Buffer.alloc(8);
        counterBuffer.writeBigUInt64BE(BigInt(counter));

        const hmac = createHmac("sha1", key);
        hmac.update(counterBuffer);
        const hash = hmac.digest();

        const offset = hash[hash.length - 1] & 0x0f;
        const code = (
            ((hash[offset] & 0x7f) << 24) |
            ((hash[offset + 1] & 0xff) << 16) |
            ((hash[offset + 2] & 0xff) << 8) |
            (hash[offset + 3] & 0xff)
        ) % (10 ** digits);

        return code.toString().padStart(digits, "0");
    }

    private static base32Decode(input: string): Buffer {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        const cleaned = input.toUpperCase().replace(/[=\s]/g, "");

        let bits = "";
        for (const char of cleaned) {
            const val = alphabet.indexOf(char);
            if (val === -1) throw new Error(`Invalid base32 character: ${char}`);
            bits += val.toString(2).padStart(5, "0");
        }

        const bytes: number[] = [];
        for (let i = 0; i + 8 <= bits.length; i += 8) {
            bytes.push(parseInt(bits.substring(i, i + 8), 2));
        }

        return Buffer.from(bytes);
    }

}