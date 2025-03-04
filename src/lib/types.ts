export interface Concept {
    value: boolean;
    isActive: boolean;
}

export interface TestCase {
    id: string;
    name: string;
    concepts: Record<string, Concept>;
}

export interface OrderSection {
    SECTION_NAME: string;
    CONCEPT_NAME: string;
    SINGLE_SELECT: number;
    ORDERS: Order[];
    SHOW_INACTIVE_DUPLICATES?: number;
}

export interface Order {
    MNEMONIC: string;
    ORDER_SENTENCE: string;
    ASC_SHORT_DESCRIPTION: string;
    COMMENT: string;
}

export type Tab = 'MAGNESIUM' | 'POTASSIUM' | 'PHOSPHATE';

export interface Config {
    RCONFIG: {
        TABS: TabConfig[];
    };
}

export interface TabConfig {
    TAB_KEY: Tab;
    TAB_NAME: string;
    CRITERIA: Criterion[];
    ORDER_SECTIONS: OrderSection[];
    RESOURCES?: Resource[];
}

export interface Criterion {
    CONCEPT_NAME: string;
    LABEL: string;
    TOOLTIP?: string;
    DISPLAY?: string;
    enabled: boolean;
}

export interface Resource {
    URL: string;
    DESCRIPTION: string;
}

export interface EvaluationResult {
    visible: boolean;
    reason?: string;
}

export interface Mnemonic {
    MNEMONIC: string;
    ProtocolURL?: string;
    Event_Name?: string;
}

export interface ResourceUrl {
    LABEL: string;
    URL: string;
}

export interface SubmitButton {
    DISMISS_LABEL: string;
    SIGN_LABEL: string;
}

export interface CancelButton {
    CANCEL_LABEL?: string;
}

export interface ResultsView {
    LOOKBEHIND_LABEL: string;
    LABEL?: string;
}

export interface GraphedResult {
    LABEL: string;
    EVENT_SET: string;
    LOOKBACK: string;
    MAX_RESULT_COUNT: string;
    RESULTS_VIEW: ResultsView;
} 