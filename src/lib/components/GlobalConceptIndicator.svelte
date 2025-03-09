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
  let activeConceptsList: { name: string; value: boolean }[] = [];

  // Subscribe to concepts store
  onMount(() => {
    unsubscribe = concepts.subscribe((storeValue) => {
      conceptsSnapshot = { ...storeValue };
      updateCounts();
      updateActiveConceptsList();
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

  // Update the list of active concepts
  function updateActiveConceptsList() {
    activeConceptsList = Object.entries(conceptsSnapshot)
      .filter(([_, concept]) => concept.isActive)
      .map(([name, concept]) => ({
        name,
        value: concept.value
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
</script>

<div 
  class="concept-status-indicator"
  role="button"
  tabindex="0"
  aria-expanded={showTooltip}
  aria-label="Concept status indicator: {activeConceptCount} active out of {totalConceptCount} total concepts"
  on:mouseenter={() => showTooltip = true}
  on:mouseleave={() => showTooltip = false}
  on:keydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      showTooltip = !showTooltip;
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

  {#if showTooltip && activeConceptsList.length > 0}
    <div 
      class="concepts-tooltip"
      role="tooltip"
    >
      <h4>Active Concepts ({activeConceptsList.length})</h4>
      <div class="concepts-list">
        {#each activeConceptsList as concept}
          <div class="concept-item">
            <span class="concept-name">{concept.name}</span>
            <span class="concept-value {concept.value ? 'true' : 'false'}">
              {concept.value ? 'True' : 'False'}
            </span>
          </div>
        {/each}
      </div>
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
    margin-top: 8px;
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    min-width: 250px;
    max-width: 400px;
    z-index: 1000;
  }

  .concepts-tooltip h4 {
    margin: 0;
    padding: 8px 12px;
    background-color: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
    font-size: 14px;
    color: #333;
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
</style> 