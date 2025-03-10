<script lang="ts">
    import type { TabConfig, OrderSection, Concept } from '../types';
    import { configStore } from '../services/configService';
    import { evaluateConceptExpression, concepts, toggleConceptActive } from '../stores';
    import GlobalConceptIndicator from './GlobalConceptIndicator.svelte';
    import OrderSectionComponent from './OrderSection.svelte';
    import OrderEditor from './OrderEditor.svelte';
    import ConceptExpressionPanel from './ConceptExpressionPanel.svelte';
    import { onMount, createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let selectedTab: string;
    export let debugMode = false;

    $: currentTab = $configStore?.RCONFIG.TABS.find(tab => tab.TAB_KEY === selectedTab) as TabConfig | undefined;
    $: orderSections = currentTab?.ORDER_SECTIONS || [];
    $: enabledCriteria = currentTab?.CRITERIA?.filter(c => c.enabled) || [];

    // Track which sections are collapsed
    let collapsedSections: Record<number, boolean> = {};
    
    // For concept expression evaluation
    let showExpressionPanel = false;
    let currentExpression = '';
    let configExpressions: { expression: string, path: string }[] = [];
    
    // For section filtering
    let filteringEnabled = false;
    let filteredSections: Record<number, boolean> = {};
    let hiddenSectionCount = 0;
    
    // Force reactivity when filtering state changes
    $: filteredSectionsState = { filteringEnabled, sections: filteredSections, count: hiddenSectionCount };
    
    // For inline section editing
    let sectionIndexToEdit: number | null = null;

    // Listen for concept changes and automatically evaluate sections
    onMount(() => {
        // Add event listener for concept changes
        const handleConceptsApplied = (event: CustomEvent) => {
            // Only evaluate sections without enabling filtering
            evaluateSectionsWithoutFiltering();
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
    function shouldShowSection(conceptName: string | undefined, sectionIndex: number): boolean {
        if (!filteredSectionsState.filteringEnabled) {
            return true;
        }
        
        // Only show sections that explicitly evaluated to true
        const shouldShow = filteredSectionsState.sections[sectionIndex] === true;
        return shouldShow;
    }

    // Evaluate concept expression using the store function
    function evaluateSectionExpression(expression: string): boolean {
        // If the expression doesn't have delimiters but should, add them
        if (!expression.includes('[%') && !expression.includes('%]')) {
            expression = `[%${expression}%]`;
        }
        
        // Use the current concepts state for evaluation
        const result = evaluateConceptExpression(expression, $concepts);
        console.log(`Evaluating expression: ${expression} => ${result}`);
        return result;
    }
    
    function openExpressionPanel(expression: string) {
        currentExpression = expression;
        configExpressions = [{ expression, path: 'Current Expression' }];
        showExpressionPanel = true;
    }
    
    function closeExpressionPanel() {
        showExpressionPanel = false;
        currentExpression = '';
        configExpressions = [];
    }
    
    // Evaluate order sections based on concept expressions
    function evaluateOrderSections() {
        if (!currentTab) {
            return;
        }
        
        // Create a new object for filtered sections to trigger reactivity
        const newFilteredSections: Record<number, boolean> = {};
        let newHiddenCount = 0;
        
        // Evaluate each section's concept expression
        orderSections.forEach((section: OrderSection, index: number) => {
            if (section.CONCEPT_NAME) {
                try {
                    const result = evaluateSectionExpression(section.CONCEPT_NAME);
                    newFilteredSections[index] = result;
                    
                    console.log(`Section ${index}: "${section.SECTION_NAME}" - Expression: ${section.CONCEPT_NAME} - Result: ${result}`);
                    
                    if (!result) {
                        newHiddenCount++;
                    }
                } catch (error) {
                    newFilteredSections[index] = false;
                    console.log(`Section ${index}: "${section.SECTION_NAME}" - Expression: ${section.CONCEPT_NAME} - Error evaluating`);
                    newHiddenCount++;
                }
            } else {
                newFilteredSections[index] = true;
                console.log(`Section ${index}: "${section.SECTION_NAME}" - No expression - Showing by default`);
            }
        });

        console.log('Filtered sections:', newFilteredSections);
        console.log('Hidden count:', newHiddenCount);

        // Update the state with new objects to trigger reactivity
        filteredSections = newFilteredSections;
        hiddenSectionCount = newHiddenCount;
        
        // Enable filtering AFTER we've evaluated all sections
        filteringEnabled = true;
    }
    
    // Show all sections
    function showAllSections() {
        console.log('Showing all sections');
        filteringEnabled = false;
        hiddenSectionCount = 0;
        filteredSections = {};
    }
    
    // Reset filtering when tab changes
    $: if (selectedTab) {
        showAllSections();
    }
    
    // Handle section update
    function handleSectionUpdate(event: CustomEvent<{ section: OrderSection }>) {
        if (!currentTab || !$configStore || sectionIndexToEdit === null) return;
        
        try {
            // Create a deep copy of the config
            const updatedConfig = JSON.parse(JSON.stringify($configStore));
            
            // Find the tab index
            const tabIndex = updatedConfig.RCONFIG.TABS.findIndex((tab: TabConfig) => tab.TAB_KEY === currentTab?.TAB_KEY);
            if (tabIndex === -1) return;
            
            // Update the section
            updatedConfig.RCONFIG.TABS[tabIndex].ORDER_SECTIONS[sectionIndexToEdit] = event.detail.section;
            
            // Update the store
            configStore.set(updatedConfig);
            
            // Close the editor
            sectionIndexToEdit = null;
        } catch (error) {
            console.error('Failed to save section:', error);
        }
    }

    function handleToggleConcept(event: CustomEvent<{ conceptName: string, newConcept: Concept | undefined }>) {
        const { conceptName, newConcept } = event.detail;
        
        // Update the concept in the store
        concepts.update(state => {
            const newState = { ...state };
            if (newConcept === undefined) {
                delete newState[conceptName];
            } else {
                newState[conceptName] = newConcept;
            }
            return newState;
        });
        
        // Re-evaluate sections after concept toggle, but don't enable filtering
        // if it's not already enabled
        evaluateSectionsWithoutFiltering();
    }
    
    // Evaluate sections without enabling filtering
    function evaluateSectionsWithoutFiltering() {
        if (!currentTab) {
            return;
        }
        
        // Create a new object for filtered sections to trigger reactivity
        const newFilteredSections: Record<number, boolean> = {};
        let newHiddenCount = 0;
        
        // Evaluate each section's concept expression
        orderSections.forEach((section: OrderSection, index: number) => {
            if (section.CONCEPT_NAME) {
                try {
                    const result = evaluateSectionExpression(section.CONCEPT_NAME);
                    newFilteredSections[index] = result;
                    
                    console.log(`Section ${index}: "${section.SECTION_NAME}" - Expression: ${section.CONCEPT_NAME} - Result: ${result}`);
                    
                    if (!result) {
                        newHiddenCount++;
                    }
                } catch (error) {
                    newFilteredSections[index] = false;
                    console.log(`Section ${index}: "${section.SECTION_NAME}" - Expression: ${section.CONCEPT_NAME} - Error evaluating`);
                    newHiddenCount++;
                }
            } else {
                newFilteredSections[index] = true;
                console.log(`Section ${index}: "${section.SECTION_NAME}" - No expression - Showing by default`);
            }
        });

        console.log('Filtered sections:', newFilteredSections);
        console.log('Hidden count:', newHiddenCount);

        // Update the state with new objects to trigger reactivity
        filteredSections = newFilteredSections;
        hiddenSectionCount = newHiddenCount;
        
        // Don't change the filtering state - keep it as is
    }
</script>

<div class="clinical-orders-panel h-full flex flex-col">
    <div class="orders-panel-header flex-none">
        <div class="concept-status">
            <GlobalConceptIndicator />
        </div>
        <div class="filter-controls">
            <button 
                class="filter-btn filter-sections-btn {filteredSectionsState.filteringEnabled ? 'active' : ''}" 
                on:click={() => filteredSectionsState.filteringEnabled ? showAllSections() : evaluateOrderSections()}
                title={filteredSectionsState.filteringEnabled ? "Show all sections" : "Show only sections with true expressions"}
            >
                Filter Sections
            </button>
            {#if filteredSectionsState.filteringEnabled && filteredSectionsState.count > 0}
                <span class="hidden-count">
                    ({filteredSectionsState.count} section{filteredSectionsState.count !== 1 ? 's' : ''} hidden)
                </span>
            {/if}
            <button 
                class="filter-btn debug-btn {debugMode ? 'active' : ''}" 
                on:click={() => {
                    debugMode = !debugMode;
                    dispatch('toggleDebug', { debugMode });
                }}
                title="Toggle debug mode"
            >
                {debugMode ? 'Debug: On' : 'Debug: Off'}
            </button>
        </div>
    </div>

    {#if orderSections.length > 0}
        <div class="order-sections flex-1 overflow-auto">
            {#key filteredSectionsState}
                {#each orderSections as section, sectionIndex}
                    {@const shouldShow = shouldShowSection(section.CONCEPT_NAME, sectionIndex)}
                    {#if shouldShow}
                        <OrderSectionComponent
                            {section}
                            {sectionIndex}
                            isCollapsed={collapsedSections[sectionIndex]}
                            {debugMode}
                            on:toggle={({ detail }) => toggleSection(detail.sectionIndex)}
                            on:edit={({ detail }) => sectionIndexToEdit = detail.sectionIndex}
                            on:evaluate={({ detail }) => openExpressionPanel(detail.expression)}
                            on:toggleConcept={handleToggleConcept}
                        />
                        
                        {#if sectionIndexToEdit === sectionIndex}
                            <OrderEditor
                                {section}
                                sectionName={section.SECTION_NAME}
                                on:save={handleSectionUpdate}
                                on:cancel={() => sectionIndexToEdit = null}
                            />
                        {/if}
                    {/if}
                {/each}
            {/key}
        </div>
    {:else}
        <div class="no-sections flex-1">
            No order sections available
        </div>
    {/if}
</div>

{#if showExpressionPanel}
    <div class="expression-panel-overlay">
        <div class="expression-panel-container">
            <div class="expression-panel-header">
                <h3>Expression Evaluator</h3>
                <button class="close-btn" on:click={closeExpressionPanel}>×</button>
            </div>
            <div class="expression-panel-content">
                <ConceptExpressionPanel
                    conceptsSnapshot={$concepts}
                    {configExpressions}
                    on:toggleConcept={handleToggleConcept}
                />
            </div>
        </div>
    </div>
{/if}

<style>
    .clinical-orders-panel {
        font-family: Arial, sans-serif;
        color: #333;
        background-color: white;
    }
    
    .orders-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background-color: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
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
    
    .filter-sections-btn {
        background-color: #f8f9fa;
        color: #6b7280;
        border: 1px solid #e5e7eb;
        font-weight: normal;
        transition: all 0.2s ease;
    }
    
    .filter-sections-btn:hover {
        background-color: #f3f4f6;
        border-color: #d1d5db;
    }
    
    .filter-sections-btn.active {
        background-color: #e5e7eb;
        color: #111827;
        border-color: #d1d5db;
        font-weight: bold;
    }
    
    .filter-sections-btn.active:hover {
        background-color: #d1d5db;
    }
    
    .show-all-btn {
        background-color: #2196f3;
        color: white;
        border-color: #1e88e5;
    }
    
    .show-all-btn:hover {
        background-color: #1e88e5;
    }
    
    .hidden-count {
        font-size: 12px;
        color: #666;
    }

    .debug-btn {
        background-color: #6b7280;
        color: white;
        border-color: #4b5563;
        margin-left: auto;
    }
    
    .debug-btn:hover {
        background-color: #4b5563;
    }
    
    .debug-btn.active {
        background-color: #3b82f6;
        border-color: #2563eb;
    }
    
    .debug-btn.active:hover {
        background-color: #2563eb;
    }

    .order-sections {
        padding: 0 5px;
    }

    .no-sections {
        padding: 10px;
        text-align: center;
        color: #666;
    }

    .expression-panel-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .expression-panel-container {
        width: 90%;
        max-width: 800px;
        max-height: 90vh;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
    }

    .expression-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid #e5e7eb;
    }

    .expression-panel-header h3 {
        margin: 0;
        font-size: 18px;
        color: #111827;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        color: #6b7280;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
    }

    .close-btn:hover {
        background-color: #f3f4f6;
        color: #374151;
    }

    .expression-panel-content {
        padding: 16px;
        overflow-y: auto;
        flex: 1;
    }
</style> 