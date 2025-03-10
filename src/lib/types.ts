export interface Concept {
    value: boolean | number | string;
    isActive: boolean;
    description?: string;
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

export type ElectrolyteTab = 'MAGNESIUM' | 'POTASSIUM' | 'PHOSPHATE';

export interface Config {
    RCONFIG: {
        TABS: NavigationTab[];
        SETTINGS: {
            theme: string;
            language: string;
            [key: string]: any;
        };
        [key: string]: any;
    };
    [key: string]: any;
}

export interface TabConfig {
    TAB_KEY: ElectrolyteTab;
    TAB_NAME: string;
    CRITERIA: Criterion[];
    ORDER_SECTIONS: OrderSection[];
    RESOURCES?: Resource[];
    FLAG_ON_CONCEPT?: string;
    CONCEPT_FOR_DISMISS?: string;
    CONCEPTS?: ConceptItem[];
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

export interface ConceptItem {
    Concept: string;
}

export interface ConceptReference {
    name: string;
    section: string;
    path: string;
    isExpression: boolean;
}

// Test Framework Types
export interface TestScenario {
    id: string;
    name: string;
    description: string;
    scenarios: TestSubScenario[];
    createdAt: string;
    updatedAt: string;
}

export interface TestSubScenario {
    id: string;
    name: string;
    description: string;
    parentId: string | null;
    level: number;
    concepts: ConceptChange[];
    children: TestSubScenario[];
    expectedResults: ExpectedResult[];
}

export interface TestPath {
    id: string;
    name: string;
    description: string;
    steps: TestStep[];
    expectedResults: ExpectedResult[];
    parentId?: string | null;
}

export interface TestStep {
    id: string;
    name: string;
    conceptChanges: ConceptChange[];
    order: number;
}

export interface ConceptChange {
    conceptName: string;
    value: boolean;
    isActive: boolean;
    inherited?: boolean;
}

export interface ExpectedResult {
    type: 'tab' | 'section' | 'order' | 'criterion';
    target: string;
    expectedVisibility: boolean;
    description: string;
}

export interface TestResult {
    scenarioId: string;
    pathId: string;
    timestamp: string;
    steps: TestStepResult[];
    success: boolean;
    failureReason?: string;
}

export interface TestStepResult {
    stepId: string;
    conceptStates: Record<string, Concept>;
    results: ExpectedResultOutcome[];
    success: boolean;
}

export interface ExpectedResultOutcome {
    expectedResult: ExpectedResult;
    actualVisibility: boolean;
    success: boolean;
}

// Navigation types
export interface NavItem {
    label: string;
    href: string;
}

// Tab types
export interface NavigationTab {
    TAB_KEY: string;
    TAB_NAME: string;
}

// Patient types
export interface Patient {
    id: string;
    name: string;
    dob: string;
    mrn: string;
    sex: string;
    age: number;
    room: string;
}

// Concept Status type
export type ConceptStatus = 'active' | 'inactive' | 'pending' | 'error'; 