<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let isOpen: boolean = false;

  let scenarioName: string = '';
  let scenarioDescription: string = '';

  const dispatch = createEventDispatcher<{
    save: { name: string; description: string };
    cancel: void;
  }>();

  function handleSubmit() {
    if (scenarioName.trim()) {
      dispatch('save', {
        name: scenarioName,
        description: scenarioDescription
      });
      resetForm();
    }
  }

  function handleCancel() {
    resetForm();
    dispatch('cancel');
  }

  function resetForm() {
    scenarioName = '';
    scenarioDescription = '';
  }
</script>

{#if isOpen}
  <div class="form-panel">
    <h3>Create New Scenario</h3>
    
    <div class="form-group">
      <label for="new-scenario-name">Name:</label>
      <input 
        type="text" 
        id="new-scenario-name" 
        bind:value={scenarioName} 
        placeholder="Enter scenario name"
      />
    </div>
    
    <div class="form-group">
      <label for="new-scenario-description">Description:</label>
      <textarea 
        id="new-scenario-description" 
        bind:value={scenarioDescription} 
        placeholder="Enter scenario description"
      ></textarea>
    </div>
    
    <div class="form-actions">
      <button class="cancel-btn" on:click={handleCancel}>Cancel</button>
      <button class="submit-btn" on:click={handleSubmit}>Create Scenario</button>
    </div>
  </div>
{/if}

<style>
  .form-panel {
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 1rem;
    margin: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .form-panel h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
    color: #333;
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
  }

  .form-group textarea {
    min-height: 100px;
    resize: vertical;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
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

  .submit-btn {
    padding: 0.5rem 1rem;
    background-color: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .submit-btn:hover {
    background-color: #1976d2;
  }
</style> 