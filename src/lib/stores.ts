import { writable } from 'svelte/store';
import type { Concept, Config, TestCase } from './types';
import type { Tab } from '$lib/types';

export const config = writable<Config | null>(null);
export const concepts = writable<Record<string, Concept>>({});
export const selectedTab = writable<string>('magnesium');
export const debugMode = writable<boolean>(false);
export const testCases = writable<TestCase[]>([]);
export const selectedTestCase = writable<string>('');

// Helper function to evaluate concept expressions
export function evaluateConceptExpression(expression: string): boolean {
    // This is a placeholder - we'll implement the actual evaluation logic later
    return true;
}

// Helper function to set concept value
export function setConceptValue(conceptId: string, value: boolean) {
    concepts.update(state => ({
        ...state,
        [conceptId]: { ...state[conceptId], value }
    }));
}

// Helper function to toggle concept active state
export function toggleConceptActive(conceptId: string) {
    concepts.update(state => ({
        ...state,
        [conceptId]: { ...state[conceptId], isActive: !state[conceptId]?.isActive }
    }));
} 