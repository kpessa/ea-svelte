import type { Meta, StoryObj } from '@storybook/svelte';
import { action } from '@storybook/addon-actions';
import ScenarioItem from './ScenarioItem.svelte';
import type { TestSubScenario } from '../types';

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

const meta = {
  title: 'Components/ScenarioItem',
  component: ScenarioItem,
  tags: ['autodocs'],
  args: {
    scenario: baseScenario,
    allScenarios: [baseScenario],
    selectedScenarioId: null,
    isEditable: true,
    onScenarioSelect: action('onScenarioSelect'),
    onAddSubScenario: action('onAddSubScenario'),
    onAddExpectedResult: action('onAddExpectedResult'),
    onEditConcepts: action('onEditConcepts'),
    onDeleteScenario: action('onDeleteScenario')
  },
  parameters: {
    docs: {
      description: {
        component: 'A refactored component that displays a scenario item with expandable details and child scenarios. Uses context API for prop sharing and has improved accessibility.'
      }
    }
  }
} satisfies Meta<ScenarioItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};

export const Selected: Story = {
  args: {
    selectedScenarioId: 'scenario-1'
  }
};

export const NotEditable: Story = {
  args: {
    isEditable: false,
    selectedScenarioId: 'scenario-1'
  }
};

export const WithChildren: Story = {
  args: {
    scenario: {
      ...baseScenario,
      children: [
        {
          id: 'child-1',
          name: 'Child Scenario 1',
          description: 'First child scenario',
          parentId: 'scenario-1',
          level: 1,
          concepts: [
            {
              conceptName: 'CALCIUM.LEVEL',
              value: false,
              isActive: true
            }
          ],
          children: [],
          expectedResults: []
        },
        {
          id: 'child-2',
          name: 'Child Scenario 2',
          description: 'Second child scenario',
          parentId: 'scenario-1',
          level: 1,
          concepts: [],
          children: [],
          expectedResults: []
        }
      ]
    }
  }
};

export const DeepNesting: Story = {
  args: {
    scenario: {
      ...baseScenario,
      children: [
        {
          id: 'child-1',
          name: 'Child Scenario 1',
          description: 'First child scenario',
          parentId: 'scenario-1',
          level: 1,
          concepts: [],
          children: [
            {
              id: 'grandchild-1',
              name: 'Grandchild Scenario 1',
              description: 'First grandchild scenario',
              parentId: 'child-1',
              level: 2,
              concepts: [],
              children: [],
              expectedResults: []
            }
          ],
          expectedResults: []
        }
      ]
    }
  }
};

export const WithInheritedConcepts: Story = {
  args: {
    scenario: {
      id: 'child-1',
      name: 'Child Scenario',
      description: 'A child scenario inheriting concepts',
      parentId: 'parent-1',
      level: 1,
      concepts: [
        {
          conceptName: 'CALCIUM.LEVEL',
          value: true,
          isActive: true
        }
      ],
      children: [],
      expectedResults: []
    },
    allScenarios: [
      {
        id: 'parent-1',
        name: 'Parent Scenario',
        description: 'Parent scenario with concepts to inherit',
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
        expectedResults: []
      }
    ]
  }
}; 