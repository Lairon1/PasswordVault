import { createContainer, asClass, asValue, InjectionMode, Lifetime } from 'awilix';
import { AesCryptoStrategy } from './strategy/impl/aes.strategy.js';
import { BlowfishCryptoStrategy } from './strategy/impl/blowfish.strategy.js';
import { ChaCha20CryptoStrategy } from './strategy/impl/chacha20.strategy.js';
import { TwofishCryptoStrategy } from './strategy/impl/twofish.strategy.js';
import {DefaultCryptoFileService} from "./service/impl/default-crypto-file.service.js";
import {DefaultVaultService} from "./service/impl/default-vault.service.js";
import {DefaultPasswordGenerationService} from "./service/impl/default-password-generation.service.js";
import {DefaultConfigService} from "./service/impl/default-config.service.js";
import {DefaultLocaleService} from "./service/impl/default-locale.service.js";

const container = createContainer({
    injectionMode: InjectionMode.CLASSIC,
    strict: true,
});

container.register({
    cryptoStrategies: asValue([
        new AesCryptoStrategy(),
        new BlowfishCryptoStrategy(),
        new ChaCha20CryptoStrategy(),
        new TwofishCryptoStrategy(),
    ]),
    cryptoFileService: asClass(DefaultCryptoFileService),
    vaultService: asClass(DefaultVaultService),
    passwordGenerationService: asClass(DefaultPasswordGenerationService),
    configService: asClass(DefaultConfigService),
    localeService: asClass(DefaultLocaleService, { lifetime: Lifetime.SINGLETON }),
});

export { container };
