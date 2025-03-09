import type { Meta, StoryObj } from '@storybook/svelte';
import { concepts } from '../stores';
import { configStore } from '../services/configService';
import { testScenarios, testResults } from '../services/conceptTestService';
import ConceptManager from './ConceptManager.svelte';
import type { Config, TabConfig, TestScenario, TestResult } from '../types';

// Mock concepts data
const mockConcepts = {
    'K_LOW': { value: true, isActive: true },
    'K_HIGH': { value: false, isActive: true },
    'MG_LOW': { value: true, isActive: true },
    'NA_LOW': { value: false, isActive: false },
    'CA_HIGH': { value: true, isActive: false }
};

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

// Mock test scenarios
const mockTestScenarios: TestScenario[] = [
    {
        id: '1',
        name: 'Basic Potassium Scenario',
        description: 'Test basic potassium management',
        scenarios: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// Mock test results
const mockTestResults: TestResult[] = [
    {
        scenarioId: '1',
        pathId: '1',
        timestamp: new Date().toISOString(),
        steps: [],
        success: true
    }
];

const meta = {
    title: 'Components/ConceptManager',
    component: ConceptManager,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    },
    decorators: [
        (story) => {
            // Set up all required stores
            concepts.set(mockConcepts);
            configStore.set(mockConfig);
            testScenarios.set(mockTestScenarios);
            testResults.set(mockTestResults);
            return story();
        }
    ]
} satisfies Meta<ConceptManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {}
};

export const WithManyConcepts: Story = {
    decorators: [
        (story) => {
            // Set up store with many concepts
            concepts.set({
                'K_LOW': { value: true, isActive: true },
                'K_HIGH': { value: false, isActive: true },
                'K_NORMAL': { value: true, isActive: true },
                'MG_LOW': { value: true, isActive: true },
                'MG_HIGH': { value: false, isActive: true },
                'MG_NORMAL': { value: true, isActive: true },
                'NA_LOW': { value: false, isActive: true },
                'NA_HIGH': { value: true, isActive: true },
                'NA_NORMAL': { value: false, isActive: true },
                'CA_LOW': { value: true, isActive: false },
                'CA_HIGH': { value: false, isActive: false },
                'CA_NORMAL': { value: true, isActive: false },
                'PO4_LOW': { value: true, isActive: true },
                'PO4_HIGH': { value: false, isActive: true },
                'PO4_NORMAL': { value: true, isActive: true }
            });
            return story();
        }
    ]
};

export const WithTestScenarios: Story = {
    decorators: [
        (story) => {
            // Set up stores with test scenarios
            concepts.set(mockConcepts);
            testScenarios.set([
                {
                    id: '1',
                    name: 'Potassium Management',
                    description: 'Test potassium replacement workflow',
                    scenarios: [
                        {
                            id: '1-1',
                            name: 'Low Potassium',
                            description: 'Patient with hypokalemia',
                            parentId: null,
                            level: 0,
                            concepts: [
                                { conceptName: 'K_LOW', value: true, isActive: true }
                            ],
                            children: [],
                            expectedResults: []
                        }
                    ],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: '2',
                    name: 'Magnesium Management',
                    description: 'Test magnesium replacement workflow',
                    scenarios: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ]);
            return story();
        }
    ]
};

export const WithComplexExpressions: Story = {
    decorators: [
        (story) => {
            // Set up config with complex concept expressions
            configStore.set({
                RCONFIG: {
                    TABS: [
                        {
                            TAB_KEY: 'POTASSIUM' as const,
                            TAB_NAME: 'Potassium',
                            CRITERIA: [
                                {
                                    CONCEPT_NAME: 'K_REPLACEMENT_NEEDED',
                                    LABEL: 'Potassium Replacement Needed',
                                    TOOLTIP: 'K_LOW && !K_HIGH && MG_NORMAL',
                                    DISPLAY: 'Complex condition',
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
            });
            return story();
        }
    ]
}; 