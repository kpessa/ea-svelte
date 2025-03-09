import type { Meta, StoryObj } from '@storybook/svelte';
import { concepts } from '../stores';
import { configStore } from '../services/configService';
import TestPathGraph from './TestPathGraph.svelte';
import type { TestScenario } from '../types';

// Mock concepts data
const mockConcepts = {
    'MG_LOW': { value: true, isActive: true },
    'MG_HIGH': { value: false, isActive: true },
    'MG_NORMAL': { value: false, isActive: true },
    'NPO': { value: false, isActive: true }
};

// Mock scenario data
const mockScenario: TestScenario = {
    id: '1',
    name: 'Magnesium Management',
    description: 'Test magnesium replacement workflow',
    scenarios: [],
    paths: [
        {
            id: 'path1',
            name: 'Oral Route - NPO',
            description: 'Patient is NPO with low magnesium',
            steps: [
                {
                    id: 'step1',
                    name: 'Initial State',
                    conceptChanges: [
                        { conceptName: 'MG_LOW', value: true, isActive: true },
                        { conceptName: 'NPO', value: true, isActive: true }
                    ],
                    order: 1
                }
            ],
            expectedResults: [],
            parentId: null
        },
        {
            id: 'path2',
            name: 'IV Route - Not NPO',
            description: 'Patient is not NPO with low magnesium',
            steps: [
                {
                    id: 'step1',
                    name: 'Initial State',
                    conceptChanges: [
                        { conceptName: 'MG_LOW', value: true, isActive: true },
                        { conceptName: 'NPO', value: false, isActive: true }
                    ],
                    order: 1
                }
            ],
            expectedResults: [],
            parentId: null
        }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

const meta = {
    title: 'Components/TestPathGraph',
    component: TestPathGraph,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    },
    argTypes: {
        scenario: {
            control: 'object',
            description: 'The test scenario to display'
        },
        selectedPathId: {
            control: 'text',
            description: 'ID of the currently selected path'
        },
        isEditable: {
            control: 'boolean',
            description: 'Whether the graph is editable'
        }
    },
    decorators: [
        (story) => {
            // Set up required stores
            concepts.set(mockConcepts);
            return story();
        }
    ]
} satisfies Meta<TestPathGraph>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        scenario: mockScenario,
        selectedPathId: null,
        isEditable: false,
        onPathSelect: (pathId: string) => console.log('Path selected:', pathId)
    }
};

export const WithSelectedPath: Story = {
    args: {
        scenario: mockScenario,
        selectedPathId: 'path1',
        isEditable: false,
        onPathSelect: (pathId: string) => console.log('Path selected:', pathId)
    }
};

export const Editable: Story = {
    args: {
        scenario: mockScenario,
        selectedPathId: null,
        isEditable: true,
        onPathSelect: (pathId: string) => console.log('Path selected:', pathId)
    }
};

export const ComplexScenario: Story = {
    args: {
        scenario: {
            ...mockScenario,
            paths: [
                ...mockScenario.paths,
                {
                    id: 'path3',
                    name: 'Combined Route',
                    description: 'Patient requires both oral and IV magnesium',
                    steps: [
                        {
                            id: 'step1',
                            name: 'Initial State',
                            conceptChanges: [
                                { conceptName: 'MG_LOW', value: true, isActive: true },
                                { conceptName: 'NPO', value: false, isActive: true }
                            ],
                            order: 1
                        },
                        {
                            id: 'step2',
                            name: 'After First Dose',
                            conceptChanges: [
                                { conceptName: 'MG_LOW', value: true, isActive: true },
                                { conceptName: 'NPO', value: true, isActive: true }
                            ],
                            order: 2
                        }
                    ],
                    expectedResults: [],
                    parentId: null
                }
            ]
        },
        selectedPathId: null,
        isEditable: false,
        onPathSelect: (pathId: string) => console.log('Path selected:', pathId)
    }
}; 