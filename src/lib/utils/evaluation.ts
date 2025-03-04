import type { Criterion, Order, OrderSection, EvaluationResult } from '$lib/types';

export function evaluateNumericCriterion(criterion: Criterion): EvaluationResult {
    if (criterion.value === undefined) {
        return {
            visible: false,
            reason: 'Value is required'
        };
    }

    const value = criterion.value as number;

    if (criterion.validation) {
        if (criterion.validation.min !== undefined && value < criterion.validation.min) {
            return {
                visible: false,
                reason: `Value must be at least ${criterion.validation.min}`
            };
        }

        if (criterion.validation.max !== undefined && value > criterion.validation.max) {
            return {
                visible: false,
                reason: `Value must be at most ${criterion.validation.max}`
            };
        }
    }

    return { visible: true };
}

export function evaluateBooleanCriterion(criterion: Criterion): EvaluationResult {
    if (criterion.value === undefined) {
        return {
            visible: false,
            reason: 'Value is required'
        };
    }

    return { visible: true };
}

export function evaluateSelectCriterion(criterion: Criterion): EvaluationResult {
    if (criterion.value === undefined || criterion.value === '') {
        return {
            visible: false,
            reason: 'Value is required'
        };
    }

    if (criterion.options && !criterion.options.includes(criterion.value as string)) {
        return {
            visible: false,
            reason: 'Invalid option selected'
        };
    }

    return { visible: true };
}

export function evaluateCriterion(criterion: Criterion): EvaluationResult {
    switch (criterion.type) {
        case 'numeric':
            return evaluateNumericCriterion(criterion);
        case 'boolean':
            return evaluateBooleanCriterion(criterion);
        case 'select':
            return evaluateSelectCriterion(criterion);
        default:
            return {
                visible: false,
                reason: 'Invalid criterion type'
            };
    }
}

export function evaluateOrderVisibility(
    order: Order,
    criteria: Criterion[]
): EvaluationResult {
    if (!order.visibilityExpression) {
        return { visible: true };
    }

    // TODO: Implement expression evaluation logic
    // For now, we'll just check if all referenced criteria are valid
    const referencedCriteria = order.visibilityExpression.match(/\$[a-zA-Z0-9_]+/g) || [];
    
    for (const ref of referencedCriteria) {
        const criterionId = ref.substring(1); // Remove the $ prefix
        const criterion = criteria.find(c => c.id === criterionId);
        
        if (!criterion) {
            return {
                visible: false,
                reason: `Referenced criterion "${criterionId}" not found`
            };
        }

        const result = evaluateCriterion(criterion);
        if (!result.visible) {
            return result;
        }
    }

    return { visible: true };
}

export function evaluateOrderSectionVisibility(
    section: OrderSection,
    criteria: Criterion[]
): EvaluationResult {
    if (!section.visibilityExpression) {
        return { visible: true };
    }

    // TODO: Implement expression evaluation logic
    // For now, we'll just check if all referenced criteria are valid
    const referencedCriteria = section.visibilityExpression.match(/\$[a-zA-Z0-9_]+/g) || [];
    
    for (const ref of referencedCriteria) {
        const criterionId = ref.substring(1); // Remove the $ prefix
        const criterion = criteria.find(c => c.id === criterionId);
        
        if (!criterion) {
            return {
                visible: false,
                reason: `Referenced criterion "${criterionId}" not found`
            };
        }

        const result = evaluateCriterion(criterion);
        if (!result.visible) {
            return result;
        }
    }

    return { visible: true };
} 