import {AlgorithmType} from "../dto/algorithm.type.js";

export class CryptoFileError extends Error {

    constructor(fileName: string, parentError?: Error) {
        super(parentError ? `File ${fileName} error. ${parentError.name} = {${parentError.message}` : `File ${fileName} error.`);
        Object.setPrototypeOf(this, CryptoFileError.prototype);
    }

}

export class CryptoFileAlgorithmStrategyNotFoundError extends CryptoFileError{

    constructor(algorithm: AlgorithmType) {
        super(`Not fount strategy for ${algorithm} algorithm`);
        Object.setPrototypeOf(this, CryptoFileAlgorithmStrategyNotFoundError.prototype);
    }

}

export class CryptoFileWriteError extends CryptoFileError {

    constructor(path: string, cause?: Error) {
        super(path, cause);
        Object.setPrototypeOf(this, CryptoFileWriteError.prototype);
    }

}

export class CryptoFileReadError extends CryptoFileError {

    constructor(path: string, cause?: Error) {
        super(path, cause);
        Object.setPrototypeOf(this, CryptoFileReadError.prototype);
    }

}

export class CryptoFileNotEncryptedError extends CryptoFileError {

    constructor(path: string) {
        super(`File ${path} is not a valid encrypted file`);
        Object.setPrototypeOf(this, CryptoFileNotEncryptedError.prototype);
    }

}