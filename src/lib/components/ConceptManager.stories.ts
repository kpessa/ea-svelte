import type { Meta, StoryObj } from '@storybook/svelte';
import { concepts } from '../stores';
import { configStore } from '../services/configService';
import { testScenarios, testResults } from '../services/conceptTestService';
import ConceptManager from './ConceptManager.svelte';
import type { Config, TabConfig, TestScenario, TestResult } from '../types';
import { action } from '@storybook/addon-actions';
import { writable } from 'svelte/store';

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

// Mock the stores and services
const mockConceptsStore = writable({
    'ConceptA': { value: true, isActive: true },
    'ConceptB': { value: false, isActive: true },
    'ConceptC': { value: true, isActive: false },
    'ConceptD': { value: false, isActive: false }
});

const mockConfigStore = writable({
    RCONFIG: {
        TABS: [
            {
                TAB_KEY: 'MAGNESIUM',
                TAB_NAME: 'Magnesium',
                FLAG_ON_CONCEPT: '{ConceptA} AND {ConceptB}',
                CRITERIA: [
                    { CONCEPT_NAME: '{ConceptA}', LABEL: 'Criterion 1' }
                ],
                ORDER_SECTIONS: [
                    { CONCEPT_NAME: 'NOT {ConceptB}', SECTION_NAME: 'Section 1' }
                ],
                CONCEPTS: [
                    { Concept: '({ConceptA} OR {ConceptB}) AND NOT {ConceptC}' }
                ]
            }
        ]
    }
});

const mockTestScenariosStore = writable([
    {
        id: 'scenario1',
        name: 'Magnesium Scenario',
        description: 'Test scenario for magnesium workflow',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scenarios: [],
        paths: [
            {
                id: 'path1',
                name: 'Happy Path',
                description: 'Normal workflow path',
                steps: [
                    {
                        id: 'step1',
                        name: 'Initial State',
                        order: 0,
                        conceptChanges: [
                            { conceptName: 'ConceptA', value: true, isActive: true },
                            { conceptName: 'ConceptB', value: false, isActive: true }
                        ]
                    }
                ]
            }
        ]
    }
]);

const mockTestResultsStore = writable([]);

// Mock the ConceptExtractionService
const mockConceptExtractionService = {
    extractConcepts: () => [
        { name: 'ConceptA', section: 'Section 1', path: 'path1', isExpression: false },
        { name: 'ConceptB', section: 'Section 1', path: 'path2', isExpression: false },
        { name: 'ConceptC', section: 'Section 2', path: 'path3', isExpression: false }
    ],
    generateConceptUsageReport: () => `
        Concept Usage Report
        -------------------
        Total concepts found: 3

        Concepts by section:
        - Section 1: ConceptA, ConceptB
        - Section 2: ConceptC

        Unused concepts: ConceptD
    `,
    initializeConceptsFromReferences: () => {}
};

// Mock the ConceptTestService
const mockConceptTestService = {
    loadTestScenarios: () => {},
    saveTestScenarios: () => {},
    updateSectionVisibility: () => {},
    addStepToPath: () => {}
};

const meta = {
    title: 'Components/ConceptManager',
    component: ConceptManager,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        mockData: {
            concepts: mockConceptsStore,
            configStore: mockConfigStore,
            testScenarios: mockTestScenariosStore,
            testResults: mockTestResultsStore,
            ConceptExtractionService: mockConceptExtractionService,
            ConceptTestService: mockConceptTestService
        }
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
    args: {},
    parameters: {
        docs: {
            description: {
                story: 'The refactored ConceptManager component with all its subcomponents.'
            }
        }
    }
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

export const WithModalOpen: Story = {
    play: async ({ canvasElement }) => {
        // Find and click the brain icon to open the modal
        const brainIcon = canvasElement.querySelector('.concept-icon') as HTMLButtonElement;
        if (brainIcon) {
            brainIcon.click();
        }
    },
    parameters: {
        docs: {
            description: {
                story: 'ConceptManager with the modal open.'
            }
        }
    }
}; 