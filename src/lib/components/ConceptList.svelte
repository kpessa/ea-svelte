<script lang="ts">
  import type { Concept } from '../types';
  import ConceptIndicator from './ConceptIndicator.svelte';
  import { createEventDispatcher } from 'svelte';
  
  export let concepts: Record<string, Concept> = {};
  export let filter: 'all' | 'active' | 'inactive' = 'all';
  export let showValue: boolean = true;
  export let showName: boolean = true;
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let searchTerm: string = '';
  export let interactive: boolean = false;
  
  const dispatch = createEventDispatcher<{
    conceptChange: { name: string, concept: Concept | undefined, concepts: Record<string, Concept> }
  }>();
  
  // Filter concepts based on the filter and search term
  $: filteredConcepts = Object.entries(concepts)
    .filter(([name, concept]) => {
      // Filter by active/inactive
      if (filter === 'active' && !concept.isActive) return false;
      if (filter === 'inactive' && concept.isActive) return false;
      
      // Filter by search term
      if (searchTerm && !name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      
      return true;
    })
    .sort(([nameA], [nameB]) => nameA.localeCompare(nameB));
    
  // Handle concept toggle
  function handleConceptToggle(event: CustomEvent<{ name: string, newConcept: Concept | undefined }>) {
    const { name, newConcept } = event.detail;
    
    // Create a new concepts object with the updated concept
    const updatedConcepts = { ...concepts };
    
    if (newConcept === undefined) {
      delete updatedConcepts[name];
    } else {
      updatedConcepts[name] = newConcept;
    }
    
    // Dispatch the event with the updated concepts
    dispatch('conceptChange', { 
      name, 
      concept: newConcept, 
      concepts: updatedConcepts 
    });
  }
</script>

<div class="concept-list">
  {#if filteredConcepts.length === 0}
    <div class="empty-message">
      {#if searchTerm}
        No concepts matching "{searchTerm}"
      {:else if filter === 'active'}
        No active concepts
      {:else if filter === 'inactive'}
        No inactive concepts
      {:else}
        No concepts available
      {/if}
    </div>
  {:else}
    <div class="concept-grid">
      {#each filteredConcepts as [name, concept]}
        <div class="concept-item">
          <ConceptIndicator 
            conceptName={name}
            concept={concept}
            {showValue}
            {showName}
            {size}
            {interactive}
            on:toggle={handleConceptToggle}
          />
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .concept-list {
    width: 100%;
  }
  
  .empty-message {
    padding: 1rem;
    text-align: center;
    color: #666;
    font-style: italic;
    background-color: #f9f9f9;
    border-radius: 0.25rem;
    border: 1px solid #eee;
  }
  
  .concept-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .concept-item {
    margin-bottom: 0.25rem;
  }
</style> 