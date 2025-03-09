<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let isOpen: boolean = false;
  export let parentId: string | null = null;

  let scenarioName: string = '';
  let scenarioDescription: string = '';

  const dispatch = createEventDispatcher<{
    save: { 
      name: string; 
      description: string;
      parentId: string | null;
    };
    cancel: void;
  }>();

  function handleSubmit() {
    if (scenarioName.trim()) {
      dispatch('save', {
        name: scenarioName,
        description: scenarioDescription,
        parentId
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

  $: formTitle = parentId ? 'Add Sub-Scenario' : 'Add Root Scenario';
  $: submitButtonText = parentId ? 'Add Sub-Scenario' : 'Add Root Scenario';
</script>

{#if isOpen}
  <div class="form-panel">
    <h3>{formTitle}</h3>
    
    <div class="form-group">
      <label for="new-subscenario-name">Name:</label>
      <input 
        type="text" 
        id="new-subscenario-name" 
        bind:value={scenarioName} 
        placeholder="Enter scenario name"
      />
    </div>
    
    <div class="form-group">
      <label for="new-subscenario-description">Description:</label>
      <textarea 
        id="new-subscenario-description" 
        bind:value={scenarioDescription} 
        placeholder="Enter scenario description"
      ></textarea>
    </div>

    {#if parentId}
      <div class="info-text">
        <p>This scenario will be created as a sub-scenario of another scenario.</p>
      </div>
    {/if}
    
    <div class="form-actions">
      <button class="cancel-btn" on:click={handleCancel}>Cancel</button>
      <button class="submit-btn" on:click={handleSubmit}>{submitButtonText}</button>
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

  .info-text {
    margin: 1rem 0;
    padding: 0.5rem;
    background-color: #e3f2fd;
    border: 1px solid #90caf9;
    border-radius: 4px;
    color: #1976d2;
    font-size: 0.9rem;
  }

  .info-text p {
    margin: 0;
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