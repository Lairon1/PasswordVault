export interface PasswordGenerationService {

    generatePassword(
        length: number,
        useUpper: boolean,
        useLower: boolean,
        useDigits: boolean,
        useSpecial: boolean
    ): string

}