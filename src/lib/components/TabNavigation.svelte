<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { NavigationTab } from '../types';
    import { configStore } from '../services/configService';

    export let selectedTab: string | undefined;

    const dispatch = createEventDispatcher<{ tabChange: string }>();

    $: tabs = ($configStore?.RCONFIG.TABS || []) as NavigationTab[];

    function handleClick(tabKey: string) {
        dispatch('tabChange', tabKey);
    }
</script>

<nav class="clinical-tabs bg-gray-100 border-b-2 border-clinical-blue">
    <div class="tabs-container flex" role="tablist">
        {#each tabs as tab}
            {#if tab && tab.TAB_KEY && tab.TAB_NAME}
                <button
                    role="tab"
                    aria-selected={selectedTab === tab.TAB_KEY}
                    class="tab-button {selectedTab === tab.TAB_KEY ? 'active' : ''} px-4 py-2 text-sm font-medium rounded-t-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-clinical-blue focus:ring-opacity-50"
                    on:click={() => handleClick(tab.TAB_KEY)}
                >
                    {tab.TAB_NAME}
                </button>
            {/if}
        {/each}
    </div>
</nav>

<style>
    .clinical-tabs {
        background-color: var(--color-gray-100);
    }

    .tab-button {
        background-color: #e0e0e0;
        border: 1px solid #ccc;
        border-bottom: none;
        border-radius: 4px 4px 0 0;
        margin-right: 2px;
        margin-bottom: -1px;
        color: #333;
        cursor: pointer;
        font-family: var(--font-sans);
        position: relative;
        top: 1px;
    }

    .tab-button:hover {
        background-color: #d0d0d0;
    }

    .tab-button.active {
        background-color: var(--color-clinical-blue, #0056b3);
        color: white;
        border-color: var(--color-clinical-blue, #0056b3);
        font-weight: bold;
    }
</style> 