import type { Meta, StoryObj } from '@storybook/svelte';
import ConceptExpressionTest from './ConceptExpressionTest.svelte';

const meta = {
  title: 'Tests/ConceptExpressionTest',
  component: ConceptExpressionTest,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A test component to verify the fix for the ConceptExpressionPanel issue.'
      }
    }
  }
} satisfies Meta<ConceptExpressionTest>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Tests the evaluation of concepts based on their isActive state. ConceptA is active and true, ConceptB is active and false. The expression "{ConceptA} AND {ConceptB}" should evaluate to false.'
      }
    }
  }
}; 