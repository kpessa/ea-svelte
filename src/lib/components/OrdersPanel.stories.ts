import type { Meta, StoryObj } from '@storybook/svelte';
import { configStore } from '../services/configService';
import OrdersPanel from './OrdersPanel.svelte';
import type { Config, TabConfig } from '../types';

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
            // Set up the store with mock data
            configStore.set(mockConfig);
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