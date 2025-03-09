import type { Meta, StoryObj } from '@storybook/svelte';
import { action } from '@storybook/addon-actions';
import SubScenarioForm from './SubScenarioForm.svelte';

const meta = {
  title: 'Components/SubScenarioForm',
  component: SubScenarioForm,
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the form is visible',
    },
    parentId: {
      control: 'text',
      description: 'ID of the parent scenario (if this is a sub-scenario)',
    }
  },
  parameters: {
    docs: {
      description: {
        component: 'A form component for creating sub-scenarios or root scenarios. Handles parent-child relationships and provides save/cancel events.'
      }
    }
  }
} satisfies Meta<SubScenarioForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// Story showing root scenario form
export const RootScenario: Story = {
  args: {
    isOpen: true,
    parentId: null
  },
  parameters: {
    docs: {
      description: {
        story: 'Form for creating a root-level scenario (no parent).'
      }
    }
  }
};

// Story showing sub-scenario form
export const SubScenario: Story = {
  args: {
    isOpen: true,
    parentId: 'parent-123'
  },
  parameters: {
    docs: {
      description: {
        story: 'Form for creating a sub-scenario with a parent scenario.'
      }
    }
  }
};

// Story showing form validation
export const ValidationExample: Story = {
  args: {
    isOpen: true,
    parentId: null
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
    isOpen: true,
    parentId: 'parent-456'
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing form events being handled. Check the Actions tab to see the events with parent ID included.'
      }
    }
  },
  play: ({ args }) => {
    const element = document.querySelector('.form-panel');
    if (element) {
      element.addEventListener('save', ((e: Event) => {
        if (e instanceof CustomEvent) {
          action('save')(e.detail);
        }
      }) as EventListener);
      element.addEventListener('cancel', action('cancel'));
    }
  }
};

// Story showing closed form
export const Closed: Story = {
  args: {
    isOpen: false,
    parentId: null
  },
  parameters: {
    docs: {
      description: {
        story: 'Form in its closed state.'
      }
    }
  }
}; 