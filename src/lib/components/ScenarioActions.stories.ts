import type { Meta, StoryObj } from '@storybook/svelte';
import { action } from '@storybook/addon-actions';
import ScenarioActions from './ScenarioActions.svelte';
import type { TestSubScenario } from '../types';
import { setContext } from 'svelte';

// Mock context for stories
const mockContext = {
  allScenarios: [],
  isEditable: true,
  onScenarioSelect: action('onScenarioSelect'),
  onAddSubScenario: action('onAddSubScenario'),
  onAddExpectedResult: action('onAddExpectedResult'),
  onEditConcepts: action('onEditConcepts'),
  onDeleteScenario: action('onDeleteScenario')
};

const meta = {
  title: 'Components/ScenarioActions',
  component: ScenarioActions,
  tags: ['autodocs'],
  args: {
    scenarioId: 'scenario-1'
  },
  // Set up context for the stories
  decorators: [
    (story) => {
      setContext('scenario-context', mockContext);
      return story();
    }
  ]
} satisfies Meta<ScenarioActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};

// Story with custom action handlers
export const CustomActions: Story = {
  decorators: [
    (story) => {
      setContext('scenario-context', {
        ...mockContext,
        onEditConcepts: () => alert('Custom edit concepts action'),
        onAddExpectedResult: () => alert('Custom add expected result action'),
        onAddSubScenario: () => alert('Custom add sub-scenario action'),
        onDeleteScenario: () => alert('Custom delete scenario action')
      });
      return story();
    }
  ],
  args: {
    scenarioId: 'custom-scenario'
  }
}; 