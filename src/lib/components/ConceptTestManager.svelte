<script lang="ts">
  import { onMount } from 'svelte';
  import { ConceptTestService, testScenarios, testResults } from '../services/conceptTestService';
  import type { TestScenario, TestPath, TestStep, TestResult, ExpectedResult, ConceptChange } from '../types';
  import { concepts } from '../stores';
  import ConceptHierarchySelector from './ConceptHierarchySelector.svelte';
  
  let selectedScenarioId: string | null = null;
  let selectedPathId: string | null = null;
  let newScenarioName = '';
  let newScenarioDescription = '';
  let newPathName = '';
  let newPathDescription = '';
  let newStepName = '';
  let newExpectedResultType: 'tab' | 'section' | 'order' | 'criterion' = 'tab';
  let newExpectedResultTarget = '';
  let newExpectedResultVisibility = true;
  let newExpectedResultDescription = '';
  let conceptsForGeneration: string[] = [];
  let isGeneratingTests = false;
  let testPathVisualizationMode: 'list' | 'graph' = 'list';
  let showDefaultsSelector = false;
  
  // For concept changes in steps
  let selectedConcepts: string[] = [];
  let conceptChangeValues: Record<string, boolean> = {};
  let conceptChangeActive: Record<string, boolean> = {};
  
  // For default values
  let defaultSelectedConcepts: string[] = [];
  let defaultConceptChangeValues: Record<string, boolean> = {};
  let defaultConceptChangeActive: Record<string, boolean> = {};
  
  $: selectedScenario = selectedScenarioId 
    ? $testScenarios.find(s => s.id === selectedScenarioId) 
    : null;
    
  $: selectedPath = selectedScenario && selectedPathId 
    ? selectedScenario.paths.find(p => p.id === selectedPathId) 
    : null;
    
  $: availableConcepts = Object.keys($concepts).sort();
  
  onMount(() => {
    ConceptTestService.loadTestScenarios();
  });
  
  function createScenario() {
    if (newScenarioName.trim()) {
      ConceptTestService.createScenario(newScenarioName, newScenarioDescription);
      newScenarioName = '';
      newScenarioDescription = '';
    }
  }
  
  function addPath() {
    if (selectedScenarioId && newPathName.trim()) {
      ConceptTestService.addPathToScenario(selectedScenarioId, newPathName, newPathDescription);
      newPathName = '';
      newPathDescription = '';
    }
  }
  
  function addStep() {
    if (selectedScenarioId && selectedPathId && newStepName.trim() && selectedConcepts.length > 0) {
      const conceptChanges: ConceptChange[] = selectedConcepts.map(conceptName => ({
        conceptName,
        value: conceptChangeValues[conceptName] || false,
        isActive: conceptChangeActive[conceptName] || true
      }));
      
      ConceptTestService.addStepToPath(selectedScenarioId, selectedPathId, newStepName, conceptChanges);
      newStepName = '';
      selectedConcepts = [];
      conceptChangeValues = {};
      conceptChangeActive = {};
    }
  }
  
  function addExpectedResult() {
    if (selectedScenarioId && selectedPathId && newExpectedResultTarget.trim()) {
      const expectedResult: ExpectedResult = {
        type: newExpectedResultType,
        target: newExpectedResultTarget,
        expectedVisibility: newExpectedResultVisibility,
        description: newExpectedResultDescription
      };
      
      ConceptTestService.addExpectedResultToPath(selectedScenarioId, selectedPathId, expectedResult);
      newExpectedResultType = 'tab';
      newExpectedResultTarget = '';
      newExpectedResultVisibility = true;
      newExpectedResultDescription = '';
    }
  }
  
  async function executeTest() {
    if (selectedScenarioId && selectedPathId) {
      await ConceptTestService.executeTestPath(selectedScenarioId, selectedPathId);
    }
  }
  
  function generateTestPaths() {
    if (selectedScenarioId && conceptsForGeneration.length > 0) {
      isGeneratingTests = true;
      try {
        ConceptTestService.generateTestPathsFromConcepts(
          selectedScenarioId,
          conceptsForGeneration
        );
        conceptsForGeneration = [];
      } finally {
        isGeneratingTests = false;
      }
    }
  }
  
  function saveScenarios() {
    ConceptTestService.saveTestScenarios();
  }
  
  function handleConceptsChanged(event: CustomEvent) {
    const { selectedConcepts: newSelectedConcepts, conceptChangeValues: newValues, conceptChangeActive: newActive } = event.detail;
    
    if (newSelectedConcepts) {
      selectedConcepts = newSelectedConcepts;
    }
    
    if (newValues) {
      conceptChangeValues = newValues;
    }
    
    if (newActive) {
      conceptChangeActive = newActive;
    }
  }
  
  function handleDefaultConceptsChanged(event: CustomEvent) {
    const { selectedConcepts: newSelectedConcepts, conceptChangeValues: newValues, conceptChangeActive: newActive } = event.detail;
    
    if (newSelectedConcepts) {
      defaultSelectedConcepts = newSelectedConcepts;
    }
    
    if (newValues) {
      defaultConceptChangeValues = newValues;
    }
    
    if (newActive) {
      defaultConceptChangeActive = newActive;
    }
  }
  
  function toggleDefaultsSelector() {
    showDefaultsSelector = !showDefaultsSelector;
  }
  
  function clearTestResults() {
    ConceptTestService.clearTestResults();
  }
  
  function getResultClass(success: boolean) {
    return success ? 'success' : 'failure';
  }
</script>

<div class="concept-test-manager">
  <h2>Concept Test Framework</h2>
  
  <div class="test-manager-container">
    <div class="test-scenarios-panel">
      <h3>Test Scenarios</h3>
      
      <div class="scenario-list">
        {#if $testScenarios.length === 0}
          <p>No test scenarios available. Create one below.</p>
        {:else}
          <ul>
            {#each $testScenarios as scenario}
              <li class:selected={selectedScenarioId === scenario.id}>
                <button on:click={() => selectedScenarioId = scenario.id}>
                  {scenario.name}
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
      
      <div class="create-scenario">
        <h4>Create New Scenario</h4>
        <input 
          type="text" 
          placeholder="Scenario Name" 
          bind:value={newScenarioName}
        />
        <textarea 
          placeholder="Scenario Description" 
          bind:value={newScenarioDescription}
        ></textarea>
        <button on:click={createScenario}>Create Scenario</button>
      </div>
      
      <button on:click={saveScenarios} class="save-button">Save All Scenarios</button>
      
      <div class="defaults-section">
        <button on:click={toggleDefaultsSelector} class="defaults-button">
          {showDefaultsSelector ? 'Hide Default Values' : 'Set Default Concept Values'}
        </button>
        
        {#if showDefaultsSelector}
          <div class="defaults-selector">
            <p class="defaults-info">
              Set default values for concepts that will be applied to all new test steps.
            </p>
            <div class="defaults-container">
              <ConceptHierarchySelector 
                bind:selectedConcepts={defaultSelectedConcepts}
                bind:conceptChangeValues={defaultConceptChangeValues}
                bind:conceptChangeActive={defaultConceptChangeActive}
                on:conceptsChanged={handleDefaultConceptsChanged}
                useAsDefaults={true}
              />
            </div>
          </div>
        {/if}
      </div>
    </div>
    
    {#if selectedScenario}
      <div class="test-paths-panel">
        <h3>Test Paths for {selectedScenario.name}</h3>
        
        <div class="visualization-toggle">
          <button 
            class:active={testPathVisualizationMode === 'list'} 
            on:click={() => testPathVisualizationMode = 'list'}
          >
            List View
          </button>
          <button 
            class:active={testPathVisualizationMode === 'graph'} 
            on:click={() => testPathVisualizationMode = 'graph'}
          >
            Graph View
          </button>
        </div>
        
        {#if testPathVisualizationMode === 'list'}
          <div class="path-list">
            {#if selectedScenario.paths.length === 0}
              <p>No test paths available. Create one below.</p>
            {:else}
              <ul>
                {#each selectedScenario.paths as path}
                  <li class:selected={selectedPathId === path.id}>
                    <button on:click={() => selectedPathId = path.id}>
                      {path.name}
                    </button>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        {:else}
          <div class="path-graph">
            <!-- Graph visualization would go here -->
            <p>Graph visualization of test paths</p>
            <!-- This would be implemented with a visualization library like D3.js -->
          </div>
        {/if}
        
        <div class="create-path">
          <h4>Add New Path</h4>
          <input 
            type="text" 
            placeholder="Path Name" 
            bind:value={newPathName}
          />
          <textarea 
            placeholder="Path Description" 
            bind:value={newPathDescription}
          ></textarea>
          <button on:click={addPath}>Add Path</button>
        </div>
        
        <div class="generate-paths">
          <h4>Generate Test Paths from Concepts</h4>
          <div class="concept-selector">
            <select multiple bind:value={conceptsForGeneration}>
              {#each availableConcepts as concept}
                <option value={concept}>{concept}</option>
              {/each}
            </select>
          </div>
          <button on:click={generateTestPaths} disabled={isGeneratingTests}>
            {isGeneratingTests ? 'Generating...' : 'Generate Test Paths'}
          </button>
        </div>
      </div>
    {/if}
    
    {#if selectedPath}
      <div class="test-details-panel">
        <h3>Test Path: {selectedPath.name}</h3>
        
        <div class="test-steps">
          <h4>Steps</h4>
          {#if selectedPath.steps.length === 0}
            <p>No steps defined. Add steps below.</p>
          {:else}
            <ol>
              {#each selectedPath.steps as step}
                <li>
                  <strong>{step.name}</strong>
                  <ul class="concept-changes">
                    {#each step.conceptChanges as change}
                      <li>
                        {change.conceptName}: 
                        {change.value ? 'true' : 'false'}, 
                        {change.isActive ? 'active' : 'inactive'}
                      </li>
                    {/each}
                  </ul>
                </li>
              {/each}
            </ol>
          {/if}
          
          <div class="add-step">
            <h5>Add Step</h5>
            <input 
              type="text" 
              placeholder="Step Name" 
              bind:value={newStepName}
            />
            
            <div class="concept-selection-container">
              <h6>Select Concepts to Change</h6>
              <div class="concept-selection">
                <ConceptHierarchySelector 
                  bind:selectedConcepts={selectedConcepts}
                  bind:conceptChangeValues={conceptChangeValues}
                  bind:conceptChangeActive={conceptChangeActive}
                  on:conceptsChanged={handleConceptsChanged}
                />
              </div>
            </div>
            
            <button on:click={addStep}>Add Step</button>
          </div>
        </div>
        
        <div class="expected-results">
          <h4>Expected Results</h4>
          {#if selectedPath.expectedResults.length === 0}
            <p>No expected results defined. Add them below.</p>
          {:else}
            <ul>
              {#each selectedPath.expectedResults as result}
                <li>
                  <strong>{result.type}:</strong> {result.target} 
                  should be {result.expectedVisibility ? 'visible' : 'hidden'}
                  <p>{result.description}</p>
                </li>
              {/each}
            </ul>
          {/if}
          
          <div class="add-expected-result">
            <h5>Add Expected Result</h5>
            <div class="form-row">
              <label>
                Type:
                <select bind:value={newExpectedResultType}>
                  <option value="tab">Tab</option>
                  <option value="section">Section</option>
                  <option value="order">Order</option>
                  <option value="criterion">Criterion</option>
                </select>
              </label>
            </div>
            
            <div class="form-row">
              <label>
                Target:
                <input 
                  type="text" 
                  placeholder="Target ID" 
                  bind:value={newExpectedResultTarget}
                />
              </label>
            </div>
            
            <div class="form-row">
              <label>
                Expected Visibility:
                <input 
                  type="checkbox" 
                  bind:checked={newExpectedResultVisibility}
                />
              </label>
            </div>
            
            <div class="form-row">
              <label>
                Description:
                <textarea 
                  placeholder="Description" 
                  bind:value={newExpectedResultDescription}
                ></textarea>
              </label>
            </div>
            
            <button on:click={addExpectedResult}>Add Expected Result</button>
          </div>
        </div>
        
        <div class="test-execution">
          <h4>Test Execution</h4>
          <button on:click={executeTest} class="execute-button">Execute Test</button>
          <button on:click={clearTestResults} class="clear-button">Clear Results</button>
        </div>
      </div>
    {/if}
  </div>
  
  {#if $testResults.length > 0}
    <div class="test-results">
      <h3>Test Results</h3>
      
      {#each $testResults as result}
        <div class="test-result {getResultClass(result.success)}">
          <h4>
            {result.success ? '✅' : '❌'} 
            Test: {$testScenarios.find(s => s.id === result.scenarioId)?.name || 'Unknown'} - 
            {$testScenarios.find(s => s.id === result.scenarioId)?.paths.find(p => p.id === result.pathId)?.name || 'Unknown'}
          </h4>
          
          {#if !result.success}
            <p class="failure-reason">{result.failureReason}</p>
          {/if}
          
          <div class="step-results">
            {#each result.steps as stepResult}
              <div class="step-result {getResultClass(stepResult.success)}">
                <h5>
                  {stepResult.success ? '✅' : '❌'} 
                  Step: {$testScenarios.find(s => s.id === result.scenarioId)?.paths.find(p => p.id === result.pathId)?.steps.find(s => s.id === stepResult.stepId)?.name || 'Unknown'}
                </h5>
                
                <div class="result-details">
                  <h6>Concept States:</h6>
                  <ul class="concept-states">
                    {#each Object.entries(stepResult.conceptStates) as [name, state]}
                      <li>
                        {name}: {state.value ? 'true' : 'false'}, {state.isActive ? 'active' : 'inactive'}
                      </li>
                    {/each}
                  </ul>
                  
                  <h6>Expected Results:</h6>
                  <ul class="result-outcomes">
                    {#each stepResult.results as outcome}
                      <li class={getResultClass(outcome.success)}>
                        {outcome.success ? '✅' : '❌'} 
                        {outcome.expectedResult.type}: {outcome.expectedResult.target} 
                        expected to be {outcome.expectedResult.expectedVisibility ? 'visible' : 'hidden'}, 
                        was {outcome.actualVisibility ? 'visible' : 'hidden'}
                      </li>
                    {/each}
                  </ul>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .concept-test-manager {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
  
  .test-manager-container {
    display: flex;
    gap: 1rem;
    height: 100%;
    min-height: 700px;
    overflow: hidden;
  }
  
  .test-scenarios-panel,
  .test-paths-panel,
  .test-details-panel {
    flex: 1;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 1rem;
    overflow-y: auto;
    background-color: #f9f9f9;
    min-width: 250px;
    max-height: 700px;
  }
  
  .test-details-panel {
    flex: 2;
    min-width: 400px;
  }
  
  h2, h3, h4, h5, h6 {
    margin-top: 0;
    margin-bottom: 0.5rem;
  }
  
  ul, ol {
    padding-left: 1.5rem;
  }
  
  .scenario-list, .path-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .scenario-list ul, .path-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .scenario-list li, .path-list li {
    margin-bottom: 0.25rem;
  }
  
  .scenario-list button, .path-list button {
    width: 100%;
    text-align: left;
    padding: 0.5rem;
    border: 1px solid #ddd;
    background-color: white;
    cursor: pointer;
  }
  
  .scenario-list li.selected button, .path-list li.selected button {
    background-color: #e6f7ff;
    border-color: #1890ff;
  }
  
  input, textarea, select {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  textarea {
    min-height: 80px;
  }
  
  button {
    padding: 0.5rem 1rem;
    background-color: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 0.5rem;
  }
  
  button:hover {
    background-color: #40a9ff;
  }
  
  button:disabled {
    background-color: #d9d9d9;
    cursor: not-allowed;
  }
  
  .save-button {
    margin-top: 1rem;
    width: 100%;
  }
  
  .defaults-section {
    margin-top: 1rem;
    border-top: 1px solid #ddd;
    padding-top: 1rem;
  }
  
  .defaults-button {
    width: 100%;
    background-color: #722ed1;
  }
  
  .defaults-button:hover {
    background-color: #9254de;
  }
  
  .defaults-selector {
    margin-top: 1rem;
  }
  
  .defaults-info {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #666;
  }
  
  .defaults-container {
    height: 400px;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .execute-button {
    background-color: #52c41a;
  }
  
  .execute-button:hover {
    background-color: #73d13d;
  }
  
  .clear-button {
    background-color: #ff4d4f;
  }
  
  .clear-button:hover {
    background-color: #ff7875;
  }
  
  .visualization-toggle {
    display: flex;
    margin-bottom: 1rem;
  }
  
  .visualization-toggle button {
    flex: 1;
    margin-top: 0;
    background-color: #f0f0f0;
    color: #333;
  }
  
  .visualization-toggle button.active {
    background-color: #1890ff;
    color: white;
  }
  
  .concept-selection-container {
    margin-bottom: 1rem;
  }
  
  .concept-selection {
    height: 450px;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 1rem;
  }
  
  .test-results {
    margin-top: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 1rem;
    background-color: #f9f9f9;
  }
  
  .test-result {
    margin-bottom: 1rem;
    padding: 1rem;
    border-radius: 4px;
  }
  
  .test-result.success {
    background-color: #f6ffed;
    border: 1px solid #b7eb8f;
  }
  
  .test-result.failure {
    background-color: #fff2f0;
    border: 1px solid #ffccc7;
  }
  
  .failure-reason {
    color: #f5222d;
    font-weight: bold;
  }
  
  .step-result {
    margin: 0.5rem 0;
    padding: 0.5rem;
    border-radius: 4px;
  }
  
  .step-result.success {
    background-color: #f6ffed;
  }
  
  .step-result.failure {
    background-color: #fff2f0;
  }
  
  .result-details {
    margin-left: 1rem;
  }
  
  .result-outcomes li.success {
    color: #52c41a;
  }
  
  .result-outcomes li.failure {
    color: #f5222d;
  }
  
  .concept-states, .result-outcomes {
    margin-bottom: 1rem;
  }
  
  @media (max-width: 1200px) {
    .test-manager-container {
      flex-direction: column;
    }
    
    .test-scenarios-panel,
    .test-paths-panel,
    .test-details-panel {
      max-height: none;
      width: 100%;
    }
  }
</style> 