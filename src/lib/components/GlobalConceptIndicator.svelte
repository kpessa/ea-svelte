<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { concepts } from '../stores';
  import type { Concept } from '../types';

  // Local state for global concept counts
  let conceptsSnapshot: Record<string, Concept> = {};
  let activeConceptCount = 0;
  let totalConceptCount = 0;
  let unsubscribe: () => void;
  let showTooltip = false;
  let tooltipPinned = false;
  let activeConceptsList: { name: string; value: any }[] = [];
  let inactiveConceptsList: { name: string; value: any }[] = [];

  // Subscribe to concepts store
  onMount(() => {
    unsubscribe = concepts.subscribe((storeValue) => {
      conceptsSnapshot = { ...storeValue };
      updateCounts();
      updateConceptsLists();
    });
  });

  // Unsubscribe when component is destroyed
  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });

  // Update the concept counts
  function updateCounts() {
    totalConceptCount = Object.keys(conceptsSnapshot).length;
    activeConceptCount = Object.values(conceptsSnapshot).filter(c => c.isActive).length;
  }

  // Update the lists of active and inactive concepts
  function updateConceptsLists() {
    // Get active concepts
    activeConceptsList = Object.entries(conceptsSnapshot)
      .filter(([_, concept]) => concept.isActive)
      .map(([name, concept]) => ({
        name,
        value: concept.value
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
      
    // Get inactive concepts
    inactiveConceptsList = Object.entries(conceptsSnapshot)
      .filter(([_, concept]) => !concept.isActive)
      .map(([name, concept]) => ({
        name,
        value: concept.value
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // Function to clear all concepts
  function clearAllConcepts() {
    console.log('[GlobalConceptIndicator] Clear All button clicked. Resetting concepts to inactive state.');
    concepts.update(currentConcepts => {
      const resetConcepts: Record<string, Concept> = {};
      for (const conceptName in currentConcepts) {
        // Keep the concept key, but reset its state
        resetConcepts[conceptName] = {
          value: false,    // Reset value to default
          isActive: false, // Reset active state to default
          description: currentConcepts[conceptName]?.description // Keep description if it exists
        };
      }
      return resetConcepts;
    });
    
    // Dispatch an event to notify other components
    const event = new CustomEvent('concepts-applied', { bubbles: true });
    document.dispatchEvent(event);
  }

  // Toggle tooltip visibility
  function toggleTooltip() {
    tooltipPinned = !tooltipPinned;
    showTooltip = tooltipPinned;
  }

  // Handle mouse enter/leave
  function handleMouseEnter() {
    if (!tooltipPinned) {
      showTooltip = true;
    }
  }

  function handleMouseLeave() {
    if (!tooltipPinned) {
      showTooltip = false;
    }
  }

  // Close tooltip
  function closeTooltip() {
    tooltipPinned = false;
    showTooltip = false;
  }
</script>

<div 
  class="concept-status-indicator"
  role="button"
  tabindex="0"
  aria-expanded={showTooltip}
  aria-label="Concept status indicator: {activeConceptCount} active out of {totalConceptCount} total concepts"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  on:click={toggleTooltip}
  on:keydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      toggleTooltip();
      e.preventDefault();
    }
  }}
>
  <div class="indicator-content">
    <div class="concept-count">
      <span class="count-value">{activeConceptCount}</span>
      <span class="count-label">active</span>
    </div>
    <div class="concept-total">
      <span class="total-value">{totalConceptCount}</span>
      <span class="total-label">total</span>
    </div>
  </div>
  <div class="indicator-icon">🧠</div>

  {#if showTooltip && (activeConceptsList.length > 0 || inactiveConceptsList.length > 0 || tooltipPinned)}
    <div 
      class="concepts-tooltip"
      role="tooltip"
      on:click|stopPropagation={() => {}}
    >
      <div class="tooltip-header">
        <h4>Concepts ({totalConceptCount})</h4>
        <div class="tooltip-actions">
          <button 
            class="clear-all-btn"
            on:click|stopPropagation={clearAllConcepts}
            title="Clear all concepts"
          >
            Clear All
          </button>
          <button 
            class="close-tooltip-btn"
            on:click|stopPropagation={closeTooltip}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>
      
      {#if activeConceptsList.length > 0}
        <h4>Active Concepts ({activeConceptsList.length})</h4>
        <div class="concepts-list">
          {#each activeConceptsList as concept}
            <div class="concept-item">
              <span class="concept-name">{concept.name}</span>
              <span class="concept-value {typeof concept.value === 'boolean' ? (concept.value ? 'true' : 'false') : 'other'}">
                {concept.value?.toString() || 'undefined'}
              </span>
            </div>
          {/each}
        </div>
      {/if}
      
      {#if inactiveConceptsList.length > 0}
        <h4>Inactive Concepts ({inactiveConceptsList.length})</h4>
        <div class="concepts-list">
          {#each inactiveConceptsList as concept}
            <div class="concept-item inactive">
              <span class="concept-name">{concept.name}</span>
              <span class="concept-value false">
                false
              </span>
            </div>
          {/each}
        </div>
      {/if}
      
      {#if activeConceptsList.length === 0 && inactiveConceptsList.length === 0}
        <div class="no-concepts">
          No concepts defined
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .concept-status-indicator {
    display: flex;
    align-items: center;
    background-color: #f0f0f0;
    border-radius: 20px;
    padding: 4px 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-right: 10px;
    cursor: pointer;
    transition: background-color 0.2s;
    position: relative;
  }

  .concept-status-indicator:hover {
    background-color: #e0e0e0;
  }

  .indicator-content {
    display: flex;
    flex-direction: column;
    margin-right: 8px;
  }

  .concept-count {
    display: flex;
    align-items: baseline;
  }

  .count-value {
    font-weight: bold;
    font-size: 14px;
    color: #4caf50;
  }

  .count-label {
    font-size: 10px;
    color: #666;
    margin-left: 3px;
  }

  .concept-total {
    display: flex;
    align-items: baseline;
    font-size: 10px;
    color: #666;
  }

  .total-value {
    font-weight: bold;
  }

  .total-label {
    margin-left: 3px;
  }

  .indicator-icon {
    font-size: 18px;
  }

  .concepts-tooltip {
    position: absolute;
    top: 100%;
    left: 0;
    /* margin-top: 8px; */ /* Removed margin causing the gap */
    padding-top: 8px; /* Add padding inside instead */
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    min-width: 250px;
    max-width: 400px;
    z-index: 1000;
  }

  .tooltip-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0;
    padding: 8px 12px;
    background-color: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .tooltip-header h4 {
    margin: 0;
    font-size: 14px;
    color: #333;
  }
  
  .tooltip-actions {
    display: flex;
    gap: 8px;
  }
  
  .clear-all-btn {
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 3px;
    padding: 4px 8px;
    font-size: 11px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .clear-all-btn:hover {
    background-color: #d32f2f;
  }
  
  .close-tooltip-btn {
    background: none;
    border: none;
    font-size: 16px;
    color: #666;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
    border-radius: 3px;
  }
  
  .close-tooltip-btn:hover {
    background-color: #e0e0e0;
    color: #333;
  }
  
  .no-concepts {
    padding: 15px;
    text-align: center;
    color: #666;
    font-style: italic;
  }

  .concepts-list {
    max-height: 300px;
    overflow-y: auto;
    padding: 8px 0;
  }

  .concept-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 12px;
    font-size: 13px;
  }

  .concept-item:hover {
    background-color: #f5f5f5;
  }

  .concept-name {
    font-family: monospace;
    color: #333;
  }

  .concept-value {
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
    font-weight: 500;
  }

  .concept-value.true {
    background-color: #e8f5e9;
    color: #2e7d32;
  }

  .concept-value.false {
    background-color: #ffebee;
    color: #c62828;
  }

  .concept-item.inactive {
    opacity: 0.7;
    background-color: #f8f8f8;
  }

  .concept-value.other {
    background-color: #e3f2fd;
    color: #0d47a1;
  }
</style> 