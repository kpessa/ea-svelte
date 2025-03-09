import type { Meta, StoryObj } from '@storybook/svelte';
import { action } from '@storybook/addon-actions';
import ExpectedResultForm from './ExpectedResultForm.svelte';

const meta = {
  title: 'Components/ExpectedResultForm',
  component: ExpectedResultForm,
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
        component: 'A form component for adding expected results to test scenarios. Supports different types of results (tab, section, order, criterion) and their visibility states.'
      }
    }
  }
} satisfies Meta<ExpectedResultForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic story showing the form in its open state
export const Open: Story = {
  args: {
    isOpen: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Form in its open state, ready to add a new expected result.'
      }
    }
  }
};

// Story showing the form in its closed state
export const Closed: Story = {
  args: {
    isOpen: false
  }
};

// Story showing form with pre-selected tab type
export const TabType: Story = {
  args: {
    isOpen: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Form configured for adding a tab visibility expectation.'
      }
    }
  }
};

// Story showing form with pre-selected section type
export const SectionType: Story = {
  args: {
    isOpen: true
  },
  play: ({ canvasElement }) => {
    const select = canvasElement.querySelector('#expected-result-type') as HTMLSelectElement;
    if (select) {
      select.value = 'section';
      select.dispatchEvent(new Event('change'));
    }
  }
};

// Story showing form validation
export const ValidationExample: Story = {
  args: {
    isOpen: true
  },
  parameters: {
    docs: {
      description: {
        story: 'The form requires a target to be entered before it can be submitted. Try clicking save with an empty target field.'
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
      element.addEventListener('save', ((e: Event) => {
        if (e instanceof CustomEvent) {
          action('save')(e.detail);
        }
      }) as EventListener);
      element.addEventListener('cancel', action('cancel'));
    }
  }
}; 