import type { Meta, StoryObj } from '@storybook/svelte';
import { concepts } from '../stores';
import HierarchicalScenarioManager from './HierarchicalScenarioManager.svelte';
import type { TestScenario, Concept } from '../types';

// Mock concepts
const mockConcepts: Record<string, Concept> = {
    'K_LOW': { value: false, isActive: true },
    'K_HIGH': { value: false, isActive: true },
    'K_NORMAL': { value: true, isActive: true },
    'MG_LOW': { value: false, isActive: true },
    'MG_HIGH': { value: false, isActive: true },
    'MG_NORMAL': { value: true, isActive: true }
};

// Mock scenario
const mockScenario: TestScenario = {
    id: '1',
    name: 'Electrolyte Management',
    description: 'Testing electrolyte management workflow',
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
                }
            ]
        }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

const meta = {
    title: 'Components/HierarchicalScenarioManager',
    component: HierarchicalScenarioManager,
    tags: ['autodocs'],
    argTypes: {
        scenario: {
            control: 'object',
            description: 'The test scenario to display'
        },
        selectedScenarioId: {
            control: 'text',
            description: 'ID of the currently selected scenario'
        },
        isEditable: {
            control: 'boolean',
            description: 'Whether the scenarios can be edited'
        },
        onScenarioSelect: {
            action: 'scenarioSelected'
        }
    }
} satisfies Meta<HierarchicalScenarioManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        scenario: mockScenario,
        selectedScenarioId: null,
        isEditable: false
    },
    decorators: [
        (story) => {
            concepts.set(mockConcepts);
            return story();
        }
    ]
};

export const WithSelectedScenario: Story = {
    args: {
        scenario: mockScenario,
        selectedScenarioId: '1-1',
        isEditable: false
    },
    decorators: [
        (story) => {
            concepts.set(mockConcepts);
            return story();
        }
    ]
};

export const Editable: Story = {
    args: {
        scenario: mockScenario,
        selectedScenarioId: '1-1',
        isEditable: true
    },
    decorators: [
        (story) => {
            concepts.set(mockConcepts);
            return story();
        }
    ]
};

export const EmptyScenario: Story = {
    args: {
        scenario: {
            id: '2',
            name: 'Empty Scenario',
            description: 'A scenario with no sub-scenarios',
            scenarios: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        selectedScenarioId: null,
        isEditable: true
    },
    decorators: [
        (story) => {
            concepts.set(mockConcepts);
            return story();
        }
    ]
};

export const ComplexHierarchy: Story = {
    args: {
        scenario: {
            id: '3',
            name: 'Complex Protocol',
            description: 'Testing nested scenario structure',
            scenarios: [
                {
                    id: '3-1',
                    name: 'Initial State',
                    description: 'Starting conditions',
                    parentId: null,
                    level: 0,
                    concepts: [
                        { conceptName: 'MG_LOW', value: true, isActive: true }
                    ],
                    children: [
                        {
                            id: '3-2',
                            name: 'Path A',
                            description: 'First treatment path',
                            parentId: '3-1',
                            level: 1,
                            concepts: [
                                { conceptName: 'MG_LOW', value: false, isActive: true },
                                { conceptName: 'MG_NORMAL', value: true, isActive: true }
                            ],
                            children: [],
                            expectedResults: []
                        },
                        {
                            id: '3-3',
                            name: 'Path B',
                            description: 'Alternative treatment path',
                            parentId: '3-1',
                            level: 1,
                            concepts: [
                                { conceptName: 'MG_HIGH', value: true, isActive: true }
                            ],
                            children: [
                                {
                                    id: '3-4',
                                    name: 'Path B Resolution',
                                    description: 'Resolution of high magnesium',
                                    parentId: '3-3',
                                    level: 2,
                                    concepts: [
                                        { conceptName: 'MG_HIGH', value: false, isActive: true },
                                        { conceptName: 'MG_NORMAL', value: true, isActive: true }
                                    ],
                                    children: [],
                                    expectedResults: []
                                }
                            ],
                            expectedResults: []
                        }
                    ],
                    expectedResults: []
                }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        selectedScenarioId: '3-1',
        isEditable: true
    },
    decorators: [
        (story) => {
            concepts.set(mockConcepts);
            return story();
        }
    ]
}; 