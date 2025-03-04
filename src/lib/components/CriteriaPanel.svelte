<script lang="ts">
    import type { Tab } from '$lib/types';
    import { evaluateConceptExpression, debugMode } from '../stores';

    export let tab: Tab;

    $: visibleCriteria = tab.criteria.filter(criteria => 
        evaluateConceptExpression(criteria.visibilityExpression)
    );

    function handleCriterionChange(criterionId: string, value: any) {
        const criterion = tab.criteria.find(c => c.id === criterionId);
        if (criterion) {
            criterion.value = value;
        }
    }
</script>

<div class="space-y-4">
    {#each tab.criteria as criterion}
        <div class="flex items-start space-x-4">
            <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700">
                    {criterion.name}
                </label>
                {#if criterion.type === 'numeric'}
                    <div class="mt-1 flex rounded-md shadow-sm">
                        <input
                            type="number"
                            class="input-primary flex-1"
                            value={criterion.value}
                            on:input={(e) => handleCriterionChange(criterion.id, Number(e.currentTarget.value))}
                        />
                        {#if criterion.unit}
                            <span class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                {criterion.unit}
                            </span>
                        {/if}
                    </div>
                {:else if criterion.type === 'boolean'}
                    <div class="mt-1">
                        <label class="inline-flex items-center">
                            <input
                                type="checkbox"
                                class="form-checkbox h-4 w-4 text-primary-600"
                                checked={criterion.value}
                                on:change={(e) => handleCriterionChange(criterion.id, e.currentTarget.checked)}
                            />
                            <span class="ml-2 text-sm text-gray-700">Yes</span>
                        </label>
                    </div>
                {:else if criterion.type === 'select' && criterion.options}
                    <div class="mt-1">
                        <select
                            class="input-primary w-full"
                            value={criterion.value}
                            on:change={(e) => handleCriterionChange(criterion.id, e.currentTarget.value)}
                        >
                            <option value="">Select an option</option>
                            {#each criterion.options as option}
                                <option value={option}>{option}</option>
                            {/each}
                        </select>
                    </div>
                {/if}
            </div>
        </div>
    {/each}
</div>

<div class="criteria-panel">
    <h2>Patient Criteria</h2>
    {#if visibleCriteria.length > 0}
        <div class="criteria-list">
            {#each visibleCriteria as criteria}
                <div class="criteria-item">
                    <h3>{criteria.title}</h3>
                    <p>{criteria.description}</p>
                    {#if $debugMode}
                        <div class="debug-info">
                            <small>Expression: {criteria.visibilityExpression}</small>
                            <small>Result: {evaluateConceptExpression(criteria.visibilityExpression) ? 'true' : 'false'}</small>
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {:else}
        <div class="no-criteria">
            No criteria available for the current patient state
        </div>
    {/if}
</div>

<style>
    .criteria-panel {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    h2 {
        margin: 0;
        color: #2c3e50;
    }

    .criteria-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .criteria-item {
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
        border-left: 4px solid #3498db;
    }

    .criteria-item h3 {
        margin: 0 0 0.5rem 0;
        color: #2c3e50;
    }

    .criteria-item p {
        margin: 0;
        color: #666;
    }

    .debug-info {
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        border-top: 1px solid #ddd;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .debug-info small {
        color: #666;
    }

    .no-criteria {
        text-align: center;
        color: #666;
        padding: 2rem;
    }
</style> 