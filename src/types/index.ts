export interface NavigationTab {
    TAB_KEY: string;
    TAB_NAME: string;
    CRITERIA: Criterion[];
    ORDERS: OrderSection[];
}

export interface Criterion {
    LABEL: string;
    DISPLAY: string;
    TOOLTIP?: string;
}

export interface OrderSection {
    SECTION_NAME: string;
    ORDERS: Order[];
}

export interface Order {
    MNEMONIC: string;
    ORDER_SENTENCE: string;
    COMMENT?: string;
} 