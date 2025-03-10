import type { Meta, StoryObj } from '@storybook/svelte';
import ConceptValueSection from './ConceptValueSection.svelte';

const meta = {
  title: 'Components/ConceptValueSection',
  component: ConceptValueSection,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    template: { control: 'text' },
    conceptsSnapshot: { control: 'object' },
    showIndicators: { control: 'boolean' }
  }
} satisfies Meta<ConceptValueSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample concepts for the stories
const sampleConcepts = {
  'PatientAge': { value: 65, isActive: true },
  'LabResults': { value: 'Normal', isActive: true },
  'MagnesiumLevel': { value: 1.8, isActive: true },
  'HasRecentLabs': { value: true, isActive: true },
  'PatientName': { value: 'John Doe', isActive: true },
  'InactiveValue': { value: 'This is inactive', isActive: false }
};

export const BasicSection: Story = {
  args: {
    title: 'Patient Information',
    description: 'Displays basic patient information',
    template: 'Patient @concept{PatientName.value} is @concept{PatientAge.value} years old with @concept{LabResults.value} lab results.',
    conceptsSnapshot: sampleConcepts,
    showIndicators: true
  },
  parameters: {
    docs: {
      description: {
        story: 'A basic section displaying patient information with concept values.'
      }
    }
  }
};

export const LabResultsSection: Story = {
  args: {
    title: 'Lab Results',
    description: 'Summary of recent lab results',
    template: 'Magnesium level: @concept{MagnesiumLevel.value} mg/dL\nRecent labs available: @concept{HasRecentLabs.value}',
    conceptsSnapshot: sampleConcepts,
    showIndicators: true
  },
  parameters: {
    docs: {
      description: {
        story: 'A section displaying lab results with concept values.'
      }
    }
  }
};

export const WithInactiveConcept: Story = {
  args: {
    title: 'Section with Inactive Concept',
    description: 'Shows how inactive concepts are displayed',
    template: 'Active value: @concept{PatientName.value}\nInactive value: @concept{InactiveValue.value}',
    conceptsSnapshot: sampleConcepts,
    showIndicators: true
  },
  parameters: {
    docs: {
      description: {
        story: 'A section showing both active and inactive concept values.'
      }
    }
  }
};

export const WithoutIndicators: Story = {
  args: {
    title: 'Without Indicators',
    description: 'Section without concept indicators',
    template: 'Patient @concept{PatientName.value} is @concept{PatientAge.value} years old.',
    conceptsSnapshot: sampleConcepts,
    showIndicators: false
  },
  parameters: {
    docs: {
      description: {
        story: 'A section displaying concept values without the concept indicators.'
      }
    }
  }
};

export const InteractiveSection: Story = {
  args: {
    title: 'Interactive Section',
    description: 'Section with interactive concept indicators',
    template: 'Patient @concept{PatientName.value} is @concept{PatientAge.value} years old with @concept{LabResults.value} lab results.',
    conceptsSnapshot: { ...sampleConcepts },
    showIndicators: true
  },
  parameters: {
    docs: {
      description: {
        story: 'An interactive section where concept indicators can be toggled.'
      }
    }
  },
  render: (args) => ({
    Component: ConceptValueSection,
    props: args,
    on: {
      toggle: (event) => {
        const { name, newConcept } = event.detail;
        if (!args.conceptsSnapshot) {
          args.conceptsSnapshot = {};
        }
        
        if (newConcept === undefined) {
          delete args.conceptsSnapshot[name];
        } else {
          args.conceptsSnapshot[name] = newConcept;
        }
        
        return args;
      }
    }
  })
}; 