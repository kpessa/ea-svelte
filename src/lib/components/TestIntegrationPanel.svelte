<script lang="ts">
  import type { TestScenario, TestPath, ConceptChange, TestStep } from '../types';
  
  export let testScenarios: TestScenario[] = [];
  export let selectedConcepts: string[] = [];
  export let conceptChangeValues: Record<string, boolean> = {};
  export let conceptChangeActive: Record<string, boolean> = {};
  
  let selectedScenarioId: string | null = null;
  let selectedPathId: string | null = null;
  let newStepName: string = '';
  let selectedTab: 'add' | 'apply' = 'add';
  
  // Define a type that extends TestScenario with the paths property
  interface ExtendedTestScenario extends TestScenario {
    paths: TestPath[];
  }
  
  $: selectedScenario = selectedScenarioId 
    ? testScenarios.find(s => s.id === selectedScenarioId) as ExtendedTestScenario | undefined
    : null;
    
  $: selectedPath = selectedScenario && selectedPathId 
    ? selectedScenario.paths.find((p: TestPath) => p.id === selectedPathId) 
    : null;
  
  function addToTestScenario() {
    if (!selectedScenarioId || !selectedPathId || !newStepName.trim() || selectedConcepts.length === 0) {
      return { success: false, error: 'Please select a scenario, path, enter a step name, and select at least one concept.' };
    }
    
    const conceptChanges = selectedConcepts.map(conceptName => ({
      conceptName,
      value: conceptChangeValues[conceptName] || false,
      isActive: conceptChangeActive[conceptName] || true
    }));
    
    // Dispatch event to notify parent component
    const event = new CustomEvent('addToTestScenario', {
      detail: {
        scenarioId: selectedScenarioId,
        pathId: selectedPathId,
        stepName: newStepName,
        conceptChanges
      }
    });
    dispatchEvent(event);
    
    return { success: true };
  }
  
  function applyConceptsFromScenarioStep(scenarioId: string, pathId: string, stepIndex: number) {
    if (!scenarioId || !pathId) return;
    
    // Dispatch event to notify parent component
    const event = new CustomEvent('applyFromTestScenario', {
      detail: {
        scenarioId,
        pathId,
        stepIndex
      }
    });
    dispatchEvent(event);
  }
</script>

<div class="test-integration">
  <h3>Test Framework Integration</h3>
  
  <div class="integration-tabs">
    <button 
      class="tab-button {selectedTab === 'add' ? 'active' : ''}" 
      on:click={() => selectedTab = 'add'}
    >
      Add to Test
    </button>
    <button 
      class="tab-button {selectedTab === 'apply' ? 'active' : ''}" 
      on:click={() => selectedTab = 'apply'}
    >
      Apply from Test
    </button>
  </div>
  
  {#if selectedTab === 'add'}
    <p class="integration-info">
      Add the current concept state to a test scenario step.
    </p>
    
    <div class="form-group">
      <label for="scenario-select">Select Scenario:</label>
      <select 
        id="scenario-select" 
        bind:value={selectedScenarioId}
      >
        <option value="">-- Select a Scenario --</option>
        {#each testScenarios as scenario}
          <option value={scenario.id}>{scenario.name}</option>
        {/each}
      </select>
    </div>
    
    {#if selectedScenario}
      <div class="form-group">
        <label for="path-select">Select Path:</label>
        <select 
          id="path-select" 
          bind:value={selectedPathId}
        >
          <option value="">-- Select a Path --</option>
          {#each selectedScenario.paths as path}
            <option value={path.id}>{path.name}</option>
          {/each}
        </select>
      </div>
    {/if}
    
    {#if selectedPath}
      <div class="form-group">
        <label for="step-name">Step Name:</label>
        <input 
          type="text" 
          id="step-name" 
          bind:value={newStepName}
          placeholder="Enter step name"
        />
      </div>
      
      <button 
        class="form-btn add-to-test-btn" 
        on:click={addToTestScenario}
        disabled={!newStepName.trim() || selectedConcepts.length === 0}
      >
        Add to Test Scenario
      </button>
    {/if}
  {:else if selectedTab === 'apply'}
    <p class="integration-info">
      Apply concept states from an existing test scenario step.
    </p>
    
    <div class="form-group">
      <label for="apply-scenario-select">Select Scenario:</label>
      <select 
        id="apply-scenario-select" 
        bind:value={selectedScenarioId}
      >
        <option value="">-- Select a Scenario --</option>
        {#each testScenarios as scenario}
          <option value={scenario.id}>{scenario.name}</option>
        {/each}
      </select>
    </div>
    
    {#if selectedScenario}
      <div class="form-group">
        <label for="apply-path-select">Select Path:</label>
        <select 
          id="apply-path-select" 
          bind:value={selectedPathId}
        >
          <option value="">-- Select a Path --</option>
          {#each selectedScenario.paths as path}
            <option value={path.id}>{path.name}</option>
          {/each}
        </select>
      </div>
    {/if}
    
    {#if selectedPath}
      <div class="form-group">
        <label for="step-select">Select Step:</label>
        <div class="step-list">
          {#each selectedPath.steps as step, index}
            <div class="step-item">
              <button 
                class="step-button" 
                on:click={() => {
                  if (selectedScenarioId && selectedPathId) {
                    applyConceptsFromScenarioStep(selectedScenarioId, selectedPathId, index);
                  }
                }}
              >
                {step.name}
              </button>
              <div class="step-concepts">
                {step.conceptChanges.length} concept changes
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .test-integration {
    border: 1px solid #eee;
    border-radius: 5px;
    padding: 15px;
    background-color: #f9f9f9;
  }
  
  .test-integration h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 15px;
  }
  
  .integration-tabs {
    display: flex;
    margin-bottom: 15px;
    border-bottom: 1px solid #ddd;
  }
  
  .tab-button {
    padding: 8px 15px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-weight: bold;
    color: #666;
  }
  
  .tab-button.active {
    color: #2196f3;
    border-bottom-color: #2196f3;
  }
  
  .integration-info {
    margin-bottom: 15px;
    color: #555;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #555;
  }
  
  .form-group select, .form-group input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .step-list {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .step-item {
    padding: 8px;
    border-bottom: 1px solid #eee;
  }
  
  .step-item:last-child {
    border-bottom: none;
  }
  
  .step-button {
    display: block;
    width: 100%;
    text-align: left;
    padding: 5px;
    background: none;
    border: none;
    cursor: pointer;
    font-weight: bold;
    color: #2196f3;
  }
  
  .step-button:hover {
    background-color: #f5f5f5;
  }
  
  .step-concepts {
    font-size: 0.8rem;
    color: #666;
    margin-top: 3px;
  }
  
  .form-btn {
    padding: 8px 15px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-weight: bold;
  }
  
  .add-to-test-btn {
    background-color: #2196f3;
    color: white;
    width: 100%;
  }
  
  .add-to-test-btn:disabled {
    background-color: #b0bec5;
    cursor: not-allowed;
  }
</style> 