<script lang="ts">
    import type { OrderSection, Concept } from '../types';
    import { createEventDispatcher } from 'svelte';
    import OrderItem from './OrderItem.svelte';
    import ConceptIndicator from './ConceptIndicator.svelte';
    import { concepts, evaluateConceptExpression } from '../stores';

    const dispatch = createEventDispatcher<{
        edit: { sectionIndex: number };
        evaluate: { expression: string };
        toggle: { sectionIndex: number };
        toggleConcept: { conceptName: string, newConcept: Concept | undefined };
    }>();

    export let section: OrderSection;
    export let sectionIndex: number;
    export let isCollapsed = false;
    export let debugMode = false;

    // Extract concept dependencies from expression
    function extractConceptsFromExpression(expression: string): string[] {
        if (!expression) return [];
        // Extract concepts between curly braces
        const conceptRegex = /\{([^{}]+)\}/g;
        const matches: string[] = [];
        let match;
        
        while ((match = conceptRegex.exec(expression)) !== null) {
            const conceptName = match[1].trim();
            if (!matches.includes(conceptName)) {
                matches.push(conceptName);
            }
        }
        return matches;
    }

    $: conceptDependencies = debugMode ? extractConceptsFromExpression(section.CONCEPT_NAME) : [];
    $: evaluationResult = debugMode && section.CONCEPT_NAME ? evaluateConceptExpression(section.CONCEPT_NAME, $concepts) : null;

    function toggleSection() {
        dispatch('toggle', { sectionIndex });
    }

    function editSection() {
        dispatch('edit', { sectionIndex });
    }

    function evaluateExpression(expression: string) {
        dispatch('evaluate', { expression });
    }

    function handleConceptToggle(event: CustomEvent<{ name: string, newConcept: Concept | undefined }>) {
        dispatch('toggleConcept', { conceptName: event.detail.name, newConcept: event.detail.newConcept });
    }
</script>

<div class="order-section" class:collapsed={isCollapsed}>
    {#if debugMode && section.CONCEPT_NAME}
        <div class="debug-info">
            <div class="concept-expression">
                <span class="expression-text">{section.CONCEPT_NAME}</span>
                <span class="evaluation-result {evaluationResult ? 'true' : 'false'}">
                    {evaluationResult ? 'True' : 'False'}
                </span>
                <button 
                    class="evaluate-btn"
                    on:click={() => evaluateExpression(section.CONCEPT_NAME)}
                    title="Evaluate expression"
                >
                    🔍
                </button>
            </div>
            {#if conceptDependencies.length > 0}
                <div class="concept-dependencies">
                    <span class="dependencies-label">Concepts in Expression:</span>
                    <div class="dependencies-list">
                        {#each conceptDependencies as concept}
                            <ConceptIndicator 
                                conceptName={concept}
                                concept={$concepts[concept]}
                                showValue={false}
                                showName={true}
                                size="small"
                                interactive={true}
                                on:toggle={handleConceptToggle}
                            />
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    {/if}
    <div class="section-header">
        <div class="section-controls">
            <button 
                class="toggle-btn" 
                on:click={toggleSection}
                title={isCollapsed ? "Expand section" : "Collapse section"}
            >
                {isCollapsed ? '▶' : '▼'}
            </button>
            <button 
                class="edit-btn" 
                on:click={editSection}
                title="Edit section"
            >
                ✏️
            </button>
        </div>
        <div class="section-title">
            {@html section.SECTION_NAME}
        </div>
    </div>
    
    {#if !isCollapsed}
        <div class="section-content">
            {#if section.ORDERS && section.ORDERS.length > 0}
                <div class="orders-list">
                    {#each section.ORDERS as order}
                        <OrderItem
                            {order}
                            {sectionIndex}
                            isSingleSelect={section.SINGLE_SELECT === 1}
                        />
                    {/each}
                </div>
            {:else}
                <div class="no-orders">
                    No orders available in this section
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .order-section {
        border: 1px solid #ddd;
        margin-bottom: 15px;
        border-radius: 4px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        background-color: white;
    }
    
    .order-section.collapsed {
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
    }

    .debug-info {
        background-color: #f8f8f8;
        border-bottom: 1px dashed #ddd;
        padding: 8px;
    }

    .concept-expression {
        font-size: 11px;
        color: #666;
        display: flex;
        align-items: center;
        gap: 4px;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-bottom: 8px;
    }
    
    .expression-text {
        font-family: monospace;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
    }

    .concept-dependencies {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .dependencies-label {
        font-size: 11px;
        font-weight: bold;
        color: #555;
    }

    .dependencies-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .section-header {
        display: flex;
        align-items: flex-start;
        padding: 8px 12px;
        background-color: #f0f0f0;
        border-bottom: 1px solid #ddd;
    }

    .section-controls {
        display: flex;
        gap: 4px;
        margin-right: 8px;
        flex: 0 0 auto;
        padding-top: 2px;
    }

    .section-title {
        flex-grow: 1;
        font-weight: bold;
        font-size: 14px;
        color: #333;
        display: block;
        padding: 0;
        line-height: 1.4;
    }

    .toggle-btn, .edit-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
        padding: 2px 4px;
        color: #666;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .toggle-btn:hover, .edit-btn:hover {
        color: #333;
        background-color: rgba(0, 0, 0, 0.05);
        border-radius: 3px;
    }

    .section-content {
        padding: 10px;
    }

    .orders-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .evaluate-btn {
        padding: 2px 8px;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-size: 11px;
    }
    
    .evaluate-btn:hover {
        background-color: #45a049;
    }

    .no-orders {
        padding: 10px;
        text-align: center;
        color: #666;
    }

    .evaluation-result {
        padding: 2px 6px;
        border-radius: 3px;
        font-weight: bold;
        font-size: 10px;
        text-transform: uppercase;
    }

    .evaluation-result.true {
        background-color: #e8f5e9;
        color: #2e7d32;
    }

    .evaluation-result.false {
        background-color: #ffebee;
        color: #c62828;
    }
</style> 