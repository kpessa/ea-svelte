<script lang="ts">
  import type { Concept } from '../types';
  import ConceptExpressionPanel from './ConceptExpressionPanel.svelte';
  import ConceptIndicator from './ConceptIndicator.svelte';
  
  // Test concepts with various value types
  let concepts: Record<string, Concept | undefined> = {
    'ConceptA': { value: 'Text value A', isActive: true },
    'ConceptB': { value: 42, isActive: true },
    'ConceptC': { value: true, isActive: false },
    'ConceptD': { value: 'Inactive value', isActive: false },
    'ConceptE': undefined
  };
  
  // Test expressions
  const expressions = [
    { 
      expression: '{ConceptA} AND {ConceptB}', 
      path: 'test/expression1.json' 
    }
  ];
  
  // Toggle to show/hide values
  let showValues = false;
  
  function handleToggleConcept(event: CustomEvent<{ name: string, newConcept: Concept | undefined }>) {
    const { name, newConcept } = event.detail;
    
    // Update the concept with the new state (including undefined)
    concepts = {
      ...concepts,
      [name]: newConcept
    };
  }
  
  // Add a new concept
  function addConcept() {
    const conceptName = `Concept${Object.keys(concepts).length + 1}`;
    concepts = {
      ...concepts,
      [conceptName]: { value: `Value for ${conceptName}`, isActive: true }
    };
  }
  
  // Toggle showing values
  function toggleShowValues() {
    showValues = !showValues;
  }
</script>

<div class="test-container">
  <h2>Concept Expression Test</h2>
  
  <div class="controls">
    <button class="control-btn" on:click={toggleShowValues}>
      {showValues ? 'Hide Values' : 'Show Values'}
    </button>
  </div>
  
  <div class="concepts-display">
    <h3>Current Concept States</h3>
    <p class="description">
      Click on a concept to toggle its state: Active (green) → Inactive (red) → Undefined (grey) → Active (green)
    </p>
    <div class="concepts-grid">
      {#each Object.entries(concepts) as [name, concept]}
        <div class="concept-item">
          <ConceptIndicator 
            conceptName={name}
            {concept}
            showValue={showValues}
            showName={true}
            size="medium"
            interactive={true}
            on:toggle={handleToggleConcept}
          />
        </div>
      {/each}
      <button class="add-concept-btn" on:click={addConcept}>
        + Add Concept
      </button>
    </div>
  </div>
  
  <div class="state-examples">
    <h3>State Examples</h3>
    <div class="examples-grid">
      <div class="example-item">
        <h4>Active State (Green)</h4>
        <ConceptIndicator 
          conceptName="ActiveExample"
          concept={{ value: 'Some value', isActive: true }}
          showValue={showValues}
          showName={true}
          size="medium"
        />
      </div>
      <div class="example-item">
        <h4>Inactive State (Red)</h4>
        <ConceptIndicator 
          conceptName="InactiveExample"
          concept={{ value: 'Some value', isActive: false }}
          showValue={showValues}
          showName={true}
          size="medium"
        />
      </div>
      <div class="example-item">
        <h4>Undefined State (Grey)</h4>
        <ConceptIndicator 
          conceptName="UndefinedExample"
          concept={undefined}
          showValue={showValues}
          showName={true}
          size="medium"
        />
      </div>
    </div>
  </div>
  
  <div class="display-options">
    <h3>Display Options</h3>
    <div class="options-grid">
      <div class="option-item">
        <h4>With Text Value</h4>
        <ConceptIndicator 
          conceptName="WithTextValue"
          concept={{ value: 'Text value', isActive: true }}
          showValue={true}
          showName={true}
          size="medium"
        />
      </div>
      <div class="option-item">
        <h4>With Number Value</h4>
        <ConceptIndicator 
          conceptName="WithNumberValue"
          concept={{ value: 42, isActive: true }}
          showValue={true}
          showName={true}
          size="medium"
        />
      </div>
      <div class="option-item">
        <h4>With Boolean Value</h4>
        <ConceptIndicator 
          conceptName="WithBooleanValue"
          concept={{ value: true, isActive: true }}
          showValue={true}
          showName={true}
          size="medium"
        />
      </div>
      <div class="option-item">
        <h4>Without Value (Default)</h4>
        <ConceptIndicator 
          conceptName="WithoutValue"
          concept={{ value: 'Hidden value', isActive: true }}
          showValue={false}
          showName={true}
          size="medium"
        />
      </div>
      <div class="option-item">
        <h4>Name Only</h4>
        <ConceptIndicator 
          conceptName="NameOnly"
          concept={{ value: 'Some value', isActive: true }}
          showValue={false}
          showName={true}
          size="medium"
        />
      </div>
      <div class="option-item">
        <h4>Icon Only</h4>
        <ConceptIndicator 
          conceptName="IconOnly"
          concept={{ value: 'Some value', isActive: true }}
          showValue={false}
          showName={false}
          size="medium"
        />
      </div>
    </div>
  </div>
  
  <div class="expression-panel">
    <ConceptExpressionPanel 
      conceptsSnapshot={concepts}
      configExpressions={expressions}
      on:toggleConcept={handleToggleConcept}
    />
  </div>
</div>

<style>
  .test-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  h2 {
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }
  
  .controls {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
  }
  
  .control-btn {
    padding: 8px 15px;
    background-color: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s;
  }
  
  .control-btn:hover {
    background-color: #1976d2;
  }
  
  .concepts-display, .state-examples, .display-options {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f5f5f5;
    border-radius: 5px;
    border: 1px solid #e0e0e0;
  }
  
  h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #333;
    font-size: 1.2rem;
  }
  
  h4 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #555;
    font-size: 1rem;
  }
  
  .description {
    margin-top: 0;
    margin-bottom: 15px;
    color: #666;
    font-style: italic;
  }
  
  .concepts-grid, .examples-grid, .options-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }
  
  .concept-item, .example-item, .option-item {
    padding: 10px;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .example-item, .option-item {
    min-width: 200px;
  }
  
  .add-concept-btn {
    padding: 8px 12px;
    background-color: #673ab7;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s;
  }
  
  .add-concept-btn:hover {
    background-color: #5e35b1;
  }
  
  .expression-panel {
    margin-top: 20px;
  }
</style> 