import type { Meta, StoryObj } from '@storybook/svelte';
import { concepts } from '../stores';
import NodeConceptsPanel from './NodeConceptsPanel.svelte';
import type { TestPath, Concept } from '../types';

// Mock concepts data
const mockConcepts: Record<string, Concept> = {
    'K_LOW': { value: false, isActive: true },
    'K_HIGH': { value: false, isActive: true },
    'K_NORMAL': { value: true, isActive: true },
    'MG_LOW': { value: false, isActive: true },
    'MG_HIGH': { value: false, isActive: true },
    'MG_NORMAL': { value: true, isActive: true }
};

// Mock path data
const mockPath: TestPath = {
    id: 'path1',
    name: 'Hypokalemia Treatment Path',
    description: 'Treatment path for low potassium',
    steps: [
        {
            id: 'step1',
            name: 'Initial Assessment',
            conceptChanges: [
                { conceptName: 'K_LOW', value: true, isActive: true },
                { conceptName: 'K_NORMAL', value: false, isActive: true }
            ],
            order: 1
        },
        {
            id: 'step2',
            name: 'After First Treatment',
            conceptChanges: [
                { conceptName: 'K_LOW', value: false, isActive: true },
                { conceptName: 'K_NORMAL', value: true, isActive: true }
            ],
            order: 2
        }
    ],
    expectedResults: []
};

const meta = {
    title: 'Components/NodeConceptsPanel',
    component: NodeConceptsPanel,
    tags: ['autodocs'],
    argTypes: {
        path: {
            control: 'object',
            description: 'The test path to display concepts for'
        }
    },
    decorators: [
        (story) => {
            // Set up concepts store
            concepts.set(mockConcepts);
            return story();
        }
    ]
} satisfies Meta<NodeConceptsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        path: null
    }
};

export const WithPath: Story = {
    args: {
        path: mockPath
    }
};

export const ComplexPath: Story = {
    args: {
        path: {
            id: 'path2',
            name: 'Complex Electrolyte Management',
            description: 'Managing multiple electrolyte abnormalities',
            steps: [
                {
                    id: 'step1',
                    name: 'Initial Assessment',
                    conceptChanges: [
                        { conceptName: 'K_LOW', value: true, isActive: true },
                        { conceptName: 'MG_LOW', value: true, isActive: true }
                    ],
                    order: 1
                },
                {
                    id: 'step2',
                    name: 'After Magnesium Replacement',
                    conceptChanges: [
                        { conceptName: 'MG_LOW', value: false, isActive: true },
                        { conceptName: 'MG_NORMAL', value: true, isActive: true }
                    ],
                    order: 2
                },
                {
                    id: 'step3',
                    name: 'After Potassium Replacement',
                    conceptChanges: [
                        { conceptName: 'K_LOW', value: false, isActive: true },
                        { conceptName: 'K_NORMAL', value: true, isActive: true }
                    ],
                    order: 3
                }
            ],
            expectedResults: []
        }
    }
};

export const InactiveConcepts: Story = {
    args: {
        path: {
            id: 'path3',
            name: 'Path with Inactive Concepts',
            description: 'Testing inactive concept states',
            steps: [
                {
                    id: 'step1',
                    name: 'Initial State',
                    conceptChanges: [
                        { conceptName: 'K_LOW', value: true, isActive: false },
                        { conceptName: 'K_HIGH', value: false, isActive: false }
                    ],
                    order: 1
                },
                {
                    id: 'step2',
                    name: 'Activate Concepts',
                    conceptChanges: [
                        { conceptName: 'K_LOW', value: true, isActive: true },
                        { conceptName: 'K_HIGH', value: false, isActive: true }
                    ],
                    order: 2
                }
            ],
            expectedResults: []
        }
    }
}; 