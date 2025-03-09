import type { Meta, StoryObj } from '@storybook/svelte';
import { concepts } from '../stores';
import GlobalConceptIndicator from './GlobalConceptIndicator.svelte';

const meta = {
    title: 'Components/GlobalConceptIndicator',
    component: GlobalConceptIndicator,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
} satisfies Meta<GlobalConceptIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic story with a few concepts
export const Default: Story = {
    decorators: [
        (story) => {
            concepts.set({
                'K_LOW': { value: true, isActive: true },
                'K_HIGH': { value: false, isActive: true },
                'MG_LOW': { value: true, isActive: true },
                'NA_LOW': { value: false, isActive: false },
            });
            return story();
        }
    ]
};

// Story with many active concepts
export const ManyActiveConcepts: Story = {
    decorators: [
        (story) => {
            concepts.set({
                'K_LOW': { value: true, isActive: true },
                'K_HIGH': { value: false, isActive: true },
                'MG_LOW': { value: true, isActive: true },
                'MG_HIGH': { value: false, isActive: true },
                'NA_LOW': { value: true, isActive: true },
                'NA_HIGH': { value: false, isActive: true },
                'PO4_LOW': { value: true, isActive: true },
                'PO4_HIGH': { value: false, isActive: true }
            });
            return story();
        }
    ]
};

// Story with no active concepts
export const NoActiveConcepts: Story = {
    decorators: [
        (story) => {
            concepts.set({
                'K_LOW': { value: true, isActive: false },
                'K_HIGH': { value: false, isActive: false },
                'MG_LOW': { value: true, isActive: false },
                'NA_LOW': { value: false, isActive: false },
            });
            return story();
        }
    ]
};

// Story with mixed states
export const MixedStates: Story = {
    decorators: [
        (story) => {
            concepts.set({
                'K_LOW': { value: true, isActive: true },
                'K_HIGH': { value: false, isActive: true },
                'MG_LOW': { value: true, isActive: false },
                'NA_LOW': { value: false, isActive: false },
                'CA_HIGH': { value: true, isActive: true },
                'CA_LOW': { value: false, isActive: false },
            });
            return story();
        }
    ]
}; 