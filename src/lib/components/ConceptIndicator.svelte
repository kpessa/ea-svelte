<script lang="ts">
  import type { Concept } from '../types';
  import { createEventDispatcher } from 'svelte';
  
  export let conceptName: string = '';
  export let concept: Concept | undefined = undefined;
  export let showValue: boolean = true;
  export let showName: boolean = true;
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let interactive: boolean = false;
  
  const dispatch = createEventDispatcher<{
    toggle: { name: string, newConcept: Concept | undefined }
  }>();
  
  // Compute the state of the concept
  $: state = getConceptState(concept);
  $: stateClass = getStateClass(state);
  $: sizeClass = getSizeClass(size);
  $: interactiveClass = interactive ? 'interactive' : '';
  
  // Get the concept state
  function getConceptState(concept: Concept | undefined): 'active-true' | 'active-false' | 'inactive' {
    if (!concept) return 'inactive';
    
    if (concept.isActive) {
      return concept.value ? 'active-true' : 'active-false';
    }
    
    return 'inactive';
  }
  
  // Get the CSS class for the state
  function getStateClass(state: 'active-true' | 'active-false' | 'inactive'): string {
    switch (state) {
      case 'active-true':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'active-false':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'inactive':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }
  
  // Get the CSS class for the size
  function getSizeClass(size: 'small' | 'medium' | 'large'): string {
    switch (size) {
      case 'small':
        return 'text-xs py-0.5 px-1.5';
      case 'large':
        return 'text-base py-1.5 px-3';
      case 'medium':
      default:
        return 'text-sm py-1 px-2';
    }
  }
  
  // Get the icon for the state
  function getStateIcon(state: 'active-true' | 'active-false' | 'inactive'): string {
    switch (state) {
      case 'active-true':
        return '✓';
      case 'active-false':
        return '✗';
      case 'inactive':
      default:
        return '○';
    }
  }
  
  // Toggle the concept state when clicked
  function toggleConceptState() {
    if (!interactive) return;
    
    let newConcept: Concept | undefined;
    
    if (!concept) {
      // If undefined, set to active-true
      newConcept = { value: true, isActive: true };
    } else if (concept.isActive && concept.value) {
      // If active-true, set to active-false
      newConcept = { value: false, isActive: true };
    } else if (concept.isActive && !concept.value) {
      // If active-false, set to inactive
      newConcept = { value: false, isActive: false };
    } else {
      // If inactive, set to undefined
      newConcept = undefined;
    }
    
    dispatch('toggle', { name: conceptName, newConcept });
  }
</script>

<div 
  class="concept-indicator {stateClass} {sizeClass} {interactiveClass}" 
  title="{conceptName}: {concept?.value ? 'True' : 'False'} ({concept?.isActive ? 'Active' : 'Inactive'}){interactive ? ' - Click to toggle state' : ''}"
  on:click={toggleConceptState}
>
  <span class="concept-icon">{getStateIcon(state)}</span>
  {#if showName}
    <span class="concept-name">{conceptName}</span>
  {/if}
  {#if showValue && concept?.isActive}
    <span class="concept-value">{concept?.value ? 'True' : 'False'}</span>
  {/if}
</div>

<style>
  .concept-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 0.25rem;
    border-width: 1px;
    font-weight: 500;
    white-space: nowrap;
  }
  
  .concept-icon {
    font-weight: bold;
  }
  
  .concept-name {
    font-weight: 600;
  }
  
  .concept-value {
    font-style: italic;
  }
  
  .interactive {
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .interactive:hover {
    filter: brightness(0.95);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .interactive:active {
    transform: translateY(0);
    box-shadow: none;
  }
</style> 