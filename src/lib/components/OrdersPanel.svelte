<script lang="ts">
    import type { Tab, OrderSection } from '../types';
    import { configStore } from '../services/configService';
    import { evaluateConceptExpression, evaluateConceptExpressionWithSteps, type EvaluationStep, concepts } from '../stores';
    import ConceptStatusIndicator from './ConceptStatusIndicator.svelte';
    import { onMount } from 'svelte';
    import { EditorView, basicSetup } from 'codemirror';
    import { json } from '@codemirror/lang-json';
    import { linter, lintGutter } from '@codemirror/lint';

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
    
    // For inline section editing
    let sectionIndexToEdit: number | null = null;
    let editorContainer: HTMLElement | null = null;
    let editorView: EditorView | null = null;
    let editorContent: string = '';
    let jsonError: string | null = null;

    const jsonLinter = linter((view) => {
        try {
            JSON.parse(view.state.doc.toString());
            jsonError = null;
            return [];
        } catch (e) {
            jsonError = e instanceof Error ? e.message : 'Invalid JSON';
            return [{
                from: 0,
                to: view.state.doc.length,
                severity: 'error',
                message: jsonError
            }];
        }
    });

    // Listen for concept changes and automatically evaluate sections
    onMount(() => {
        // Add event listener for concept changes
        const handleConceptsApplied = (event: CustomEvent) => {
            evaluateOrderSections();
        };
        
        document.addEventListener('concepts-applied', handleConceptsApplied as EventListener);
        
        // Add listener for the evaluate-order-sections event
        document.addEventListener('evaluate-order-sections', (() => {
            evaluateOrderSections();
        }) as EventListener);
        
        return () => {
            document.removeEventListener('concepts-applied', handleConceptsApplied as EventListener);
            document.removeEventListener('evaluate-order-sections', (evaluateOrderSections as unknown) as EventListener);
        };
    });

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
    
    // Evaluate order sections based on concept expressions
    function evaluateOrderSections() {
        if (!currentTab) {
            return;
        }
        
        // Enable filtering
        filteringEnabled = true;
        
        // Get sections from the current tab
        const sections = currentTab.ORDER_SECTIONS || [];
        
        // Reset filtered sections
        filteredSections = {};
        hiddenSectionCount = 0;
        
        // Evaluate each section's concept expression
        sections.forEach((section: OrderSection, index: number) => {
            if (section.CONCEPT_NAME) {
                try {
                    const result = evaluateSectionExpression(section.CONCEPT_NAME);
                    filteredSections[index] = result;
                    
                    if (!result) {
                        hiddenSectionCount++;
                    }
                } catch (error) {
                    filteredSections[index] = false;
                    hiddenSectionCount++;
                }
            } else {
                filteredSections[index] = true;
            }
        });
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
    
    // Open inline section editor
    function editSection(sectionIndex: number) {
        if (!currentTab) return;
        
        // Close any existing editor first
        if (editorView) {
            editorView.destroy();
            editorView = null;
        }
        
        // Set the section to edit
        sectionIndexToEdit = sectionIndex;
        
        // We'll initialize the editor in the next render cycle
        // after the editor container is available in the DOM
        setTimeout(() => {
            if (editorContainer && sectionIndexToEdit !== null) {
                const section = orderSections[sectionIndexToEdit];
                editorContent = JSON.stringify(section, null, 2);
                
                editorView = new EditorView({
                    doc: editorContent,
                    extensions: [
                        basicSetup,
                        json(),
                        lintGutter(),
                        jsonLinter,
                        EditorView.theme({
                            '&': {
                                height: '300px',
                                fontSize: '14px'
                            },
                            '.cm-content': {
                                fontFamily: 'monospace'
                            },
                            '.cm-gutters': {
                                backgroundColor: '#f5f5f5',
                                borderRight: '1px solid #ddd'
                            }
                        })
                    ],
                    parent: editorContainer
                });
            }
        }, 0);
    }
    
    // Handle section update
    function handleSectionUpdate() {
        if (sectionIndexToEdit === null || !currentTab || !$configStore || !editorView) return;
        
        try {
            const content = editorView.state.doc.toString();
            const updatedSection = JSON.parse(content) as OrderSection;
            
            // Create a deep copy of the config
            const updatedConfig = JSON.parse(JSON.stringify($configStore));
            
            // Find the tab index
            const tabIndex = updatedConfig.RCONFIG.TABS.findIndex((tab: any) => tab.TAB_KEY === currentTab.TAB_KEY);
            if (tabIndex === -1) return;
            
            // Update the section
            updatedConfig.RCONFIG.TABS[tabIndex].ORDER_SECTIONS[sectionIndexToEdit] = updatedSection;
            
            // Update the store
            configStore.set(updatedConfig);
            
            // Close the editor
            closeSectionEditor();
            
            jsonError = null;
        } catch (error) {
            console.error('Failed to save section:', error);
            jsonError = error instanceof Error ? error.message : 'Failed to save section';
        }
    }
    
    // Close section editor
    function closeSectionEditor() {
        if (editorView) {
            editorView.destroy();
            editorView = null;
        }
        sectionIndexToEdit = null;
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
                {#if hiddenSectionCount > 0}
                    <span class="hidden-count">
                        ({hiddenSectionCount} section{hiddenSectionCount !== 1 ? 's' : ''} hidden)
                    </span>
                {/if}
            {/if}
            {#if debugMode}
                <button 
                    class="filter-btn debug-btn" 
                    on:click={() => console.log('Current concepts store:', $concepts)}
                    title="Log current concepts to console"
                >
                    Log Concepts
                </button>
            {/if}
        </div>
    </div>

    {#if orderSections.length > 0}
        <div class="order-sections">
            {#each orderSections as section, sectionIndex}
                {#if shouldShowSection(section.CONCEPT_NAME, sectionIndex)}
                    <div class="order-section" class:collapsed={collapsedSections[sectionIndex]}>
                        {#if debugMode}
                            <div class="concept-expression">
                                <span class="expression-text">{section.CONCEPT_NAME}</span>
                                <button 
                                    class="evaluate-btn"
                                    on:click={() => openEvaluationModal(section.CONCEPT_NAME)}
                                    title="Evaluate expression"
                                >
                                    🔍
                                </button>
                            </div>
                        {/if}
                        <div class="section-header">
                            <div class="section-controls">
                                <button 
                                    class="toggle-btn" 
                                    on:click={() => toggleSection(sectionIndex)}
                                    title={collapsedSections[sectionIndex] ? "Expand section" : "Collapse section"}
                                >
                                    {collapsedSections[sectionIndex] ? '▶' : '▼'}
                                </button>
                                <button 
                                    class="edit-btn" 
                                    on:click={() => editSection(sectionIndex)}
                                    title="Edit section"
                                >
                                    ✏️
                                </button>
                            </div>
                            <div class="section-title">
                                {@html section.SECTION_NAME}
                            </div>
                        </div>
                        
                        {#if !collapsedSections[sectionIndex]}
                            <div class="section-content">
                                {#if section.ORDERS && section.ORDERS.length > 0}
                                    <div class="orders-list">
                                        {#each section.ORDERS as order}
                                            <div class="order-item">
                                                <div class="order-checkbox">
                                                    <input 
                                                        type="checkbox" 
                                                        id={`order-${sectionIndex}-${order.MNEMONIC}`}
                                                        disabled={section.SINGLE_SELECT === 1}
                                                    />
                                                    <label for={`order-${sectionIndex}-${order.MNEMONIC}`}>
                                                        {order.ORDER_SENTENCE || order.MNEMONIC}
                                                    </label>
                                                </div>
                                                {#if order.ASC_SHORT_DESCRIPTION || order.COMMENT}
                                                    <div class="order-details">
                                                        {#if order.ASC_SHORT_DESCRIPTION}
                                                            <div class="order-description">
                                                                {order.ASC_SHORT_DESCRIPTION}
                                                            </div>
                                                        {/if}
                                                        {#if order.COMMENT}
                                                            <div class="order-comment">
                                                                {order.COMMENT}
                                                            </div>
                                                        {/if}
                                                    </div>
                                                {/if}
                                            </div>
                                        {/each}
                                    </div>
                                {:else}
                                    <div class="no-orders">
                                        No orders available in this section
                                    </div>
                                {/if}
                            </div>
                        {/if}
                        
                        <!-- Inline editor for this section -->
                        {#if sectionIndexToEdit === sectionIndex}
                            <div class="inline-editor-container">
                                <div class="inline-editor-header">
                                    <h3>Editing: {section.SECTION_NAME}</h3>
                                </div>
                                
                                {#if jsonError}
                                    <div class="json-error">
                                        {jsonError}
                                    </div>
                                {/if}
                                
                                <div class="editor-wrapper" bind:this={editorContainer}></div>
                                
                                <div class="inline-editor-actions">
                                    <button 
                                        class="cancel-btn" 
                                        on:click={closeSectionEditor}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        class="save-btn" 
                                        on:click={handleSectionUpdate}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        {/if}
                    </div>
                {/if}
            {/each}
        </div>
    {:else}
        <div class="no-sections">
            No order sections available
        </div>
    {/if}
</div>

{#if showEvaluationModal}
    <div class="evaluation-modal">
        <div class="evaluation-modal-content">
            <div class="evaluation-modal-header">
                <h3>Expression Evaluation</h3>
                <button class="close-btn" on:click={closeEvaluationModal}>×</button>
            </div>
            <div class="evaluation-modal-body">
                <div class="original-expression">
                    <strong>Original Expression:</strong> {currentExpression}
                </div>
                <div class="evaluation-result">
                    <strong>Result:</strong> <span class={evaluationResult ? 'true-result' : 'false-result'}>
                        {evaluationResult ? 'TRUE' : 'FALSE'}
                    </span>
                </div>
                <div class="evaluation-steps">
                    <h4>Evaluation Steps:</h4>
                    <div class="steps-list">
                        {#each evaluationSteps as step, index}
                            <div class="step-item" class:sub-expression={step.isSubExpression}>
                                <div class="step-number">{index + 1}.</div>
                                <div class="step-content">
                                    <div class="step-expression">
                                        {step.expression}
                                    </div>
                                    {#if step.result !== null}
                                        <div class="step-result" class:true-result={step.result} class:false-result={!step.result}>
                                            = {step.result ? 'TRUE' : 'FALSE'}
                                        </div>
                                    {/if}
                                    <div class="step-explanation">
                                        {step.explanation}
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .clinical-orders-panel {
        font-family: Arial, sans-serif;
        color: #333;
        height: 100%;
        overflow: auto;
        display: flex;
        flex-direction: column;
    }
    
    .orders-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background-color: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
        margin-bottom: 15px;
    }
    
    .concept-status {
        display: flex;
        align-items: center;
    }
    
    .filter-controls {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .filter-btn {
        padding: 4px 8px;
        font-size: 12px;
        border: 1px solid #ccc;
        background-color: #f0f0f0;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .filter-btn:hover {
        background-color: #e0e0e0;
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
    
    .concept-expression {
        font-size: 11px;
        color: #666;
        background-color: #f8f8f8;
        padding: 4px 8px;
        border-radius: 2px 2px 0 0;
        display: flex;
        align-items: center;
        gap: 4px;
        border-bottom: 1px dashed #ddd;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    .expression-text {
        font-family: monospace;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
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

    .order-item {
        display: block;
        padding: 8px;
        border-bottom: 1px solid #eee;
    }

    /* Style for blue highlighted text that appears in some order items */
    .order-item div[style*="background-color: rgb(230, 247, 255)"],
    .order-item div[style*="background-color:#e6f7ff"] {
        display: block;
        width: 100%;
        padding: 8px;
        margin: 5px 0;
        border-radius: 4px;
        border: 1px dashed #91d5ff;
        line-height: 1.5;
        white-space: normal;
        word-break: break-word;
    }

    .order-checkbox {
        display: flex;
        align-items: flex-start;
        margin-right: 0;
        width: 100%;
    }

    .order-checkbox input[type="checkbox"] {
        margin-top: 2px;
        margin-right: 8px;
        flex-shrink: 0;
    }

    .order-checkbox label {
        font-weight: bold;
        cursor: pointer;
        flex: 1;
        word-break: break-word;
        white-space: normal;
    }

    .order-details {
        flex: 1 1 100%;
        margin-left: 28px; /* Align with the text of the checkbox label */
        margin-top: 5px;
    }

    .order-description {
        font-size: 13px;
        color: #333;
        margin-top: 4px;
        display: block;
        width: 100%;
    }

    .order-comment {
        font-size: 12px;
        color: #555;
        margin-top: 5px;
        padding: 5px;
        background-color: #f9f9f9;
        border-left: 3px solid #ddd;
        display: block;
        width: 100%;
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
    
    .section-controls {
        display: flex;
        gap: 4px;
        margin-right: 8px;
    }
    
    .toggle-btn, .edit-btn, .evaluate-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 12px;
        padding: 2px;
        color: #666;
    }
    
    .toggle-btn:hover, .edit-btn:hover, .evaluate-btn:hover {
        color: #333;
    }
    
    .section-header {
        display: flex;
        align-items: center;
        padding: 8px;
        background-color: #f0f0f0;
        border-bottom: 1px solid #ddd;
    }
    
    .expression-text {
        font-family: monospace;
    }
    
    .evaluation-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .evaluation-modal-content {
        background-color: white;
        border-radius: 4px;
        width: 80%;
        max-width: 800px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .evaluation-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #e5e5e5;
    }
    
    .evaluation-modal-header h3 {
        margin: 0;
        font-size: 18px;
    }
    
    .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #666;
    }
    
    .close-btn:hover {
        color: #333;
    }
    
    .evaluation-modal-body {
        padding: 16px;
        overflow-y: auto;
    }
    
    .original-expression {
        margin-bottom: 12px;
        padding: 8px;
        background-color: #f8f8f8;
        border-radius: 4px;
        font-family: monospace;
    }
    
    .evaluation-result {
        margin-bottom: 16px;
        padding: 8px;
        background-color: #f0f0f0;
        border-radius: 4px;
    }
    
    .true-result {
        color: #22c55e;
        font-weight: bold;
    }
    
    .false-result {
        color: #ef4444;
        font-weight: bold;
    }
    
    .evaluation-steps h4 {
        margin-top: 0;
        margin-bottom: 8px;
    }
    
    .steps-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .step-item {
        display: flex;
        padding: 8px;
        background-color: #f8f8f8;
        border-radius: 4px;
    }
    
    .sub-expression {
        margin-left: 24px;
        background-color: #edf2f7;
        border-left: 3px solid #cbd5e0;
    }
    
    .step-number {
        margin-right: 8px;
        font-weight: bold;
        color: #666;
    }
    
    .step-content {
        flex-grow: 1;
    }
    
    .step-expression {
        font-family: monospace;
        margin-bottom: 4px;
    }
    
    .step-result {
        font-weight: bold;
        margin-bottom: 4px;
    }
    
    .step-explanation {
        color: #666;
        font-size: 12px;
    }
    
    .filter-controls {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .filter-btn:hover {
        background-color: #e0e0e0;
    }
    
    .evaluate-sections-btn {
        background-color: #3b82f6;
        color: white;
        border-color: #2563eb;
    }
    
    .evaluate-sections-btn:hover {
        background-color: #2563eb;
    }
    
    .show-all-btn {
        background-color: #6b7280;
        color: white;
        border-color: #4b5563;
    }
    
    .show-all-btn:hover {
        background-color: #4b5563;
    }
    
    .hidden-count {
        font-size: 12px;
        color: #666;
    }
    
    .orders-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        background-color: #f8f8f8;
        border-bottom: 1px solid #ddd;
    }
    
    /* Inline editor styles */
    .inline-editor-container {
        border-top: 1px solid #ddd;
        background-color: #f8f8f8;
        padding: 15px;
        margin-top: 0;
    }
    
    .inline-editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }
    
    .inline-editor-header h3 {
        margin: 0;
        font-size: 16px;
        color: #333;
    }
    
    .editor-wrapper {
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: white;
        height: 300px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .inline-editor-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 12px;
    }
    
    .save-btn, .cancel-btn {
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        border: 1px solid transparent;
        transition: background-color 0.2s;
    }
    
    .save-btn {
        background-color: #4caf50;
        color: white;
    }
    
    .save-btn:hover {
        background-color: #45a049;
    }
    
    .cancel-btn {
        background-color: #f44336;
        color: white;
    }
    
    .cancel-btn:hover {
        background-color: #d32f2f;
    }
    
    .json-error {
        padding: 10px;
        margin-bottom: 12px;
        background-color: #ffebee;
        color: #c62828;
        border-radius: 4px;
        font-size: 14px;
        border-left: 4px solid #ef5350;
    }
    
    /* Make sure the editor is visible */
    :global(.cm-editor) {
        height: 100%;
    }
    
    :global(.cm-scroller) {
        overflow: auto;
    }

    .order-sections {
        padding: 0 5px;
        overflow: auto;
        flex: 1;
    }

    /* Add styles to properly handle HTML content in section titles */
    .section-title :global(br) {
        display: block;
        content: "";
        margin-top: 5px;
    }
    
    .section-title :global(p) {
        display: block;
        margin: 5px 0;
    }
    
    .section-title :global(p[style*="text-indent"]) {
        display: block;
        margin-top: 5px;
    }
    
    .section-title :global(p:first-child) {
        margin-top: 0;
    }
    
    .section-title :global(p:last-child) {
        margin-bottom: 0;
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
</style> 