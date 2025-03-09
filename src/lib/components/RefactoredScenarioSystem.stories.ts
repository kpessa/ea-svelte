import type { Meta, StoryObj } from '@storybook/svelte';
import { action } from '@storybook/addon-actions';
import ScenarioItem from './ScenarioItem.svelte';
import type { TestSubScenario } from '../types';

// Sample data for a complex scenario tree
const complexScenario: TestSubScenario = {
  id: 'root',
  name: 'Root Scenario',
  description: 'The root scenario with multiple levels of children',
  parentId: null,
  level: 0,
  concepts: [
    {
      conceptName: 'GLOBAL.FEATURE',
      value: true,
      isActive: true
    },
    {
      conceptName: 'SYSTEM.ENABLED',
      value: true,
      isActive: true
    }
  ],
  children: [
    {
      id: 'child-1',
      name: 'Magnesium Feature',
      description: 'Tests for the Magnesium feature',
      parentId: 'root',
      level: 1,
      concepts: [
        {
          conceptName: 'MAGNESIUM.LEVEL',
          value: true,
          isActive: true
        }
      ],
      children: [
        {
          id: 'grandchild-1',
          name: 'Magnesium High Level',
          description: 'Tests for high magnesium levels',
          parentId: 'child-1',
          level: 2,
          concepts: [
            {
              conceptName: 'MAGNESIUM.HIGH',
              value: true,
              isActive: true
            }
          ],
          children: [],
          expectedResults: [
            {
              type: 'section',
              target: '#high-mg-warning',
              expectedVisibility: true,
              description: 'High magnesium warning should be visible'
            }
          ]
        },
        {
          id: 'grandchild-2',
          name: 'Magnesium Low Level',
          description: 'Tests for low magnesium levels',
          parentId: 'child-1',
          level: 2,
          concepts: [
            {
              conceptName: 'MAGNESIUM.LOW',
              value: true,
              isActive: true
            }
          ],
          children: [],
          expectedResults: [
            {
              type: 'section',
              target: '#low-mg-warning',
              expectedVisibility: true,
              description: 'Low magnesium warning should be visible'
            }
          ]
        }
      ],
      expectedResults: [
        {
          type: 'tab',
          target: '#magnesium-tab',
          expectedVisibility: true,
          description: 'Magnesium tab should be visible'
        }
      ]
    },
    {
      id: 'child-2',
      name: 'Calcium Feature',
      description: 'Tests for the Calcium feature',
      parentId: 'root',
      level: 1,
      concepts: [
        {
          conceptName: 'CALCIUM.LEVEL',
          value: true,
          isActive: true
        }
      ],
      children: [],
      expectedResults: [
        {
          type: 'tab',
          target: '#calcium-tab',
          expectedVisibility: true,
          description: 'Calcium tab should be visible'
        }
      ]
    }
  ],
  expectedResults: [
    {
      type: 'section',
      target: '#main-dashboard',
      expectedVisibility: true,
      description: 'Main dashboard should be visible'
    }
  ]
};

const meta = {
  title: 'Examples/RefactoredScenarioSystem',
  component: ScenarioItem,
  tags: ['autodocs'],
  args: {
    scenario: complexScenario,
    allScenarios: [complexScenario],
    selectedScenarioId: 'root',
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
        component: `
# Refactored Scenario System

This example demonstrates the complete refactored scenario system with all components working together:

- **ScenarioItem**: The main component that renders a scenario and its children
- **ScenarioActions**: Handles the action buttons for each scenario
- **ScenarioDetails**: Displays the expanded details of a scenario

The refactoring improved:
1. **Component Structure**: Separated concerns into focused components
2. **Prop Management**: Used Svelte's context API to reduce prop drilling
3. **Accessibility**: Added ARIA attributes for better screen reader support
4. **Maintainability**: Made the code more modular and easier to maintain
        `
      }
    }
  }
} satisfies Meta<ScenarioItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CompleteSystem: Story = {
  args: {}
};

export const EditableMode: Story = {
  args: {
    isEditable: true
  }
};

export const ReadOnlyMode: Story = {
  args: {
    isEditable: false
  }
};

export const SelectedChild: Story = {
  args: {
    selectedScenarioId: 'child-1'
  }
};

export const SelectedGrandchild: Story = {
  args: {
    selectedScenarioId: 'grandchild-1'
  }
}; 