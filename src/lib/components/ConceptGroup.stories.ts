import type { Meta, StoryObj } from '@storybook/svelte';
import ConceptGroup from './ConceptGroup.svelte';
import type { ConceptChange } from '../types';

const meta = {
  title: 'Components/ConceptGroup',
  component: ConceptGroup,
  tags: ['autodocs'],
  args: {
    category: 'EA Orders',
    concepts: [
      {
        conceptName: 'EASHOWMAGORDERS',
        value: true,
        isActive: true,
        inherited: false
      },
      {
        conceptName: 'EAPROTOCOLMAGIV',
        value: true,
        isActive: true,
        inherited: false
      }
    ]
  }
} satisfies Meta<ConceptGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};

export const EmptyConcepts: Story = {
  args: {
    category: 'Empty Group',
    concepts: []
  }
};

export const MixedStateConcepts: Story = {
  args: {
    category: 'EA Criteria',
    concepts: [
      {
        conceptName: 'EACRITERIAVALIDMAGRESULT4H',
        value: true,
        isActive: true,
        inherited: false
      },
      {
        conceptName: 'EALABMAGBTW00AND13',
        value: false,
        isActive: true,
        inherited: false
      },
      {
        conceptName: 'EACRITERIAVALIDMAGRESULT24H',
        value: true,
        isActive: false,
        inherited: false
      },
      {
        conceptName: 'EALABMAGGT13',
        value: false,
        isActive: false,
        inherited: false
      }
    ]
  }
};

export const InheritedConcepts: Story = {
  args: {
    category: 'EA Protocol',
    concepts: [
      {
        conceptName: 'EAPROTOCOLMAGIV',
        value: true,
        isActive: true,
        inherited: true
      },
      {
        conceptName: 'EAPROTOCOLMAGORAL',
        value: false,
        isActive: true,
        inherited: true
      },
      {
        conceptName: 'EAPROTOCOLMAGHOLD',
        value: true,
        isActive: true,
        inherited: false
      }
    ]
  }
}; 