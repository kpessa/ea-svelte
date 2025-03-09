import type { Meta, StoryObj } from '@storybook/svelte';
import { configStore } from '../services/configService';
import { concepts } from '../stores';
import TabContent from './TabContent.svelte';
import type { Config, TabConfig } from '../types';

// Mock config data with orders and criteria
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
                ORDER_SECTIONS: [
                    {
                        SECTION_NAME: 'Potassium Replacement',
                        CONCEPT_NAME: 'K_LOW',
                        SINGLE_SELECT: 1,
                        ORDERS: [
                            {
                                MNEMONIC: 'KCL_ORAL_20',
                                ORDER_SENTENCE: 'Potassium Chloride 20 mEq Oral Tablet',
                                ASC_SHORT_DESCRIPTION: 'For mild hypokalemia',
                                COMMENT: 'Take with food and water'
                            },
                            {
                                MNEMONIC: 'KCL_IV_40',
                                ORDER_SENTENCE: 'Potassium Chloride 40 mEq in 100mL NS IV',
                                ASC_SHORT_DESCRIPTION: 'For moderate hypokalemia',
                                COMMENT: 'Infuse over 4 hours'
                            }
                        ]
                    }
                ]
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
                ORDER_SECTIONS: [
                    {
                        SECTION_NAME: 'Magnesium Replacement',
                        CONCEPT_NAME: 'MG_LOW',
                        SINGLE_SELECT: 1,
                        ORDERS: [
                            {
                                MNEMONIC: 'MGSO4_2G',
                                ORDER_SENTENCE: 'Magnesium Sulfate 2g in 50mL NS IV',
                                ASC_SHORT_DESCRIPTION: 'For hypomagnesemia',
                                COMMENT: 'Infuse over 2 hours'
                            }
                        ]
                    }
                ]
            } as TabConfig
        ],
        SETTINGS: {
            theme: 'light',
            language: 'en'
        }
    }
};

// Mock concepts data
const mockConcepts = {
    'K_LOW': { value: true, isActive: true },
    'K_HIGH': { value: false, isActive: true },
    'MG_LOW': { value: true, isActive: true }
};

const meta = {
    title: 'Components/TabContent',
    component: TabContent,
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
            // Set up both stores with mock data
            configStore.set(mockConfig);
            concepts.set(mockConcepts);
            return story();
        }
    ]
} satisfies Meta<TabContent>;

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

export const WithDifferentConceptStates: Story = {
    decorators: [
        (story) => {
            // Set up stores with different concept states
            configStore.set(mockConfig);
            concepts.set({
                'K_LOW': { value: false, isActive: true },
                'K_HIGH': { value: true, isActive: true },
                'MG_LOW': { value: false, isActive: false }
            });
            return story();
        }
    ],
    args: {
        selectedTab: 'POTASSIUM',
        debugMode: true
    }
}; 