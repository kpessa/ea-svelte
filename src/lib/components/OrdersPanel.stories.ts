import type { Meta, StoryObj } from '@storybook/svelte';
import { configStore } from '../services/configService';
import { concepts } from '../stores';
import OrdersPanel from './OrdersPanel.svelte';
import type { Config, TabConfig, Concept } from '../types';

// Mock config data with orders
const mockConfig: Config = {
    RCONFIG: {
        TABS: [
            {
                TAB_KEY: 'POTASSIUM' as const,
                TAB_NAME: 'Potassium',
                CRITERIA: [],
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
                    },
                    {
                        SECTION_NAME: 'Potassium Monitoring',
                        CONCEPT_NAME: 'K_HIGH',
                        SINGLE_SELECT: 1,
                        ORDERS: [
                            {
                                MNEMONIC: 'K_LEVEL_STAT',
                                ORDER_SENTENCE: 'Basic Metabolic Panel STAT',
                                ASC_SHORT_DESCRIPTION: 'Immediate potassium check',
                                COMMENT: 'Monitor for hyperkalemia'
                            }
                        ]
                    },
                    {
                        SECTION_NAME: 'No Concept Section',
                        SINGLE_SELECT: 1,
                        ORDERS: [
                            {
                                MNEMONIC: 'GENERAL_ORDER',
                                ORDER_SENTENCE: 'General Order',
                                ASC_SHORT_DESCRIPTION: 'Always visible',
                                COMMENT: 'This section has no concept'
                            }
                        ]
                    }
                ]
            } as TabConfig,
            {
                TAB_KEY: 'MAGNESIUM' as const,
                TAB_NAME: 'Magnesium',
                CRITERIA: [],
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

// Mock concepts for testing section filtering
const mockConcepts: Record<string, Concept> = {
    'K_LOW': {
        value: true,
        isActive: true,
        description: 'Patient has low potassium'
    },
    'K_HIGH': {
        value: false,
        isActive: true,
        description: 'Patient has high potassium'
    },
    'MG_LOW': {
        value: true,
        isActive: true,
        description: 'Patient has low magnesium'
    }
};

const meta = {
    title: 'Components/OrdersPanel',
    component: OrdersPanel,
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
            // Set up the stores with mock data
            configStore.set(mockConfig);
            concepts.set(mockConcepts);
            return story();
        }
    ]
} satisfies Meta<OrdersPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PotassiumOrders: Story = {
    args: {
        selectedTab: 'POTASSIUM',
        debugMode: false
    }
};

export const MagnesiumOrders: Story = {
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

export const WithSectionFiltering: Story = {
    args: {
        selectedTab: 'POTASSIUM',
        debugMode: true
    },
    play: async ({ canvasElement }) => {
        // Get the evaluate button
        const evaluateButton = canvasElement.querySelector('.evaluate-sections-btn') as HTMLButtonElement;
        if (evaluateButton) {
            evaluateButton.click();
        }
    }
}; 