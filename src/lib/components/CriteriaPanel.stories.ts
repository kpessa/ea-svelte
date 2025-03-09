import type { Meta, StoryObj } from '@storybook/svelte';
import { configStore } from '../services/configService';
import CriteriaPanel from './CriteriaPanel.svelte';
import type { Config, TabConfig } from '../types';

// Mock config data
const mockConfig: Config = {
    RCONFIG: {
        TABS: [
            {
                TAB_KEY: 'POTASSIUM' as const,
                TAB_NAME: 'Potassium',
                CRITERIA: [
                    {
                        CONCEPT_NAME: 'K_LOW',
                        LABEL: 'Low Potassium',
                        TOOLTIP: 'Serum potassium < 3.5 mEq/L',
                        DISPLAY: 'K < 3.5',
                        enabled: true
                    },
                    {
                        CONCEPT_NAME: 'K_HIGH',
                        LABEL: 'High Potassium',
                        TOOLTIP: 'Serum potassium > 5.0 mEq/L',
                        DISPLAY: 'K > 5.0',
                        enabled: true
                    }
                ],
                ORDER_SECTIONS: []
            } as TabConfig,
            {
                TAB_KEY: 'MAGNESIUM' as const,
                TAB_NAME: 'Magnesium',
                CRITERIA: [
                    {
                        CONCEPT_NAME: 'MG_LOW',
                        LABEL: 'Low Magnesium',
                        TOOLTIP: 'Serum magnesium < 1.7 mg/dL',
                        DISPLAY: 'Mg < 1.7',
                        enabled: true
                    }
                ],
                ORDER_SECTIONS: []
            } as TabConfig
        ],
        SETTINGS: {
            theme: 'light',
            language: 'en'
        }
    }
};

const meta = {
    title: 'Components/CriteriaPanel',
    component: CriteriaPanel,
    tags: ['autodocs'],
    argTypes: {
        selectedTab: {
            control: 'text',
            description: 'The selected tab key'
        },
        debugMode: {
            control: 'boolean',
            description: 'Whether to show debug information'
        }
    },
    decorators: [
        (story) => {
            // Set up the store with mock data
            configStore.set(mockConfig);
            return story();
        }
    ]
} satisfies Meta<CriteriaPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PotassiumTab: Story = {
    args: {
        selectedTab: 'POTASSIUM',
        debugMode: false
    }
};

export const MagnesiumTab: Story = {
    args: {
        selectedTab: 'MAGNESIUM',
        debugMode: false
    }
};

export const WithDebugMode: Story = {
    args: {
        selectedTab: 'POTASSIUM',
        debugMode: true
    }
}; 