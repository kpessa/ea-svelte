import type { Meta, StoryObj } from '@storybook/svelte';
import { concepts } from '../stores';
import ScenarioConceptEditor from './ScenarioConceptEditor.svelte';
import type { TestSubScenario, ConceptChange } from '../types';

// Mock concepts data
const mockConcepts = {
    'K_LOW': { value: true, isActive: true },
    'K_HIGH': { value: false, isActive: true },
    'K_NORMAL': { value: true, isActive: true },
    'MG_LOW': { value: true, isActive: true },
    'MG_HIGH': { value: false, isActive: true },
    'MG_NORMAL': { value: true, isActive: true }
};

// Mock scenario data
const mockScenario: TestSubScenario = {
    id: '1',
    name: 'Low Potassium Scenario',
    description: 'Patient with hypokalemia',
    parentId: null,
    level: 0,
    concepts: [
        { conceptName: 'K_LOW', value: true, isActive: true },
        { conceptName: 'K_NORMAL', value: false, isActive: true }
    ],
    children: [],
    expectedResults: []
};

// Mock parent concepts
const mockParentConcepts: ConceptChange[] = [
    { conceptName: 'MG_NORMAL', value: true, isActive: true }
];

const meta = {
    title: 'Components/ScenarioConceptEditor',
    component: ScenarioConceptEditor,
    tags: ['autodocs'],
    argTypes: {
        scenario: {
            control: 'object',
            description: 'The scenario being edited'
        },
        parentConcepts: {
            control: 'object',
            description: 'Concepts inherited from parent scenarios'
        }
    },
    decorators: [
        (story) => {
            // Set up concepts store
            concepts.set(mockConcepts);
            return story();
        }
    ]
} satisfies Meta<ScenarioConceptEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        scenario: mockScenario,
        parentConcepts: []
    }
};

export const WithParentConcepts: Story = {
    args: {
        scenario: mockScenario,
        parentConcepts: mockParentConcepts
    }
};

export const EmptyScenario: Story = {
    args: {
        scenario: {
            id: '2',
            name: 'New Scenario',
            description: 'Empty scenario for testing',
            parentId: null,
            level: 0,
            concepts: [],
            children: [],
            expectedResults: []
        },
        parentConcepts: []
    }
};

export const ComplexScenario: Story = {
    args: {
        scenario: {
            id: '3',
            name: 'Complex Electrolyte Scenario',
            description: 'Multiple electrolyte abnormalities',
            parentId: null,
            level: 0,
            concepts: [
                { conceptName: 'K_LOW', value: true, isActive: true },
                { conceptName: 'MG_LOW', value: true, isActive: true },
                { conceptName: 'K_HIGH', value: false, isActive: false },
                { conceptName: 'MG_HIGH', value: false, isActive: false },
                { conceptName: 'K_NORMAL', value: false, isActive: true },
                { conceptName: 'MG_NORMAL', value: false, isActive: true }
            ],
            children: [],
            expectedResults: []
        },
        parentConcepts: []
    }
};

export const WithInheritedConcepts: Story = {
    args: {
        scenario: {
            id: '4',
            name: 'Child Scenario',
            description: 'Inherits concepts from parent',
            parentId: '1',
            level: 1,
            concepts: [
                { conceptName: 'K_LOW', value: true, isActive: true }
            ],
            children: [],
            expectedResults: []
        },
        parentConcepts: [
            { conceptName: 'MG_NORMAL', value: true, isActive: true },
            { conceptName: 'K_HIGH', value: false, isActive: true }
        ]
    }
}; 