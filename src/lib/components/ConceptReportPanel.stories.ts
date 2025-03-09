import type { Meta, StoryObj } from '@storybook/svelte';
import ConceptReportPanel from './ConceptReportPanel.svelte';
import { action } from '@storybook/addon-actions';

const meta = {
  title: 'Components/ConceptReportPanel',
  component: ConceptReportPanel,
  tags: ['autodocs'],
  argTypes: {
    conceptReport: { control: 'text' },
    showConceptReport: { control: 'boolean' },
    showEvaluationDetails: { control: 'boolean' },
    conceptEvaluationDetails: { control: 'object' },
    conceptsSnapshot: { control: 'object' },
    showSectionControl: { control: 'boolean' },
    sectionVisibilityControl: { control: 'object' }
  },
  parameters: {
    actions: {
      handles: ['toggleSectionVisibility']
    }
  }
} satisfies Meta<ConceptReportPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample concepts for the stories
const sampleConcepts = {
  'ConceptA': { value: true, isActive: true },
  'ConceptB': { value: false, isActive: true },
  'ConceptC': { value: true, isActive: false },
  'ConceptD': { value: false, isActive: false }
};

// Sample concept evaluation details
const sampleEvaluationDetails = {
  'ConceptE': {
    value: true,
    expression: '{ConceptA} AND {ConceptB}',
    dependencies: ['ConceptA', 'ConceptB']
  },
  'ConceptF': {
    value: false,
    expression: '{ConceptA} OR {ConceptC}',
    dependencies: ['ConceptA', 'ConceptC']
  },
  'ConceptG': {
    value: true,
    expression: 'NOT {ConceptB}',
    dependencies: ['ConceptB']
  }
};

// Sample section visibility control
const sampleSectionVisibility = {
  'Section 1': true,
  'Section 2': false,
  'Section 3': true
};

// Sample concept report
const sampleReport = `
Concept Usage Report
-------------------
Total concepts found: 7

Concepts by section:
- Section 1: ConceptA, ConceptB
- Section 2: ConceptC, ConceptD
- Section 3: ConceptE, ConceptF, ConceptG

Unused concepts: None
`;

export const ConceptReportOnly: Story = {
  args: {
    conceptReport: sampleReport,
    showConceptReport: true,
    showEvaluationDetails: false,
    showSectionControl: false,
    conceptEvaluationDetails: {},
    conceptsSnapshot: sampleConcepts,
    sectionVisibilityControl: {}
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows only the concept usage report.'
      }
    }
  }
};

export const EvaluationDetailsOnly: Story = {
  args: {
    conceptReport: sampleReport,
    showConceptReport: false,
    showEvaluationDetails: true,
    showSectionControl: false,
    conceptEvaluationDetails: sampleEvaluationDetails,
    conceptsSnapshot: sampleConcepts,
    sectionVisibilityControl: {}
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows only the concept evaluation details.'
      }
    }
  }
};

export const SectionControlOnly: Story = {
  args: {
    conceptReport: sampleReport,
    showConceptReport: false,
    showEvaluationDetails: false,
    showSectionControl: true,
    conceptEvaluationDetails: sampleEvaluationDetails,
    conceptsSnapshot: sampleConcepts,
    sectionVisibilityControl: sampleSectionVisibility
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows only the section visibility control.'
      }
    }
  }
};

export const AllPanelsVisible: Story = {
  args: {
    conceptReport: sampleReport,
    showConceptReport: true,
    showEvaluationDetails: true,
    showSectionControl: true,
    conceptEvaluationDetails: sampleEvaluationDetails,
    conceptsSnapshot: sampleConcepts,
    sectionVisibilityControl: sampleSectionVisibility
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows all panels: concept report, evaluation details, and section control.'
      }
    }
  }
}; 