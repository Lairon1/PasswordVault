export interface AppConfig {
    language: string;
}

export interface ConfigService {
    loadConfig(): Promise<AppConfig | null>;
    saveConfig(config: AppConfig): Promise<void>;
}
