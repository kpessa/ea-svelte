<script lang="ts">
    import type { Tab } from '../types';
    import { configStore } from '../services/configService';
    import { evaluateConceptExpression, evaluateConceptExpressionWithSteps, type EvaluationStep } from '../stores';
    import ConceptStatusIndicator from './ConceptStatusIndicator.svelte';

    export let selectedTab: Tab;
    export let debugMode = false;

    $: currentTab = $configStore?.RCONFIG.TABS.find(tab => tab.TAB_KEY === selectedTab);
    $: orderSections = currentTab?.ORDER_SECTIONS || [];
    $: enabledCriteria = currentTab?.CRITERIA.filter(c => c.enabled) || [];

    // Track which sections are collapsed
    let collapsedSections: Record<number, boolean> = {};
    
    // For concept expression evaluation
    let showEvaluationModal = false;
    let currentExpression = '';
    let evaluationResult: boolean | null = null;
    let evaluationSteps: EvaluationStep[] = [];
    
    // For section filtering
    let filteringEnabled = false;
    let filteredSections: Record<number, boolean> = {};
    let hiddenSectionCount = 0;

    function toggleSection(sectionIndex: number): void {
        collapsedSections[sectionIndex] = !collapsedSections[sectionIndex];
        collapsedSections = {...collapsedSections}; // Trigger reactivity
    }

    // Evaluate if a section should be shown based on its concept expression
    function shouldShowSection(conceptName: string, sectionIndex: number): boolean {
        if (!filteringEnabled) return true;
        return filteredSections[sectionIndex] !== false;
    }

    // Evaluate concept expression using the store function
    function evaluateSectionExpression(expression: string): boolean {
        return evaluateConceptExpression(expression);
    }
    
    function openEvaluationModal(expression: string) {
        currentExpression = expression;
        const { result, steps } = evaluateConceptExpressionWithSteps(expression);
        evaluationResult = result;
        evaluationSteps = steps;
        showEvaluationModal = true;
    }
    
    function closeEvaluationModal() {
        showEvaluationModal = false;
    }
    
    // Filter sections based on concept expressions
    function evaluateOrderSections() {
        filteringEnabled = true;
        hiddenSectionCount = 0;
        
        // Evaluate each section's concept expression
        orderSections.forEach((section, index) => {
            const isVisible = evaluateSectionExpression(section.CONCEPT_NAME);
            filteredSections[index] = isVisible;
            
            if (!isVisible) {
                hiddenSectionCount++;
            }
        });
        
        // Force reactivity
        filteredSections = {...filteredSections};
    }
    
    // Show all sections
    function showAllSections() {
        filteringEnabled = false;
        hiddenSectionCount = 0;
        filteredSections = {};
    }
    
    // Reset filtering when tab changes
    $: if (selectedTab) {
        showAllSections();
    }
</script>

<div class="clinical-orders-panel">
    <div class="orders-panel-header">
        <div class="concept-status">
            <ConceptStatusIndicator />
        </div>
        <div class="filter-controls">
            <button 
                class="filter-btn evaluate-sections-btn" 
                on:click={evaluateOrderSections}
                title="Show only sections with true concept expressions"
            >
                Evaluate Order Sections
            </button>
            {#if filteringEnabled}
                <button 
                    class="filter-btn show-all-btn" 
                    on:click={showAllSections}
                    title="Show all order sections"
                >
                    Show All Orders
                </button>
                <div class="filter-status">
                    {hiddenSectionCount} section{hiddenSectionCount !== 1 ? 's' : ''} hidden
                </div>
            {/if}
        </div>
    </div>

    {#if orderSections.length > 0}
        <div class="order-sections">
            {#each orderSections as section, i}
                {@const isConceptTrue = evaluateSectionExpression(section.CONCEPT_NAME)}
                {#if shouldShowSection(section.CONCEPT_NAME, i)}
                    {#if debugMode}
                        <div class="debug-section">
                            <div class="section-title">Debug: {section.SECTION_NAME}</div>
                            <div class="section-content">
                                <div class="debug-info">
                                    <div class="debug-expression-item">
                                        <span class="debug-label">Expression:</span>
                                        <code>{section.CONCEPT_NAME}</code>
                                        <button 
                                            class="evaluate-btn"
                                            on:click={() => openEvaluationModal(section.CONCEPT_NAME)}
                                        >
                                            Evaluate
                                        </button>
                                    </div>
                                    <div class="debug-expression-item">
                                        <span class="debug-label">Evaluation:</span>
                                        {#if isConceptTrue}
                                            <span class="concept-true">True</span>
                                        {:else}
                                            <span class="concept-false">False</span>
                                        {/if}
                                    </div>
                                    <div class="debug-expression-item">
                                        <span class="debug-label">Orders:</span>
                                        <span>{section.ORDERS?.length || 0}</span>
                                    </div>
                                    <div class="debug-expression-item">
                                        <span class="debug-label">Single Select:</span>
                                        <span>{section.SINGLE_SELECT === 1 ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/if}
                    <div class="order-section {isConceptTrue ? '' : 'concept-false-section'}">
                        <div class="section-header">
                            <div class="section-title-row">
                                <div class="section-title">
                                    {@html section.SECTION_NAME}
                                    {#if debugMode || filteringEnabled}
                                        <span class="concept-indicator {isConceptTrue ? 'true' : 'false'}" 
                                              title="Concept expression evaluates to {isConceptTrue ? 'true' : 'false'}">
                                            {isConceptTrue ? '✓' : '✗'}
                                        </span>
                                    {/if}
                                </div>
                                <div class="section-controls">
                                    <button class="edit-button">Edit</button>
                                    <button class="collapse-button" on:click={() => toggleSection(i)}>
                                        {collapsedSections[i] ? '▼' : '▲'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {#if !collapsedSections[i]}
                            <div class="section-content">
                                {#if section.ORDERS && section.ORDERS.length > 0}
                                    <div class="orders-list">
                                        {#each section.ORDERS as order}
                                            <div class="order-item">
                                                <div class="order-checkbox">
                                                    {#if section.SINGLE_SELECT === 1}
                                                        <input type="radio" name={`section-${i}`} class="radio-input" />
                                                    {:else}
                                                        <input type="checkbox" class="checkbox-input" />
                                                    {/if}
                                                </div>
                                                <div class="order-details">
                                                    <div class="order-name">{order.MNEMONIC}</div>
                                                    <div class="order-sentence">{order.ORDER_SENTENCE}</div>
                                                    {#if order.COMMENT}
                                                        <div class="order-comment">
                                                            {@html order.COMMENT}
                                                        </div>
                                                    {/if}
                                                </div>
                                            </div>
                                        {/each}
                                    </div>
                                {:else}
                                    <div class="no-orders">
                                        No orders in this section
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    </div>
                {/if}
            {/each}
        </div>
        
        {#if filteringEnabled && hiddenSectionCount > 0}
            <div class="hidden-sections-info">
                {hiddenSectionCount} section{hiddenSectionCount !== 1 ? 's' : ''} hidden based on concept evaluation.
                <button class="show-all-link" on:click={showAllSections}>
                    Show all sections
                </button>
            </div>
        {/if}
    {:else}
        <div class="no-orders-available">
            No orders available
        </div>
    {/if}
</div>

{#if showEvaluationModal}
    <div class="evaluation-modal-overlay">
        <div class="evaluation-modal">
            <div class="evaluation-modal-header">
                <h3>Expression Evaluation</h3>
                <button class="close-btn" on:click={closeEvaluationModal}>×</button>
            </div>
            <div class="evaluation-modal-body">
                <div class="expression-container">
                    <h4>Expression:</h4>
                    <code class="expression-code">{currentExpression}</code>
                </div>
                
                {#if evaluationResult !== null}
                    <div class="evaluation-result">
                        <span class="result-label">Result:</span>
                        <span class="result-value {evaluationResult ? 'true' : 'false'}">
                            {evaluationResult ? 'True' : 'False'}
                        </span>
                    </div>
                {/if}
                
                {#if evaluationSteps.length > 0}
                    <div class="evaluation-steps">
                        <h4>Step-by-Step Evaluation</h4>
                        <div class="steps-container">
                            {#each evaluationSteps as step, index}
                                <div class="evaluation-step {step.isSubExpression ? 'sub-expression' : ''}">
                                    <div class="step-number">{index + 1}</div>
                                    <div class="step-content">
                                        <div class="step-explanation">{step.explanation}</div>
                                        <div class="step-expression">
                                            {#if step.isSubExpression}
                                                <span class="concept-name">{step.conceptName}</span>: 
                                                <span class="concept-value {step.result ? 'true' : 'false'}">
                                                    {step.result ? 'True' : 'False'}
                                                </span>
                                            {:else}
                                                <code>{step.expression}</code>
                                                {#if step.result !== null}
                                                    <span class="result-indicator {step.result ? 'true' : 'false'}">
                                                        {step.result ? 'True' : 'False'}
                                                    </span>
                                                {/if}
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    .clinical-orders-panel {
        font-family: Arial, sans-serif;
        color: #333;
    }
    
    .orders-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background-color: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
        margin-bottom: 10px;
    }
    
    .concept-status {
        display: flex;
        align-items: center;
    }
    
    .filter-controls {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .filter-btn {
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        border: 1px solid transparent;
        transition: all 0.2s;
    }
    
    .evaluate-sections-btn {
        background-color: #4caf50;
        color: white;
        border-color: #43a047;
    }
    
    .evaluate-sections-btn:hover {
        background-color: #43a047;
    }
    
    .show-all-btn {
        background-color: #2196f3;
        color: white;
        border-color: #1e88e5;
    }
    
    .show-all-btn:hover {
        background-color: #1e88e5;
    }
    
    .filter-status {
        font-size: 12px;
        color: #666;
        padding: 4px 8px;
        background-color: #f1f1f1;
        border-radius: 4px;
    }
    
    .hidden-sections-info {
        margin-top: 15px;
        padding: 10px;
        background-color: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 4px;
        font-size: 14px;
        color: #666;
        text-align: center;
    }
    
    .show-all-link {
        background: none;
        border: none;
        color: #2196f3;
        cursor: pointer;
        font-weight: 500;
        text-decoration: underline;
        margin-left: 5px;
    }
    
    .concept-indicator {
        display: inline-block;
        width: 16px;
        height: 16px;
        line-height: 16px;
        text-align: center;
        border-radius: 50%;
        font-size: 10px;
        margin-left: 5px;
    }
    
    .concept-indicator.true {
        background-color: #e8f5e9;
        color: #2e7d32;
    }
    
    .concept-indicator.false {
        background-color: #ffebee;
        color: #c62828;
    }
    
    .concept-false-section {
        opacity: 0.8;
    }

    .ordered-by-section, .debug-section {
        border: 1px solid #ccc;
        margin-bottom: 10px;
    }

    .section-title {
        font-weight: bold;
        padding: 5px;
        display: flex;
        align-items: center;
    }

    .ordered-by-section .section-title, .debug-section .section-title {
        background-color: #f0f0f0;
        border-bottom: 1px solid #ccc;
    }

    .debug-section .section-title {
        background-color: #e6f7ff;
        color: #0056b3;
    }

    .ordered-by-section .section-content, .debug-section .section-content {
        padding: 5px;
    }

    .debug-info {
        font-size: 12px;
        font-family: Arial, sans-serif;
    }

    .debug-expression-item {
        margin-bottom: 5px;
        display: flex;
        align-items: center;
    }

    .debug-label {
        font-weight: bold;
        margin-right: 5px;
        min-width: 100px;
    }

    code {
        font-family: monospace;
        background-color: #f5f5f5;
        padding: 2px 4px;
        border-radius: 3px;
        font-size: 11px;
    }

    .order-section {
        border: 1px solid #ccc;
        margin-bottom: 20px;
        transition: opacity 0.3s, transform 0.3s;
    }

    .section-header {
        background-color: #f0f0f0;
        border-bottom: 1px solid #ccc;
    }

    .section-title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px;
    }

    .section-controls {
        display: flex;
        gap: 5px;
    }

    .edit-button, .collapse-button {
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        padding: 2px 5px;
        font-size: 12px;
        cursor: pointer;
    }

    .edit-button:hover, .collapse-button:hover {
        background-color: #e0e0e0;
    }

    .section-content {
        padding: 5px;
    }

    .orders-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .order-item {
        display: flex;
        padding: 5px;
        border-bottom: 1px solid #eee;
    }

    .order-checkbox {
        margin-right: 10px;
        display: flex;
        align-items: flex-start;
        padding-top: 3px;
    }

    .checkbox-input, .radio-input {
        width: 16px;
        height: 16px;
    }

    .order-details {
        flex: 1;
    }

    .order-name {
        font-weight: bold;
        margin-bottom: 3px;
    }

    .order-sentence {
        font-size: 13px;
        margin-bottom: 3px;
    }

    .order-comment {
        font-size: 12px;
        color: #555;
        margin-top: 5px;
        padding: 5px;
        background-color: #f9f9f9;
        border-left: 3px solid #ddd;
    }

    .concept-true {
        color: green;
        font-weight: bold;
    }

    .concept-false {
        color: red;
        font-weight: bold;
    }

    .no-orders, .no-orders-available {
        padding: 10px;
        text-align: center;
        color: #666;
    }

    .evaluate-btn {
        margin-left: 10px;
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
    
    /* Evaluation Modal Styles */
    .evaluation-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .evaluation-modal {
        background-color: white;
        border-radius: 5px;
        width: 90%;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    }
    
    .evaluation-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #eee;
        position: sticky;
        top: 0;
        background-color: white;
        z-index: 10;
    }
    
    .evaluation-modal-header h3 {
        margin: 0;
        font-size: 1.2rem;
    }
    
    .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
    }
    
    .evaluation-modal-body {
        padding: 20px;
    }
    
    .expression-container {
        margin-bottom: 20px;
    }
    
    .expression-container h4 {
        margin-top: 0;
        margin-bottom: 10px;
    }
    
    .expression-code {
        display: block;
        padding: 10px;
        background-color: #f8f9fa;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-family: monospace;
        font-size: 1rem;
        white-space: pre-wrap;
        word-break: break-word;
    }
    
    .evaluation-result {
        margin-bottom: 20px;
        padding: 10px;
        border-radius: 4px;
        background-color: #f5f5f5;
    }
    
    .result-label {
        font-weight: bold;
        margin-right: 10px;
    }
    
    .result-value {
        font-weight: bold;
        padding: 2px 5px;
        border-radius: 3px;
    }
    
    .result-value.true, .concept-true {
        background-color: #e8f5e9;
        color: #2e7d32;
    }
    
    .result-value.false, .concept-false {
        background-color: #ffebee;
        color: #c62828;
    }
    
    .evaluation-steps {
        margin-top: 10px;
    }
    
    .evaluation-steps h4 {
        margin-top: 0;
        margin-bottom: 10px;
    }
    
    .steps-container {
        max-height: 400px;
        overflow-y: auto;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: white;
    }
    
    .evaluation-step {
        padding: 12px;
        border-bottom: 1px solid #eee;
        display: flex;
        align-items: flex-start;
    }
    
    .evaluation-step:last-child {
        border-bottom: none;
    }
    
    .evaluation-step.sub-expression {
        margin-left: 20px;
        background-color: #f9f9f9;
        border-left: 3px solid #2196f3;
    }
    
    .step-number {
        font-weight: bold;
        margin-right: 10px;
        background-color: #2196f3;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    
    .step-content {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }
    
    .step-explanation {
        margin-bottom: 5px;
        color: #555;
        font-style: italic;
    }
    
    .step-expression {
        font-family: monospace;
        font-size: 1rem;
        padding: 5px;
        background-color: #f5f5f5;
        border-radius: 3px;
        display: flex;
        align-items: center;
    }
    
    .concept-name {
        font-weight: bold;
        color: #2196f3;
    }
    
    .concept-value {
        margin-left: 5px;
        padding: 2px 5px;
        border-radius: 3px;
        font-weight: bold;
    }
    
    .result-indicator {
        margin-left: 10px;
        padding: 2px 5px;
        border-radius: 3px;
        font-weight: bold;
    }
    
    .result-indicator.true {
        background-color: #e8f5e9;
        color: #2e7d32;
    }
    
    .result-indicator.false {
        background-color: #ffebee;
        color: #c62828;
    }
</style> 