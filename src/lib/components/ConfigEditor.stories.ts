import type { Meta, StoryObj } from '@storybook/svelte';
import { configStore, currentConfigName, availableConfigs } from '../services/configService';
import ConfigEditor from './ConfigEditor.svelte';
import type { Config, TabConfig, ElectrolyteTab } from '../types';

// Mock config data
const mockConfig: Config = {
    RCONFIG: {
        TABS: [
            {
                TAB_KEY: 'POTASSIUM' as ElectrolyteTab,
                TAB_NAME: 'Potassium',
                CRITERIA: [
                    {
                        CONCEPT_NAME: 'K_LOW',
                        LABEL: 'Low Potassium',
                        TOOLTIP: 'Serum potassium < 3.5 mEq/L',
                        DISPLAY: 'K < 3.5',
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

const mockConfigs = ['default', 'test', 'development'];

const meta = {
    title: 'Components/ConfigEditor',
    component: ConfigEditor,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    },
    argTypes: {
        isFullScreen: {
            control: 'boolean',
            description: 'Whether to display the editor in full screen mode'
        },
        sectionToEdit: {
            control: 'text',
            description: 'Specific section of the config to edit'
        },
        onClose: { action: 'closed' },
        onSectionSave: { action: 'section saved' }
    },
    decorators: [
        (story) => {
            // Set up required stores
            configStore.set(mockConfig);
            currentConfigName.set('default');
            availableConfigs.set(mockConfigs);
            return story();
        }
    ]
} satisfies Meta<ConfigEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        isFullScreen: false,
        sectionToEdit: null
    }
};

export const FullScreen: Story = {
    args: {
        isFullScreen: true,
        sectionToEdit: null
    }
};

export const EditingSection: Story = {
    args: {
        isFullScreen: false,
        sectionToEdit: 'RCONFIG.SETTINGS',
        onSectionSave: (updatedSection: Record<string, unknown>) => console.log('Section saved:', updatedSection)
    }
};

export const ComplexConfig: Story = {
    decorators: [
        (story) => {
            const complexConfig: Config = {
                RCONFIG: {
                    TABS: [
                        {
                            TAB_KEY: 'MAGNESIUM' as ElectrolyteTab,
                            TAB_NAME: 'Electrolytes',
                            CRITERIA: [
                                {
                                    CONCEPT_NAME: 'K_LOW',
                                    LABEL: 'Low Potassium',
                                    TOOLTIP: 'Serum potassium < 3.5 mEq/L',
                                    DISPLAY: 'K < 3.5',
                                    enabled: true
                                },
                                {
                                    CONCEPT_NAME: 'MG_LOW',
                                    LABEL: 'Low Magnesium',
                                    TOOLTIP: 'Serum magnesium < 1.5 mg/dL',
                                    DISPLAY: 'Mg < 1.5',
                                    enabled: true
                                }
                            ],
                            ORDER_SECTIONS: [
                                {
                                    SECTION_NAME: 'Laboratory Tests',
                                    CONCEPT_NAME: 'LABS',
                                    SINGLE_SELECT: 0,
                                    ORDERS: [
                                        {
                                            MNEMONIC: 'BMP',
                                            ORDER_SENTENCE: 'Basic Metabolic Panel',
                                            ASC_SHORT_DESCRIPTION: 'BMP',
                                            COMMENT: ''
                                        }
                                    ]
                                }
                            ]
                        } as TabConfig
                    ],
                    SETTINGS: {
                        theme: 'dark',
                        language: 'en',
                        notifications: {
                            enabled: true,
                            sound: false
                        }
                    }
                }
            };
            configStore.set(complexConfig);
            return story();
        }
    ],
    args: {
        isFullScreen: false,
        sectionToEdit: null
    }
}; 