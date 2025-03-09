<script lang="ts">
  export let isEditMode: boolean = false;

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{
    saveScenarios: void;
    clearTestResults: void;
    toggleEditMode: void;
  }>();

  function handleSaveScenarios() {
    dispatch('saveScenarios');
  }

  function handleClearTestResults() {
    dispatch('clearTestResults');
  }

  function handleToggleEditMode() {
    dispatch('toggleEditMode');
  }
</script>

<div class="manager-header">
  <h2>Test Case Manager</h2>
  
  <div class="header-actions">
    <button class="action-btn" on:click={handleSaveScenarios}>
      Save Scenarios
    </button>
    <button class="action-btn" on:click={handleClearTestResults}>
      Clear Test Results
    </button>
    <button class="action-btn {isEditMode ? 'active' : ''}" on:click={handleToggleEditMode}>
      {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
    </button>
  </div>
</div>

<style>
  .manager-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #f0f0f0;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .manager-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }
  
  .header-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .action-btn {
    padding: 0.5rem 1rem;
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .action-btn:hover {
    background-color: #e0e0e0;
  }
  
  .action-btn.active {
    background-color: #e3f2fd;
    border-color: #2196f3;
    color: #0d47a1;
  }
</style> 