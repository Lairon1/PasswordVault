export interface CryptoService {

    /**
     * Зашифровать данные по паролю.
     *
     * @param content Контент для шифрования.
     * @param password Пароль для шифрования.
     * @return Шифрованные данные
     */
    encrypt(content: string, password: string): Promise<string>;

    /**
     * Расшифровать данные по паролю.
     *
     * @param content Контент для дешифрования
     * @param password Пароль для дешифрования (Пароль необходимо использовать такой же, как и при шифровании этого же контента)
     * @return Дешефрованные данные
     */
    decrypt(content: string, password: string): Promise<string>;

    /**
     * Получить имя алгоритма
     */
    getCryptoAlgorithmName(): string;

}