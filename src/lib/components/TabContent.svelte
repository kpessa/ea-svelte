<script lang="ts">
    import { config, selectedTab } from '$lib/stores';
    import CriteriaPanel from './CriteriaPanel.svelte';
    import OrdersPanel from './OrdersPanel.svelte';
</script>

<div class="mt-6">
    {#if $config}
        {#each $config.tabs as tab}
            {#if $selectedTab === tab.id}
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white rounded-lg shadow">
                        <div class="px-4 py-5 sm:p-6">
                            <h2 class="text-lg font-medium text-gray-900 mb-4">Criteria</h2>
                            <CriteriaPanel {tab} />
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow">
                        <div class="px-4 py-5 sm:p-6">
                            <h2 class="text-lg font-medium text-gray-900 mb-4">Orders</h2>
                            <OrdersPanel {tab} />
                        </div>
                    </div>
                </div>
            {/if}
        {/each}
    {/if}
</div>

<style>
    .tab-content {
        flex: 1;
        overflow: hidden;
    }

    .split-panel {
        display: flex;
        height: 100%;
        gap: 1rem;
    }

    .panel {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .no-tab-selected {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: #666;
        font-size: 1.2rem;
    }
</style> 