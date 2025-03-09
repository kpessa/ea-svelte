import type { Meta, StoryObj } from '@storybook/svelte';
import ConceptList from './ConceptList.svelte';

const meta = {
  title: 'Components/ConceptList',
  component: ConceptList,
  tags: ['autodocs'],
  argTypes: {
    concepts: { control: 'object' },
    filter: { 
      control: { type: 'select' },
      options: ['all', 'active', 'inactive']
    },
    showValue: { control: 'boolean' },
    showName: { control: 'boolean' },
    size: { 
      control: { type: 'select' },
      options: ['small', 'medium', 'large']
    },
    searchTerm: { control: 'text' },
    interactive: { control: 'boolean' }
  }
} satisfies Meta<ConceptList>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample concepts for the stories
const sampleConcepts = {
  'ConceptA': { value: true, isActive: true },
  'ConceptB': { value: false, isActive: true },
  'ConceptC': { value: true, isActive: false },
  'ConceptD': { value: false, isActive: false },
  'MagnesiumLow': { value: true, isActive: true },
  'MagnesiumHigh': { value: false, isActive: true },
  'PatientAge': { value: true, isActive: true },
  'HasRecentLabs': { value: false, isActive: false }
};

export const AllConcepts: Story = {
  args: {
    concepts: sampleConcepts,
    filter: 'all',
    showValue: true,
    showName: true,
    size: 'medium',
    searchTerm: '',
    interactive: false
  },
  parameters: {
    docs: {
      description: {
        story: 'List showing all concepts.'
      }
    }
  }
};

export const ActiveConcepts: Story = {
  args: {
    concepts: sampleConcepts,
    filter: 'active',
    showValue: true,
    showName: true,
    size: 'medium',
    searchTerm: '',
    interactive: false
  },
  parameters: {
    docs: {
      description: {
        story: 'List showing only active concepts.'
      }
    }
  }
};

export const InactiveConcepts: Story = {
  args: {
    concepts: sampleConcepts,
    filter: 'inactive',
    showValue: true,
    showName: true,
    size: 'medium',
    searchTerm: '',
    interactive: false
  },
  parameters: {
    docs: {
      description: {
        story: 'List showing only inactive concepts.'
      }
    }
  }
};

export const WithSearch: Story = {
  args: {
    concepts: sampleConcepts,
    filter: 'all',
    showValue: true,
    showName: true,
    size: 'medium',
    searchTerm: 'Magnesium',
    interactive: false
  },
  parameters: {
    docs: {
      description: {
        story: 'List with search term filtering.'
      }
    }
  }
};

export const SmallSize: Story = {
  args: {
    concepts: sampleConcepts,
    filter: 'all',
    showValue: true,
    showName: true,
    size: 'small',
    searchTerm: '',
    interactive: false
  },
  parameters: {
    docs: {
      description: {
        story: 'List with small-sized concept indicators.'
      }
    }
  }
};

export const LargeSize: Story = {
  args: {
    concepts: sampleConcepts,
    filter: 'all',
    showValue: true,
    showName: true,
    size: 'large',
    searchTerm: '',
    interactive: false
  },
  parameters: {
    docs: {
      description: {
        story: 'List with large-sized concept indicators.'
      }
    }
  }
};

export const NameOnly: Story = {
  args: {
    concepts: sampleConcepts,
    filter: 'all',
    showValue: false,
    showName: true,
    size: 'medium',
    searchTerm: '',
    interactive: false
  },
  parameters: {
    docs: {
      description: {
        story: 'List showing only concept names.'
      }
    }
  }
};

export const EmptyList: Story = {
  args: {
    concepts: {},
    filter: 'all',
    showValue: true,
    showName: true,
    size: 'medium',
    searchTerm: '',
    interactive: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty concept list.'
      }
    }
  }
};

export const Interactive: Story = {
  args: {
    concepts: sampleConcepts,
    filter: 'all',
    showValue: true,
    showName: true,
    size: 'medium',
    searchTerm: '',
    interactive: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive concept list where each concept can be clicked to toggle its state. The state cycles through: active-true → active-false → inactive → undefined → active-true.'
      }
    }
  },
  render: (args) => ({
    Component: ConceptList,
    props: args,
    on: {
      conceptChange: (event) => {
        args.concepts = event.detail.concepts;
        return args;
      }
    }
  })
}; 