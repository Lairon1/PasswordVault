/**
 * Коллекция хранилищ. Тоесть папка с хранилищами
 */
export interface VaultCollection {

    /**
     * Имя коллекции хранилищ.
     */
    collectionName: string;

    /**
     * Коллекции которые содержит данная коллекция
     */
    childCollections: VaultCollection[];

    /**
     * Хранилище которые содержит данная коллекция.
     */
    vaults: Vault[];

    /**
     * Коллекция в которой находится данная коллекция.
     * Может быть null, тогда это root коллекция
     */
    parentCollection?: VaultCollection;

}

/**
 * Хранилище пароля. Тоесть файл
 */
export interface Vault {

    /**
     * Имя хранилища, тоесть имя файла
     */
    name: string;

    /**
     * Коллекция в которой находится данное хранилище
     */
    parentCollection: VaultCollection;

}

/**
 * Данные хранилища. Можно получить только расшифровав хранилище
 */
export interface VaultContent {

    /**
     * Логин для авторизации
     */
    login?: string;

    /**
     * Пароль для авторизации. Пароль нигде не отображаем, только даем скопировать
     */
    password?: string;

    /**
     * ТОТP секрет для генерации TOTP кода как в Google Auth
     */
    totpSecret?: string;

    /**
     * Экстра данные если необходимо сохранить чтото еще
     */
    extraData?: Record<string, string>

}