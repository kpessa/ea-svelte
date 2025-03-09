import type { Meta, StoryObj } from '@storybook/svelte';
import { action } from '@storybook/addon-actions';
import ScenarioSelector from './ScenarioSelector.svelte';

const meta = {
  title: 'Components/ScenarioSelector',
  component: ScenarioSelector,
  tags: ['autodocs'],
  argTypes: {
    scenarios: {
      control: 'object',
      description: 'Array of available test scenarios'
    },
    selectedScenarioId: {
      control: 'text',
      description: 'ID of the currently selected scenario'
    },
    isEditMode: {
      control: 'boolean',
      description: 'Whether the component is in edit mode'
    }
  },
  parameters: {
    docs: {
      description: {
        component: 'A component for selecting and managing test scenarios.'
      }
    }
  }
} satisfies Meta<ScenarioSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockScenarios = [
  {
    id: 'scenario-1',
    name: 'Test Scenario 1',
    description: 'First test scenario',
    scenarios: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'scenario-2',
    name: 'Test Scenario 2',
    description: 'Second test scenario',
    scenarios: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'scenario-3',
    name: 'Test Scenario 3',
    description: 'Third test scenario',
    scenarios: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper function to add event listeners
const addEventListeners = (storyContext: any) => {
  const events = [
    'scenarioChange',
    'createScenario',
    'createDefaultScenario',
    'setAllConcepts',
    'deleteScenario'
  ];

  events.forEach(eventName => {
    storyContext.args[`on:${eventName}`] = action(eventName);
  });
};

// Story with scenarios and selection
export const WithScenarios: Story = {
  args: {
    scenarios: mockScenarios,
    selectedScenarioId: 'scenario-1',
    isEditMode: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Scenario selector with multiple scenarios and one selected.'
      }
    }
  },
  play: (context) => {
    addEventListeners(context);
  }
};

// Story with no scenarios
export const EmptyState: Story = {
  args: {
    scenarios: [],
    selectedScenarioId: null,
    isEditMode: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Scenario selector with no available scenarios.'
      }
    }
  },
  play: (context) => {
    addEventListeners(context);
  }
};

// Story in edit mode
export const EditMode: Story = {
  args: {
    scenarios: mockScenarios,
    selectedScenarioId: 'scenario-2',
    isEditMode: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Scenario selector in edit mode with additional actions available.'
      }
    }
  },
  play: (context) => {
    addEventListeners(context);
  }
}; 