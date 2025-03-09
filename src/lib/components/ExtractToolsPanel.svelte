<script lang="ts">
  export let showConceptReport: boolean = false;
  export let showEvaluationDetails: boolean = false;
  export let showSectionControl: boolean = false;
  export let showTestIntegration: boolean = false;
  
  function toggleConceptReport() {
    showConceptReport = !showConceptReport;
    
    // Dispatch event to notify parent component
    const event = new CustomEvent('toggleConceptReport', {
      detail: { showConceptReport }
    });
    dispatchEvent(event);
  }
  
  function toggleEvaluationDetails() {
    showEvaluationDetails = !showEvaluationDetails;
    
    // Dispatch event to notify parent component
    const event = new CustomEvent('toggleEvaluationDetails', {
      detail: { showEvaluationDetails }
    });
    dispatchEvent(event);
  }
  
  function toggleSectionControl() {
    showSectionControl = !showSectionControl;
    
    // Dispatch event to notify parent component
    const event = new CustomEvent('toggleSectionControl', {
      detail: { showSectionControl }
    });
    dispatchEvent(event);
  }
  
  function toggleTestIntegration() {
    showTestIntegration = !showTestIntegration;
    
    // Dispatch event to notify parent component
    const event = new CustomEvent('toggleTestIntegration', {
      detail: { showTestIntegration }
    });
    dispatchEvent(event);
  }
  
  function extractConceptsFromConfig() {
    // Dispatch event to notify parent component
    const event = new CustomEvent('extractConcepts');
    dispatchEvent(event);
  }
</script>

<div class="extraction-tools">
  <h3>Configuration Tools</h3>
  <div class="extraction-actions">
    <button 
      class="extraction-btn" 
      on:click={extractConceptsFromConfig}
    >
      Extract Concepts from Config
    </button>
    <button 
      class="extraction-btn" 
      on:click={toggleConceptReport}
    >
      {showConceptReport ? 'Hide' : 'Show'} Concept Usage Report
    </button>
    <button 
      class="extraction-btn" 
      on:click={toggleEvaluationDetails}
    >
      {showEvaluationDetails ? 'Hide' : 'Show'} Evaluation Details
    </button>
    <button 
      class="extraction-btn" 
      on:click={toggleSectionControl}
    >
      {showSectionControl ? 'Hide' : 'Show'} Section Control
    </button>
    <button 
      class="extraction-btn test-integration-btn" 
      on:click={toggleTestIntegration}
    >
      {showTestIntegration ? 'Hide' : 'Show'} Test Integration
    </button>
  </div>
</div>

<style>
  .extraction-tools {
    grid-column: 1 / -1;
    border: 1px solid #eee;
    border-radius: 5px;
    padding: 15px;
    background-color: #f9f9f9;
    margin-bottom: 15px;
  }
  
  .extraction-tools h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 15px;
  }
  
  .extraction-actions {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }
  
  .extraction-btn {
    padding: 8px 15px;
    border-radius: 4px;
    border: 1px solid #673ab7;
    background-color: #673ab7;
    color: white;
    cursor: pointer;
    font-weight: bold;
  }
  
  .extraction-btn:hover {
    background-color: #5e35b1;
  }
  
  .test-integration-btn {
    background-color: #2196f3;
    border-color: #2196f3;
  }
  
  .test-integration-btn:hover {
    background-color: #1e88e5;
  }
</style> 