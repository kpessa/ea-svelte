import type { Meta, StoryObj } from '@storybook/svelte';
import TabNavigation from './TabNavigation.svelte';

const meta = {
    title: 'Components/TabNavigation',
    component: TabNavigation,
    tags: ['autodocs'],
    argTypes: {
        tabs: {
            control: 'object',
            description: 'Array of tab objects with TAB_KEY and TAB_LABEL properties'
        },
        selectedTab: {
            control: 'text',
            description: 'The currently selected tab key'
        },
        onTabChange: {
            action: 'tabChanged',
            description: 'Callback function when a tab is selected'
        }
    }
} satisfies Meta<TabNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        tabs: [
            { TAB_KEY: 'tab1', TAB_LABEL: 'First Tab' },
            { TAB_KEY: 'tab2', TAB_LABEL: 'Second Tab' },
            { TAB_KEY: 'tab3', TAB_LABEL: 'Third Tab' }
        ],
        selectedTab: 'tab1',
        onTabChange: (tabKey) => console.log('Tab changed:', tabKey)
    }
};

export const WithLongLabels: Story = {
    args: {
        tabs: [
            { TAB_KEY: 'potassium', TAB_LABEL: 'Potassium Management' },
            { TAB_KEY: 'sodium', TAB_LABEL: 'Sodium & Fluid Balance' },
            { TAB_KEY: 'magnesium', TAB_LABEL: 'Magnesium Replacement' },
            { TAB_KEY: 'calcium', TAB_LABEL: 'Calcium Homeostasis' }
        ],
        selectedTab: 'potassium',
        onTabChange: (tabKey) => console.log('Tab changed:', tabKey)
    }
};

export const WithIcons: Story = {
    args: {
        tabs: [
            {
                TAB_KEY: 'dashboard',
                TAB_LABEL: 'Dashboard',
                ICON: '📊'
            },
            {
                TAB_KEY: 'patients',
                TAB_LABEL: 'Patients',
                ICON: '👥'
            },
            {
                TAB_KEY: 'settings',
                TAB_LABEL: 'Settings',
                ICON: '⚙️'
            }
        ],
        selectedTab: 'dashboard',
        onTabChange: (tabKey) => console.log('Tab changed:', tabKey)
    }
};

export const SingleTab: Story = {
    args: {
        tabs: [
            { TAB_KEY: 'main', TAB_LABEL: 'Main View' }
        ],
        selectedTab: 'main',
        onTabChange: (tabKey) => console.log('Tab changed:', tabKey)
    }
}; 