import type { Meta, StoryObj } from '@storybook/svelte';
import Navbar from './Navbar.svelte';

const meta = {
    title: 'Components/Navbar',
    component: Navbar,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
    argTypes: {
        title: {
            control: 'text',
            description: 'The title to display in the navbar'
        }
    }
} satisfies Meta<Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Electrolyte Advisor'
    }
};

export const WithCustomTitle: Story = {
    args: {
        title: 'Clinical Decision Support'
    }
};

export const WithActions: Story = {
    args: {
        title: 'Electrolyte Advisor'
    },
    render: () => ({
        Component: Navbar,
        slots: {
            actions: `
                <div class="flex space-x-4">
                    <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Save</button>
                    <button class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Export</button>
                </div>
            `
        }
    })
};

export const WithDebugActions: Story = {
    args: {
        title: 'Debug Mode'
    },
    render: () => ({
        Component: Navbar,
        slots: {
            actions: `
                <div class="flex space-x-4 items-center">
                    <span class="text-yellow-500">Debug Mode Active</span>
                    <button class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Reset</button>
                    <button class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">Logs</button>
                </div>
            `
        }
    })
}; 