import type { Meta, StoryObj } from '@storybook/svelte';
import OrderEditor from './OrderEditor.svelte';
import type { OrderSection } from '../types';

const mockSection: OrderSection = {
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
    title: 'Components/OrderEditor',
    component: OrderEditor,
    tags: ['autodocs'],
    argTypes: {
        section: { control: 'object' },
        sectionName: { control: 'text' }
    }
} satisfies Meta<OrderEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        section: mockSection,
        sectionName: mockSection.SECTION_NAME
    }
};

export const WithInvalidJSON: Story = {
    args: {
        section: {
            ...mockSection,
            ORDERS: [
                {
                    ...mockSection.ORDERS[0],
                    // @ts-ignore - intentionally invalid for story
                    MNEMONIC: undefined
                }
            ]
        },
        sectionName: 'Invalid JSON Example'
    }
}; 