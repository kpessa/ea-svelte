<script lang="ts">
  import { onMount } from 'svelte';
  import { concepts } from '$lib/stores';
  import { evaluateConceptExpression, setConceptValue, toggleConceptActive } from '$lib/stores';
  import type { Concept } from '$lib/types';
  
  let showModal = false;
  let conceptsSnapshot: Record<string, Concept> = {};
  let searchTerm = '';
  let newConceptName = '';
  let newConceptValue = false;
  let expressionToEvaluate = '';
  let evaluationResult: boolean | null = null;
  let validationError = '';
  let editMode = false;
  let editingConceptName = '';
  let editingConceptOriginalName = '';
  
  // Subscribe to concepts store
  const unsubConcepts = concepts.subscribe((value: Record<string, Concept>) => {
    conceptsSnapshot = { ...value };
  });
  
  function toggleModal() {
    showModal = !showModal;
    if (showModal) {
      // Reset state when opening modal
      searchTerm = '';
      newConceptName = '';
      newConceptValue = false;
      expressionToEvaluate = '';
      evaluationResult = null;
      validationError = '';
      editMode = false;
      editingConceptName = '';
      editingConceptOriginalName = '';
    }
  }
  
  // Close modal when clicking outside of it
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('concept-modal')) {
      showModal = false;
    }
  }
  
  // Close modal when pressing Escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && showModal) {
      showModal = false;
    }
  }
  
  function createNewConcept() {
    if (!newConceptName.trim()) {
      validationError = 'Concept name cannot be empty';
      return;
    }
    
    // Check for duplicate names
    if (conceptsSnapshot[newConceptName.trim()]) {
      validationError = 'A concept with this name already exists';
      return;
    }
    
    validationError = '';
    
    // Add new concept to the store
    concepts.update(state => ({
      ...state,
      [newConceptName.trim()]: {
        value: newConceptValue,
        isActive: true
      }
    }));
    
    // Reset form
    newConceptName = '';
    newConceptValue = false;
  }
  
  function startEditConcept(conceptName: string) {
    editMode = true;
    editingConceptOriginalName = conceptName;
    editingConceptName = conceptName;
    newConceptValue = conceptsSnapshot[conceptName]?.value || false;
  }
  
  function saveEditedConcept() {
    if (!editingConceptName.trim()) {
      validationError = 'Concept name cannot be empty';
      return;
    }
    
    // Check for duplicate names (excluding the current concept)
    if (editingConceptName !== editingConceptOriginalName && 
        conceptsSnapshot[editingConceptName.trim()]) {
      validationError = 'A concept with this name already exists';
      return;
    }
    
    validationError = '';
    
    // If name changed, we need to remove the old one and add a new one
    if (editingConceptName !== editingConceptOriginalName) {
      concepts.update(state => {
        const newState = { ...state };
        const conceptValue = newState[editingConceptOriginalName]?.value || false;
        const conceptActive = newState[editingConceptOriginalName]?.isActive || true;
        
        // Remove old concept
        delete newState[editingConceptOriginalName];
        
        // Add with new name
        newState[editingConceptName.trim()] = {
          value: newConceptValue,
          isActive: conceptActive
        };
        
        return newState;
      });
    } else {
      // Just update the value
      setConceptValue(editingConceptName, newConceptValue);
    }
    
    // Reset edit mode
    editMode = false;
    editingConceptName = '';
    editingConceptOriginalName = '';
    newConceptValue = false;
  }
  
  function cancelEdit() {
    editMode = false;
    editingConceptName = '';
    editingConceptOriginalName = '';
    newConceptValue = false;
    validationError = '';
  }
  
  function deleteConcept(conceptName: string) {
    if (confirm(`Are you sure you want to delete the concept "${conceptName}"?`)) {
      concepts.update(state => {
        const newState = { ...state };
        delete newState[conceptName];
        return newState;
      });
    }
  }
  
  function toggleConceptActiveState(conceptName: string) {
    toggleConceptActive(conceptName);
  }
  
  function evaluateExpression() {
    if (!expressionToEvaluate.trim()) {
      validationError = 'Expression cannot be empty';
      return;
    }
    
    validationError = '';
    
    try {
      // Use the evaluateConceptExpression function from stores
      evaluationResult = evaluateConceptExpression(expressionToEvaluate.trim());
    } catch (error) {
      validationError = `Error evaluating expression: ${error instanceof Error ? error.message : 'Unknown error'}`;
      evaluationResult = null;
    }
  }
  
  function exportConcepts() {
    const dataStr = JSON.stringify(conceptsSnapshot, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'concepts.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
  
  function handleFileImport(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Validate imported data
        if (typeof importedData !== 'object' || importedData === null || Array.isArray(importedData)) {
          alert('Invalid import file format. Expected an object.');
          return;
        }
        
        // Import concepts
        concepts.update(state => {
          const newState = { ...state };
          
          Object.entries(importedData).forEach(([key, value]) => {
            // Validate each concept
            if (typeof value === 'object' && value !== null && 
                'value' in value && 'isActive' in value) {
              newState[key] = {
                value: Boolean((value as any).value),
                isActive: Boolean((value as any).isActive)
              };
            }
          });
          
          return newState;
        });
        
        alert('Concepts imported successfully');
      } catch (error) {
        alert('Error importing concepts: ' + error);
      }
    };
    reader.readAsText(file);
  }
  
  // Filter concepts based on search term
  $: filteredConcepts = Object.entries(conceptsSnapshot).filter(([name]) => 
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      unsubConcepts();
    };
  });
</script>

<div class="concept-icon-container">
  <button 
    class="concept-icon {showModal ? 'active' : ''}" 
    on:click={toggleModal}
    aria-label="Concept Manager"
  >
    🧠
  </button>
</div>

{#if showModal}
  <div 
    class="concept-modal" 
    style="display: block;" 
    on:click={handleClickOutside}
  >
    <div class="concept-modal-content">
      <div class="concept-modal-header">
        <h2 class="concept-modal-title">Concept Manager</h2>
        <button 
          class="concept-modal-close" 
          on:click={toggleModal}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div class="concept-modal-body">
        <!-- Concept List -->
        <div class="concept-section">
          <h3>Concepts</h3>
          
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Search concepts..." 
              bind:value={searchTerm}
            />
          </div>
          
          {#if filteredConcepts.length > 0}
            <div class="concept-list">
              {#each filteredConcepts as [name, concept]}
                <div class="concept-item">
                  <div class="concept-info">
                    <div class="concept-name">{name}</div>
                    <div class="concept-status">
                      <span class="concept-value {concept.value ? 'true' : 'false'}">
                        {concept.value ? 'True' : 'False'}
                      </span>
                      <span class="concept-active {concept.isActive ? 'active' : 'inactive'}">
                        {concept.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div class="concept-actions">
                    <button 
                      class="concept-action-btn toggle-btn" 
                      on:click={() => setConceptValue(name, !concept.value)}
                    >
                      Toggle Value
                    </button>
                    <button 
                      class="concept-action-btn active-btn" 
                      on:click={() => toggleConceptActiveState(name)}
                    >
                      {concept.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      class="concept-action-btn edit-btn" 
                      on:click={() => startEditConcept(name)}
                    >
                      Edit
                    </button>
                    <button 
                      class="concept-action-btn delete-btn" 
                      on:click={() => deleteConcept(name)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="no-concepts">
              {searchTerm ? 'No concepts match your search.' : 'No concepts available. Create a new concept to get started.'}
            </div>
          {/if}
        </div>
        
        <!-- Create/Edit Concept Form -->
        <div class="concept-form">
          <h3>{editMode ? 'Edit Concept' : 'Create New Concept'}</h3>
          
          <div class="form-group">
            <label for="concept-name">Concept Name:</label>
            <input 
              type="text" 
              id="concept-name" 
              bind:value={editMode ? editingConceptName : newConceptName} 
              placeholder="Enter concept name"
            />
          </div>
          
          <div class="form-group">
            <label for="concept-value">Concept Value:</label>
            <div class="toggle-switch">
              <input 
                type="checkbox" 
                id="concept-value" 
                bind:checked={newConceptValue}
              />
              <label for="concept-value" class="toggle-label">
                {newConceptValue ? 'True' : 'False'}
              </label>
            </div>
          </div>
          
          {#if validationError}
            <div class="validation-error">{validationError}</div>
          {/if}
          
          <div class="form-actions">
            {#if editMode}
              <button class="form-btn save-btn" on:click={saveEditedConcept}>
                Save Changes
              </button>
              <button class="form-btn cancel-btn" on:click={cancelEdit}>
                Cancel
              </button>
            {:else}
              <button class="form-btn create-btn" on:click={createNewConcept}>
                Create Concept
              </button>
            {/if}
          </div>
        </div>
        
        <!-- Expression Evaluator -->
        <div class="expression-evaluator">
          <h3>Expression Evaluator</h3>
          
          <div class="form-group">
            <label for="expression">Enter Expression:</label>
            <input 
              type="text" 
              id="expression" 
              bind:value={expressionToEvaluate} 
              placeholder="Enter concept expression to evaluate"
            />
          </div>
          
          <button class="form-btn evaluate-btn" on:click={evaluateExpression}>
            Evaluate
          </button>
          
          {#if evaluationResult !== null}
            <div class="evaluation-result">
              <span class="result-label">Result:</span>
              <span class="result-value {evaluationResult ? 'true' : 'false'}">
                {evaluationResult ? 'True' : 'False'}
              </span>
            </div>
          {/if}
        </div>
        
        <!-- Import/Export Section -->
        <div class="import-export-section">
          <h3>Import/Export</h3>
          <div class="import-export-actions">
            <button class="import-export-btn" on:click={exportConcepts}>
              Export Concepts
            </button>
            <label class="import-btn">
              Import Concepts
              <input 
                type="file" 
                accept=".json" 
                on:change={handleFileImport} 
                style="display: none;"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .concept-icon-container {
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 1000;
  }
  
  .concept-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #9c27b0;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  }
  
  .concept-icon:hover, .concept-icon.active {
    background-color: #7b1fa2;
    transform: scale(1.05);
  }
  
  .concept-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1001;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .concept-modal-content {
    background-color: white;
    border-radius: 5px;
    width: 80%;
    max-width: 800px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  }
  
  .concept-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
  }
  
  .concept-modal-title {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }
  
  .concept-modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }
  
  .concept-modal-close:hover {
    color: #333;
  }
  
  .concept-modal-body {
    padding: 20px;
  }
  
  .concept-section, .concept-form, .expression-evaluator, .import-export-section {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
  }
  
  .concept-section h3, .concept-form h3, .expression-evaluator h3, .import-export-section h3 {
    margin-top: 0;
    color: #333;
  }
  
  .search-box {
    margin-bottom: 10px;
  }
  
  .search-box input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .concept-list {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .concept-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #eee;
  }
  
  .concept-item:last-child {
    border-bottom: none;
  }
  
  .concept-info {
    flex: 1;
  }
  
  .concept-name {
    font-weight: bold;
    margin-bottom: 3px;
  }
  
  .concept-status {
    display: flex;
    gap: 10px;
    font-size: 12px;
  }
  
  .concept-value, .concept-active {
    padding: 2px 5px;
    border-radius: 3px;
  }
  
  .concept-value.true {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .concept-value.false {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .concept-active.active {
    background-color: #e3f2fd;
    color: #1565c0;
  }
  
  .concept-active.inactive {
    background-color: #f5f5f5;
    color: #757575;
  }
  
  .concept-actions {
    display: flex;
    gap: 5px;
  }
  
  .concept-action-btn {
    padding: 3px 8px;
    border-radius: 3px;
    border: 1px solid #ccc;
    background-color: #f5f5f5;
    cursor: pointer;
    font-size: 12px;
  }
  
  .toggle-btn {
    background-color: #4caf50;
    color: white;
    border-color: #4caf50;
  }
  
  .active-btn {
    background-color: #2196f3;
    color: white;
    border-color: #2196f3;
  }
  
  .edit-btn {
    background-color: #ff9800;
    color: white;
    border-color: #ff9800;
  }
  
  .delete-btn {
    background-color: #f44336;
    color: white;
    border-color: #f44336;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  .form-group input[type="text"] {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .toggle-switch {
    display: flex;
    align-items: center;
  }
  
  .toggle-switch input[type="checkbox"] {
    margin-right: 10px;
  }
  
  .toggle-label {
    font-weight: normal;
  }
  
  .validation-error {
    color: #f44336;
    font-size: 12px;
    margin-top: 5px;
    margin-bottom: 10px;
  }
  
  .form-actions {
    display: flex;
    gap: 10px;
  }
  
  .form-btn {
    padding: 8px 15px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-weight: bold;
  }
  
  .create-btn, .save-btn {
    background-color: #4caf50;
    color: white;
  }
  
  .cancel-btn {
    background-color: #9e9e9e;
    color: white;
  }
  
  .evaluate-btn {
    background-color: #673ab7;
    color: white;
  }
  
  .evaluation-result {
    margin-top: 10px;
    padding: 10px;
    border-radius: 4px;
    background-color: #f5f5f5;
  }
  
  .result-label {
    font-weight: bold;
    margin-right: 10px;
  }
  
  .result-value {
    font-weight: bold;
    padding: 2px 5px;
    border-radius: 3px;
  }
  
  .result-value.true {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .result-value.false {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .import-export-actions {
    display: flex;
    gap: 10px;
  }
  
  .import-export-btn, .import-btn {
    padding: 8px 15px;
    border-radius: 4px;
    border: 1px solid #ddd;
    background-color: #f5f5f5;
    cursor: pointer;
    text-align: center;
  }
  
  .no-concepts {
    padding: 15px;
    text-align: center;
    color: #666;
    font-style: italic;
  }
</style> 