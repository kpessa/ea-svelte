import type { Meta, StoryObj } from '@storybook/svelte';
import { action } from '@storybook/addon-actions';
import ScenarioForm from './ScenarioForm.svelte';

const meta = {
  title: 'Components/ScenarioForm',
  component: ScenarioForm,
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the form is visible',
    }
  },
  parameters: {
    docs: {
      description: {
        component: 'A form component for creating or editing test scenarios. Handles input validation and provides save/cancel events.'
      }
    }
  }
} satisfies Meta<ScenarioForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic story showing the form in its open state
export const Open: Story = {
  args: {
    isOpen: true
  }
};

// Story showing the form in its closed state
export const Closed: Story = {
  args: {
    isOpen: false
  }
};

// Story demonstrating form interactions
export const WithInteractions: Story = {
  args: {
    isOpen: true
  },
  parameters: {
    docs: {
      description: {
        story: 'This story demonstrates the form interactions. Try entering a name and description, then click save or cancel.'
      }
    }
  },
  play: async ({ canvasElement, args }) => {
    // You can add automated interactions here using @storybook/testing-library
  }
};

// Story showing form validation (empty name)
export const ValidationExample: Story = {
  args: {
    isOpen: true
  },
  parameters: {
    docs: {
      description: {
        story: 'The form requires a name to be entered before it can be submitted. Try clicking save with an empty name field.'
      }
    }
  }
};

// Story showing form with event handlers
export const WithEventHandlers: Story = {
  args: {
    isOpen: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing form events being handled. Check the Actions tab to see the events.'
      }
    }
  },
  play: ({ args }) => {
    const element = document.querySelector('.form-panel');
    if (element) {
      element.addEventListener('save', action('save'));
      element.addEventListener('cancel', action('cancel'));
    }
  }
}; 