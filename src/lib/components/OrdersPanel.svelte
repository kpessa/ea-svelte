<script lang="ts">
    import type { Tab } from '$lib/types';
    import { evaluateConceptExpression, debugMode } from '../stores';

    export let tab: Tab;

    function evaluateOrders() {
        // TODO: Implement order evaluation logic based on criteria values
        return tab.orderSections;
    }

    $: visibleOrders = evaluateOrders();

    function toggleOrder(sectionId: string, orderId: string) {
        // TODO: Implement order selection logic
        console.log('Toggle order:', sectionId, orderId);
    }
</script>

<div class="space-y-6">
    {#each visibleOrders as section}
        <div>
            <h3 class="text-sm font-medium text-gray-900 mb-3">{section.name}</h3>
            <div class="space-y-2">
                {#each section.orders as order}
                    <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div class="flex-shrink-0">
                            {#if order.type === 'medication'}
                                <svg class="h-5 w-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            {:else if order.type === 'lab'}
                                <svg class="h-5 w-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            {:else}
                                <svg class="h-5 w-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            {/if}
                        </div>
                        <div class="flex-1">
                            <h4 class="text-sm font-medium text-gray-900">{order.name}</h4>
                            <p class="text-sm text-gray-500 mt-1">{order.details}</p>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/each}
</div>

<div class="orders-panel">
    <h2>Recommended Orders</h2>
    {#if visibleOrders.length > 0}
        <div class="order-actions">
            <button class="btn primary">Sign Orders</button>
        </div>
    {:else}
        <div class="no-orders">
            No orders available for the current patient state
        </div>
    {/if}
</div>

<style>
    .orders-panel {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    h2 {
        margin: 0;
        color: #2c3e50;
    }

    .order-sections {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .order-section {
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
        border-left: 4px solid #2ecc71;
    }

    .order-section h3 {
        margin: 0 0 1rem 0;
        color: #2c3e50;
    }

    .orders-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .order-item {
        padding: 0.5rem;
        background-color: white;
        border-radius: 4px;
    }

    .order-checkbox {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
    }

    .order-name {
        font-weight: 500;
        color: #2c3e50;
    }

    .order-description {
        margin: 0.25rem 0 0 1.5rem;
        font-size: 0.9rem;
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

    .order-actions {
        margin-top: auto;
        padding-top: 1rem;
        border-top: 1px solid #ddd;
    }

    .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        background-color: #3498db;
        color: white;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .btn:hover {
        background-color: #2980b9;
    }

    .no-orders {
        text-align: center;
        color: #666;
        padding: 2rem;
    }
</style> 