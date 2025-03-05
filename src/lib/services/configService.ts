import { writable, get } from 'svelte/store';
import type { Config } from '../types';

export const configStore = writable<Config | null>(null);
export const currentConfigName = writable<string>('default');
export const availableConfigs = writable<string[]>([]);

export class ConfigService {
    static async loadConfig(path: string): Promise<Config> {
        try {
            // First check if we have configs in local storage
            const storedConfigs = this.getStoredConfigNames();
            availableConfigs.set(storedConfigs);
            
            // If we have a default config in local storage, use that
            if (storedConfigs.includes('default')) {
                const config = this.loadConfigFromLocalStorage('default');
                if (config) {
                    configStore.set(config);
                    currentConfigName.set('default');
                    return config;
                }
            }
            
            // Otherwise, load from the provided path
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load config: ${response.statusText}`);
            }
            const config = await response.json();
            configStore.set(config);
            
            // Save this as the default config if we don't have one yet
            if (!storedConfigs.includes('default')) {
                this.saveConfigToLocalStorage('default', config);
                availableConfigs.update(configs => [...configs, 'default']);
            }
            
            currentConfigName.set('default');
            return config;
        } catch (error) {
            console.error('Error loading config:', error);
            throw error;
        }
    }

    static async saveConfig(config: Config): Promise<void> {
        try {
            const configName = get(currentConfigName);
            configStore.set(config);
            this.saveConfigToLocalStorage(configName, config);
            console.log(`Config "${configName}" saved:`, config);
        } catch (error) {
            console.error('Error saving config:', error);
            throw error;
        }
    }
    
    static saveConfigAs(configName: string, config: Config): void {
        try {
            this.saveConfigToLocalStorage(configName, config);
            currentConfigName.set(configName);
            
            // Update available configs list if this is a new config
            if (!get(availableConfigs).includes(configName)) {
                availableConfigs.update(configs => [...configs, configName]);
            }
            
            console.log(`Config saved as "${configName}":`, config);
        } catch (error) {
            console.error(`Error saving config as "${configName}":`, error);
            throw error;
        }
    }
    
    static loadConfigByName(configName: string): Config | null {
        try {
            const config = this.loadConfigFromLocalStorage(configName);
            if (config) {
                configStore.set(config);
                currentConfigName.set(configName);
                return config;
            }
            return null;
        } catch (error) {
            console.error(`Error loading config "${configName}":`, error);
            return null;
        }
    }
    
    static deleteConfig(configName: string): boolean {
        try {
            localStorage.removeItem(`config_${configName}`);
            
            // Update available configs list
            availableConfigs.update(configs => configs.filter(name => name !== configName));
            
            // If we deleted the current config, load another one if available
            if (get(currentConfigName) === configName) {
                const availableConfigsList = get(availableConfigs);
                if (availableConfigsList.length > 0) {
                    this.loadConfigByName(availableConfigsList[0]);
                } else {
                    configStore.set(null);
                    currentConfigName.set('');
                }
            }
            
            return true;
        } catch (error) {
            console.error(`Error deleting config "${configName}":`, error);
            return false;
        }
    }
    
    // Helper methods for local storage
    private static saveConfigToLocalStorage(name: string, config: Config): void {
        localStorage.setItem(`config_${name}`, JSON.stringify(config));
    }
    
    private static loadConfigFromLocalStorage(name: string): Config | null {
        const storedConfig = localStorage.getItem(`config_${name}`);
        return storedConfig ? JSON.parse(storedConfig) : null;
    }
    
    private static getStoredConfigNames(): string[] {
        const configs: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('config_')) {
                configs.push(key.replace('config_', ''));
            }
        }
        return configs;
    }
} 