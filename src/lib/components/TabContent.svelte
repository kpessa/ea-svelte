<script lang="ts">
    import type { Tab } from '../types';
    import CriteriaPanel from './CriteriaPanel.svelte';
    import OrdersPanel from './OrdersPanel.svelte';

    export let selectedTab: Tab;
    export let debugMode = false;
</script>

<div class="mt-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <CriteriaPanel {selectedTab} />
        </div>
        <div>
            <OrdersPanel {selectedTab} {debugMode} />
        </div>
    </div>
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