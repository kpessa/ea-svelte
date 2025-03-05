<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { ConceptChange, TestSubScenario } from '../types';
  import { concepts } from '../stores';
  import ConceptStatusIndicator from './ConceptStatusIndicator.svelte';
  import ConceptHierarchySelector from './ConceptHierarchySelector.svelte';
  import { ConceptTestService } from '../services/conceptTestService';
  
  export let scenario: TestSubScenario | null = null;
  export let parentConcepts: ConceptChange[] = [];
  
  const dispatch = createEventDispatcher();
  
  let selectedConcepts: string[] = [];
  let conceptChangeValues: Record<string, boolean> = {};
  let conceptChangeActive: Record<string, boolean> = {};
  let searchTerm = '';
  
  // Initialize from scenario if provided
  $: if (scenario) {
    selectedConcepts = scenario.concepts.map(c => c.conceptName);
    
    conceptChangeValues = {};
    conceptChangeActive = {};
    
    scenario.concepts.forEach(c => {
      conceptChangeValues[c.conceptName] = c.value;
      conceptChangeActive[c.conceptName] = c.isActive;
    });
  }
  
  // Check if a concept is inherited from a parent
  function isInheritedConcept(conceptName: string): boolean {
    return parentConcepts.some(c => c.conceptName === conceptName);
  }
  
  // Get the inherited value for a concept
  function getInheritedValue(conceptName: string): boolean {
    const parentConcept = parentConcepts.find(c => c.conceptName === conceptName);
    return parentConcept ? parentConcept.value : false;
  }
  
  // Get the inherited active state for a concept
  function getInheritedActive(conceptName: string): boolean {
    const parentConcept = parentConcepts.find(c => c.conceptName === conceptName);
    return parentConcept ? parentConcept.isActive : true;
  }
  
  // Handle concept changes from the hierarchy selector
  function handleConceptsChanged(event: CustomEvent) {
    const { selectedConcepts: newSelectedConcepts, conceptChangeValues: newValues, conceptChangeActive: newActive } = event.detail;
    
    selectedConcepts = newSelectedConcepts;
    conceptChangeValues = newValues;
    conceptChangeActive = newActive;
  }
  
  // Save changes and close the editor
  function saveChanges() {
    const conceptChanges: ConceptChange[] = selectedConcepts.map(conceptName => ({
      conceptName,
      value: conceptChangeValues[conceptName] || false,
      isActive: conceptChangeActive[conceptName] || true
    }));
    
    dispatch('save', { conceptChanges });
  }
  
  // Cancel and close the editor
  function cancel() {
    dispatch('cancel');
  }
</script>

<div class="concept-editor">
  <h2>Edit Concepts for {scenario?.name}</h2>
  
  <div class="editor-content">
    <div class="concept-selector">
      <h3>Available Concepts</h3>
      <div class="search-box">
        <input 
          type="text" 
          placeholder="Search concepts..." 
          bind:value={searchTerm}
        />
      </div>
      
      <div class="hierarchy-selector">
        <ConceptHierarchySelector
          bind:selectedConcepts={selectedConcepts}
          bind:conceptChangeValues={conceptChangeValues}
          bind:conceptChangeActive={conceptChangeActive}
          on:conceptsChanged={handleConceptsChanged}
        />
      </div>
    </div>
    
    <div class="selected-concepts">
      <h3>Selected Concepts</h3>
      
      {#if selectedConcepts.length === 0}
        <div class="empty-selection">
          <p>No concepts selected. Click on concepts from the list to select them.</p>
        </div>
      {:else}
        <table class="concept-table">
          <thead>
            <tr>
              <th>Concept</th>
              <th>Value</th>
              <th>Active</th>
              <th>Inherited</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each selectedConcepts as conceptName}
              <tr>
                <td>{conceptName}</td>
                <td>
                  <div class="toggle-switch">
                    <input 
                      type="checkbox" 
                      id="value-{conceptName}" 
                      checked={conceptChangeValues[conceptName] || false}
                      on:change={() => conceptChangeValues[conceptName] = !conceptChangeValues[conceptName]}
                    />
                    <label for="value-{conceptName}"></label>
                    <span>{conceptChangeValues[conceptName] ? 'True' : 'False'}</span>
                  </div>
                </td>
                <td>
                  <div class="toggle-switch">
                    <input 
                      type="checkbox" 
                      id="active-{conceptName}" 
                      checked={conceptChangeActive[conceptName] || true}
                      on:change={() => conceptChangeActive[conceptName] = !conceptChangeActive[conceptName]}
                    />
                    <label for="active-{conceptName}"></label>
                    <span>{conceptChangeActive[conceptName] ? 'Active' : 'Inactive'}</span>
                  </div>
                </td>
                <td>
                  {#if isInheritedConcept(conceptName)}
                    <span class="inherited-badge" title="Inherited from parent scenario">
                      Inherited
                    </span>
                  {:else}
                    <span>-</span>
                  {/if}
                </td>
                <td>
                  <button 
                    class="remove-btn" 
                    on:click={() => {
                      selectedConcepts = selectedConcepts.filter(c => c !== conceptName);
                      delete conceptChangeValues[conceptName];
                      delete conceptChangeActive[conceptName];
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>
  
  <div class="editor-actions">
    <button class="cancel-btn" on:click={cancel}>Cancel</button>
    <button class="save-btn" on:click={saveChanges}>Save Changes</button>
  </div>
</div>

<style>
  .concept-editor {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1rem;
  }
  
  h2 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
  }
  
  .editor-content {
    display: flex;
    flex: 1;
    gap: 1rem;
    overflow: hidden;
  }
  
  .concept-selector {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .concept-selector h3 {
    margin: 0;
    padding: 0.75rem;
    background-color: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .search-box {
    padding: 0.75rem;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .search-box input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
  }
  
  .hierarchy-selector {
    flex: 1;
    overflow: auto;
    padding: 0.75rem;
  }
  
  .selected-concepts {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .selected-concepts h3 {
    margin: 0;
    padding: 0.75rem;
    background-color: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .empty-selection {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 2rem;
    color: #999;
    font-style: italic;
    text-align: center;
  }
  
  .concept-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .concept-table th,
  .concept-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .concept-table th {
    background-color: #f9f9f9;
    font-weight: 500;
  }
  
  .toggle-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .toggle-switch label {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
    background-color: #ccc;
    border-radius: 20px;
    transition: .4s;
    cursor: pointer;
  }
  
  .toggle-switch label:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    border-radius: 50%;
    transition: .4s;
  }
  
  .toggle-switch input:checked + label {
    background-color: #2196F3;
  }
  
  .toggle-switch input:checked + label:before {
    transform: translateX(20px);
  }
  
  .inherited-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background-color: #e3f2fd;
    color: #0d47a1;
    border-radius: 4px;
    font-size: 0.8rem;
  }
  
  .remove-btn {
    padding: 0.25rem 0.5rem;
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ffcdd2;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .remove-btn:hover {
    background-color: #ffcdd2;
  }
  
  .editor-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e0e0e0;
  }
  
  .cancel-btn {
    padding: 0.5rem 1rem;
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .cancel-btn:hover {
    background-color: #e0e0e0;
  }
  
  .save-btn {
    padding: 0.5rem 1rem;
    background-color: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .save-btn:hover {
    background-color: #1976d2;
  }
</style> 