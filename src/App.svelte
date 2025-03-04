<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from './lib/components/Navbar.svelte';
  import TabNavigation from './lib/components/TabNavigation.svelte';
  import TabContent from './lib/components/TabContent.svelte';
  import ConfigEditor from './lib/components/ConfigEditor.svelte';
  import { ConfigService, configStore } from './lib/services/configService';
  import type { Tab } from './lib/types';
  import './app.css';

  let showConfigEditor = false;
  let selectedTab: Tab = 'MAGNESIUM';
  let error: string | null = null;
  let debugMode = false;

  onMount(async () => {
    try {
      const config = await ConfigService.loadConfig('/config.json');
      // Set initial tab to first available tab if exists
      if (config.RCONFIG.TABS.length > 0) {
        selectedTab = config.RCONFIG.TABS[0].TAB_KEY;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load configuration';
      console.error('Error loading configuration:', err);
    }
  });

  function handleTabChange(tab: Tab) {
    selectedTab = tab;
  }

  function toggleConfigEditor() {
    showConfigEditor = !showConfigEditor;
  }

  function toggleDebugMode() {
    debugMode = !debugMode;
    console.log('Debug mode:', debugMode);
  }
</script>

<div class="min-h-screen bg-gray-50">
  <Navbar>
    <div slot="actions" class="flex space-x-2">
      <button
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        on:click={toggleConfigEditor}
      >
        Edit Config
      </button>
      <button
        class="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        on:click={toggleDebugMode}
      >
        {debugMode ? 'Disable Debug' : 'Enable Debug'}
      </button>
    </div>
  </Navbar>

  {#if error}
    <div class="p-4 mx-4 mt-4 text-sm text-red-700 bg-red-100 rounded-md">
      {error}
    </div>
  {/if}

  {#if debugMode}
    <div class="p-4 mx-4 mt-4 text-sm text-blue-700 bg-blue-100 rounded-md">
      <h3 class="font-bold">Debug Information</h3>
      <p>Selected Tab: {selectedTab}</p>
      <p>Config Loaded: {$configStore ? 'Yes' : 'No'}</p>
      {#if $configStore}
        <p>Tabs Available: {$configStore.RCONFIG.TABS.length}</p>
        <p>Current Tab Criteria: {$configStore.RCONFIG.TABS.find(t => t.TAB_KEY === selectedTab)?.CRITERIA.length || 0}</p>
        <p>Current Tab Order Sections: {$configStore.RCONFIG.TABS.find(t => t.TAB_KEY === selectedTab)?.ORDER_SECTIONS.length || 0}</p>
      {/if}
    </div>
  {/if}

  <main class="container mx-auto px-4 py-8">
    <TabNavigation {selectedTab} onTabChange={handleTabChange} />
    <TabContent {selectedTab} {debugMode} />
  </main>

  {#if showConfigEditor}
    <ConfigEditor onClose={toggleConfigEditor} />
  {/if}
</div>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f5f5f5;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    overflow: hidden;
  }
</style>
