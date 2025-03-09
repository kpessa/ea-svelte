import type { Meta, StoryObj } from '@storybook/svelte';
import { concepts } from '../stores';
import { configStore } from '../services/configService';
import { defaultConceptValues } from '../services/conceptTestService';
import ConceptHierarchySelector from './ConceptHierarchySelector.svelte';
import type { Concept, Config, TabConfig, ElectrolyteTab } from '../types';

// Mock concepts
const mockConcepts: Record<string, Concept> = {
    'K_LOW': { value: false, isActive: true },
    'K_HIGH': { value: false, isActive: true },
    'K_NORMAL': { value: true, isActive: true },
    'MG_LOW': { value: false, isActive: true },
    'MG_HIGH': { value: false, isActive: true },
    'MG_NORMAL': { value: true, isActive: true }
};

// Mock config with concept references
const mockConfig: Config = {
    RCONFIG: {
        TABS: [
            {
                TAB_KEY: 'MAGNESIUM' as ElectrolyteTab,
                TAB_NAME: 'Magnesium',
                ORDER_SECTIONS: [],
                CRITERIA: [
                    {
                        CONCEPT_NAME: 'MG_LOW',
                        LABEL: 'Low Magnesium',
                        TOOLTIP: 'Serum magnesium < 1.5 mg/dL',
                        DISPLAY: 'Mg < 1.5',
                        enabled: true
                    },
                    {
                        CONCEPT_NAME: 'MG_HIGH',
                        LABEL: 'High Magnesium',
                        TOOLTIP: 'Serum magnesium > 2.5 mg/dL',
                        DISPLAY: 'Mg > 2.5',
                        enabled: true
                    }
                ]
            } as TabConfig,
            {
                TAB_KEY: 'POTASSIUM' as ElectrolyteTab,
                TAB_NAME: 'Potassium',
                ORDER_SECTIONS: [],
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
    title: 'Components/ConceptHierarchySelector',
    component: ConceptHierarchySelector,
    tags: ['autodocs'],
    argTypes: {
        selectedConcepts: {
            control: { type: 'object' },
            description: 'Array of selected concept names'
        },
        conceptChangeValues: {
            control: { type: 'object' },
            description: 'Record of concept values'
        },
        conceptChangeActive: {
            control: { type: 'object' },
            description: 'Record of concept active states'
        },
        useAsDefaults: {
            control: { type: 'boolean' },
            description: 'Whether to use selected concepts as defaults'
        }
    }
} satisfies Meta<ConceptHierarchySelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        selectedConcepts: [],
        conceptChangeValues: {},
        conceptChangeActive: {},
        useAsDefaults: false
    },
    decorators: [
        (story) => {
            concepts.set(mockConcepts);
            configStore.set(mockConfig);
            return story();
        }
    ]
};

export const WithSelectedConcepts: Story = {
    args: {
        selectedConcepts: ['MG_LOW', 'K_LOW'],
        conceptChangeValues: {
            'MG_LOW': true,
            'K_LOW': true
        },
        conceptChangeActive: {
            'MG_LOW': true,
            'K_LOW': true
        },
        useAsDefaults: false
    },
    decorators: [
        (story) => {
            concepts.set(mockConcepts);
            configStore.set(mockConfig);
            return story();
        }
    ]
};

export const AsDefaults: Story = {
    args: {
        selectedConcepts: ['MG_LOW', 'K_LOW'],
        conceptChangeValues: {
            'MG_LOW': true,
            'K_LOW': true
        },
        conceptChangeActive: {
            'MG_LOW': true,
            'K_LOW': true
        },
        useAsDefaults: true
    },
    decorators: [
        (story) => {
            concepts.set(mockConcepts);
            configStore.set(mockConfig);
            defaultConceptValues.set({
                'MG_LOW': { value: true, isActive: true },
                'K_LOW': { value: true, isActive: true }
            });
            return story();
        }
    ]
};

export const WithInactiveConcepts: Story = {
    args: {
        selectedConcepts: ['MG_LOW', 'K_LOW', 'MG_HIGH'],
        conceptChangeValues: {
            'MG_LOW': true,
            'K_LOW': true,
            'MG_HIGH': false
        },
        conceptChangeActive: {
            'MG_LOW': true,
            'K_LOW': true,
            'MG_HIGH': false
        },
        useAsDefaults: false
    },
    decorators: [
        (story) => {
            concepts.set({
                ...mockConcepts,
                'MG_HIGH': { value: false, isActive: false }
            });
            configStore.set(mockConfig);
            return story();
        }
    ]
};

export const WithComplexConfig: Story = {
    args: {
        selectedConcepts: [],
        conceptChangeValues: {},
        conceptChangeActive: {},
        useAsDefaults: false
    },
    decorators: [
        (story) => {
            const complexConfig: Config = {
                RCONFIG: {
                    TABS: [
                        {
                            TAB_KEY: 'MAGNESIUM' as ElectrolyteTab,
                            TAB_NAME: 'Electrolytes',
                            ORDER_SECTIONS: [
                                {
                                    SECTION_NAME: 'Magnesium',
                                    CONCEPT_NAME: 'MG_SECTION',
                                    SINGLE_SELECT: 0,
                                    ORDERS: []
                                },
                                {
                                    SECTION_NAME: 'Potassium',
                                    CONCEPT_NAME: 'K_SECTION',
                                    SINGLE_SELECT: 0,
                                    ORDERS: []
                                }
                            ],
                            CRITERIA: [
                                {
                                    CONCEPT_NAME: 'MG_LOW',
                                    LABEL: 'Low Magnesium',
                                    TOOLTIP: 'Serum magnesium < 1.5 mg/dL',
                                    DISPLAY: 'Mg < 1.5',
                                    enabled: true
                                },
                                {
                                    CONCEPT_NAME: 'K_LOW',
                                    LABEL: 'Low Potassium',
                                    TOOLTIP: 'Serum potassium < 3.5 mEq/L',
                                    DISPLAY: 'K < 3.5',
                                    enabled: true
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

            concepts.set(mockConcepts);
            configStore.set(complexConfig);
            return story();
        }
    ]
}; 