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
    const conceptsSnapshot = providedConcepts || get(concepts);
    
    steps.push({ expression, result: null, explanation: 'Starting with the original expression' });
    
    // --- Preprocessing: Remove delimiters and replace operators --- 
    let processedExpression = expression;
    const trimmedExpression = expression.trim();
    if (trimmedExpression.startsWith('[%') && trimmedExpression.endsWith('%]')) {
        processedExpression = trimmedExpression.slice(2, -2);
        steps.push({ expression: processedExpression, result: null, explanation: 'Removed "[%" and "%]" delimiters' });
    } else {
        // If delimiters aren't exactly at start/end, assume it's not a delimited expression
        processedExpression = expression; 
    }
    
    const operatorReplacements = [
        { from: /\bAND\b/g, to: '&&' },
        { from: /\bOR\b/g, to: '||' },
        { from: /\bNOT\b/g, to: '!' }
    ];
    let operatorsReplaced = false;
    for (const { from, to } of operatorReplacements) {
        if (from.test(processedExpression)) {
            processedExpression = processedExpression.replace(from, to);
            operatorsReplaced = true;
        }
    }
    if (operatorsReplaced) {
        steps.push({ expression: processedExpression, result: null, explanation: 'Replaced English operators (AND, OR, NOT)' });
    }
    
    // --- Concept Substitution Logic for {CONCEPT} and {CONCEPT}.PROPERTY syntax ---
    
    // Regex captures: 1={CONCEPT}, 2=CONCEPT_NAME, 3=PROPERTY_NAME (optional, after })
    const conceptRegex = /(\{(\w+)\})(?:\.(\w+))?/g; 
    const placeholders = [];
    let match;

    // Find all potential matches first
    while ((match = conceptRegex.exec(processedExpression)) !== null) {
        placeholders.push({
            fullMatch: match[0],        // e.g., {CONCEPT}.COUNT or {CONCEPT}
            conceptPlaceholder: match[1], // e.g., {CONCEPT}
            conceptName: match[2],       // e.g., CONCEPT
            propertyName: match[3],      // e.g., COUNT or undefined
            index: match.index
        });
    }

    // Sort matches by index to process them in order of appearance
    placeholders.sort((a, b) => a.index - b.index);

    let lastIndex = 0;
    let builtString = "";
    let substitutionsMade = false;

    // Iteratively build the string with substitutions
    for (const { fullMatch, conceptName, propertyName, index } of placeholders) {
        // Add the substring from the end of the last match to the start of this one
        builtString += processedExpression.substring(lastIndex, index);

        const concept = conceptsSnapshot[conceptName];
        const isActive = concept?.isActive ?? false;
        let substitutionValue: string | number | boolean = false;
        let explanation = ``;

        explanation = `Match "${fullMatch}" at index ${index}: `;
        if (propertyName) {
            // Property Access (e.g., {CONCEPT}.COUNT)
            switch (propertyName.toUpperCase()) {
                case 'COUNT':
                    substitutionValue = isActive ? 1 : 0;
                    explanation += `Concept "${conceptName}" is ${isActive ? 'active' : 'inactive'}, .${propertyName} evaluates to ${substitutionValue}`;
                    break;
                case 'VALUE':
                    substitutionValue = isActive && concept ? concept.value : false;
                    explanation += `Concept "${conceptName}" is ${isActive ? 'active' : 'inactive'}, .${propertyName} evaluates to ${substitutionValue}`;
                    break;
                default:
                    substitutionValue = false; // Treat unknown properties as false
                    explanation += `Concept "${conceptName}" is ${isActive ? 'active' : 'inactive'}, unknown property ".${propertyName}". Evaluating as ${substitutionValue}`;
                    console.warn(`Unknown property ".${propertyName}" accessed for concept "${conceptName}" in expression: ${processedExpression}`);
            }
        } else {
            // Simple Concept Reference (e.g., {CONCEPT})
            substitutionValue = isActive;
            explanation += `Concept "${conceptName}" is ${isActive ? 'active' : 'inactive'}, evaluating as ${substitutionValue}`;
        }

        // Add the calculated substitution value to the built string
        builtString += String(substitutionValue);
        // Update the last index to the end of the current full match ({CONCEPT}.PROP or {CONCEPT})
        lastIndex = index + fullMatch.length; 
        substitutionsMade = true;

        // Add step for this substitution
        steps.push({
            expression: fullMatch, // Log the part that was matched and substituted
            result: typeof substitutionValue === 'boolean' ? substitutionValue : null,
            explanation: explanation,
            isSubExpression: true,
            conceptName,
            conceptValue: typeof substitutionValue === 'boolean' ? substitutionValue : undefined
        });
    }

    // Add any remaining part of the original string after the last match
    builtString += processedExpression.substring(lastIndex);

    let modifiedExpression = builtString; // The fully substituted string

    if (substitutionsMade) {
        steps.push({ expression: modifiedExpression, result: null, explanation: 'Expression after all concept substitutions' });
    }

    // --- Final Evaluation --- 
    // Convert single '=' to '==' for boolean comparison, avoiding (!=, ==, <=, >=)
    const finalExpressionString = modifiedExpression.replace(/([^=!><])=([^=])/g, '$1==$2');

    if (finalExpressionString !== modifiedExpression) {
         steps.push({ expression: finalExpressionString, result: null, explanation: 'Converted standalone = to == for comparison' });
    }


    let result: boolean;
    try {
        // Use new Function for safer evaluation than eval()
        result = new Function(`return ${finalExpressionString || 'false'}`)() === true; 
        steps.push({ expression: finalExpressionString, result, explanation: `Final evaluation result: ${result}` });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        steps.push({ expression: finalExpressionString, result: false, explanation: `Error evaluating final expression: ${errorMessage}` });
        console.error(`[evaluateConceptExpression] Error evaluating expression "${finalExpressionString}": ${errorMessage}`);
        result = false;
    }
    
    return { result, steps };
}

// Helper function to evaluate concept expressions (simplified version)
export function evaluateConceptExpression(expression: string, providedConcepts?: Record<string, Concept>): boolean {
    const { result } = evaluateConceptExpressionWithSteps(expression, providedConcepts);
    return result;
}

// Helper function to set concept value (typically not used directly, concepts are usually reactive)
export function setConceptValue(conceptId: string, value: boolean, isActive: boolean = true) {
    concepts.update(state => {
        const currentConcept = state[conceptId] || {};
        return {
            ...state,
            [conceptId]: { 
                ...currentConcept, 
                value, 
                isActive // Setting value often implies it should be active
            }
        };
    });
}

// Helper function to toggle concept active state
export function toggleConceptActive(conceptId: string) {
    concepts.update(state => {
        const currentConcept = state[conceptId];
        if (!currentConcept) return state; // Concept doesn't exist
        return {
            ...state,
            [conceptId]: { 
                ...currentConcept, 
                isActive: !currentConcept.isActive 
            }
        };
    });
}