<!-- ConceptGroup.svelte -->
<script lang="ts">
  import type { ConceptChange } from '../types';
  import ConceptStatusIndicator from './ConceptStatusIndicator.svelte';

  export let category: string;
  export let concepts: ConceptChange[];
</script>

<div class="concept-group">
  <h5>{category}</h5>
  <div class="concept-list">
    {#each concepts as concept}
      <div class="concept-item {concept.inherited ? 'inherited' : ''}">
        <div class="concept-details">
          <span class="concept-name">{concept.conceptName}</span>
          {#if concept.inherited}
            <span class="inherited-badge" title="Inherited from parent scenario">
              Inherited
            </span>
          {/if}
        </div>
        <ConceptStatusIndicator 
          value={concept.value} 
          isActive={concept.isActive} 
          conceptName={concept.conceptName} 
        />
      </div>
    {/each}
  </div>
</div>

<style>
  .concept-group {
    flex: 1;
    min-width: 250px;
    background-color: #f9f9f9;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 0.75rem;
  }

  .concept-group h5 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    color: #333;
    font-size: 0.9rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.25rem;
  }

  .concept-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .concept-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }

  .concept-item:hover {
    background-color: #f0f7ff;
  }

  .concept-item.inherited {
    border-left: 3px solid #9c27b0;
  }

  .concept-details {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .concept-name {
    font-size: 0.9rem;
    font-family: monospace;
    color: #555;
  }

  .inherited-badge {
    display: inline-block;
    padding: 0.1rem 0.3rem;
    background-color: #f3e5f5;
    color: #9c27b0;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 500;
  }
</style> 