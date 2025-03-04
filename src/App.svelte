<script lang="ts">
  import { onMount } from 'svelte';
  import { config, selectedTab } from './lib/stores';
  import Navbar from './lib/components/Navbar.svelte';
  import TabNavigation from './lib/components/TabNavigation.svelte';
  import TabContent from './lib/components/TabContent.svelte';
  import './app.css';

  onMount(async () => {
    // TODO: Load configuration from file
    const mockConfig = {
      tabs: [
        {
          id: 'magnesium',
          name: 'Magnesium',
          criteria: [],
          orderSections: []
        },
        {
          id: 'potassium',
          name: 'Potassium',
          criteria: [],
          orderSections: []
        },
        {
          id: 'phosphate',
          name: 'Phosphate',
          criteria: [],
          orderSections: []
        }
      ],
      testCases: []
    };
    config.set(mockConfig);
    selectedTab.set('magnesium');
  });
</script>

<div class="min-h-screen bg-gray-50 flex flex-col">
  <Navbar />
  <main class="flex-1 container mx-auto px-4 py-6">
    <TabNavigation />
    <TabContent />
  </main>
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
