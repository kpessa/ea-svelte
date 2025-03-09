import type { Meta, StoryObj } from '@storybook/svelte';
import Counter from './Counter.svelte';

const meta = {
    title: 'Components/Counter',
    component: Counter,
    tags: ['autodocs'],
} satisfies Meta<Counter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithInitialCount: Story = {
    args: {
        count: 10
    }
}; 