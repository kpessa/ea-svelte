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
    title: string;
    visibilityExpression: string;
    orders: Order[];
}

export interface Order {
    id: string;
    name: string;
    description?: string;
    selected?: boolean;
}

export interface Tab {
    id: string;
    name: string;
    criteria: Criteria[];
    orderSections: OrderSection[];
}

export interface Criteria {
    id: string;
    title: string;
    description: string;
    visibilityExpression: string;
}

export interface Config {
    tabs: Tab[];
    testCases: TestCase[];
} 