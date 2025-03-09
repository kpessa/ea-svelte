import type { Meta, StoryObj } from '@storybook/svelte';
import ExtractToolsPanel from './ExtractToolsPanel.svelte';
import { action } from '@storybook/addon-actions';

const meta = {
  title: 'Components/ExtractToolsPanel',
  component: ExtractToolsPanel,
  tags: ['autodocs'],
  argTypes: {
    showConceptReport: { control: 'boolean' },
    showEvaluationDetails: { control: 'boolean' },
    showSectionControl: { control: 'boolean' },
    showTestIntegration: { control: 'boolean' }
  },
  parameters: {
    actions: {
      handles: [
        'extractConcepts',
        'toggleConceptReport',
        'toggleEvaluationDetails',
        'toggleSectionControl',
        'toggleTestIntegration'
      ]
    }
  }
} satisfies Meta<ExtractToolsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    showConceptReport: false,
    showEvaluationDetails: false,
    showSectionControl: false,
    showTestIntegration: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Extract tools panel with all toggles in off state.'
      }
    }
  }
};

export const AllTogglesOn: Story = {
  args: {
    showConceptReport: true,
    showEvaluationDetails: true,
    showSectionControl: true,
    showTestIntegration: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Extract tools panel with all toggles in on state.'
      }
    }
  }
};

export const MixedToggles: Story = {
  args: {
    showConceptReport: true,
    showEvaluationDetails: false,
    showSectionControl: true,
    showTestIntegration: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Extract tools panel with mixed toggle states.'
      }
    }
  }
}; 