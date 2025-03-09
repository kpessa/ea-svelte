import type { Meta, StoryObj } from '@storybook/svelte';
import { concepts } from '../stores';
import { testScenarios, testResults } from '../services/conceptTestService';
import { configStore } from '../services/configService';
import ConceptTestManager from './ConceptTestManager.svelte';
import type { TestScenario, Concept, Config, TestSubScenario, TabConfig, TestResult, TestStepResult, ExpectedResultOutcome } from '../types';

// Mock concepts
const mockConcepts: Record<string, Concept> = {
    'K_LOW': { value: false, isActive: true },
    'K_HIGH': { value: false, isActive: true },
    'K_NORMAL': { value: true, isActive: true },
    'MG_LOW': { value: false, isActive: true },
    'MG_HIGH': { value: false, isActive: true },
    'MG_NORMAL': { value: true, isActive: true }
};

// Mock test scenarios
const mockScenarios: TestScenario[] = [
    {
        id: '1',
        name: 'Magnesium Management',
        description: 'Testing magnesium replacement workflow',
        scenarios: [
            {
                id: '1-1',
                name: 'Initial Low Magnesium',
                description: 'Patient presents with hypomagnesemia',
                parentId: null,
                level: 0,
                concepts: [
                    { conceptName: 'MG_LOW', value: true, isActive: true },
                    { conceptName: 'MG_NORMAL', value: false, isActive: true }
                ],
                children: [],
                expectedResults: [
                    {
                        type: 'tab',
                        target: 'MAGNESIUM',
                        expectedVisibility: true,
                        description: 'Magnesium tab should be visible'
                    }
                ]
            }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// Mock config
const mockConfig: Config = {
    RCONFIG: {
        TABS: [
            {
                TAB_KEY: 'MAGNESIUM',
                TAB_NAME: 'Magnesium',
                ORDER_SECTIONS: [],
                CRITERIA: []
            } as TabConfig
        ],
        SETTINGS: {
            theme: 'light',
            language: 'en'
        }
    }
};

const meta = {
    title: 'Components/ConceptTestManager',
    component: ConceptTestManager,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    },
    decorators: [
        (story) => {
            // Set up required stores
            concepts.set(mockConcepts);
            testScenarios.set(mockScenarios);
            testResults.set([]);
            configStore.set(mockConfig);
            return story();
        }
    ]
} satisfies Meta<ConceptTestManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithComplexScenarios: Story = {
    decorators: [
        (story) => {
            const complexScenarios: TestScenario[] = [
                {
                    id: '1',
                    name: 'Electrolyte Management',
                    description: 'Complex electrolyte management workflow',
                    scenarios: [
                        {
                            id: '1-1',
                            name: 'Initial Assessment',
                            description: 'Patient presents with multiple abnormalities',
                            parentId: null,
                            level: 0,
                            concepts: [
                                { conceptName: 'MG_LOW', value: true, isActive: true },
                                { conceptName: 'K_LOW', value: true, isActive: true }
                            ],
                            children: [],
                            expectedResults: [
                                {
                                    type: 'tab',
                                    target: 'MAGNESIUM',
                                    expectedVisibility: true,
                                    description: 'Magnesium tab should be visible'
                                },
                                {
                                    type: 'tab',
                                    target: 'POTASSIUM',
                                    expectedVisibility: true,
                                    description: 'Potassium tab should be visible'
                                }
                            ]
                        },
                        {
                            id: '1-2',
                            name: 'After Magnesium Replacement',
                            description: 'Magnesium corrected, potassium still low',
                            parentId: '1-1',
                            level: 1,
                            concepts: [
                                { conceptName: 'MG_LOW', value: false, isActive: true },
                                { conceptName: 'MG_NORMAL', value: true, isActive: true },
                                { conceptName: 'K_LOW', value: true, isActive: true }
                            ],
                            children: [],
                            expectedResults: [
                                {
                                    type: 'tab',
                                    target: 'MAGNESIUM',
                                    expectedVisibility: false,
                                    description: 'Magnesium tab should be hidden'
                                }
                            ]
                        }
                    ],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];

            testScenarios.set(complexScenarios);
            return story();
        }
    ]
};

export const EmptyState: Story = {
    decorators: [
        (story) => {
            testScenarios.set([]);
            return story();
        }
    ]
};

export const WithNestedScenarios: Story = {
    decorators: [
        (story) => {
            const nestedScenarios: TestScenario[] = [
                {
                    id: '1',
                    name: 'Complex Protocol',
                    description: 'Testing nested scenario structure',
                    scenarios: [
                        {
                            id: '1-1',
                            name: 'Initial State',
                            description: 'Starting conditions',
                            parentId: null,
                            level: 0,
                            concepts: [
                                { conceptName: 'MG_LOW', value: true, isActive: true }
                            ],
                            children: [
                                {
                                    id: '1-2',
                                    name: 'Path A',
                                    description: 'First treatment path',
                                    parentId: '1-1',
                                    level: 1,
                                    concepts: [
                                        { conceptName: 'MG_LOW', value: false, isActive: true },
                                        { conceptName: 'MG_NORMAL', value: true, isActive: true }
                                    ],
                                    children: [],
                                    expectedResults: []
                                } as TestSubScenario,
                                {
                                    id: '1-3',
                                    name: 'Path B',
                                    description: 'Alternative treatment path',
                                    parentId: '1-1',
                                    level: 1,
                                    concepts: [
                                        { conceptName: 'MG_HIGH', value: true, isActive: true }
                                    ],
                                    children: [
                                        {
                                            id: '1-4',
                                            name: 'Path B Resolution',
                                            description: 'Resolution of high magnesium',
                                            parentId: '1-3',
                                            level: 2,
                                            concepts: [
                                                { conceptName: 'MG_HIGH', value: false, isActive: true },
                                                { conceptName: 'MG_NORMAL', value: true, isActive: true }
                                            ],
                                            children: [],
                                            expectedResults: []
                                        } as TestSubScenario
                                    ],
                                    expectedResults: []
                                } as TestSubScenario
                            ],
                            expectedResults: []
                        }
                    ],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];

            testScenarios.set(nestedScenarios);
            return story();
        }
    ]
};

export const WithTestResults: Story = {
    decorators: [
        (story) => {
            const results: TestResult[] = [
                {
                    scenarioId: '1',
                    pathId: '1-1',
                    timestamp: new Date().toISOString(),
                    steps: [
                        {
                            stepId: '1',
                            conceptStates: mockConcepts,
                            results: [
                                {
                                    expectedResult: {
                                        type: 'tab' as const,
                                        target: 'MAGNESIUM',
                                        expectedVisibility: true,
                                        description: 'Magnesium tab should be visible'
                                    },
                                    actualVisibility: true,
                                    success: true
                                }
                            ],
                            success: true
                        }
                    ],
                    success: true
                }
            ];

            testResults.set(results);
            return story();
        }
    ]
}; 