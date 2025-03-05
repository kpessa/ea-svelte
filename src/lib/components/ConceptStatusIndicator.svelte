<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { concepts } from '../stores';
  import type { Concept } from '../types';

  // Local state
  let conceptsSnapshot: Record<string, Concept> = {};
  let activeConceptCount = 0;
  let totalConceptCount = 0;
  let unsubscribe: () => void;

  // Subscribe to concepts store
  onMount(() => {
    unsubscribe = concepts.subscribe((value) => {
      conceptsSnapshot = { ...value };
      updateCounts();
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
</script>

<div class="concept-status-indicator">
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
  <div class="indicator-icon" title="Active Concepts: {activeConceptCount} / {totalConceptCount}">
    🧠
  </div>
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
</style> 