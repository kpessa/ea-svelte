import type { Meta, StoryObj } from '@storybook/svelte';
import ConceptModalContainer from './ConceptModalContainer.svelte';
import { action } from '@storybook/addon-actions';

const meta = {
  title: 'Components/ConceptModalContainer',
  component: ConceptModalContainer,
  tags: ['autodocs'],
  argTypes: {
    showModal: { control: 'boolean' }
  },
  parameters: {
    actions: {
      handles: ['toggleModal']
    }
  }
} satisfies Meta<ConceptModalContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  args: {
    showModal: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal container in closed state, showing only the brain icon button.'
      }
    }
  }
};

export const Open: Story = {
  args: {
    showModal: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal container in open state, showing the full modal dialog.'
      }
    }
  },
  render: (args) => ({
    Component: ConceptModalContainer,
    props: args,
    slots: {
      default: '<div style="padding: 20px; background-color: #f0f0f0; border-radius: 5px;">This is sample content inside the modal.</div>'
    }
  })
}; 