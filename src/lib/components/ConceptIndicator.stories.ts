import type { Meta, StoryObj } from '@storybook/svelte';
import ConceptIndicator from './ConceptIndicator.svelte';

const meta = {
  title: 'Components/ConceptIndicator',
  component: ConceptIndicator,
  tags: ['autodocs'],
  argTypes: {
    conceptName: { control: 'text' },
    concept: { control: 'object' },
    showValue: { control: 'boolean' },
    showName: { control: 'boolean' },
    size: { 
      control: { type: 'select' },
      options: ['small', 'medium', 'large']
    },
    interactive: { control: 'boolean' }
  }
} satisfies Meta<ConceptIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveTrue: Story = {
  args: {
    conceptName: 'ConceptA',
    concept: { value: true, isActive: true },
    showValue: true,
    showName: true,
    size: 'medium'
  },
  parameters: {
    docs: {
      description: {
        story: 'Concept that is active and has a value of true (green).'
      }
    }
  }
};

export const ActiveFalse: Story = {
  args: {
    conceptName: 'ConceptB',
    concept: { value: false, isActive: true },
    showValue: true,
    showName: true,
    size: 'medium'
  },
  parameters: {
    docs: {
      description: {
        story: 'Concept that is active and has a value of false (red).'
      }
    }
  }
};

export const Inactive: Story = {
  args: {
    conceptName: 'ConceptC',
    concept: { value: true, isActive: false },
    showValue: true,
    showName: true,
    size: 'medium'
  },
  parameters: {
    docs: {
      description: {
        story: 'Concept that is inactive (grey).'
      }
    }
  }
};

export const Small: Story = {
  args: {
    conceptName: 'ConceptA',
    concept: { value: true, isActive: true },
    showValue: true,
    showName: true,
    size: 'small'
  },
  parameters: {
    docs: {
      description: {
        story: 'Small-sized concept indicator.'
      }
    }
  }
};

export const Large: Story = {
  args: {
    conceptName: 'ConceptA',
    concept: { value: true, isActive: true },
    showValue: true,
    showName: true,
    size: 'large'
  },
  parameters: {
    docs: {
      description: {
        story: 'Large-sized concept indicator.'
      }
    }
  }
};

export const IconOnly: Story = {
  args: {
    conceptName: 'ConceptA',
    concept: { value: true, isActive: true },
    showValue: false,
    showName: false,
    size: 'medium'
  },
  parameters: {
    docs: {
      description: {
        story: 'Concept indicator showing only the icon.'
      }
    }
  }
};

export const NameOnly: Story = {
  args: {
    conceptName: 'ConceptA',
    concept: { value: true, isActive: true },
    showValue: false,
    showName: true,
    size: 'medium'
  },
  parameters: {
    docs: {
      description: {
        story: 'Concept indicator showing only the name and icon.'
      }
    }
  }
};

export const ValueOnly: Story = {
  args: {
    conceptName: 'ConceptA',
    concept: { value: true, isActive: true },
    showValue: true,
    showName: false,
    size: 'medium'
  },
  parameters: {
    docs: {
      description: {
        story: 'Concept indicator showing only the value and icon.'
      }
    }
  }
};

export const Undefined: Story = {
  args: {
    conceptName: 'MissingConcept',
    concept: undefined,
    showValue: true,
    showName: true,
    size: 'medium'
  },
  parameters: {
    docs: {
      description: {
        story: 'Concept indicator for an undefined concept.'
      }
    }
  }
};

export const Interactive: Story = {
  args: {
    conceptName: 'InteractiveConcept',
    concept: { value: true, isActive: true },
    showValue: true,
    showName: true,
    size: 'medium',
    interactive: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive concept indicator that can be clicked to toggle its state. The state cycles through: active-true → active-false → inactive → undefined → active-true.'
      }
    }
  },
  render: (args) => ({
    Component: ConceptIndicator,
    props: args,
    on: {
      toggle: (event) => {
        args.concept = event.detail.newConcept;
        return args;
      }
    }
  })
}; 