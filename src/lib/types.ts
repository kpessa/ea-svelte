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
    id: string;
    name: string;
    visibilityExpression: string;
    orders: Order[];
}

export interface Order {
    id: string;
    name: string;
    type: 'medication' | 'lab' | 'procedure';
    details: string;
    visibilityExpression?: string;
}

export interface Tab {
    id: string;
    name: string;
    criteria: Criterion[];
    orderSections: OrderSection[];
}

export interface Criterion {
    id: string;
    name: string;
    type: 'numeric' | 'boolean' | 'select';
    value?: number | boolean | string;
    options?: string[];
    unit?: string;
    validation?: {
        min?: number;
        max?: number;
        required?: boolean;
    };
    visibilityExpression?: string;
}

export interface Config {
    tabs: Tab[];
    testCases: TestCase[];
}

export interface EvaluationResult {
    visible: boolean;
    reason?: string;
} 