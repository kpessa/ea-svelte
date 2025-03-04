<script lang="ts">
    import type { Tab } from '../types';
    import { configStore } from '../services/configService';

    export let selectedTab: Tab;
    export let debugMode = false;

    $: currentTab = $configStore?.RCONFIG.TABS.find(tab => tab.TAB_KEY === selectedTab);
    $: orderSections = currentTab?.ORDER_SECTIONS || [];
    $: enabledCriteria = currentTab?.CRITERIA.filter(c => c.enabled) || [];

    // Evaluate if a section should be shown based on its concept expression
    // This is a simplified version - in a real app, you would evaluate the expression
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

<div class="orders-panel">
    <h2 class="text-xl font-semibold mb-4">{currentTab?.TAB_NAME || ''} Orders</h2>
    {#if orderSections.length > 0}
        <div class="space-y-6">
            {#each orderSections as section}
                {@const isConceptTrue = evaluateConceptExpression(section.CONCEPT_NAME)}
                {#if shouldShowSection(section.CONCEPT_NAME)}
                    <div class="bg-white shadow rounded-lg p-6 border-t-4 border-blue-500 hover:shadow-lg transition-shadow duration-200">
                        {#if debugMode}
                            <div class="flex items-center justify-between mb-2">
                                <div class="text-xs font-mono bg-gray-100 p-2 rounded overflow-x-auto border border-gray-200 flex-1 mr-2">
                                    <code class="text-purple-600">{section.CONCEPT_NAME}</code>
                                </div>
                                <div class="flex-shrink-0">
                                    {#if isConceptTrue}
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <svg class="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                                                <circle cx="4" cy="4" r="3" />
                                            </svg>
                                            True
                                        </span>
                                    {:else}
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            <svg class="-ml-0.5 mr-1.5 h-2 w-2 text-red-400" fill="currentColor" viewBox="0 0 8 8">
                                                <circle cx="4" cy="4" r="3" />
                                            </svg>
                                            False
                                        </span>
                                    {/if}
                                </div>
                            </div>
                        {/if}
                        <h3 class="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                            {@html section.SECTION_NAME}
                        </h3>
                        <div class="space-y-4">
                            {#if section.ORDERS && section.ORDERS.length > 0}
                                {#each section.ORDERS as order}
                                    <div class="border-l-4 border-green-500 bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors duration-200 shadow-sm">
                                        <div class="flex items-start">
                                            <div class="flex-1">
                                                <p class="text-sm font-medium text-gray-900">{order.MNEMONIC}</p>
                                                <p class="mt-1 text-sm text-gray-600">{order.ORDER_SENTENCE}</p>
                                                {#if order.COMMENT}
                                                    <div class="mt-2 text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                                                        {@html order.COMMENT}
                                                    </div>
                                                {/if}
                                            </div>
                                            <div class="ml-4">
                                                <input 
                                                    type="checkbox" 
                                                    class="form-checkbox h-5 w-5 text-blue-600"
                                                    disabled={section.SINGLE_SELECT === 1 && false} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                {/each}
                            {:else}
                                <div class="text-center text-gray-500 py-4 bg-gray-50 rounded-lg">
                                    No orders in this section
                                </div>
                            {/if}
                        </div>
                    </div>
                {/if}
            {/each}
        </div>
    {:else}
        <div class="text-center text-gray-500 py-8 bg-white shadow rounded-lg">
            No orders available
        </div>
    {/if}
</div>

<style>
    :global(.form-checkbox) {
        border-radius: 0.25rem;
        border-color: #d1d5db;
    }

    :global(.form-checkbox:focus) {
        outline: none;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
        border-color: #3b82f6;
    }
</style> 