<script lang="ts">
    import type { Tab } from '../types';
    import { configStore } from '../services/configService';

    export let selectedTab: Tab;
    export let debugMode = false;

    $: currentTab = $configStore?.RCONFIG.TABS.find(tab => tab.TAB_KEY === selectedTab);
    $: orderSections = currentTab?.ORDER_SECTIONS || [];
    $: enabledCriteria = currentTab?.CRITERIA.filter(c => c.enabled) || [];

    // Track which sections are collapsed
    let collapsedSections: Record<number, boolean> = {};

    function toggleSection(sectionIndex: number): void {
        collapsedSections[sectionIndex] = !collapsedSections[sectionIndex];
        collapsedSections = {...collapsedSections}; // Trigger reactivity
    }

    // Evaluate if a section should be shown based on its concept expression
    function shouldShowSection(conceptName: string): boolean {
        // For demo purposes, we'll just show all sections
        // In a real implementation, this would evaluate the concept expression
        return true;
    }

    // For demo purposes, we'll simulate concept evaluation
    function evaluateConceptExpression(expression: string): boolean {
        // This is a simplified evaluation for demo purposes
        // In a real app, you would parse and evaluate the expression
        return true;
    }
</script>

<div class="clinical-orders-panel">

    {#if orderSections.length > 0}
        <div class="order-sections">
            {#each orderSections as section, i}
                {@const isConceptTrue = evaluateConceptExpression(section.CONCEPT_NAME)}
                {#if shouldShowSection(section.CONCEPT_NAME)}
                    {#if debugMode}
                        <div class="debug-section">
                            <div class="section-title">Debug: {section.SECTION_NAME}</div>
                            <div class="section-content">
                                <div class="debug-info">
                                    <div class="debug-expression-item">
                                        <span class="debug-label">Expression:</span>
                                        <code>{section.CONCEPT_NAME}</code>
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
                    <div class="order-section">
                        <div class="section-header">
                            <div class="section-title-row">
                                <div class="section-title">
                                    {@html section.SECTION_NAME}
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
    {:else}
        <div class="no-orders-available">
            No orders available
        </div>
    {/if}
</div>

<style>
    .clinical-orders-panel {
        font-family: Arial, sans-serif;
        color: #333;
    }

    .ordered-by-section, .debug-section {
        border: 1px solid #ccc;
        margin-bottom: 10px;
    }

    .section-title {
        font-weight: bold;
        padding: 5px;
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
</style> 