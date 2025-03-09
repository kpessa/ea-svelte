import type { Meta, StoryObj } from '@storybook/svelte';
import ImportExportPanel from './ImportExportPanel.svelte';
import { action } from '@storybook/addon-actions';

const meta = {
  title: 'Components/ImportExportPanel',
  component: ImportExportPanel,
  tags: ['autodocs'],
  argTypes: {
    conceptsSnapshot: { control: 'object' }
  },
  parameters: {
    actions: {
      handles: ['importConcepts']
    }
  }
} satisfies Meta<ImportExportPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample concepts for the stories
const sampleConcepts = {
  'ConceptA': { value: true, isActive: true },
  'ConceptB': { value: false, isActive: true },
  'ConceptC': { value: true, isActive: false },
  'ConceptD': { value: false, isActive: false }
};

export const Default: Story = {
  args: {
    conceptsSnapshot: sampleConcepts
  },
  parameters: {
    docs: {
      description: {
        story: 'Import/Export panel with sample concepts.'
      }
    }
  }
};

export const EmptyConcepts: Story = {
  args: {
    conceptsSnapshot: {}
  },
  parameters: {
    docs: {
      description: {
        story: 'Import/Export panel with no concepts.'
      }
    }
  }
}; 