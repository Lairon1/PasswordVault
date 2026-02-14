import {PasswordGenerationService} from "../password-generation.service.js";

const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lower = "abcdefghijklmnopqrstuvwxyz";
const digits = "0123456789";
const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";

export class DefaultPasswordGenerationService implements PasswordGenerationService {

    generatePassword(length: number, useUpper: boolean, useLower: boolean, useDigits: boolean, useSpecial: boolean): string {
        if (length < 3) {
            throw new Error("Password length must be at least 3 characters.");
        }

        let available = "";
        let password = "";

        // Ensure each selected category contributes at least one character
        if (useUpper) {
            password += upper[Math.floor(Math.random() * upper.length)];
            available += upper;
        }

        if (useLower) {
            password += lower[Math.floor(Math.random() * lower.length)];
            available += lower;
        }

        if (useDigits) {
            password += digits[Math.floor(Math.random() * digits.length)];
            available += digits;
        }

        if (useSpecial) {
            password += special[Math.floor(Math.random() * special.length)];
            available += special;
        }

        if (available.length === 0) {
            throw new Error("At least one character set must be enabled.");
        }

        while (password.length < length) {
            password += available[Math.floor(Math.random() * available.length)];
        }

        password = password
            .split("")
            .sort(() => Math.random() - 0.5)
            .join("");

        return password;
    }

}