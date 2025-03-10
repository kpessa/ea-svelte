import { writable, get } from 'svelte/store';
import type { Concept, Config, TestCase } from './types';

export const config = writable<Config | null>(null);
export const concepts = writable<Record<string, Concept>>({});
export const selectedTab = writable<string>('magnesium');
export const debugMode = writable<boolean>(false);
export const testCases = writable<TestCase[]>([]);
export const selectedTestCase = writable<string>('');

// Interface for evaluation steps
export interface EvaluationStep {
    expression: string;
    result: boolean | null;
    explanation: string;
    isSubExpression?: boolean;
    conceptName?: string;
    conceptValue?: boolean;
}

// Helper function to evaluate concept expressions with detailed steps
export function evaluateConceptExpressionWithSteps(
  expression: string, 
  providedConcepts?: Record<string, Concept | undefined>
): { result: boolean, steps: EvaluationStep[] } {
    const steps: EvaluationStep[] = [];
    // Use provided concepts if available, otherwise get from store
    const conceptsSnapshot = providedConcepts || get(concepts);
    
    // Add the initial step with the original expression
    steps.push({
        expression,
        result: null,
        explanation: 'Starting with the original expression'
    });
    
    // First, handle the "[%" and "%]" delimiters
    let processedExpression = expression;
    
    // Replace "[%" and "%]" with empty strings
    if (processedExpression.includes('[%') && processedExpression.includes('%]')) {
        processedExpression = processedExpression.replace(/\[%/g, '').replace(/%\]/g, '');
        
        steps.push({
            expression: processedExpression,
            result: null,
            explanation: 'Removed "[%" and "%]" delimiters'
        });
    }
    
    // Replace English operators with JavaScript operators
    const operatorReplacements = [
        { from: /\bAND\b/g, to: '&&', explanation: 'Replaced "AND" with "&&"' },
        { from: /\bOR\b/g, to: '||', explanation: 'Replaced "OR" with "||"' },
        { from: /\bNOT\b/g, to: '!', explanation: 'Replaced "NOT" with "!"' }
    ];
    
    let operatorsReplaced = false;
    let operatorExplanation = 'Replaced English operators with JavaScript operators:';
    
    for (const replacement of operatorReplacements) {
        if (replacement.from.test(processedExpression)) {
            processedExpression = processedExpression.replace(replacement.from, replacement.to);
            operatorsReplaced = true;
            operatorExplanation += ` ${replacement.explanation};`;
        }
    }
    
    if (operatorsReplaced) {
        steps.push({
            expression: processedExpression,
            result: null,
            explanation: operatorExplanation
        });
    }
    
    // Extract concept references from the expression
    const conceptRegex = /\{([^{}]+)\}/g;
    let modifiedExpression = processedExpression;
    let match;
    
    // Replace all concept references with their values
    while ((match = conceptRegex.exec(processedExpression)) !== null) {
        const conceptName = match[1].trim();
        const concept = conceptsSnapshot[conceptName];
        
        // If concept is undefined or not active, its value is considered false
        const effectiveValue = concept?.isActive ?? false;
        
        // Add a step for each concept substitution
        steps.push({
            expression: `{${conceptName}}`,
            result: effectiveValue,
            explanation: concept 
                ? `Concept "${conceptName}" ${concept.isActive ? 'is' : 'is not'} active` 
                : `Concept "${conceptName}" is undefined, treating as inactive`,
            isSubExpression: true,
            conceptName,
            conceptValue: effectiveValue
        });
        
        // Replace the concept reference with its boolean value
        modifiedExpression = modifiedExpression.replace(`{${conceptName}}`, effectiveValue.toString());
    }
    
    // Convert single equals to double equals for boolean comparison
    modifiedExpression = modifiedExpression.replace(/([^=!><])=([^=])/g, '$1==$2');
    
    // Add a step showing the operator conversion
    steps.push({
        expression: modifiedExpression,
        result: null,
        explanation: 'Converted = to == for proper boolean comparison'
    });
    
    // Evaluate the expression safely
    let result: boolean;
    try {
        // Use Function constructor to evaluate the expression
        // This is safe as we're only evaluating boolean expressions
        result = new Function(`return ${modifiedExpression}`)() === true;
        
        // Add the final evaluation step
        steps.push({
            expression: modifiedExpression,
            result,
            explanation: `Final evaluation result: ${result}`
        });
    } catch (error) {
        // If there's an error, add it as a step
        steps.push({
            expression: modifiedExpression,
            result: false,
            explanation: `Error evaluating expression: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
        result = false;
    }
    
    return { result, steps };
}

// Helper function to evaluate concept expressions (simplified version)
export function evaluateConceptExpression(expression: string, providedConcepts?: Record<string, Concept>): boolean {
    const { result } = evaluateConceptExpressionWithSteps(expression, providedConcepts);
    return result;
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