<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { concepts } from '../stores';
  import { configStore } from '../services/configService';
  import { ConceptExtractionService } from '../services/conceptExtractionService';
  import { ConceptTestService, defaultConceptValues } from '../services/conceptTestService';
  import { get } from 'svelte/store';
  import type { ConceptReference, Concept, Config, ConceptChange } from '../types';
  
  export let selectedConcepts: string[] = [];
  export let conceptChangeValues: Record<string, boolean> = {};
  export let conceptChangeActive: Record<string, boolean> = {};
  export let useAsDefaults = false;
  
  const dispatch = createEventDispatcher();
  
  let conceptReferences: ConceptReference[] = [];
  let groupedConcepts: Record<string, Record<string, string[]>> = {};
  let expandedTabs: Record<string, boolean> = {};
  let expandedSections: Record<string, Record<string, boolean>> = {};
  let searchTerm = '';
  let showValueInputs: Record<string, boolean> = {};
  
  // Subscribe to config store to extract concepts when config changes
  const unsubConfig = configStore.subscribe(config => {
    if (config) {
      try {
        conceptReferences = ConceptExtractionService.extractConcepts(config);
        groupConceptsByTabAndSection();
      } catch (error) {
        console.error('Error extracting concepts:', error);
      }
    }
  });
  
  // Subscribe to defaultConceptValues store to update UI when defaults change
  const unsubDefaults = defaultConceptValues.subscribe(defaults => {
    if (useAsDefaults) {
      // Update UI to reflect current defaults
      Object.entries(defaults).forEach(([conceptName, values]) => {
        if (!selectedConcepts.includes(conceptName)) {
          selectedConcepts = [...selectedConcepts, conceptName];
        }
        conceptChangeValues[conceptName] = values.value;
        conceptChangeActive[conceptName] = values.isActive;
      });
      
      dispatch('conceptsChanged', { 
        selectedConcepts,
        conceptChangeValues,
        conceptChangeActive
      });
    }
  });
  
  function groupConceptsByTabAndSection() {
    // Use the service method instead of duplicating code
    groupedConcepts = ConceptTestService.getConceptReferencesByTabAndSection();
    
    // Initialize expanded state for tabs and sections
    Object.keys(groupedConcepts).forEach(tabName => {
      if (expandedTabs[tabName] === undefined) {
        expandedTabs[tabName] = false;
      }
      
      expandedSections[tabName] = expandedSections[tabName] || {};
      Object.keys(groupedConcepts[tabName]).forEach(sectionName => {
        if (expandedSections[tabName][sectionName] === undefined) {
          expandedSections[tabName][sectionName] = false;
        }
      });
    });
  }
  
  function toggleTab(tabName: string) {
    expandedTabs[tabName] = !expandedTabs[tabName];
  }
  
  function toggleSection(tabName: string, sectionName: string) {
    expandedSections[tabName][sectionName] = !expandedSections[tabName][sectionName];
  }
  
  function toggleConceptSelection(conceptName: string) {
    if (selectedConcepts.includes(conceptName)) {
      selectedConcepts = selectedConcepts.filter(c => c !== conceptName);
      
      // If using as defaults, update the defaults store
      if (useAsDefaults) {
        updateDefaultValues();
      }
      
      dispatch('conceptsChanged', { selectedConcepts });
    } else {
      selectedConcepts = [...selectedConcepts, conceptName];
      
      // Initialize with default values if not already set
      if (conceptChangeValues[conceptName] === undefined) {
        conceptChangeValues[conceptName] = true;
      }
      if (conceptChangeActive[conceptName] === undefined) {
        conceptChangeActive[conceptName] = true;
      }
      
      // If using as defaults, update the defaults store
      if (useAsDefaults) {
        updateDefaultValues();
      }
      
      dispatch('conceptsChanged', { 
        selectedConcepts,
        conceptChangeValues,
        conceptChangeActive
      });
    }
  }
  
  function toggleValueInput(conceptName: string) {
    showValueInputs[conceptName] = !showValueInputs[conceptName];
  }
  
  function updateConceptValue(conceptName: string, value: boolean) {
    conceptChangeValues[conceptName] = value;
    
    // If using as defaults, update the defaults store
    if (useAsDefaults) {
      updateDefaultValues();
    }
    
    dispatch('conceptsChanged', { 
      selectedConcepts,
      conceptChangeValues,
      conceptChangeActive
    });
  }
  
  function updateConceptActive(conceptName: string, isActive: boolean) {
    conceptChangeActive[conceptName] = isActive;
    
    // If using as defaults, update the defaults store
    if (useAsDefaults) {
      updateDefaultValues();
    }
    
    dispatch('conceptsChanged', { 
      selectedConcepts,
      conceptChangeValues,
      conceptChangeActive
    });
  }
  
  function updateDefaultValues() {
    if (!useAsDefaults) return;
    
    const defaults: Record<string, { value: boolean, isActive: boolean }> = {};
    
    selectedConcepts.forEach(conceptName => {
      defaults[conceptName] = {
        value: conceptChangeValues[conceptName] || false,
        isActive: conceptChangeActive[conceptName] || true
      };
    });
    
    ConceptTestService.setDefaultConceptValues(defaults);
  }
  
  function selectAllInSection(tabName: string, sectionName: string) {
    const conceptsInSection = groupedConcepts[tabName][sectionName];
    
    conceptsInSection.forEach(conceptName => {
      if (!selectedConcepts.includes(conceptName)) {
        selectedConcepts = [...selectedConcepts, conceptName];
        
        // Initialize with default values
        if (conceptChangeValues[conceptName] === undefined) {
          conceptChangeValues[conceptName] = true;
        }
        if (conceptChangeActive[conceptName] === undefined) {
          conceptChangeActive[conceptName] = true;
        }
      }
    });
    
    // If using as defaults, update the defaults store
    if (useAsDefaults) {
      updateDefaultValues();
    }
    
    dispatch('conceptsChanged', { 
      selectedConcepts,
      conceptChangeValues,
      conceptChangeActive
    });
  }
  
  function deselectAllInSection(tabName: string, sectionName: string) {
    const conceptsInSection = groupedConcepts[tabName][sectionName];
    
    selectedConcepts = selectedConcepts.filter(
      conceptName => !conceptsInSection.includes(conceptName)
    );
    
    // If using as defaults, update the defaults store
    if (useAsDefaults) {
      updateDefaultValues();
    }
    
    dispatch('conceptsChanged', { 
      selectedConcepts,
      conceptChangeValues,
      conceptChangeActive
    });
  }
  
  function getFilteredConcepts() {
    if (!searchTerm.trim()) {
      return groupedConcepts;
    }
    
    const filtered: Record<string, Record<string, string[]>> = {};
    
    Object.entries(groupedConcepts).forEach(([tabName, sections]) => {
      Object.entries(sections).forEach(([sectionName, conceptList]) => {
        const matchingConcepts = conceptList.filter(concept => 
          concept.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (matchingConcepts.length > 0) {
          if (!filtered[tabName]) {
            filtered[tabName] = {};
          }
          filtered[tabName][sectionName] = matchingConcepts;
        }
      });
    });
    
    return filtered;
  }
  
  $: filteredConcepts = getFilteredConcepts();
  
  onMount(() => {
    // Expand the first tab by default
    const firstTab = Object.keys(groupedConcepts)[0];
    if (firstTab) {
      expandedTabs[firstTab] = true;
    }
    
    // If using as defaults, initialize with current defaults
    if (useAsDefaults) {
      const currentDefaults = get(defaultConceptValues);
      Object.entries(currentDefaults).forEach(([conceptName, values]) => {
        if (!selectedConcepts.includes(conceptName)) {
          selectedConcepts = [...selectedConcepts, conceptName];
        }
        conceptChangeValues[conceptName] = (values as { value: boolean, isActive: boolean }).value;
        conceptChangeActive[conceptName] = (values as { value: boolean, isActive: boolean }).isActive;
      });
    }
    
    return () => {
      unsubConfig();
      unsubDefaults();
    };
  });
</script>

<div class="concept-hierarchy-selector">
  <div class="search-container">
    <input 
      type="text" 
      placeholder="Search concepts..." 
      bind:value={searchTerm}
      class="search-input"
    />
    
    {#if useAsDefaults}
      <div class="defaults-indicator">
        <span class="defaults-badge">Setting Default Values</span>
        <p class="defaults-hint">
          Selected concepts will be used as defaults for new test steps
        </p>
      </div>
    {/if}
  </div>
  
  <div class="hierarchy-container">
    {#each Object.entries(filteredConcepts) as [tabName, sections]}
      <div class="tab-group">
        <div class="tab-header" on:click={() => toggleTab(tabName)}>
          <span class="expand-icon">{expandedTabs[tabName] ? '▼' : '►'}</span>
          <span class="tab-name">{tabName}</span>
        </div>
        
        {#if expandedTabs[tabName]}
          <div class="tab-content">
            {#each Object.entries(sections) as [sectionName, conceptList]}
              <div class="section-group">
                <div class="section-header" on:click={() => toggleSection(tabName, sectionName)}>
                  <span class="expand-icon">{expandedSections[tabName][sectionName] ? '▼' : '►'}</span>
                  <span class="section-name">{sectionName}</span>
                  <div class="section-actions">
                    <button 
                      class="small-button select-all" 
                      on:click|stopPropagation={() => selectAllInSection(tabName, sectionName)}
                    >
                      Select All
                    </button>
                    <button 
                      class="small-button deselect-all" 
                      on:click|stopPropagation={() => deselectAllInSection(tabName, sectionName)}
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                
                {#if expandedSections[tabName][sectionName]}
                  <div class="concept-list">
                    {#each conceptList as conceptName}
                      <div class="concept-item">
                        <div class="concept-header">
                          <label class="concept-label">
                            <input 
                              type="checkbox" 
                              checked={selectedConcepts.includes(conceptName)} 
                              on:change={() => toggleConceptSelection(conceptName)}
                            />
                            <span class="concept-name">{conceptName}</span>
                          </label>
                          
                          {#if selectedConcepts.includes(conceptName)}
                            <button 
                              class="toggle-value-button" 
                              on:click={() => toggleValueInput(conceptName)}
                            >
                              {showValueInputs[conceptName] ? 'Hide' : 'Edit'}
                            </button>
                          {/if}
                        </div>
                        
                        {#if selectedConcepts.includes(conceptName) && showValueInputs[conceptName]}
                          <div class="concept-values">
                            <div class="value-control">
                              <label>
                                Value:
                                <div class="toggle-switch">
                                  <input 
                                    type="checkbox" 
                                    checked={conceptChangeValues[conceptName]} 
                                    on:change={() => updateConceptValue(conceptName, !conceptChangeValues[conceptName])}
                                    id={`value-${conceptName}`}
                                  />
                                  <label for={`value-${conceptName}`} class="toggle-label"></label>
                                </div>
                                <span class="value-text">
                                  {conceptChangeValues[conceptName] ? 'True' : 'False'}
                                </span>
                              </label>
                            </div>
                            
                            <div class="value-control">
                              <label>
                                Active:
                                <div class="toggle-switch">
                                  <input 
                                    type="checkbox" 
                                    checked={conceptChangeActive[conceptName]} 
                                    on:change={() => updateConceptActive(conceptName, !conceptChangeActive[conceptName])}
                                    id={`active-${conceptName}`}
                                  />
                                  <label for={`active-${conceptName}`} class="toggle-label"></label>
                                </div>
                                <span class="value-text">
                                  {conceptChangeActive[conceptName] ? 'Active' : 'Inactive'}
                                </span>
                              </label>
                            </div>
                          </div>
                        {/if}
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
    
    {#if Object.keys(filteredConcepts).length === 0}
      <div class="no-results">
        {searchTerm ? 'No concepts match your search.' : 'No concepts found in the configuration.'}
      </div>
    {/if}
  </div>
  
  <div class="selected-summary">
    <h4>Selected Concepts: {selectedConcepts.length}</h4>
    <div class="selected-list">
      {#each selectedConcepts as conceptName}
        <div class="selected-item">
          <span class="selected-name">{conceptName}</span>
          <span class="selected-values">
            ({conceptChangeValues[conceptName] ? 'True' : 'False'}, 
            {conceptChangeActive[conceptName] ? 'Active' : 'Inactive'})
          </span>
          <button 
            class="remove-button" 
            on:click={() => toggleConceptSelection(conceptName)}
          >
            ×
          </button>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .concept-hierarchy-selector {
    display: flex;
    flex-direction: column;
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  .search-container {
    padding: 1rem;
    background-color: #f9f9f9;
    border-bottom: 1px solid #eaeaea;
  }
  
  .search-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  
  .search-input:focus {
    border-color: #40a9ff;
    outline: none;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
  
  .defaults-indicator {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background-color: #f6ffed;
    border: 1px solid #b7eb8f;
    border-radius: 4px;
  }
  
  .defaults-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background-color: #52c41a;
    color: white;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
  
  .defaults-hint {
    margin: 0;
    color: #52c41a;
    font-size: 0.9rem;
  }
  
  .hierarchy-container {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
  }
  
  .tab-group {
    margin-bottom: 1rem;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  
  .tab-header {
    padding: 0.75rem 1rem;
    background-color: #f0f0f0;
    cursor: pointer;
    display: flex;
    align-items: center;
    font-weight: 500;
    color: #333;
    transition: background-color 0.2s;
  }
  
  .tab-header:hover {
    background-color: #e6f7ff;
  }
  
  .tab-name {
    font-size: 1.1rem;
  }
  
  .tab-content {
    border-top: 1px solid #eaeaea;
  }
  
  .section-group {
    margin: 0.5rem;
    border: 1px solid #eaeaea;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .section-header {
    padding: 0.75rem 1rem;
    background-color: #f9f9f9;
    cursor: pointer;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    transition: background-color 0.2s;
  }
  
  .section-header:hover {
    background-color: #e6f7ff;
  }
  
  .section-name {
    flex: 1;
    min-width: 100px;
    font-weight: 500;
    color: #333;
  }
  
  .section-actions {
    display: flex;
    gap: 0.5rem;
    margin-left: auto;
  }
  
  .small-button {
    padding: 0.35rem 0.75rem;
    font-size: 0.85rem;
    background-color: #f0f0f0;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    cursor: pointer;
    white-space: nowrap;
    transition: background-color 0.2s, color 0.2s;
  }
  
  .small-button:hover {
    background-color: #e0e0e0;
  }
  
  .select-all {
    color: #1890ff;
  }
  
  .select-all:hover {
    background-color: #e6f7ff;
    border-color: #1890ff;
  }
  
  .deselect-all {
    color: #ff4d4f;
  }
  
  .deselect-all:hover {
    background-color: #fff1f0;
    border-color: #ff4d4f;
  }
  
  .concept-list {
    padding: 0.75rem;
    max-height: 300px;
    overflow-y: auto;
    background-color: white;
  }
  
  .concept-item {
    margin-bottom: 0.75rem;
    padding: 0.75rem;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    background-color: white;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  
  .concept-item:hover {
    border-color: #d9d9d9;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  
  .concept-item.selected {
    border-color: #91d5ff;
    background-color: #e6f7ff;
  }
  
  .concept-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .concept-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    flex: 1;
    min-width: 150px;
  }
  
  .concept-name {
    font-family: monospace;
    word-break: break-word;
    font-size: 1rem;
    color: #333;
  }
  
  .toggle-value-button {
    padding: 0.35rem 0.75rem;
    font-size: 0.85rem;
    background-color: #f0f0f0;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 0.75rem;
    transition: background-color 0.2s;
  }
  
  .toggle-value-button:hover {
    background-color: #e6f7ff;
    border-color: #1890ff;
    color: #1890ff;
  }
  
  .concept-values {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background-color: #f9f9f9;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .value-control {
    display: flex;
    align-items: center;
  }
  
  .value-control label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    font-size: 0.95rem;
    color: #333;
  }
  
  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 22px;
    flex-shrink: 0;
  }
  
  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .toggle-label {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 22px;
  }
  
  .toggle-label:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
  
  input:checked + .toggle-label {
    background-color: #1890ff;
  }
  
  input:checked + .toggle-label:before {
    transform: translateX(22px);
  }
  
  .value-text {
    min-width: 60px;
    font-weight: 500;
  }
  
  .expand-icon {
    margin-right: 0.75rem;
    font-size: 0.85rem;
    flex-shrink: 0;
    color: #666;
  }
  
  .selected-summary {
    padding: 0.75rem;
    border-top: 1px solid #eaeaea;
    background-color: #f5f5f5;
    max-height: 150px;
    overflow-y: auto;
  }
  
  .selected-summary h4 {
    margin: 0 0 0.75rem 0;
    color: #333;
    font-size: 1rem;
  }
  
  .selected-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .selected-item {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.75rem;
    background-color: #e6f7ff;
    border: 1px solid #91d5ff;
    border-radius: 4px;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }
  
  .selected-item:hover {
    background-color: #bae7ff;
  }
  
  .selected-name {
    font-weight: 500;
    word-break: break-word;
    color: #1890ff;
  }
  
  .selected-values {
    color: #666;
    font-size: 0.85rem;
  }
  
  .remove-button {
    background: none;
    border: none;
    color: #ff4d4f;
    cursor: pointer;
    font-size: 1.1rem;
    padding: 0;
    margin-left: 0.35rem;
    flex-shrink: 0;
    transition: color 0.2s;
  }
  
  .remove-button:hover {
    color: #ff7875;
  }
  
  .no-results {
    padding: 1.5rem;
    text-align: center;
    color: #666;
    font-style: italic;
    background-color: #f9f9f9;
    border-radius: 4px;
    margin: 1rem;
  }
  
  @media (max-width: 768px) {
    .section-header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .section-actions {
      margin-top: 0.75rem;
      margin-left: 0;
      width: 100%;
      justify-content: space-between;
    }
    
    .concept-header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .toggle-value-button {
      margin-top: 0.75rem;
      margin-left: 0;
      width: 100%;
      text-align: center;
    }
  }
</style> 