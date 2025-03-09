<script lang="ts">
  import type { TestScenario } from '../types';

  export let scenarios: TestScenario[] = [];
  export let selectedScenarioId: string | null = null;
  export let isEditMode: boolean = false;

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{
    scenarioChange: { scenarioId: string };
    createScenario: void;
    createDefaultScenario: void;
    setAllConcepts: void;
    deleteScenario: void;
  }>();

  function handleScenarioChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    dispatch('scenarioChange', { scenarioId: select.value });
  }

  function handleCreateScenario() {
    dispatch('createScenario');
  }

  function handleCreateDefaultScenario() {
    dispatch('createDefaultScenario');
  }

  function handleSetAllConcepts() {
    dispatch('setAllConcepts');
  }

  function handleDeleteScenario() {
    dispatch('deleteScenario');
  }
</script>

<div class="scenario-selection">
  <div class="scenario-select">
    <label for="scenario-select">Select Scenario:</label>
    <select id="scenario-select" on:change={handleScenarioChange}>
      {#each scenarios as scenario}
        <option value={scenario.id} selected={scenario.id === selectedScenarioId}>
          {scenario.name}
        </option>
      {/each}
    </select>
  </div>
  
  <div class="scenario-actions">
    <button class="action-btn" on:click={handleCreateScenario}>
      Create New Scenario
    </button>
    <button class="action-btn" on:click={handleCreateDefaultScenario}>
      Create Default Scenario
    </button>
    <button class="action-btn" on:click={handleSetAllConcepts}>
      Set All Concepts
    </button>
    {#if selectedScenarioId}
      <button class="action-btn delete-btn" on:click={handleDeleteScenario}>
        Delete Scenario
      </button>
    {/if}
  </div>
</div>

<style>
  .scenario-selection {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #f9f9f9;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .scenario-select {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .scenario-select label {
    font-weight: 500;
    color: #333;
  }
  
  .scenario-select select {
    padding: 0.5rem;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    min-width: 200px;
  }
  
  .scenario-actions {
    display: flex;
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
  
  .delete-btn {
    background-color: #dc3545;
    color: white;
    border-color: #dc3545;
  }
  
  .delete-btn:hover {
    background-color: #c82333;
    border-color: #bd2130;
  }
</style> 