import type { Meta, StoryObj } from '@storybook/svelte';
import { action } from '@storybook/addon-actions';
import ScenarioActionPanel from './ScenarioActionPanel.svelte';

const meta = {
  title: 'Components/ScenarioActionPanel',
  component: ScenarioActionPanel,
  tags: ['autodocs'],
  argTypes: {
    selectedScenarioId: {
      control: 'text',
      description: 'ID of the selected scenario'
    },
    selectedSubScenarioId: {
      control: 'text',
      description: 'ID of the selected sub-scenario'
    }
  },
  parameters: {
    docs: {
      description: {
        component: 'A panel containing action buttons for managing test scenarios and concepts.'
      }
    }
  }
} satisfies Meta<ScenarioActionPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper function to add event listeners
const addEventListeners = (storyContext: any) => {
  const events = [
    'editConcepts',
    'addExpectedResult',
    'applyConcepts',
    'clearConcepts',
    'setMagnesiumConcepts',
    'executeTest',
    'deleteSubScenario'
  ];

  events.forEach(eventName => {
    storyContext.args[`on:${eventName}`] = action(eventName);
  });
};

// Story with both IDs present (enabled state)
export const EnabledState: Story = {
  args: {
    selectedScenarioId: 'scenario-1',
    selectedSubScenarioId: 'sub-1'
  },
  parameters: {
    docs: {
      description: {
        story: 'Panel with all actions enabled due to having both scenario and sub-scenario selected.'
      }
    }
  },
  play: (context) => {
    addEventListeners(context);
  }
};

// Story with missing sub-scenario ID (partially disabled state)
export const PartiallyDisabled: Story = {
  args: {
    selectedScenarioId: 'scenario-1',
    selectedSubScenarioId: null
  },
  parameters: {
    docs: {
      description: {
        story: 'Panel with some actions disabled due to missing sub-scenario selection.'
      }
    }
  },
  play: (context) => {
    addEventListeners(context);
  }
};

// Story with no IDs (fully disabled state)
export const FullyDisabled: Story = {
  args: {
    selectedScenarioId: null,
    selectedSubScenarioId: null
  },
  parameters: {
    docs: {
      description: {
        story: 'Panel with actions disabled due to no scenario selection.'
      }
    }
  },
  play: (context) => {
    addEventListeners(context);
  }
}; 