import fs from 'node:fs/promises';
import path from 'node:path';
import {AppConfig, ConfigService} from '../config.service.js';
import {AppUtils} from '../../utils/app.utils.js';

export class DefaultConfigService implements ConfigService {
    private readonly configPath: string;

    constructor() {
        this.configPath = path.join(AppUtils.getAppDataPath(), 'config.json');
    }

    async loadConfig(): Promise<AppConfig | null> {
        try {
            const data = await fs.readFile(this.configPath, 'utf-8');
            return JSON.parse(data) as AppConfig;
        } catch {
            return null;
        }
    }

    async saveConfig(config: AppConfig): Promise<void> {
        const dir = path.dirname(this.configPath);
        await fs.mkdir(dir, {recursive: true});
        await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
    }
}
