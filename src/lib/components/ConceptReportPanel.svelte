<script lang="ts">
  import type { Concept, ConceptReference } from '../types';
  
  export let conceptReport: string = '';
  export let showConceptReport: boolean = false;
  export let showEvaluationDetails: boolean = false;
  export let conceptEvaluationDetails: Record<string, { value: boolean, expression: string, dependencies: string[] }> = {};
  export let conceptsSnapshot: Record<string, Concept> = {};
  export let showSectionControl: boolean = false;
  export let sectionVisibilityControl: Record<string, boolean> = {};
  
  function toggleSectionVisibility(section: string) {
    // Dispatch event to notify parent component
    const event = new CustomEvent('toggleSectionVisibility', {
      detail: { section }
    });
    dispatchEvent(event);
  }
</script>

{#if showConceptReport && conceptReport}
  <div class="concept-report">
    <h4>Concept Usage Report</h4>
    <pre>{conceptReport}</pre>
  </div>
{/if}

{#if showEvaluationDetails && Object.keys(conceptEvaluationDetails).length > 0}
  <div class="evaluation-details">
    <h4>Concept Evaluation Details</h4>
    <div class="evaluation-grid">
      {#each Object.entries(conceptEvaluationDetails) as [conceptName, details]}
        <div class="evaluation-card">
          <div class="evaluation-header">
            <span class="concept-name">{conceptName}</span>
            <span class="concept-value {details.value ? 'true' : 'false'}">
              {details.value ? 'True' : 'False'}
            </span>
          </div>
          <div class="evaluation-body">
            <div class="expression">
              <span class="label">Expression:</span>
              <code>{details.expression}</code>
            </div>
            <div class="dependencies">
              <span class="label">Dependencies:</span>
              <div class="dependency-list">
                {#each details.dependencies as dependency}
                  <span class="dependency-tag {conceptsSnapshot[dependency]?.value ? 'true' : 'false'}">
                    {dependency}: {conceptsSnapshot[dependency]?.value ? 'True' : 'False'}
                  </span>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

{#if showSectionControl && Object.keys(sectionVisibilityControl).length > 0}
  <div class="section-control">
    <h4>Section Visibility Control</h4>
    <div class="section-control-grid">
      {#each Object.entries(sectionVisibilityControl) as [section, isVisible]}
        <div class="section-control-item">
          <label class="section-control-label">
            <input 
              type="checkbox" 
              checked={isVisible} 
              on:change={() => toggleSectionVisibility(section)}
            />
            <span class="section-name">{section}</span>
          </label>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .concept-report {
    margin-top: 10px;
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;
    font-family: monospace;
    font-size: 12px;
    white-space: pre-wrap;
  }
  
  .concept-report h4, .evaluation-details h4, .section-control h4 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #333;
  }
  
  .evaluation-details, .section-control {
    margin-top: 15px;
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 4px;
    max-height: 300px;
    overflow-y: auto;
  }
  
  .evaluation-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 10px;
  }
  
  .evaluation-card {
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
    background-color: white;
  }
  
  .evaluation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;
    background-color: #f0f0f0;
    border-bottom: 1px solid #ddd;
  }
  
  .evaluation-body {
    padding: 10px;
  }
  
  .concept-name {
    font-weight: bold;
    color: #2196f3;
  }
  
  .concept-value {
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: bold;
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
  
  .expression, .dependencies {
    margin-bottom: 8px;
  }
  
  .label {
    font-weight: bold;
    margin-right: 5px;
    color: #555;
  }
  
  code {
    background-color: #f5f5f5;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9rem;
    word-break: break-all;
  }
  
  .dependency-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 5px;
  }
  
  .dependency-tag {
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.8rem;
    white-space: nowrap;
  }
  
  .dependency-tag.true {
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #a5d6a7;
  }
  
  .dependency-tag.false {
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ef9a9a;
  }
  
  .section-control-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }
  
  .section-control-item {
    padding: 5px;
  }
  
  .section-control-label {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  
  .section-control-label input {
    margin-right: 8px;
  }
  
  .section-name {
    font-size: 0.9rem;
  }
</style> 