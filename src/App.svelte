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
  import LabInput from './lib/components/LabInput.svelte';
  import { ConfigService, configStore, currentConfigName } from './lib/services/configService';
  import { ConceptExtractionService } from './lib/services/conceptExtractionService';
  import { concepts, setConceptValue } from './lib/stores';
  import type { ElectrolyteTab, Concept, Config } from './lib/types';
  import './app.css';
  import ConceptStatusIndicator from './lib/components/ConceptStatusIndicator.svelte';
  import CriteriaPanel from './lib/components/CriteriaPanel.svelte';

  let showConfigEditor = false;
  let configEditorFullScreen = false;
  let selectedTab: ElectrolyteTab = 'MAGNESIUM';
  let error: string | null = null;
  let debugMode = false;
  let showConceptTestManager = false;
  let showConceptManager = false;

  onMount(async () => {
    try {
      const loadedConfig = await ConfigService.loadConfig('/config.json');
      if (loadedConfig) {
            // Set initial tab
            if (loadedConfig.RCONFIG?.TABS?.length > 0) {
                selectedTab = loadedConfig.RCONFIG.TABS[0].TAB_KEY as ElectrolyteTab;
            }

            // --- Initialize Concepts --- 
            try {
                const conceptReferences = ConceptExtractionService.extractConcepts(loadedConfig);
                ConceptExtractionService.initializeConceptsFromReferences(conceptReferences);
            } catch (extractionError) {
                console.error("Error during concept extraction/initialization:", extractionError);
                // Decide how to handle this - maybe show a specific error?
            }
            // --- End Initialize Concepts --- 

      } else {
          throw new Error("Loaded configuration is null or invalid.");
      }
      
      // Add global event listener for debugging
      document.addEventListener('concepts-applied', (event: Event) => {
        console.log('App.svelte: Global concepts-applied event detected:', event);
        console.log('App.svelte: Current selected tab:', selectedTab);
      });
      
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load configuration';
      console.error('Error loading configuration:', err);
    }
  });

  function handleTabChange(event: CustomEvent<string>) {
    const tabKey = event.detail;
    selectedTab = tabKey as ElectrolyteTab;
  }

  function toggleConfigEditor(fullScreen = false) {
    showConfigEditor = !showConfigEditor;
    configEditorFullScreen = fullScreen;
  }

  function toggleDebugMode() {
    debugMode = !debugMode;
    console.log('Debug mode:', debugMode);
  }
  
  function toggleConceptTestManager() {
    showConceptTestManager = !showConceptTestManager;
  }

  function toggleConceptManager() {
    showConceptManager = !showConceptManager;
  }

  function updateConceptsForLabValue(event: CustomEvent<{ electrolyte: string, value: number | null }>) {
      const { electrolyte } = event.detail;
      // Ensure value is treated as a number
      const value = event.detail.value !== null ? parseFloat(String(event.detail.value)) : null;
      
      if (value === null || isNaN(value)) { // Also check for NaN after parseFloat
          // Handle clearing logic if needed (e.g., deactivate related concepts)
          console.log(`Clearing lab value for ${electrolyte}`);
          // Add logic here to potentially deactivate all related concepts for this electrolyte
          return;
      }

      const conceptsSnapshot = $concepts;
      if (!conceptsSnapshot) {
           console.error("Concept store snapshot is not available.");
           return;
      }
      
      let abb = '';
      let todoConcept = '';

      switch (electrolyte) {
          case 'Magnesium':
              abb = 'MAG';
              todoConcept = 'EALABMAGTODO';
              break;
          case 'Potassium':
              abb = 'POT';
              todoConcept = 'EALABPOTTODO';
              break;
          case 'Phosphorus':
              abb = 'PHOS';
              todoConcept = 'EALABPHOSTODO';
              break;
          case 'Calcium':
              abb = 'CALCIUM'; // Assuming Calcium uses the full name
              todoConcept = 'EALABCALCIUMTODO';
              break;
          default:
              console.error('Unknown electrolyte:', electrolyte);
              return;
      }
      
      // Activate the TODO concept
      if (conceptsSnapshot.hasOwnProperty(todoConcept)) {
         setConceptValue(todoConcept, true);
      } else {
          console.warn(`TODO Concept "${todoConcept}" not found.`);
      }

      let matchedConceptFound = false;

      // --- First Pass: Deactivate all range concepts for this electrolyte ---
      const prefix = `EALAB${abb}`;
      for (const conceptName in conceptsSnapshot) {
          if (conceptName.startsWith(prefix) && conceptName !== todoConcept) {
              // Check if concept exists before attempting deactivation
              if(conceptsSnapshot.hasOwnProperty(conceptName)) { 
                  setConceptValue(conceptName, false, false); // Set value=false, isActive=false
              } else {
                   console.warn(`Concept "${conceptName}" referenced in deactivation logic but not found in store.`);
              }
          }
      }
      // --- End Deactivation Pass ---
      
      // --- Second Pass: Find the single matching range and activate it ---
      for (const conceptName in conceptsSnapshot) {
          if (conceptName.startsWith(prefix) && conceptName !== todoConcept) {
              // Ensure concept exists before checking patterns
              if(!conceptsSnapshot.hasOwnProperty(conceptName)) {
                  console.warn(`Concept "${conceptName}" referenced in activation logic but not found in store.`);
                  continue; 
              }

              // Try to match BTW pattern
              const btwPattern = prefix + 'BTW(\\d+)AND(\\d+)'; // Explicitly create pattern string
              const btwMatch = conceptName.match(new RegExp(btwPattern));
              if (btwMatch) {
                  const low = parseInt(btwMatch[1], 10) / 10;
                  const high = parseInt(btwMatch[2], 10) / 10;
                  const isMatch = value >= low && value <= high;
                  if (isMatch) {
                      setConceptValue(conceptName, true, true); // Set value=true, isActive=true
                      matchedConceptFound = true;
                  }
              }

              // Try to match LT pattern
              const ltPattern = prefix + 'LT(\\d+)';
              const ltMatch = conceptName.match(new RegExp(ltPattern));
              if (ltMatch) {
                  const threshold = parseInt(ltMatch[1], 10) / 10;
                  const isMatch = value < threshold;
                  if (isMatch) {
                      setConceptValue(conceptName, true, true); // Set value=true, isActive=true
                      matchedConceptFound = true;
                  }
              }

              // Try to match GT pattern
              const gtPattern = prefix + 'GT(\\d+)';
              const gtMatch = conceptName.match(new RegExp(gtPattern)); 
              if (gtMatch) {
                  const threshold = parseInt(gtMatch[1], 10) / 10;
                  const isMatch = value > threshold;
                  if (isMatch) {
                      setConceptValue(conceptName, true, true); // Set value=true, isActive=true
                      matchedConceptFound = true;
                  }
              }
              
              // Add other patterns (LTE, GTE) here if needed
          }
      }
      // --- End Activation Pass ---

      if (!matchedConceptFound && value !== null) { // Check value is not null before warning
            console.warn(`No matching range concept found for ${electrolyte} value ${value}`);
        }

      // --- Dispatch event after updates --- 
      console.log("Dispatching concepts-applied event after lab value update.");
      document.dispatchEvent(new CustomEvent('concepts-applied', {
          detail: { source: 'LabInput' } // Optional detail
      }));
      // --- End Dispatch --- 
  }
</script>

<div class="app-container min-h-screen flex flex-col bg-gray-50">
  <Navbar>
    <div slot="actions" class="flex space-x-2">
      <button 
        class="btn btn-sm flex items-center" 
        on:click={() => toggleConfigEditor(false)}
      >
        <span class="hidden sm:inline mr-1">Config</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      <button 
        class="btn btn-sm flex items-center" 
        on:click={() => toggleDebugMode()}
      >
        <span class="hidden sm:inline mr-1">Debug</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </button>
      <button 
        class="btn btn-sm flex items-center" 
        on:click={() => toggleConceptTestManager()}
      >
        <span class="hidden sm:inline mr-1">Test Manager</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>
      <button 
        class="btn btn-sm flex items-center" 
        on:click={() => toggleConceptManager()}
      >
        <span class="hidden sm:inline mr-1">Concept Manager</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </button>
    </div>
  </Navbar>

  <PatientHeader />

  <main class="flex-grow p-2 md:p-4">
    <div class="container-fluid max-w-[1600px] mx-auto mb-4">
        <LabInput on:updateLab={updateConceptsForLabValue} />
    </div>
    
    {#if error}
      <div class="container mx-auto p-4">
        <div class="bg-error-light text-error-dark p-4 rounded-md shadow-sm">
          <h2 class="text-lg font-bold">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    {:else}
      <div class="container-fluid max-w-[1600px] mx-auto">
        <div class="flex flex-col">
          <div class="mb-4">
            <TabNavigation {selectedTab} on:tabChange={handleTabChange} />
          </div>
          
          <div>
            <TabContent {selectedTab} {debugMode} />
          </div>
        </div>
      </div>
    {/if}
  </main>

  {#if showConfigEditor}
    <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 fade-in">
      <div class="{configEditorFullScreen ? 'w-full h-full' : 'w-full max-w-4xl max-h-[90vh]'} bg-white rounded-lg shadow-xl flex flex-col">
        <div class="flex justify-between items-center p-4 border-b">
          <h2 class="text-lg font-bold">Configuration Editor</h2>
          <div class="flex space-x-2">
            <button 
              class="p-2 rounded-md hover:bg-gray-100" 
              on:click={() => toggleConfigEditor()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div class="flex-grow overflow-hidden">
          <ConfigEditor onClose={() => toggleConfigEditor(false)} isFullScreen={configEditorFullScreen} />
        </div>
      </div>
    </div>
  {/if}

  {#if showConceptTestManager}
    <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 fade-in">
      <div class="w-full h-full bg-white rounded-lg shadow-xl flex flex-col">
        <div class="flex justify-between items-center p-4 border-b">
          <h2 class="text-lg font-bold">Concept Test Manager</h2>
          <div class="flex space-x-2">
            <button 
              class="p-2 rounded-md hover:bg-gray-100" 
              on:click={() => toggleConceptTestManager()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div class="flex-grow overflow-hidden">
          <ConceptTestManager />
        </div>
      </div>
    </div>
  {/if}

  {#if showConceptManager}
    <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 fade-in">
      <div class="w-full h-full bg-white rounded-lg shadow-xl flex flex-col">
        <div class="flex justify-between items-center p-4 border-b">
          <h2 class="text-lg font-bold">Concept Manager</h2>
          <div class="flex space-x-2">
            <button 
              class="p-2 rounded-md hover:bg-gray-100" 
              on:click={() => toggleConceptManager()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div class="flex-grow overflow-hidden">
          <ConceptManager show={showConceptManager} />
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(html, body) {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
</style>
