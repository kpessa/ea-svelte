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

export const Active: Story = {
  args: {
    conceptName: 'ActiveConcept',
    concept: { value: 'Some value', isActive: true },
    showValue: false,
    showName: true,
    size: 'medium'
  },
  parameters: {
    docs: {
      description: {
        story: 'Concept that is active (green). The isActive state determines the color, not the value.'
      }
    }
  }
};

export const Inactive: Story = {
  args: {
    conceptName: 'InactiveConcept',
    concept: { value: 'Some value', isActive: false },
    showValue: false,
    showName: true,
    size: 'medium'
  },
  parameters: {
    docs: {
      description: {
        story: 'Concept that is inactive (red). The isActive state determines the color, not the value.'
      }
    }
  }
};

export const Undefined: Story = {
  args: {
    conceptName: 'UndefinedConcept',
    concept: undefined,
    showValue: false,
    showName: true,
    size: 'medium'
  },
  parameters: {
    docs: {
      description: {
        story: 'Concept that is undefined (grey).'
      }
    }
  }
};

export const WithTextValue: Story = {
  args: {
    conceptName: 'TextValueConcept',
    concept: { value: 'Some text value', isActive: true },
    showValue: true,
    showName: true,
    size: 'medium'
  },
  parameters: {
    docs: {
      description: {
        story: 'Concept with a text value displayed.'
      }
    }
  }
};

export const WithBooleanValue: Story = {
  args: {
    conceptName: 'BooleanValueConcept',
    concept: { value: true, isActive: true },
    showValue: true,
    showName: true,
    size: 'medium'
  },
  parameters: {
    docs: {
      description: {
        story: 'Concept with a boolean value displayed.'
      }
    }
  }
};

export const WithNumberValue: Story = {
  args: {
    conceptName: 'NumberValueConcept',
    concept: { value: 42, isActive: true },
    showValue: true,
    showName: true,
    size: 'medium'
  },
  parameters: {
    docs: {
      description: {
        story: 'Concept with a number value displayed.'
      }
    }
  }
};

export const Small: Story = {
  args: {
    conceptName: 'SmallConcept',
    concept: { value: 'Some value', isActive: true },
    showValue: false,
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
    conceptName: 'LargeConcept',
    concept: { value: 'Some value', isActive: true },
    showValue: false,
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
    conceptName: 'IconOnlyConcept',
    concept: { value: 'Some value', isActive: true },
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
    conceptName: 'NameOnlyConcept',
    concept: { value: 'Some value', isActive: true },
    showValue: false,
    showName: true,
    size: 'medium'
  },
  parameters: {
    docs: {
      description: {
        story: 'Concept indicator showing only the name and icon (default).'
      }
    }
  }
};

export const Interactive: Story = {
  args: {
    conceptName: 'InteractiveConcept',
    concept: { value: 'Some value', isActive: true },
    showValue: false,
    showName: true,
    size: 'medium',
    interactive: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive concept indicator that can be clicked to toggle its state. The state cycles through: active (green) → inactive (red) → undefined (grey) → active (green).'
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