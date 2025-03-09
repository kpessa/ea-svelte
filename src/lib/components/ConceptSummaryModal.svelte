<script lang="ts">
  import type { ConceptChange } from '../types';

  export let isOpen: boolean = false;
  export let appliedConcepts: ConceptChange[] = [];
  export let inheritedConcepts: ConceptChange[] = [];
  export let totalConceptCount: number = 0;

  function handleClose() {
    dispatch('close');
  }

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{
    close: void;
  }>();
</script>

{#if isOpen}
  <div class="modal-overlay" on:click={handleClose}>
    <div class="modal-content summary-modal" on:click|stopPropagation>
      <div class="summary-header">
        <h3>Applied Concepts Summary</h3>
        <button class="close-btn" on:click={handleClose}>×</button>
      </div>
      
      <div class="summary-content">
        <p>Successfully applied {totalConceptCount} concepts to the application.</p>
        
        {#if inheritedConcepts.length > 0}
          <div class="inherited-concepts-summary">
            <h4>Inherited Concepts ({inheritedConcepts.length})</h4>
            <table class="summary-table">
              <thead>
                <tr>
                  <th>Concept</th>
                  <th>Value</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {#each inheritedConcepts as concept}
                  <tr>
                    <td>{concept.conceptName}</td>
                    <td>
                      <span class="concept-value {concept.value ? 'true' : 'false'}">
                        {concept.value ? 'True' : 'False'}
                      </span>
                    </td>
                    <td>
                      <span class="concept-active {concept.isActive ? 'active' : 'inactive'}">
                        {concept.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <p>No concepts were inherited from parent scenarios.</p>
        {/if}

        {#if appliedConcepts.length > 0}
          <div class="applied-concepts-summary">
            <h4>Directly Applied Concepts ({appliedConcepts.length})</h4>
            <table class="summary-table">
              <thead>
                <tr>
                  <th>Concept</th>
                  <th>Value</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {#each appliedConcepts as concept}
                  <tr>
                    <td>{concept.conceptName}</td>
                    <td>
                      <span class="concept-value {concept.value ? 'true' : 'false'}">
                        {concept.value ? 'True' : 'False'}
                      </span>
                    </td>
                    <td>
                      <span class="concept-active {concept.isActive ? 'active' : 'inactive'}">
                        {concept.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
      
      <div class="summary-actions">
        <button class="action-btn primary" on:click={handleClose}>
          Close
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    width: 80%;
    max-width: 800px;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #f0f0f0;
    border-bottom: 1px solid #e0e0e0;
  }

  .summary-header h3 {
    margin: 0;
    color: #333;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }

  .summary-content {
    padding: 1rem;
    max-height: 60vh;
    overflow-y: auto;
  }

  .inherited-concepts-summary,
  .applied-concepts-summary {
    margin-top: 1rem;
    background-color: #f9f9f9;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 1rem;
  }

  .inherited-concepts-summary h4,
  .applied-concepts-summary h4 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    color: #333;
  }

  .summary-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0.5rem;
  }

  .summary-table th,
  .summary-table td {
    padding: 0.5rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }

  .summary-table th {
    background-color: #f0f0f0;
    font-weight: 500;
  }

  .concept-value,
  .concept-active {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
  }

  .concept-value.true {
    background-color: #e8f5e9;
    color: #2e7d32;
  }

  .concept-value.false {
    background-color: #ffebee;
    color: #c62828;
  }

  .concept-active.active {
    background-color: #e3f2fd;
    color: #0d47a1;
  }

  .concept-active.inactive {
    background-color: #f5f5f5;
    color: #757575;
  }

  .summary-actions {
    padding: 1rem;
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid #e0e0e0;
  }

  .action-btn {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn.primary {
    background-color: #2196f3;
    color: white;
    border: none;
  }

  .action-btn.primary:hover {
    background-color: #1976d2;
  }
</style> 