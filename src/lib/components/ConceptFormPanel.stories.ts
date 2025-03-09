import type { Meta, StoryObj } from '@storybook/svelte';
import ConceptFormPanel from './ConceptFormPanel.svelte';
import { action } from '@storybook/addon-actions';

// Mock event handlers
const mockCreateConcept = action('createConcept');
const mockSaveConcept = action('saveConcept');
const mockCancelEdit = action('cancelEdit');

const meta = {
  title: 'Components/ConceptFormPanel',
  component: ConceptFormPanel,
  tags: ['autodocs'],
  argTypes: {
    conceptsSnapshot: { control: 'object' },
    editMode: { control: 'boolean' },
    newConceptName: { control: 'text' },
    newConceptValue: { control: 'boolean' },
    editingConceptName: { control: 'text' },
    editingConceptOriginalName: { control: 'text' },
    validationError: { control: 'text' }
  },
  parameters: {
    actions: {
      handles: ['createConcept', 'saveConcept', 'cancelEdit']
    }
  }
} satisfies Meta<ConceptFormPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample concepts for the stories
const sampleConcepts = {
  'ConceptA': { value: true, isActive: true },
  'ConceptB': { value: false, isActive: true }
};

export const CreateMode: Story = {
  args: {
    conceptsSnapshot: sampleConcepts,
    editMode: false,
    newConceptName: '',
    newConceptValue: false,
    validationError: ''
  },
  parameters: {
    docs: {
      description: {
        story: 'Form in create mode for adding a new concept.'
      }
    }
  }
};

export const EditMode: Story = {
  args: {
    conceptsSnapshot: sampleConcepts,
    editMode: true,
    newConceptValue: true,
    editingConceptName: 'ConceptA',
    editingConceptOriginalName: 'ConceptA',
    validationError: ''
  },
  parameters: {
    docs: {
      description: {
        story: 'Form in edit mode for modifying an existing concept.'
      }
    }
  }
};

export const WithValidationError: Story = {
  args: {
    conceptsSnapshot: sampleConcepts,
    editMode: false,
    newConceptName: 'ConceptA',
    newConceptValue: true,
    validationError: 'A concept with this name already exists'
  },
  parameters: {
    docs: {
      description: {
        story: 'Form showing a validation error.'
      }
    }
  }
}; 