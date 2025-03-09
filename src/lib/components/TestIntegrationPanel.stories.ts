import type { Meta, StoryObj } from '@storybook/svelte';
import TestIntegrationPanel from './TestIntegrationPanel.svelte';
import { action } from '@storybook/addon-actions';
import type { TestScenario, TestPath, TestStep, ConceptChange } from '../types';

const meta = {
  title: 'Components/TestIntegrationPanel',
  component: TestIntegrationPanel,
  tags: ['autodocs'],
  argTypes: {
    testScenarios: { control: 'object' },
    selectedConcepts: { control: 'object' },
    conceptChangeValues: { control: 'object' },
    conceptChangeActive: { control: 'object' }
  },
  parameters: {
    actions: {
      handles: ['addToTestScenario', 'applyFromTestScenario']
    }
  }
} satisfies Meta<TestIntegrationPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample test scenarios
const sampleScenarios: TestScenario[] = [
  {
    id: 'scenario1',
    name: 'Magnesium Scenario',
    description: 'Test scenario for magnesium workflow',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scenarios: []
  },
  {
    id: 'scenario2',
    name: 'Potassium Scenario',
    description: 'Test scenario for potassium workflow',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scenarios: []
  }
];

// Add paths to scenarios for the stories
(sampleScenarios[0] as any).paths = [
  {
    id: 'path1',
    name: 'Happy Path',
    description: 'Normal workflow path',
    steps: [
      {
        id: 'step1',
        name: 'Initial State',
        order: 0,
        conceptChanges: [
          { conceptName: 'ConceptA', value: true, isActive: true },
          { conceptName: 'ConceptB', value: false, isActive: true }
        ]
      },
      {
        id: 'step2',
        name: 'After Action',
        order: 1,
        conceptChanges: [
          { conceptName: 'ConceptA', value: true, isActive: true },
          { conceptName: 'ConceptB', value: true, isActive: true }
        ]
      }
    ]
  },
  {
    id: 'path2',
    name: 'Error Path',
    description: 'Error handling path',
    steps: []
  }
];

(sampleScenarios[1] as any).paths = [
  {
    id: 'path3',
    name: 'Standard Path',
    description: 'Standard workflow',
    steps: []
  }
];

// Sample selected concepts
const selectedConcepts = ['ConceptA', 'ConceptB'];
const conceptChangeValues = { 'ConceptA': true, 'ConceptB': false };
const conceptChangeActive = { 'ConceptA': true, 'ConceptB': true };

export const AddMode: Story = {
  args: {
    testScenarios: sampleScenarios,
    selectedConcepts,
    conceptChangeValues,
    conceptChangeActive
  },
  parameters: {
    docs: {
      description: {
        story: 'Test integration panel in "Add to Test" mode.'
      }
    }
  }
};

export const ApplyMode: Story = {
  args: {
    testScenarios: sampleScenarios,
    selectedConcepts,
    conceptChangeValues,
    conceptChangeActive
  },
  play: async ({ canvasElement, args }) => {
    // This will simulate clicking the "Apply from Test" tab
    const applyTab = canvasElement.querySelector('.tab-button:nth-child(2)') as HTMLButtonElement;
    if (applyTab) {
      applyTab.click();
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Test integration panel in "Apply from Test" mode.'
      }
    }
  }
};

export const EmptyScenarios: Story = {
  args: {
    testScenarios: [],
    selectedConcepts,
    conceptChangeValues,
    conceptChangeActive
  },
  parameters: {
    docs: {
      description: {
        story: 'Test integration panel with no scenarios.'
      }
    }
  }
}; 