import type { Meta, StoryObj } from '@storybook/svelte';
import { action } from '@storybook/addon-actions';
import ScenarioDetails from './ScenarioDetails.svelte';
import type { TestSubScenario } from '../types';
import { setContext } from 'svelte';

// Sample scenario data
const baseScenario: TestSubScenario = {
  id: 'scenario-1',
  name: 'Test Scenario',
  description: 'A test scenario for demonstration',
  parentId: null,
  level: 0,
  concepts: [
    {
      conceptName: 'MAGNESIUM.LEVEL',
      value: true,
      isActive: true
    }
  ],
  children: [],
  expectedResults: [
    {
      type: 'tab',
      target: '#magnesium-tab',
      expectedVisibility: true,
      description: 'Magnesium tab should be visible'
    }
  ]
};

// Mock context for stories
const mockContext = {
  allScenarios: [baseScenario],
  isEditable: true,
  onScenarioSelect: action('onScenarioSelect'),
  onAddSubScenario: action('onAddSubScenario'),
  onAddExpectedResult: action('onAddExpectedResult'),
  onEditConcepts: action('onEditConcepts'),
  onDeleteScenario: action('onDeleteScenario')
};

const meta = {
  title: 'Components/ScenarioDetails',
  component: ScenarioDetails,
  tags: ['autodocs'],
  args: {
    scenario: baseScenario
  },
  // Set up context for the stories
  decorators: [
    (story) => {
      setContext('scenario-context', mockContext);
      return story();
    }
  ]
} satisfies Meta<ScenarioDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};

export const WithoutConcepts: Story = {
  args: {
    scenario: {
      ...baseScenario,
      concepts: []
    }
  }
};

export const WithoutExpectedResults: Story = {
  args: {
    scenario: {
      ...baseScenario,
      expectedResults: []
    }
  }
};

export const ReadOnly: Story = {
  decorators: [
    (story) => {
      setContext('scenario-context', {
        ...mockContext,
        isEditable: false
      });
      return story();
    }
  ],
  args: {}
};

export const WithInheritedConcepts: Story = {
  decorators: [
    (story) => {
      const parentScenario: TestSubScenario = {
        id: 'parent-1',
        name: 'Parent Scenario',
        description: 'Parent scenario with concepts to inherit',
        parentId: null,
        level: 0,
        concepts: [
          {
            conceptName: 'CALCIUM.LEVEL',
            value: true,
            isActive: true
          }
        ],
        children: [],
        expectedResults: []
      };
      
      const childScenario: TestSubScenario = {
        id: 'child-1',
        name: 'Child Scenario',
        description: 'A child scenario inheriting concepts',
        parentId: 'parent-1',
        level: 1,
        concepts: [
          {
            conceptName: 'MAGNESIUM.LEVEL',
            value: true,
            isActive: true
          }
        ],
        children: [],
        expectedResults: []
      };
      
      setContext('scenario-context', {
        ...mockContext,
        allScenarios: [parentScenario, childScenario]
      });
      return story();
    }
  ],
  args: {
    scenario: {
      id: 'child-1',
      name: 'Child Scenario',
      description: 'A child scenario inheriting concepts',
      parentId: 'parent-1',
      level: 1,
      concepts: [
        {
          conceptName: 'MAGNESIUM.LEVEL',
          value: true,
          isActive: true
        }
      ],
      children: [],
      expectedResults: []
    }
  }
}; 