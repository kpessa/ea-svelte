import type { Meta, StoryObj } from '@storybook/svelte';
import OrderSection from './OrderSection.svelte';
import type { OrderSection as OrderSectionType } from '../types';

const mockSection: OrderSectionType = {
    SECTION_NAME: 'Potassium Replacement',
    CONCEPT_NAME: 'K_LOW',
    SINGLE_SELECT: 1,
    ORDERS: [
        {
            MNEMONIC: 'KCL_ORAL_20',
            ORDER_SENTENCE: 'Potassium Chloride 20 mEq Oral Tablet',
            ASC_SHORT_DESCRIPTION: 'For mild hypokalemia',
            COMMENT: 'Take with food and water'
        },
        {
            MNEMONIC: 'KCL_IV_40',
            ORDER_SENTENCE: 'Potassium Chloride 40 mEq in 100mL NS IV',
            ASC_SHORT_DESCRIPTION: 'For moderate hypokalemia',
            COMMENT: 'Infuse over 4 hours'
        }
    ]
};

const meta = {
    title: 'Components/OrderSection',
    component: OrderSection,
    tags: ['autodocs'],
    argTypes: {
        section: { control: 'object' },
        sectionIndex: { control: 'number' },
        isCollapsed: { control: 'boolean' },
        debugMode: { control: 'boolean' }
    }
} satisfies Meta<OrderSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        section: mockSection,
        sectionIndex: 0,
        isCollapsed: false,
        debugMode: false
    }
};

export const Collapsed: Story = {
    args: {
        section: mockSection,
        sectionIndex: 0,
        isCollapsed: true,
        debugMode: false
    }
};

export const WithDebugMode: Story = {
    args: {
        section: mockSection,
        sectionIndex: 0,
        isCollapsed: false,
        debugMode: true
    }
};

export const EmptyOrders: Story = {
    args: {
        section: {
            ...mockSection,
            ORDERS: []
        },
        sectionIndex: 0,
        isCollapsed: false,
        debugMode: false
    }
};

export const NoConceptName: Story = {
    args: {
        section: {
            ...mockSection,
            CONCEPT_NAME: ''
        },
        sectionIndex: 0,
        isCollapsed: false,
        debugMode: true
    }
};

export const MultiSelect: Story = {
    args: {
        section: {
            ...mockSection,
            SINGLE_SELECT: 0
        },
        sectionIndex: 0,
        isCollapsed: false,
        debugMode: false
    }
}; 