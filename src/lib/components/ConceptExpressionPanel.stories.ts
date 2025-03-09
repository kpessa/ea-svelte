import type { Meta, StoryObj } from '@storybook/svelte';
import ConceptExpressionPanel from './ConceptExpressionPanel.svelte';

const meta = {
  title: 'Components/ConceptExpressionPanel',
  component: ConceptExpressionPanel,
  tags: ['autodocs'],
  argTypes: {
    conceptsSnapshot: { control: 'object' },
    configExpressions: { control: 'object' }
  }
} satisfies Meta<ConceptExpressionPanel>;

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

// Sample config expressions
const sampleConfigExpressions = [
  { 
    expression: '{ConceptA} AND {ConceptB}', 
    path: 'config/simple.json' 
  },
  { 
    expression: '({ConceptA} OR {ConceptB}) AND NOT {ConceptC}', 
    path: 'config/complex.json' 
  },
  { 
    expression: '{MagnesiumLow} AND NOT {MagnesiumHigh}', 
    path: 'config/magnesium.json' 
  }
];

export const Default: Story = {
  args: {
    conceptsSnapshot: sampleConcepts,
    configExpressions: sampleConfigExpressions
  },
  parameters: {
    docs: {
      description: {
        story: 'Default ConceptExpressionPanel with sample concepts and config expressions.'
      }
    }
  }
};

export const WithoutConfigExpressions: Story = {
  args: {
    conceptsSnapshot: sampleConcepts,
    configExpressions: []
  },
  parameters: {
    docs: {
      description: {
        story: 'ConceptExpressionPanel without any config expressions.'
      }
    }
  }
};

export const InteractivePanel: Story = {
  args: {
    conceptsSnapshot: { ...sampleConcepts },
    configExpressions: sampleConfigExpressions
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive ConceptExpressionPanel where concepts can be toggled.'
      }
    }
  },
  render: (args) => ({
    Component: ConceptExpressionPanel,
    props: args,
    on: {
      toggleConcept: (event) => {
        const { conceptName } = event.detail;
        if (!args.conceptsSnapshot) {
          args.conceptsSnapshot = {};
        }
        
        const concept = args.conceptsSnapshot[conceptName];
        
        if (concept) {
          // Toggle the concept value
          args.conceptsSnapshot[conceptName] = {
            ...concept,
            value: !concept.value
          };
        }
        
        return args;
      }
    }
  })
}; 