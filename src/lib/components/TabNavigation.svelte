<script lang="ts">
    import { config, selectedTab } from '$lib/stores';
</script>

<div class="border-b border-gray-200">
    <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        {#each $config.tabs as tab}
            <button
                class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    {$selectedTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                on:click={() => selectedTab.set(tab.id)}
            >
                {tab.name}
            </button>
        {/each}
    </nav>
</div>

<style>
    .tab-navigation {
        display: flex;
        gap: 0.5rem;
        padding: 0.5rem 0;
        border-bottom: 1px solid #ddd;
    }

    .tab-button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px 4px 0 0;
        background-color: #f0f0f0;
        cursor: pointer;
        transition: all 0.2s;
    }

    .tab-button:hover {
        background-color: #e0e0e0;
    }

    .tab-button.active {
        background-color: #3498db;
        color: white;
    }
</style> 