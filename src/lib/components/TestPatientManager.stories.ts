import type { Meta, StoryObj } from '@storybook/svelte';
import { testCases, selectedTestCase, concepts } from '../stores';
import TestPatientManager from './TestPatientManager.svelte';
import type { TestCase, Concept } from '../types';
import { TestPatientService } from '../services/testPatientService';

// Mock test cases
const mockTestCases: TestCase[] = [
    {
        id: '1',
        name: 'Normal Patient',
        concepts: {
            'K_LOW': { value: false, isActive: true },
            'K_HIGH': { value: false, isActive: true },
            'K_NORMAL': { value: true, isActive: true },
            'MG_LOW': { value: false, isActive: true },
            'MG_HIGH': { value: false, isActive: true },
            'MG_NORMAL': { value: true, isActive: true }
        }
    },
    {
        id: '2',
        name: 'Hypokalemia',
        concepts: {
            'K_LOW': { value: true, isActive: true },
            'K_HIGH': { value: false, isActive: true },
            'K_NORMAL': { value: false, isActive: true },
            'MG_LOW': { value: false, isActive: true },
            'MG_HIGH': { value: false, isActive: true },
            'MG_NORMAL': { value: true, isActive: true }
        }
    }
];

// Mock concepts
const mockConcepts: Record<string, Concept> = {
    'K_LOW': { value: false, isActive: true },
    'K_HIGH': { value: false, isActive: true },
    'K_NORMAL': { value: true, isActive: true },
    'MG_LOW': { value: false, isActive: true },
    'MG_HIGH': { value: false, isActive: true },
    'MG_NORMAL': { value: true, isActive: true }
};

// Set up the stores with initial data
testCases.set(mockTestCases);
selectedTestCase.set('');
concepts.set(mockConcepts);

const meta = {
    title: 'Components/TestPatientManager',
    component: TestPatientManager,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen'
    }
} satisfies Meta<TestPatientManager>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper function to trigger modal open
const openModal = () => {
    const button = document.querySelector('.test-patient-icon') as HTMLButtonElement;
    if (button) button.click();
};

export const Default: Story = {
    play: async () => {
        openModal();
    }
};

export const WithSelectedTestCase: Story = {
    decorators: [
        (story) => {
            testCases.set(mockTestCases);
            selectedTestCase.set('1');
            concepts.set(mockTestCases[0].concepts);
            return story();
        }
    ],
    play: async () => {
        openModal();
    }
};

export const WithHypokalemia: Story = {
    decorators: [
        (story) => {
            testCases.set(mockTestCases);
            selectedTestCase.set('2');
            concepts.set(mockTestCases[1].concepts);
            return story();
        }
    ],
    play: async () => {
        openModal();
    }
};

export const EmptyTestCases: Story = {
    decorators: [
        (story) => {
            testCases.set([]);
            selectedTestCase.set('');
            concepts.set(mockConcepts);
            return story();
        }
    ],
    play: async () => {
        openModal();
    }
};

export const WithManyTestCases: Story = {
    decorators: [
        (story) => {
            const manyTestCases = [
                ...mockTestCases,
                {
                    id: '3',
                    name: 'Hyperkalemia',
                    concepts: {
                        'K_LOW': { value: false, isActive: true },
                        'K_HIGH': { value: true, isActive: true },
                        'K_NORMAL': { value: false, isActive: true }
                    }
                },
                {
                    id: '4',
                    name: 'Hypomagnesemia',
                    concepts: {
                        'MG_LOW': { value: true, isActive: true },
                        'MG_HIGH': { value: false, isActive: true },
                        'MG_NORMAL': { value: false, isActive: true }
                    }
                },
                {
                    id: '5',
                    name: 'Complex Case',
                    concepts: {
                        'K_LOW': { value: true, isActive: true },
                        'MG_LOW': { value: true, isActive: true },
                        'K_HIGH': { value: false, isActive: true },
                        'MG_HIGH': { value: false, isActive: true }
                    }
                }
            ];
            testCases.set(manyTestCases);
            selectedTestCase.set('5');
            concepts.set(manyTestCases[4].concepts);
            return story();
        }
    ],
    play: async () => {
        openModal();
    }
}; 