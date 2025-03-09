import type { Meta, StoryObj } from '@storybook/svelte';
import { concepts } from '../stores';
import ConceptStatusIndicator from './ConceptStatusIndicator.svelte';

// Mock concepts data
const mockConcepts = {
    'K_LOW': { value: true, isActive: true },
    'K_HIGH': { value: false, isActive: true },
    'MG_LOW': { value: true, isActive: true },
    'NA_LOW': { value: false, isActive: false },
    'CA_HIGH': { value: true, isActive: false }
};

const meta = {
    title: 'Components/ConceptStatusIndicator',
    component: ConceptStatusIndicator,
    tags: ['autodocs'],
    argTypes: {
        value: {
            control: 'boolean',
            description: 'The truth value of the concept'
        },
        isActive: {
            control: 'boolean',
            description: 'Whether the concept is active'
        },
        conceptName: {
            control: 'text',
            description: 'Name of the specific concept to display'
        }
    },
    decorators: [
        (story) => {
            // Set up the concepts store with mock data
            concepts.set(mockConcepts);
            return story();
        }
    ]
} satisfies Meta<ConceptStatusIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

// Individual concept indicator stories
export const ActiveTrue: Story = {
    args: {
        value: true,
        isActive: true,
        conceptName: 'K_LOW'
    }
};

export const ActiveFalse: Story = {
    args: {
        value: false,
        isActive: true,
        conceptName: 'K_HIGH'
    }
};

export const Inactive: Story = {
    args: {
        value: false,
        isActive: false,
        conceptName: 'NA_LOW'
    }
};

// Global concept indicator story
export const GlobalIndicator: Story = {
    args: {}
};

export const WithManyActiveConcepts: Story = {
    decorators: [
        (story) => {
            // Set up the concepts store with more mock data
            concepts.set({
                'K_LOW': { value: true, isActive: true },
                'K_HIGH': { value: false, isActive: true },
                'MG_LOW': { value: true, isActive: true },
                'MG_HIGH': { value: false, isActive: true },
                'NA_LOW': { value: true, isActive: true },
                'NA_HIGH': { value: false, isActive: true },
                'CA_LOW': { value: true, isActive: false },
                'CA_HIGH': { value: false, isActive: false },
                'PO4_LOW': { value: true, isActive: true }
            });
            return story();
        }
    ],
    args: {}
}; 