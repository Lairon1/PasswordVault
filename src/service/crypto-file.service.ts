import {AlgorithmType} from "../dto/algorithm.type.js";

export interface CryptoFileService {

    saveFile(path: string, data: string, algorithm: AlgorithmType, password: string): Promise<void>;

    readFile(path: string, password: string): Promise<string>

    isEncrypted(path: string): Promise<boolean>

}