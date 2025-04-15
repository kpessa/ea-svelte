import type { Meta, StoryObj } from '@storybook/svelte';
import ConceptExpressionPanel from './ConceptExpressionPanel.svelte';
import type { Concept } from '../types';

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
const sampleConcepts: Record<string, Concept | undefined> = {
  'ConceptA': { value: 'Text value A', isActive: true },
  'ConceptB': { value: 42, isActive: true },
  'ConceptC': { value: true, isActive: false },
  'ConceptActiveCount': { value: 'Active', isActive: true },
  'ConceptInactiveCount': { value: 'Inactive', isActive: false },
  'MagnesiumLow': { value: 'Low magnesium level', isActive: true },
  'MagnesiumHigh': { value: 'High magnesium level', isActive: false },
  'ConceptD': undefined
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
  },
  { 
    expression: '{ConceptActiveCount.COUNT} > 0',
    path: 'config/count_active.json' 
  },
  { 
    expression: '{ConceptInactiveCount.COUNT} == 0',
    path: 'config/count_inactive.json' 
  },
  {
    expression: '{ConceptA} AND {ConceptD}',
    path: 'config/undefined.json'
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
        story: 'Default ConceptExpressionPanel with sample concepts and config expressions. Evaluates expressions based on the isActive state of concepts. Active concepts are shown in green, inactive in red, and undefined in grey. ConceptD is undefined and will be treated as false in evaluations.'
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

export const WithCountProperty: Story = {
  args: {
    conceptsSnapshot: {
      'ConceptActiveCount': { value: 'Active', isActive: true },
      'ConceptInactiveCount': { value: 'Inactive', isActive: false },
      'AnotherActive': { value: true, isActive: true }
    },
    configExpressions: [
      { 
        expression: '{ConceptActiveCount.COUNT} > 0',
        path: 'test/count_active.json' 
      },
      { 
        expression: '{ConceptInactiveCount.COUNT} == 0',
        path: 'test/count_inactive.json' 
      },
      { 
        expression: '{ConceptActiveCount.COUNT} > 0 AND {AnotherActive}',
        path: 'test/count_and_simple.json' 
      },
      { 
        expression: '{ConceptInactiveCount.COUNT} > 0',
        path: 'test/count_inactive_false.json' 
      },
    ]
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests expressions using the `.COUNT` property. `ConceptActiveCount` is active (COUNT should be 1), `ConceptInactiveCount` is inactive (COUNT should be 0).'
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
        story: 'Interactive ConceptExpressionPanel where concepts can be toggled between three states: Active (green) → Inactive (red) → Undefined (grey) → Active (green). All three states are visible in the UI.'
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
        
        if (!concept) {
          // If undefined, set to active
          args.conceptsSnapshot[conceptName] = {
            value: `Value for ${conceptName}`,
            isActive: true
          };
        } else if (concept.isActive) {
          // If active, set to inactive (keep the same value)
          args.conceptsSnapshot[conceptName] = {
            ...concept,
            isActive: false
          };
        } else {
          // If inactive, set to undefined
          args.conceptsSnapshot[conceptName] = undefined;
        }
        
        return args;
      }
    }
  })
}; 