import type { Config } from '$lib/types';
import { config } from '$lib/stores';

export class ConfigService {
    private static instance: ConfigService;
    private currentConfig: Config | null = null;

    private constructor() {}

    static getInstance(): ConfigService {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }

    async loadConfig(configPath: string): Promise<void> {
        try {
            const response = await fetch(configPath);
            if (!response.ok) {
                throw new Error(`Failed to load configuration: ${response.statusText}`);
            }
            const configData = await response.json();
            this.validateConfig(configData);
            this.currentConfig = configData;
            config.set(configData);
        } catch (error) {
            console.error('Error loading configuration:', error);
            throw error;
        }
    }

    getConfig(): Config | null {
        return this.currentConfig;
    }

    private validateConfig(configData: unknown): asserts configData is Config {
        if (!configData || typeof configData !== 'object') {
            throw new Error('Configuration must be an object');
        }

        const config = configData as Partial<Config>;
        if (!Array.isArray(config.tabs)) {
            throw new Error('Configuration must have a tabs array');
        }

        if (!Array.isArray(config.testCases)) {
            throw new Error('Configuration must have a testCases array');
        }

        // Validate each tab
        config.tabs.forEach((tab, index) => {
            if (!tab.id || typeof tab.id !== 'string') {
                throw new Error(`Tab ${index} must have a valid id`);
            }
            if (!tab.name || typeof tab.name !== 'string') {
                throw new Error(`Tab ${index} must have a valid name`);
            }
            if (!Array.isArray(tab.criteria)) {
                throw new Error(`Tab ${index} must have a criteria array`);
            }
            if (!Array.isArray(tab.orderSections)) {
                throw new Error(`Tab ${index} must have an orderSections array`);
            }
        });

        // Validate each test case
        config.testCases.forEach((testCase, index) => {
            if (!testCase.id || typeof testCase.id !== 'string') {
                throw new Error(`Test case ${index} must have a valid id`);
            }
            if (!testCase.name || typeof testCase.name !== 'string') {
                throw new Error(`Test case ${index} must have a valid name`);
            }
            if (!testCase.concepts || typeof testCase.concepts !== 'object') {
                throw new Error(`Test case ${index} must have a valid concepts object`);
            }
        });
    }
} 