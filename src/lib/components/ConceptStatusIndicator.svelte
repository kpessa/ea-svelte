<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { concepts } from '../stores';
  import type { Concept } from '../types';

  // Props for individual concept status
  export let value: boolean = false;
  export let isActive: boolean = true;
  export let conceptName: string;
  
  let unsubscribe: () => void;

  // Subscribe to concepts store
  onMount(() => {
    unsubscribe = concepts.subscribe((storeValue) => {
      if (conceptName && storeValue[conceptName]) {
        value = storeValue[conceptName].value;
        isActive = storeValue[conceptName].isActive;
      }
    });
  });

  // Unsubscribe when component is destroyed
  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });
  
  // Determine the status class based on props
  $: statusClass = isActive 
    ? (value ? 'active-true' : 'active-false') 
    : 'inactive';
</script>

<div 
  class="concept-status {statusClass}" 
  role="status"
  aria-label="Concept status: {isActive ? (value ? 'Active and True' : 'Active and False') : 'Inactive'}"
>
  {#if isActive}
    {value ? '✓' : '✗'}
  {:else}
    <span class="inactive-icon">○</span>
  {/if}
</div>

<style>
  /* Individual concept status styles */
  .concept-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-weight: bold;
    font-size: 14px;
  }
  
  .active-true {
    background-color: #4caf50;
    color: white;
  }
  
  .active-false {
    background-color: #f44336;
    color: white;
  }
  
  .inactive {
    background-color: #e0e0e0;
    color: #999;
  }
  
  .inactive-icon {
    font-size: 16px;
  }
</style> 