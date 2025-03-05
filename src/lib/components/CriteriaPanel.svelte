<script lang="ts">
    import type { Tab, Criterion } from '../types';
    import { configStore } from '../services/configService';
    import { onMount } from 'svelte';
    import { EditorView, basicSetup } from 'codemirror';
    import { json } from '@codemirror/lang-json';
    import { linter, lintGutter } from '@codemirror/lint';

    export let selectedTab: Tab;
    export let debugMode = false;

    $: currentTab = $configStore?.RCONFIG.TABS.find(tab => tab.TAB_KEY === selectedTab);
    $: criteria = currentTab?.CRITERIA || [];
    
    // For tooltips
    let activeTooltip: string | null = null;
    
    // For inline editing
    let criterionIndexToEdit: number | null = null;
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
    
    // Listen for concept changes and refresh the criteria panel
    onMount(() => {
        const handleConceptsApplied = (event: CustomEvent) => {
            // Force a refresh of the criteria display
            criteria = [...criteria];
        };
        
        document.addEventListener('concepts-applied', handleConceptsApplied as EventListener);
        
        return () => {
            document.removeEventListener('concepts-applied', handleConceptsApplied as EventListener);
        };
    });
    
    function showTooltip(criterionId: string) {
        activeTooltip = criterionId;
    }
    
    function hideTooltip() {
        activeTooltip = null;
    }
    
    // Open inline criterion editor
    function editCriterion(criterionIndex: number) {
        if (!currentTab) return;
        
        // Close any existing editor first
        if (editorView) {
            editorView.destroy();
            editorView = null;
        }
        
        // Set the criterion to edit
        criterionIndexToEdit = criterionIndex;
        
        // We'll initialize the editor in the next render cycle
        // after the editor container is available in the DOM
        setTimeout(() => {
            if (editorContainer && criterionIndexToEdit !== null) {
                const criterion = criteria[criterionIndexToEdit];
                editorContent = JSON.stringify(criterion, null, 2);
                
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
    
    // Handle criterion update
    function handleCriterionUpdate() {
        if (criterionIndexToEdit === null || !currentTab || !$configStore || !editorView) return;
        
        try {
            const content = editorView.state.doc.toString();
            const updatedCriterion = JSON.parse(content) as Criterion;
            
            // Create a deep copy of the config
            const updatedConfig = JSON.parse(JSON.stringify($configStore));
            
            // Find the tab index
            const tabIndex = updatedConfig.RCONFIG.TABS.findIndex((tab: any) => tab.TAB_KEY === currentTab.TAB_KEY);
            if (tabIndex === -1) return;
            
            // Update the criterion
            updatedConfig.RCONFIG.TABS[tabIndex].CRITERIA[criterionIndexToEdit] = updatedCriterion;
            
            // Update the store
            configStore.set(updatedConfig);
            
            // Close the editor
            closeCriterionEditor();
            
            jsonError = null;
        } catch (error) {
            console.error('Failed to save criterion:', error);
            jsonError = error instanceof Error ? error.message : 'Failed to save criterion';
        }
    }
    
    // Close criterion editor
    function closeCriterionEditor() {
        if (editorView) {
            editorView.destroy();
            editorView = null;
        }
        criterionIndexToEdit = null;
    }
</script>

<div class="criteria-panel card shadow-md rounded-lg overflow-hidden">
    <div class="criteria-header bg-gray-100 p-3 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-lg font-medium text-gray-800">Criteria</h2>
        {#if debugMode}
            <span class="badge badge-info">Debug Mode</span>
        {/if}
    </div>
    
    <div class="criteria-body p-3">
        {#if !criteria || criteria.length === 0}
            <div class="text-center py-4 text-gray-500">
                No criteria defined for this tab.
            </div>
        {:else}
            <div class="space-y-3">
                {#each criteria as criterion, index}
                    <div 
                        class="criterion-item bg-white border border-gray-200 rounded-md p-3 hover:shadow-sm transition-shadow duration-200 relative"
                        on:mouseenter={() => showTooltip(criterion.LABEL)}
                        on:mouseleave={hideTooltip}
                    >
                        <div class="flex justify-between items-start">
                            <div class="criterion-name font-medium text-gray-700 mb-1">
                                {criterion.LABEL}
                            </div>
                            <button 
                                class="text-gray-500 hover:text-primary-600 p-1 rounded-full hover:bg-gray-100 transition-colors duration-150"
                                on:click={() => editCriterion(index)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                        </div>
                        
                        {#if criterion.DISPLAY}
                            <div class="criterion-value text-sm text-gray-600">
                                <span class="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">
                                    {criterion.DISPLAY}
                                </span>
                            </div>
                        {/if}
                        
                        {#if activeTooltip === criterion.LABEL && criterion.TOOLTIP}
                            <div class="tooltip-container">
                                <div class="tooltip-content">
                                    {criterion.TOOLTIP}
                                </div>
                            </div>
                        {/if}
                        
                        {#if debugMode && criterion.CONCEPT_NAME}
                            <div class="criterion-expression mt-2 p-2 bg-gray-50 rounded border border-gray-200 text-xs font-mono overflow-x-auto">
                                <div class="text-gray-500 mb-1 text-xs">Concept:</div>
                                <code class="text-gray-800">{criterion.CONCEPT_NAME}</code>
                            </div>
                        {/if}
                        
                        <!-- Inline editor for this criterion -->
                        {#if criterionIndexToEdit === index}
                            <div class="inline-editor mt-3 pt-3 border-t border-gray-200">
                                <div class="mb-2 flex justify-between items-center">
                                    <h4 class="text-sm font-medium text-gray-700">Editing: {criterion.LABEL}</h4>
                                </div>
                                
                                <div class="mb-3">
                                    <div bind:this={editorContainer} class="border border-gray-300 rounded-md h-48"></div>
                                    {#if jsonError}
                                        <div class="mt-2 text-sm text-red-600">{jsonError}</div>
                                    {/if}
                                </div>
                                
                                <div class="flex justify-end space-x-2">
                                    <button 
                                        class="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-150"
                                        on:click={closeCriterionEditor}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        class="px-3 py-1 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors duration-150"
                                        on:click={handleCriterionUpdate}
                                        disabled={!!jsonError}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    .criteria-panel {
        background-color: white;
        height: 100%;
        overflow-y: auto;
    }
    
    .criterion-item {
        transition: all var(--transition-fast);
    }
    
    .criterion-item:hover {
        border-color: var(--color-primary-300);
    }
    
    .inline-editor {
        animation: fadeIn 0.2s ease-in-out;
    }
    
    .tooltip-container {
        position: absolute;
        top: 100%;
        left: 0;
        z-index: 10;
        margin-top: 5px;
        animation: fadeIn 0.2s ease-in-out;
    }
    
    .tooltip-content {
        background-color: #333;
        color: white;
        padding: 6px 10px;
        border-radius: 4px;
        font-size: 12px;
        max-width: 250px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        white-space: normal;
        word-wrap: break-word;
    }
    
    .tooltip-content::before {
        content: '';
        position: absolute;
        top: -5px;
        left: 10px;
        border-width: 0 5px 5px;
        border-style: solid;
        border-color: transparent transparent #333;
    }
    
    /* CodeMirror custom styling */
    :global(.cm-editor) {
        height: 100%;
        font-family: var(--font-mono);
        font-size: 14px;
    }
    
    :global(.cm-gutters) {
        background-color: var(--color-gray-50);
        border-right: 1px solid var(--color-gray-200);
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
</style> 