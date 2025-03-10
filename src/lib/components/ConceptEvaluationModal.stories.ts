import type { Meta, StoryObj } from '@storybook/svelte';
import ConceptEvaluationModal from './ConceptEvaluationModal.svelte';
import type { Concept } from '../types';

const mockConcepts: Record<string, Concept> = {
    'K_LOW': { value: true, isActive: true },
    'K_HIGH': { value: false, isActive: true },
    'MG_LOW': { value: true, isActive: true },
    'INACTIVE_CONCEPT': { value: false, isActive: false }
};

const meta = {
    title: 'Components/ConceptEvaluationModal',
    component: ConceptEvaluationModal,
    tags: ['autodocs'],
    argTypes: {
        expression: { control: 'text' },
        concepts: { control: 'object' }
    }
} satisfies Meta<ConceptEvaluationModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        expression: 'K_LOW',
        concepts: mockConcepts
    }
};

export const ComplexExpression: Story = {
    args: {
        expression: 'K_LOW && !K_HIGH',
        concepts: mockConcepts
    }
};

export const WithInactiveConcept: Story = {
    args: {
        expression: 'K_LOW && INACTIVE_CONCEPT',
        concepts: mockConcepts
    }
}; 