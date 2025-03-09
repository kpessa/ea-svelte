import type { Meta, StoryObj } from '@storybook/svelte';
import { action } from '@storybook/addon-actions';
import ManagerHeader from './ManagerHeader.svelte';

const meta = {
  title: 'Components/ManagerHeader',
  component: ManagerHeader,
  tags: ['autodocs'],
  argTypes: {
    isEditMode: {
      control: 'boolean',
      description: 'Whether the component is in edit mode'
    }
  },
  parameters: {
    docs: {
      description: {
        component: 'Header component for the test case manager with action buttons and edit mode toggle.'
      }
    }
  }
} satisfies Meta<ManagerHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper function to add event listeners
const addEventListeners = (storyContext: any) => {
  const events = [
    'saveScenarios',
    'clearTestResults',
    'toggleEditMode'
  ];

  events.forEach(eventName => {
    storyContext.args[`on:${eventName}`] = action(eventName);
  });
};

// Default view
export const Default: Story = {
  args: {
    isEditMode: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Default header view with edit mode disabled.'
      }
    }
  },
  play: (context) => {
    addEventListeners(context);
  }
};

// Edit mode enabled
export const EditModeEnabled: Story = {
  args: {
    isEditMode: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Header with edit mode enabled, showing the active state of the toggle button.'
      }
    }
  },
  play: (context) => {
    addEventListeners(context);
  }
}; 