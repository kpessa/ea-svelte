<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from './lib/components/Navbar.svelte';
  import TabNavigation from './lib/components/TabNavigation.svelte';
  import TabContent from './lib/components/TabContent.svelte';
  import ConfigEditor from './lib/components/ConfigEditor.svelte';
  import PatientHeader from './lib/components/PatientHeader.svelte';
  import TestPatientManager from './lib/components/TestPatientManager.svelte';
  import ConceptManager from './lib/components/ConceptManager.svelte';
  import ConceptTestManager from './lib/components/ConceptTestManager.svelte';
  import { ConfigService, configStore } from './lib/services/configService';
  import type { Tab } from './lib/types';
  import './app.css';
  import ConceptStatusIndicator from './lib/components/ConceptStatusIndicator.svelte';

  let showConfigEditor = false;
  let selectedTab: Tab = 'MAGNESIUM';
  let error: string | null = null;
  let debugMode = false;
  let showConceptTestManager = false;

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
  
  function toggleConceptTestManager() {
    showConceptTestManager = !showConceptTestManager;
  }
</script>

<div class="clinical-app">
  <div class="admin-controls bg-gray-100 p-2 flex justify-end space-x-2">
    <div class="flex-grow flex items-center">
      <ConceptStatusIndicator />
    </div>
    <button
      class="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      on:click={toggleConfigEditor}
    >
      Edit Config
    </button>
    <button
      class="px-3 py-1 text-sm font-medium text-white bg-purple-600 rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      on:click={toggleConceptTestManager}
    >
      Concept Test Framework
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
  
  {#if showConceptTestManager}
    <div class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Concept Test Framework</h2>
          <button class="close-button" on:click={toggleConceptTestManager}>×</button>
        </div>
        <div class="modal-body">
          <ConceptTestManager />
        </div>
      </div>
    </div>
  {/if}
  
  <TestPatientManager />
  <ConceptManager />
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
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 4px;
    width: 90%;
    height: 90%;
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e5e5e5;
  }
  
  .modal-header h2 {
    margin: 0;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }
  
  .close-button:hover {
    color: #333;
  }
  
  .modal-body {
    flex: 1;
    overflow: auto;
    padding: 0;
  }
</style>
