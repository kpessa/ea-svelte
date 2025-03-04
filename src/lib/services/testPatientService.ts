import type { TestCase, Concept } from '$lib/types';
import { testCases, selectedTestCase } from '$lib/stores';

export class TestPatientService {
    private static instance: TestPatientService;
    private testCases: TestCase[] = [];

    private constructor() {
        testCases.subscribe(value => {
            this.testCases = value;
        });
    }

    static getInstance(): TestPatientService {
        if (!TestPatientService.instance) {
            TestPatientService.instance = new TestPatientService();
        }
        return TestPatientService.instance;
    }

    addTestCase(name: string, concepts: Record<string, Concept>): TestCase {
        const newTestCase: TestCase = {
            id: this.generateId(),
            name,
            concepts
        };
        this.testCases = [...this.testCases, newTestCase];
        testCases.set(this.testCases);
        return newTestCase;
    }

    updateTestCase(id: string, updates: Partial<TestCase>): TestCase | null {
        const index = this.testCases.findIndex(tc => tc.id === id);
        if (index === -1) return null;

        const updatedTestCase = {
            ...this.testCases[index],
            ...updates
        };
        this.testCases = [
            ...this.testCases.slice(0, index),
            updatedTestCase,
            ...this.testCases.slice(index + 1)
        ];
        testCases.set(this.testCases);
        return updatedTestCase;
    }

    deleteTestCase(id: string): boolean {
        const index = this.testCases.findIndex(tc => tc.id === id);
        if (index === -1) return false;

        this.testCases = [
            ...this.testCases.slice(0, index),
            ...this.testCases.slice(index + 1)
        ];
        testCases.set(this.testCases);

        // If the deleted test case was selected, clear the selection
        if (selectedTestCase.get() === id) {
            selectedTestCase.set('');
        }

        return true;
    }

    getTestCase(id: string): TestCase | null {
        return this.testCases.find(tc => tc.id === id) || null;
    }

    getAllTestCases(): TestCase[] {
        return this.testCases;
    }

    applyTestCase(id: string): boolean {
        const testCase = this.getTestCase(id);
        if (!testCase) return false;

        selectedTestCase.set(id);
        return true;
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
} 