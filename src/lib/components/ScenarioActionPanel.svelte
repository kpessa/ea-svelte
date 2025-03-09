<script lang="ts">
  import type { ConceptChange } from '../types';

  export let selectedScenarioId: string | null = null;
  export let selectedSubScenarioId: string | null = null;

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{
    editConcepts: void;
    addExpectedResult: void;
    applyConcepts: void;
    clearConcepts: void;
    setMagnesiumConcepts: void;
    executeTest: void;
    deleteSubScenario: void;
  }>();

  function handleEditConcepts() {
    dispatch('editConcepts');
  }

  function handleAddExpectedResult() {
    dispatch('addExpectedResult');
  }

  function handleApplyConcepts() {
    dispatch('applyConcepts');
  }

  function handleClearConcepts() {
    dispatch('clearConcepts');
  }

  function handleSetMagnesiumConcepts() {
    dispatch('setMagnesiumConcepts');
  }

  function handleExecuteTest() {
    dispatch('executeTest');
  }

  function handleDeleteSubScenario() {
    dispatch('deleteSubScenario');
  }
</script>

<div class="selected-subscenario-actions">
  <div class="action-panel">
    <h4>Selected Scenario Actions</h4>
    <div class="action-buttons">
      <button class="action-btn" on:click={handleEditConcepts}>
        Edit Concepts
      </button>
      <button class="action-btn" on:click={handleAddExpectedResult}>
        Add Expected Result
      </button>
      <button 
        class="btn btn-primary" 
        on:click={handleApplyConcepts}
        disabled={!selectedScenarioId || !selectedSubScenarioId}
      >
        Apply Concepts
      </button>
      <button 
        class="btn btn-danger" 
        on:click={handleClearConcepts}
        title="Clear all concepts and reset to default state"
      >
        Clear All Concepts
      </button>
      <button 
        class="btn btn-secondary" 
        on:click={handleSetMagnesiumConcepts}
        title="Set key concepts for Magnesium tab"
      >
        Set Magnesium Concepts
      </button>
      <button class="action-btn" on:click={handleExecuteTest}>
        Execute Test
      </button>
      <button class="action-btn delete-btn" on:click={handleDeleteSubScenario}>
        Delete Sub-Scenario
      </button>
    </div>
  </div>
</div>

<style>
  .selected-subscenario-actions {
    padding: 1rem;
    background-color: #f0f0f0;
    border-top: 1px solid #e0e0e0;
  }

  .action-panel {
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 1rem;
  }

  .action-panel h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #333;
    font-size: 1rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
  }

  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .action-btn {
    padding: 0.5rem 1rem;
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background-color: #e0e0e0;
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary {
    background-color: #2196f3;
    color: white;
    border: 1px solid #1976d2;
  }

  .btn-primary:hover {
    background-color: #1976d2;
  }

  .btn-danger {
    background-color: #dc3545;
    color: white;
    border: 1px solid #dc3545;
  }

  .btn-danger:hover {
    background-color: #c82333;
  }

  .btn-secondary {
    background-color: #6c757d;
    color: white;
    border: 1px solid #6c757d;
  }

  .btn-secondary:hover {
    background-color: #5a6268;
  }

  .delete-btn {
    background-color: #dc3545;
    color: white;
    border-color: #dc3545;
  }

  .delete-btn:hover {
    background-color: #c82333;
    border-color: #bd2130;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style> 