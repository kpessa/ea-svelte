import type { Meta, StoryObj } from '@storybook/svelte';
import ExpectedResults from './ExpectedResults.svelte';
import type { ExpectedResult } from '../types';

const meta = {
  title: 'Components/ExpectedResults',
  component: ExpectedResults,
  tags: ['autodocs'],
  args: {
    results: [
      {
        type: 'tab',
        target: '#magnesium-level',
        expectedVisibility: true,
        description: 'Magnesium level should be visible when value is high'
      },
      {
        type: 'section',
        target: 'InfusionControl',
        expectedVisibility: false,
        description: 'Infusion control should be hidden when level is normal'
      }
    ]
  }
} satisfies Meta<ExpectedResults>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};

export const NoResults: Story = {
  args: {
    results: []
  }
};

export const WithoutDescriptions: Story = {
  args: {
    results: [
      {
        type: 'tab',
        target: '#calcium-level',
        expectedVisibility: true,
        description: ''
      },
      {
        type: 'order',
        target: 'CalciumInfusion',
        expectedVisibility: false,
        description: ''
      }
    ]
  }
};

export const ManyResults: Story = {
  args: {
    results: Array.from({ length: 10 }, (_, i) => ({
      type: i % 2 === 0 ? 'tab' : 'section',
      target: `#test-${i}`,
      expectedVisibility: i % 3 === 0,
      description: `Test description for result ${i}`
    })) as ExpectedResult[]
  }
};

export const LongDescriptions: Story = {
  args: {
    results: [
      {
        type: 'criterion',
        target: '#very-long-target-id-that-might-overflow',
        expectedVisibility: true,
        description: 'This is a very long description that might need to wrap to multiple lines and should be handled gracefully by the component layout'
      },
      {
        type: 'order',
        target: 'VeryLongComponentNameThatMightOverflow',
        expectedVisibility: false,
        description: 'Another very long description with detailed explanation of why this particular result is expected in the current scenario context'
      }
    ]
  }
}; 