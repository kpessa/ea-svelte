<script lang="ts">
  import { onMount } from 'svelte';
  import ConceptEvaluator from './ConceptEvaluator.svelte';
  import type { Concept } from '../types';
  
  export let conceptsSnapshot: Record<string, Concept> = {};
  export let configExpressions: { expression: string, path: string }[] = [];
  
  let expressionToEvaluate: string = '';
  let validationError: string = '';
  let conceptEvaluator: ConceptEvaluator;
  
  function evaluateExpression() {
    if (!expressionToEvaluate.trim()) {
      validationError = 'Expression cannot be empty';
      return;
    }
    
    validationError = '';
    
    // Use the ConceptEvaluator component to evaluate the expression
    const result = conceptEvaluator.evaluateExpression();
    
    if (result.error) {
      validationError = result.error;
    }
  }
  
  function selectConfigExpression(expression: string) {
    expressionToEvaluate = expression;
    evaluateExpression();
  }
  
  function handleToggleConcept(event: CustomEvent) {
    // Forward the event to the parent component
    const toggleEvent = new CustomEvent('toggleConcept', {
      detail: event.detail
    });
    dispatchEvent(toggleEvent);
  }
</script>

<div class="expression-evaluator">
  <h3>Expression Evaluator</h3>
  
  <div class="form-group">
    <label for="expression">Enter Expression:</label>
    <input 
      type="text" 
      id="expression" 
      bind:value={expressionToEvaluate} 
      placeholder="Enter concept expression to evaluate"
    />
  </div>
  
  {#if validationError}
    <div class="validation-error">{validationError}</div>
  {/if}
  
  <ConceptEvaluator 
    bind:this={conceptEvaluator}
    {expressionToEvaluate}
    {conceptsSnapshot}
    on:toggleConcept={handleToggleConcept}
  />
  
  <button class="form-btn evaluate-btn" on:click={evaluateExpression}>
    Evaluate
  </button>
  
  {#if configExpressions.length > 0}
    <div class="config-expressions">
      <h4>Select from Configuration</h4>
      <div class="expressions-list">
        {#each configExpressions as expr}
          <div class="expression-item" on:click={() => selectConfigExpression(expr.expression)}>
            <div class="expression-text">{expr.expression}</div>
            <div class="expression-path">{expr.path}</div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .expression-evaluator {
    border: 1px solid #eee;
    border-radius: 5px;
    padding: 15px;
    background-color: #f9f9f9;
  }
  
  .expression-evaluator h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 15px;
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
  
  .form-group input[type="text"] {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .validation-error {
    color: #f44336;
    font-size: 12px;
    margin-top: 5px;
    margin-bottom: 10px;
  }
  
  .form-btn {
    padding: 8px 15px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-weight: bold;
    margin-top: 10px;
  }
  
  .evaluate-btn {
    background-color: #673ab7;
    color: white;
  }
  
  .config-expressions {
    margin-top: 15px;
    padding: 10px;
    border-radius: 4px;
    background-color: #f5f5f5;
  }
  
  .config-expressions h4 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #333;
  }
  
  .expressions-list {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
  }
  
  .expression-item {
    padding: 8px 12px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .expression-item:hover {
    background-color: #e3f2fd;
  }
  
  .expression-item:last-child {
    border-bottom: none;
  }
  
  .expression-text {
    font-family: monospace;
    font-weight: bold;
    margin-bottom: 3px;
  }
  
  .expression-path {
    font-size: 0.8rem;
    color: #666;
  }
</style> 