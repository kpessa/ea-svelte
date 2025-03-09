<!-- GlobalConceptStatus.svelte -->
<script lang="ts">
  import ConceptStatusIndicator from './ConceptStatusIndicator.svelte';
  import { concepts } from '../stores';
</script>

<div class="global-concept-status">
  <div class="status-header">
    <h3>Global Concept Status</h3>
    <div class="status-legend">
      <div class="legend-item">
        <span class="dot active"></span>
        <span>Active</span>
      </div>
      <div class="legend-item">
        <span class="dot inactive"></span>
        <span>Inactive</span>
      </div>
    </div>
  </div>
  <div class="concept-grid">
    {#each Object.entries($concepts) as [conceptName, status]}
      <div class="concept-status-item">
        <ConceptStatusIndicator 
          value={status.value} 
          isActive={status.isActive} 
          conceptName={conceptName}
        />
        <span class="concept-label">{conceptName}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .global-concept-status {
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e0e0e0;
  }

  .status-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
    font-weight: 500;
  }

  .status-legend {
    display: flex;
    gap: 1rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #666;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }

  .dot.active {
    background-color: #4caf50;
  }

  .dot.inactive {
    background-color: #9e9e9e;
  }

  .concept-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .concept-status-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
  }

  .concept-label {
    font-size: 0.9rem;
    color: #495057;
    font-family: monospace;
  }
</style> 