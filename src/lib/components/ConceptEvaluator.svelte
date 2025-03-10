<script lang="ts">
  import { evaluateConceptExpressionWithSteps, type EvaluationStep } from '../stores';
  import type { Concept } from '../types';
  import ConceptIndicator from './ConceptIndicator.svelte';
  import { createEventDispatcher } from 'svelte';

  export let expressionToEvaluate: string = '';
  export let conceptsSnapshot: Record<string, Concept | undefined> = {};
  
  const dispatch = createEventDispatcher<{
    toggleConcept: { conceptName: string }
  }>();
  
  let evaluationResult: boolean | null = null;
  let evaluationSteps: EvaluationStep[] = [];
  let conceptsInExpression: string[] = [];
  
  $: if (expressionToEvaluate) {
    extractConceptsFromExpression(expressionToEvaluate);
  }
  
  function evaluateExpression() {
    if (!expressionToEvaluate.trim()) {
      return { error: 'Expression cannot be empty' };
    }
    
    try {
      // Extract concepts from the expression
      extractConceptsFromExpression(expressionToEvaluate);
      
      // Evaluate the expression
      const { result, steps } = evaluateConceptExpressionWithSteps(expressionToEvaluate.trim(), conceptsSnapshot);
      evaluationResult = result;
      evaluationSteps = steps;
      
      return { result, steps, error: null };
    } catch (error) {
      const errorMessage = `Error evaluating expression: ${error instanceof Error ? error.message : 'Unknown error'}`;
      evaluationResult = null;
      evaluationSteps = [];
      
      return { error: errorMessage };
    }
  }
  
  function extractConceptsFromExpression(expression: string) {
    // Extract concepts between curly braces
    const conceptRegex = /\{([^{}]+)\}/g;
    let match;
    conceptsInExpression = [];
    
    while ((match = conceptRegex.exec(expression)) !== null) {
      const conceptName = match[1].trim();
      if (!conceptsInExpression.includes(conceptName)) {
        conceptsInExpression.push(conceptName);
      }
    }
  }
  
  function handleConceptToggle(event: CustomEvent<{ name: string, newConcept: Concept | undefined }>) {
    const { name, newConcept } = event.detail;
    dispatch('toggleConcept', { conceptName: name });
  }
  
  // Expose the evaluateExpression method to parent components
  export { evaluateExpression };
</script>

<div class="evaluator-container">
  <!-- Display concepts in expression -->
  {#if conceptsInExpression.length > 0}
    <div class="concepts-in-expression">
      <h4>Concepts in Expression</h4>
      <div class="concept-toggles">
        {#each conceptsInExpression as concept}
          <div class="concept-toggle">
            <ConceptIndicator 
              conceptName={concept}
              concept={conceptsSnapshot[concept]}
              showValue={false}
              showName={true}
              size="medium"
              interactive={true}
              on:toggle={handleConceptToggle}
            />
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Display evaluation result -->
  {#if evaluationResult !== null}
    <div class="evaluation-result">
      <span class="result-label">Result:</span>
      <span class="result-value {evaluationResult ? 'true' : 'false'}">
        {evaluationResult ? 'True' : 'False'}
      </span>
    </div>
  {/if}

  <!-- Display simplified evaluation steps -->
  {#if evaluationSteps.length > 0}
    <div class="evaluation-steps">
      <h4>Step-by-Step Evaluation</h4>
      <div class="steps-container">
        <!-- Show only key steps: original expression, concept substitutions, and final result -->
        {#each evaluationSteps.filter((step, index) => 
          step.isSubExpression || 
          index === 0 || 
          index === evaluationSteps.length - 1
        ) as step, index}
          <div class="evaluation-step {step.isSubExpression ? 'sub-expression' : ''}">
            <div class="step-number">{index + 1}</div>
            <div class="step-content">
              <div class="step-explanation">{step.explanation}</div>
              <div class="step-expression">
                {#if step.isSubExpression}
                  <ConceptIndicator 
                    conceptName={step.conceptName || ''}
                    concept={{ value: step.conceptName || '', isActive: step.result === true }}
                    showValue={false}
                    showName={true}
                    size="small"
                    interactive={false}
                  />
                {:else}
                  <code>{step.expression}</code>
                  {#if step.result !== null}
                    <span class="result-indicator {step.result ? 'true' : 'false'}">
                      {step.result ? 'True' : 'False'}
                    </span>
                  {/if}
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .evaluator-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .concepts-in-expression {
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 4px;
  }
  
  .concept-toggles {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
  }
  
  .concept-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px;
    border-radius: 4px;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .evaluation-result {
    padding: 10px;
    border-radius: 4px;
    background-color: #f0f4f8;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .result-label {
    font-weight: bold;
    color: #333;
  }
  
  .result-value {
    padding: 3px 8px;
    border-radius: 3px;
    font-weight: bold;
  }
  
  .result-value.true {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .result-value.false {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .evaluation-steps {
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 4px;
  }
  
  .steps-container {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .evaluation-step {
    display: flex;
    padding: 8px;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .evaluation-step.sub-expression {
    margin-left: 20px;
    background-color: #f8f9fa;
  }
  
  .step-number {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #673ab7;
    color: white;
    border-radius: 50%;
    font-weight: bold;
    font-size: 12px;
    margin-right: 10px;
  }
  
  .step-content {
    flex: 1;
  }
  
  .step-explanation {
    margin-bottom: 5px;
    color: #555;
  }
  
  .step-expression {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .step-expression code {
    padding: 2px 5px;
    background-color: #f5f5f5;
    border-radius: 3px;
    font-family: monospace;
  }
  
  .result-indicator {
    padding: 2px 5px;
    border-radius: 3px;
    font-size: 12px;
    font-weight: bold;
  }
  
  .result-indicator.true {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .result-indicator.false {
    background-color: #ffebee;
    color: #c62828;
  }
</style> 