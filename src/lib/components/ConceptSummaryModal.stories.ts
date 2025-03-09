import type { Meta, StoryObj } from '@storybook/svelte';
import { action } from '@storybook/addon-actions';
import ConceptSummaryModal from './ConceptSummaryModal.svelte';

const meta = {
  title: 'Components/ConceptSummaryModal',
  component: ConceptSummaryModal,
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the modal is visible',
    },
    appliedConcepts: {
      control: 'object',
      description: 'Array of directly applied concepts',
    },
    inheritedConcepts: {
      control: 'object',
      description: 'Array of inherited concepts from parent scenarios',
    },
    totalConceptCount: {
      control: 'number',
      description: 'Total number of concepts applied',
    }
  },
  parameters: {
    docs: {
      description: {
        component: 'A modal component that displays a summary of applied and inherited concepts in a test scenario.'
      }
    }
  }
} satisfies Meta<ConceptSummaryModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockConcepts = [
  {
    conceptName: 'TEST_CONCEPT_1',
    value: true,
    isActive: true
  },
  {
    conceptName: 'TEST_CONCEPT_2',
    value: false,
    isActive: true
  },
  {
    conceptName: 'TEST_CONCEPT_3',
    value: true,
    isActive: false
  }
];

// Basic story showing the modal with both applied and inherited concepts
export const WithBothTypes: Story = {
  args: {
    isOpen: true,
    appliedConcepts: mockConcepts,
    inheritedConcepts: mockConcepts.map(c => ({ ...c, conceptName: `INHERITED_${c.conceptName}` })),
    totalConceptCount: 6
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal showing both directly applied and inherited concepts.'
      }
    }
  }
};

// Story showing only applied concepts
export const OnlyAppliedConcepts: Story = {
  args: {
    isOpen: true,
    appliedConcepts: mockConcepts,
    inheritedConcepts: [],
    totalConceptCount: 3
  }
};

// Story showing only inherited concepts
export const OnlyInheritedConcepts: Story = {
  args: {
    isOpen: true,
    appliedConcepts: [],
    inheritedConcepts: mockConcepts.map(c => ({ ...c, conceptName: `INHERITED_${c.conceptName}` })),
    totalConceptCount: 3
  }
};

// Story showing empty state
export const EmptyConcepts: Story = {
  args: {
    isOpen: true,
    appliedConcepts: [],
    inheritedConcepts: [],
    totalConceptCount: 0
  }
};

// Story showing closed modal
export const Closed: Story = {
  args: {
    isOpen: false,
    appliedConcepts: mockConcepts,
    inheritedConcepts: mockConcepts,
    totalConceptCount: 6
  }
};

// Story with event handling
export const WithEventHandling: Story = {
  args: {
    isOpen: true,
    appliedConcepts: mockConcepts,
    inheritedConcepts: [],
    totalConceptCount: 3
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing modal events being handled. Try clicking the close button or outside the modal.'
      }
    }
  },
  play: ({ args }) => {
    const element = document.querySelector('.modal-overlay');
    if (element) {
      element.addEventListener('close', action('close'));
    }
  }
}; 