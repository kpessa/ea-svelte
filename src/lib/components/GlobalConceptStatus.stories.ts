import type { Meta, StoryObj } from '@storybook/svelte';
import GlobalConceptStatus from './GlobalConceptStatus.svelte';
import { concepts } from '../stores';
import type { Concept } from '../types';

const meta = {
  title: 'Components/GlobalConceptStatus',
  component: GlobalConceptStatus,
  tags: ['autodocs'],
} satisfies Meta<GlobalConceptStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock the concepts store for stories
const defaultConcepts: Record<string, Concept> = {
  'MAGNESIUM.LEVEL': { value: true, isActive: true },
  'MAGNESIUM.INFUSION': { value: false, isActive: false },
  'CALCIUM.LEVEL': { value: true, isActive: true },
  'CALCIUM.INFUSION': { value: true, isActive: true },
  'POTASSIUM.LEVEL': { value: true, isActive: true },
  'POTASSIUM.INFUSION': { value: false, isActive: false },
};

concepts.set(defaultConcepts);

export const Default: Story = {
  args: {}
};

export const EmptyConcepts: Story = {
  args: {},
  decorators: [
    () => {
      concepts.set({});
      return {};
    }
  ]
};

export const ManyConcepts: Story = {
  args: {},
  decorators: [
    () => {
      const manyConcepts: Record<string, Concept> = {};
      for (let i = 1; i <= 20; i++) {
        manyConcepts[`CONCEPT${i}.VALUE`] = {
          value: i % 2 === 0,
          isActive: i % 3 === 0
        };
      }
      concepts.set(manyConcepts);
      return {};
    }
  ]
}; 