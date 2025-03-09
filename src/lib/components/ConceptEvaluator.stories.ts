import type { Meta, StoryObj } from '@storybook/svelte';
import ConceptEvaluator from './ConceptEvaluator.svelte';

const meta = {
  title: 'Components/ConceptEvaluator',
  component: ConceptEvaluator,
  tags: ['autodocs'],
  argTypes: {
    expressionToEvaluate: { control: 'text' },
    conceptsSnapshot: { control: 'object' }
  }
} satisfies Meta<ConceptEvaluator>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample concepts for the stories
const sampleConcepts = {
  'ConceptA': { value: true, isActive: true },
  'ConceptB': { value: false, isActive: true },
  'ConceptC': { value: true, isActive: false },
  'ConceptD': { value: false, isActive: false }
};

export const SimpleExpression: Story = {
  args: {
    expressionToEvaluate: '{ConceptA} AND {ConceptB}',
    conceptsSnapshot: sampleConcepts
  },
  parameters: {
    docs: {
      description: {
        story: 'A simple expression with AND operator.'
      }
    }
  },
  play: async ({ canvasElement, args }) => {
    // This will run after the story renders
    // We need to wait for the component to be fully rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Find the component instance
    const component = canvasElement.querySelector('svelte-component');
    if (component) {
      // Call evaluateExpression method
      const evaluateMethod = (component as any).__svelte?.evaluateExpression;
      if (evaluateMethod) {
        evaluateMethod();
      }
    }
  }
};

export const ComplexExpression: Story = {
  args: {
    expressionToEvaluate: '({ConceptA} OR {ConceptB}) AND NOT {ConceptC}',
    conceptsSnapshot: sampleConcepts
  },
  parameters: {
    docs: {
      description: {
        story: 'A more complex expression with multiple operators.'
      }
    }
  },
  play: async ({ canvasElement, args }) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const component = canvasElement.querySelector('svelte-component');
    if (component) {
      const evaluateMethod = (component as any).__svelte?.evaluateExpression;
      if (evaluateMethod) {
        evaluateMethod();
      }
    }
  }
};

export const InteractiveEvaluator: Story = {
  args: {
    expressionToEvaluate: '{ConceptA} AND {ConceptB}',
    conceptsSnapshot: { ...sampleConcepts }
  },
  parameters: {
    docs: {
      description: {
        story: 'An interactive evaluator where concepts can be toggled.'
      }
    }
  },
  render: (args) => ({
    Component: ConceptEvaluator,
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
          
          // Re-evaluate the expression
          const component = document.querySelector('svelte-component');
          if (component) {
            const evaluateMethod = (component as any).__svelte?.evaluateExpression;
            if (evaluateMethod) {
              evaluateMethod();
            }
          }
        }
        
        return args;
      }
    }
  }),
  play: async ({ canvasElement, args }) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const component = canvasElement.querySelector('svelte-component');
    if (component) {
      const evaluateMethod = (component as any).__svelte?.evaluateExpression;
      if (evaluateMethod) {
        evaluateMethod();
      }
    }
  }
};

export const WithDelimiters: Story = {
  args: {
    expressionToEvaluate: '[%{ConceptA} AND {ConceptB}%]',
    conceptsSnapshot: sampleConcepts
  }
};

export const EmptyExpression: Story = {
  args: {
    expressionToEvaluate: '',
    conceptsSnapshot: sampleConcepts
  }
};

export const WithInactiveConcepts: Story = {
  args: {
    expressionToEvaluate: '{ConceptA} AND {ConceptC}',
    conceptsSnapshot: sampleConcepts
  }
}; 