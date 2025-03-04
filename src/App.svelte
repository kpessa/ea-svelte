<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from './lib/components/Navbar.svelte';
  import TabNavigation from './lib/components/TabNavigation.svelte';
  import TabContent from './lib/components/TabContent.svelte';
  import ConfigEditor from './lib/components/ConfigEditor.svelte';
  import PatientHeader from './lib/components/PatientHeader.svelte';
  import TestPatientManager from './lib/components/TestPatientManager.svelte';
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

<div class="clinical-app">
  <div class="admin-controls bg-gray-100 p-2 flex justify-end space-x-2">
    <button
      class="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      on:click={toggleConfigEditor}
    >
      Edit Config
    </button>
    <button
      class="px-3 py-1 text-sm font-medium text-white bg-gray-600 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      on:click={toggleDebugMode}
    >
      {debugMode ? 'Disable Debug' : 'Enable Debug'}
    </button>
  </div>

  <PatientHeader />

  {#if error}
    <div class="p-4 mx-4 mt-4 text-sm text-red-700 bg-red-100 rounded-md">
      {error}
    </div>
  {/if}

  <TabNavigation {selectedTab} onTabChange={handleTabChange} />
  
  <div class="clinical-content">
    <TabContent {selectedTab} {debugMode} />
  </div>

  {#if showConfigEditor}
    <ConfigEditor onClose={toggleConfigEditor} />
  {/if}
  
  <TestPatientManager />
</div>

<style>
  .clinical-app {
    font-family: Arial, sans-serif;
    background-color: #f5f5f5;
    min-height: 100vh;
  }

  .clinical-content {
    padding: 0.5rem;
    background-color: white;
  }

  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
