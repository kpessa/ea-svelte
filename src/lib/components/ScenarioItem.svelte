<!-- ScenarioItem.svelte -->
<script lang="ts">
  import type { TestSubScenario } from '../types';
  import { slide } from 'svelte/transition';
  import ScenarioActions from './ScenarioActions.svelte';
  import ScenarioDetails from './ScenarioDetails.svelte';
  import { setContext, getContext } from 'svelte';

  export let scenario: TestSubScenario;
  export let allScenarios: TestSubScenario[] = [];
  export let selectedScenarioId: string | null = null;
  export let onScenarioSelect: (scenarioId: string) => void = () => {};
  export let isEditable: boolean = false;
  export let onAddSubScenario: (parentId: string) => void = () => {};
  export let onAddExpectedResult: (scenarioId: string) => void = () => {};
  export let onEditConcepts: (scenarioId: string) => void = () => {};
  export let onDeleteScenario: (scenarioId: string) => void = () => {};

  let isExpanded = false;

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

  // Try to get context from parent, or use props
  try {
    const parentContext = getContext<ScenarioContext>('scenario-context');
    // Use parent context if available, otherwise use props
    if (parentContext) {
      allScenarios = parentContext.allScenarios;
      isEditable = parentContext.isEditable;
      onScenarioSelect = parentContext.onScenarioSelect;
      onAddSubScenario = parentContext.onAddSubScenario;
      onAddExpectedResult = parentContext.onAddExpectedResult;
      onEditConcepts = parentContext.onEditConcepts;
      onDeleteScenario = parentContext.onDeleteScenario;
    }
  } catch (e) {
    // No parent context, use props
  }

  // Provide context for child components
  setContext<ScenarioContext>('scenario-context', {
    allScenarios,
    isEditable,
    onScenarioSelect,
    onAddSubScenario,
    onAddExpectedResult,
    onEditConcepts,
    onDeleteScenario
  });

  function handleHeaderClick() {
    isExpanded = !isExpanded;
    onScenarioSelect(scenario.id);
  }
</script>

<div class="scenario-item {selectedScenarioId === scenario.id ? 'selected' : ''}" 
     role="treeitem" 
     aria-expanded={isExpanded}>
  <div class="scenario-header" on:click={handleHeaderClick}>
    <div class="scenario-name">
      <span class="expand-icon" aria-hidden="true">{isExpanded ? '▼' : '▶'}</span> 
      {scenario.name}
    </div>
    {#if isEditable}
      <ScenarioActions scenarioId={scenario.id} />
    {/if}
  </div>

  {#if isExpanded && selectedScenarioId === scenario.id}
    <ScenarioDetails {scenario} />
  {/if}

  {#if scenario.children.length > 0}
    <div class="child-scenarios" class:hidden={!isExpanded} role="group">
      {#each scenario.children as childScenario}
        <svelte:self
          scenario={childScenario}
          {selectedScenarioId}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .scenario-item {
    margin-bottom: 0.5rem;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .scenario-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .scenario-header:hover {
    background-color: #f0f7ff;
  }

  .scenario-item.selected > .scenario-header {
    background-color: #e3f2fd;
    border-color: #2196f3;
  }

  .scenario-name {
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .expand-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    text-align: center;
    line-height: 16px;
    color: #666;
    transition: transform 0.2s ease;
  }

  .child-scenarios {
    margin-left: 1rem;
    border-left: 2px solid #e0e0e0;
    padding-left: 0.5rem;
    transition: all 0.3s ease;
  }

  .child-scenarios.hidden {
    display: none;
  }
</style> 