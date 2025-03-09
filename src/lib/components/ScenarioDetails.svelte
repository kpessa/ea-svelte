<!-- ScenarioDetails.svelte -->
<script lang="ts">
  import type { TestSubScenario } from '../types';
  import { getActiveConcepts, groupConceptsByCategory } from '../utils/scenario-utils';
  import ConceptGroup from './ConceptGroup.svelte';
  import ExpectedResults from './ExpectedResults.svelte';
  import GlobalConceptIndicator from './GlobalConceptIndicator.svelte';
  import { slide } from 'svelte/transition';
  import { getContext } from 'svelte';

  export let scenario: TestSubScenario;
  
  // Define the context type
  type ScenarioContext = {
    allScenarios: TestSubScenario[];
    isEditable: boolean;
    onEditConcepts: (scenarioId: string) => void;
    onScenarioSelect: (scenarioId: string) => void;
    onAddSubScenario: (parentId: string) => void;
    onAddExpectedResult: (scenarioId: string) => void;
    onDeleteScenario: (scenarioId: string) => void;
  };
  
  // Get common props from context with type
  const { allScenarios, isEditable, onEditConcepts } = getContext<ScenarioContext>('scenario-context');
</script>

<div class="scenario-details" transition:slide role="region" aria-label="Scenario details">
  <div class="scenario-description">
    {scenario.description || 'No description provided.'}
  </div>

  <div class="concept-summary">
    <h4 id="concepts-heading">Concepts</h4>
    <GlobalConceptIndicator />

    {#if getActiveConcepts(scenario, allScenarios).length === 0}
      <div class="no-concepts" aria-labelledby="concepts-heading">
        <p>No concepts defined for this scenario.</p>
      </div>
    {:else}
      <div class="concept-groups" aria-labelledby="concepts-heading">
        {#each Object.entries(groupConceptsByCategory(getActiveConcepts(scenario, allScenarios))) as [category, conceptList]}
          <ConceptGroup {category} concepts={conceptList} />
        {/each}
      </div>
    {/if}
  </div>

  {#if scenario.expectedResults.length > 0}
    <ExpectedResults results={scenario.expectedResults} />
  {/if}

  {#if isEditable && scenario.concepts.length === 0}
    <div class="no-concepts-warning" role="alert">
      <p>This scenario has no concepts defined. Click "Edit Concepts" to add some.</p>
      <button class="action-btn edit-btn" on:click={() => onEditConcepts(scenario.id)}>
        <span class="btn-icon" aria-hidden="true">✏️</span> Edit Concepts
      </button>
    </div>
  {/if}
</div>

<style>
  .scenario-details {
    padding: 1rem;
    background-color: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-top: none;
    border-radius: 0 0 4px 4px;
    margin-top: -4px;
  }

  .scenario-description {
    margin-bottom: 1rem;
    font-style: italic;
    color: #666;
  }

  .concept-summary {
    margin-top: 1rem;
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 1rem;
  }

  .concept-summary h4 {
    margin-top: 0;
    margin-bottom: 0.75rem;
    color: #333;
    font-size: 1rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
  }

  .no-concepts {
    padding: 1rem;
    background-color: #f9f9f9;
    border: 1px dashed #ccc;
    border-radius: 4px;
    text-align: center;
    color: #666;
    font-style: italic;
  }

  .concept-groups {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .no-concepts-warning {
    background-color: #fff8e1;
    border: 1px solid #ffe082;
    border-radius: 4px;
    padding: 1rem;
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .no-concepts-warning p {
    margin: 0;
    color: #ff8f00;
    font-style: italic;
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
</style> 