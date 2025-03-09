<!-- ScenarioActions.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';
  import type { TestSubScenario } from '../types';

  export let scenarioId: string;
  
  // Define the context type
  type ScenarioContext = {
    allScenarios: TestSubScenario[];
    isEditable: boolean;
    onScenarioSelect: (scenarioId: string) => void;
    onAddSubScenario: (parentId: string) => void;
    onAddExpectedResult: (scenarioId: string) => void;
    onEditConcepts: (scenarioId: string) => void;
    onDeleteScenario: (scenarioId: string) => void;
  };
  
  // Get actions from context
  const { 
    onEditConcepts, 
    onAddExpectedResult, 
    onAddSubScenario, 
    onDeleteScenario 
  } = getContext<ScenarioContext>('scenario-context');
</script>

<div class="scenario-actions" role="toolbar" aria-label="Scenario actions">
  <button 
    class="action-btn edit-btn" 
    on:click|stopPropagation={() => onEditConcepts(scenarioId)}
    aria-label="Edit concepts"
  >
    <span class="btn-icon" aria-hidden="true">✏️</span> Edit Concepts
  </button>
  <button 
    class="action-btn" 
    on:click|stopPropagation={() => onAddExpectedResult(scenarioId)}
    aria-label="Add expected result"
  >
    <span class="btn-icon" aria-hidden="true">✓</span> Add Expected Result
  </button>
  <button 
    class="action-btn" 
    on:click|stopPropagation={() => onAddSubScenario(scenarioId)}
    aria-label="Add sub-scenario"
  >
    <span class="btn-icon" aria-hidden="true">+</span> Add Sub-Scenario
  </button>
  <button 
    class="action-btn delete-btn" 
    on:click|stopPropagation={() => onDeleteScenario(scenarioId)}
    aria-label="Delete scenario"
  >
    <span class="btn-icon" aria-hidden="true">🗑️</span> Delete
  </button>
</div>

<style>
  .scenario-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
    background-color: #f0f0f0;
    border: 1px solid #d0d0d0;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .action-btn:hover {
    background-color: #e0e0e0;
  }

  .edit-btn {
    background-color: #e3f2fd;
    border-color: #2196f3;
    color: #0d47a1;
  }

  .edit-btn:hover {
    background-color: #bbdefb;
  }

  .btn-icon {
    font-size: 0.9rem;
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