<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { TestPath, TestStep, ConceptChange } from '../types';
  import { concepts } from '../stores';
  
  export let path: TestPath | null = null;
  
  const dispatch = createEventDispatcher();
  
  // Group concept changes by step
  $: conceptsByStep = path ? groupConceptsByStep(path) : [];
  
  // Get all unique concepts from the path
  $: allConcepts = path ? getAllConcepts(path) : [];
  
  // Group concept changes by step
  function groupConceptsByStep(path: TestPath) {
    return path.steps.map(step => ({
      step,
      conceptChanges: step.conceptChanges
    }));
  }
  
  // Get all unique concepts from the path
  function getAllConcepts(path: TestPath) {
    const conceptSet = new Set<string>();
    
    path.steps.forEach(step => {
      step.conceptChanges.forEach(change => {
        conceptSet.add(change.conceptName);
      });
    });
    
    return Array.from(conceptSet).sort();
  }
  
  // Apply concepts from the selected path to the current state
  function applyPathConcepts() {
    if (!path) return;
    
    // Get the last step to apply all concept changes up to that point
    const lastStep = path.steps[path.steps.length - 1];
    if (!lastStep) return;
    
    // Update the concepts store directly
    concepts.update(state => {
      // Create a copy of the current state
      const newState = { ...state };
      
      // Apply each concept change
      lastStep.conceptChanges.forEach(change => {
        if (newState[change.conceptName]) {
          newState[change.conceptName] = {
            ...newState[change.conceptName],
            value: change.value,
            isActive: change.isActive
          };
        }
      });
      
      return newState;
    });
    
    // Dispatch event to notify parent component
    dispatch('conceptsApplied');
  }
</script>

<div class="node-concepts-panel">
  {#if path}
    <div class="panel-header">
      <h3>Concepts for: {path.name}</h3>
    </div>
    
    <div class="panel-content">
      <div class="concepts-summary">
        <h4>All Concepts in Path</h4>
        <ul class="concept-list">
          {#each allConcepts as concept}
            <li>{concept}</li>
          {/each}
        </ul>
      </div>
      
      <div class="concepts-by-step">
        <h4>Concepts by Step</h4>
        {#each conceptsByStep as { step, conceptChanges }, index}
          <div class="step-concepts">
            <h5>Step {index + 1}: {step.name}</h5>
            <ul class="concept-changes">
              {#each conceptChanges as change}
                <li>
                  <span class="concept-name">{change.conceptName}:</span>
                  <span class="concept-value">{change.value ? 'true' : 'false'}</span>
                  <span class="concept-active">{change.isActive ? '(active)' : '(inactive)'}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
      
      <div class="actions">
        <button class="apply-button" on:click={applyPathConcepts}>
          Apply Concepts from Path
        </button>
      </div>
    </div>
  {:else}
    <div class="no-path-selected">
      <p>Select a node in the graph to view its concepts.</p>
    </div>
  {/if}
</div>

<style>
  .node-concepts-panel {
    height: 100%;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    background-color: #f9f9f9;
    overflow: auto;
  }
  
  .panel-header {
    padding: 1rem;
    border-bottom: 1px solid #e8e8e8;
    background-color: #fafafa;
  }
  
  .panel-header h3 {
    margin: 0;
    font-size: 1.2rem;
    color: #333;
  }
  
  .panel-content {
    padding: 1rem;
  }
  
  .concepts-summary {
    margin-bottom: 1.5rem;
  }
  
  .concepts-summary h4 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    color: #333;
  }
  
  .concept-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .concept-list li {
    background-color: #e6f7ff;
    color: #1890ff;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  
  .concepts-by-step h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1rem;
    color: #333;
  }
  
  .step-concepts {
    margin-bottom: 1rem;
    padding: 0.75rem;
    background-color: white;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
  }
  
  .step-concepts h5 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #333;
  }
  
  .concept-changes {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .concept-changes li {
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
  }
  
  .concept-name {
    font-weight: 500;
  }
  
  .concept-value {
    margin-left: 0.25rem;
    color: #52c41a;
  }
  
  .concept-active {
    margin-left: 0.25rem;
    color: #722ed1;
    font-style: italic;
  }
  
  .actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: center;
  }
  
  .apply-button {
    padding: 0.5rem 1rem;
    background-color: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .apply-button:hover {
    background-color: #40a9ff;
  }
  
  .no-path-selected {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #999;
    font-style: italic;
  }
</style> 