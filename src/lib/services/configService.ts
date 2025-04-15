import { writable, get } from 'svelte/store';
import type { Config } from '../types';
import { concepts } from '../stores'; // Import concepts store
import { ConceptExtractionService } from './conceptExtractionService'; // Import extraction service

export const configStore = writable<Config | null>(null);
export const currentConfigName = writable<string>('default');
export const availableConfigs = writable<string[]>([]);

// --- Helper function for concept initialization ---
function initializeConceptsFromConfig(config: Config | null) {
    if (!config) {
        console.warn("Attempted to initialize concepts with null config");
        concepts.set({}); // Clear concepts if config is null
        return;
    }
    try {
        const conceptReferences = ConceptExtractionService.extractConcepts(config);
        ConceptExtractionService.initializeConceptsFromReferences(conceptReferences);
    } catch (extractionError) {
        console.error("ConfigService: Error during concept extraction/initialization:", extractionError);
        concepts.set({}); // Clear concepts on error
    }
}
// --- End Helper Function ---


export class ConfigService {
    static async loadConfig(path: string): Promise<Config | null> { // Return type allows null
        try {
            const storedConfigs = this.getStoredConfigNames();
            availableConfigs.set(storedConfigs);
            
            let loadedConfig: Config | null = null;

            // Try loading default from local storage first
            if (storedConfigs.includes('default')) {
                loadedConfig = this.loadConfigFromLocalStorage('default');
                if (loadedConfig) {
                     console.log("Loaded default config from localStorage.");
                     currentConfigName.set('default');
                }
            }
            
            // If not found or failed, load from path
            if (!loadedConfig) {
                 console.log(`Default config not in localStorage or failed to load, fetching from ${path}`);
                const response = await fetch(path);
                if (!response.ok) {
                    throw new Error(`Failed to load config from ${path}: ${response.statusText}`);
                }
                loadedConfig = await response.json() as Config;
                console.log(`Loaded config from ${path}.`);
                
                // Save fetched config as default if 'default' doesn't exist
                if (!storedConfigs.includes('default')) {
                     console.log("Saving fetched config as default in localStorage.");
                    this.saveConfigToLocalStorage('default', loadedConfig);
                    availableConfigs.update(configs => [...configs, 'default']);
                }
                currentConfigName.set('default');
            }

            // Set the store and initialize concepts
            configStore.set(loadedConfig);
            initializeConceptsFromConfig(loadedConfig); 
            
            return loadedConfig;
        } catch (error) {
            console.error('Error loading config:', error);
            configStore.set(null); // Ensure store is null on error
            initializeConceptsFromConfig(null); // Clear concepts on error
            // throw error; // Re-throwing might prevent app from loading gracefully
            return null; // Return null on error
        }
    }

    static async saveConfig(config: Config): Promise<void> {
        try {
            const configName = get(currentConfigName);
            configStore.set(config);
            this.saveConfigToLocalStorage(configName, config);
            initializeConceptsFromConfig(config); // Re-initialize concepts
            console.log(`Config "${configName}" saved:`, config);
        } catch (error) {
            console.error('Error saving config:', error);
            throw error;
        }
    }
    
    static saveConfigAs(configName: string, config: Config): void {
        try {
            this.saveConfigToLocalStorage(configName, config);
            configStore.set(config); // Update store *before* initializing
            currentConfigName.set(configName);
            initializeConceptsFromConfig(config); // Re-initialize concepts
            
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
                initializeConceptsFromConfig(config); // Re-initialize concepts
                return config;
            }
             console.warn(`Config "${configName}" not found in localStorage.`);
            return null;
        } catch (error) {
            console.error(`Error loading config "${configName}":`, error);
            return null;
        }
    }
    
    static deleteConfig(configName: string): boolean {
        try {
            localStorage.removeItem(`config_${configName}`);
            availableConfigs.update(configs => configs.filter(name => name !== configName));
            
            if (get(currentConfigName) === configName) {
                const availableConfigsList = get(availableConfigs);
                if (availableConfigsList.length > 0) {
                    // Load the next available config, which will also initialize concepts
                    this.loadConfigByName(availableConfigsList[0]); 
                } else {
                    configStore.set(null);
                    currentConfigName.set('');
                    initializeConceptsFromConfig(null); // Clear concepts
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
        if (!storedConfig) return null;
        try {
            const parsed = JSON.parse(storedConfig);

            // --- Stricter Validation --- 
            if (parsed && 
                typeof parsed === 'object' && 
                parsed.RCONFIG && 
                Array.isArray(parsed.RCONFIG.TABS)) {
                
                // Check each tab in the array
                const allTabsValid = parsed.RCONFIG.TABS.every((tab: any, index: number) => {
                    if (tab && typeof tab === 'object' && tab.hasOwnProperty('TAB_NAME') && tab.hasOwnProperty('TAB_KEY')) {
                        return true; // Tab is valid
                    } else {
                        console.warn(`Stored config "${name}" has invalid tab object at index ${index}:`, tab);
                        return false; // Found an invalid tab
                    }
                });

                if (allTabsValid) {
                    return parsed as Config;
                } else {
                     console.warn(`Stored config "${name}" validation failed due to invalid tab structure.`);
                     // Optionally remove the invalid config here?
                     // localStorage.removeItem(`config_${name}`);
                     return null;
                }
            } else {
                 console.warn(`Stored config "${name}" has invalid base structure (missing RCONFIG or TABS array).`);
                 return null;
            }
            // --- End Stricter Validation --- 

        } catch (e) {
             console.error(`Error parsing stored config "${name}":`, e);
             localStorage.removeItem(`config_${name}`); // Remove corrupted data
             return null;
        }
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