<script lang="ts">
  import type { Concept } from '../types';
  
  export let conceptsSnapshot: Record<string, Concept> = {};
  export let editMode: boolean = false;
  export let newConceptName: string = '';
  export let newConceptValue: boolean = false;
  export let editingConceptName: string = '';
  export let editingConceptOriginalName: string = '';
  export let validationError: string = '';
  
  function createNewConcept() {
    if (!newConceptName.trim()) {
      validationError = 'Concept name cannot be empty';
      return { success: false, error: validationError };
    }
    
    // Check for duplicate names
    if (conceptsSnapshot[newConceptName.trim()]) {
      validationError = 'A concept with this name already exists';
      return { success: false, error: validationError };
    }
    
    validationError = '';
    
    // Dispatch event to notify parent component
    const event = new CustomEvent('createConcept', {
      detail: {
        name: newConceptName.trim(),
        value: newConceptValue
      }
    });
    dispatchEvent(event);
    
    return { success: true };
  }
  
  function saveEditedConcept() {
    if (!editingConceptName.trim()) {
      validationError = 'Concept name cannot be empty';
      return { success: false, error: validationError };
    }
    
    // Check for duplicate names (excluding the current concept)
    if (editingConceptName !== editingConceptOriginalName && 
        conceptsSnapshot[editingConceptName.trim()]) {
      validationError = 'A concept with this name already exists';
      return { success: false, error: validationError };
    }
    
    validationError = '';
    
    // Dispatch event to notify parent component
    const event = new CustomEvent('saveConcept', {
      detail: {
        originalName: editingConceptOriginalName,
        newName: editingConceptName.trim(),
        value: newConceptValue
      }
    });
    dispatchEvent(event);
    
    return { success: true };
  }
  
  function cancelEdit() {
    // Dispatch event to notify parent component
    const event = new CustomEvent('cancelEdit');
    dispatchEvent(event);
  }
  
  // Expose functions to parent component
  export { createNewConcept, saveEditedConcept, cancelEdit };
</script>

<div class="concept-form">
  <h3>{editMode ? 'Edit Concept' : 'Create New Concept'}</h3>
  
  <div class="form-group">
    <label for="concept-name">Concept Name:</label>
    {#if editMode}
      <input 
        type="text" 
        id="concept-name" 
        bind:value={editingConceptName}
        placeholder="Enter concept name"
      />
    {:else}
      <input 
        type="text" 
        id="concept-name" 
        bind:value={newConceptName}
        placeholder="Enter concept name"
      />
    {/if}
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

<style>
  .concept-form {
    border: 1px solid #eee;
    border-radius: 5px;
    padding: 15px;
    background-color: #f9f9f9;
  }
  
  .concept-form h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 15px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #555;
  }
  
  .form-group input[type="text"] {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 30px;
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
    border-radius: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 12px;
  }
  
  input:checked + .toggle-label {
    background-color: #4caf50;
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
</style> 