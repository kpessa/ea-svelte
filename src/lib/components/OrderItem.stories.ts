import type { Meta, StoryObj } from '@storybook/svelte';
import OrderItem from './OrderItem.svelte';
import type { Order } from '../types';

const mockOrder: Order = {
    MNEMONIC: 'KCL_ORAL_20',
    ORDER_SENTENCE: 'Potassium Chloride 20 mEq Oral Tablet',
    ASC_SHORT_DESCRIPTION: 'For mild hypokalemia',
    COMMENT: 'Take with food and water'
};

const meta = {
    title: 'Components/OrderItem',
    component: OrderItem,
    tags: ['autodocs'],
    argTypes: {
        order: { control: 'object' },
        sectionIndex: { control: 'number' },
        isSingleSelect: { control: 'boolean' }
    }
} satisfies Meta<OrderItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        order: mockOrder,
        sectionIndex: 0,
        isSingleSelect: false
    }
};

export const SingleSelect: Story = {
    args: {
        order: mockOrder,
        sectionIndex: 0,
        isSingleSelect: true
    }
};

export const NoDescription: Story = {
    args: {
        order: {
            ...mockOrder,
            ASC_SHORT_DESCRIPTION: ''
        },
        sectionIndex: 0,
        isSingleSelect: false
    }
};

export const NoComment: Story = {
    args: {
        order: {
            ...mockOrder,
            COMMENT: ''
        },
        sectionIndex: 0,
        isSingleSelect: false
    }
};

export const NoOrderSentence: Story = {
    args: {
        order: {
            ...mockOrder,
            ORDER_SENTENCE: ''
        },
        sectionIndex: 0,
        isSingleSelect: false
    }
};

export const WithHtmlComment: Story = {
    args: {
        order: {
            ...mockOrder,
            COMMENT: 'Take with food and water<br>Monitor potassium levels after 4 hours<br><b>Important:</b> Check renal function'
        },
        sectionIndex: 0,
        isSingleSelect: false
    }
}; 