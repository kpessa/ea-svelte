<script lang="ts">
  import { evaluateConceptExpressionWithSteps, type EvaluationStep } from '../stores';
  import type { Concept } from '../types';
  import ConceptIndicator from './ConceptIndicator.svelte';
  import { createEventDispatcher } from 'svelte';

  export let expressionToEvaluate: string = '';
  export let conceptsSnapshot: Record<string, Concept> = {};
  
  const dispatch = createEventDispatcher<{
    toggleConcept: { conceptName: string }
  }>();
  
  let evaluationResult: boolean | null = null;
  let evaluationSteps: EvaluationStep[] = [];
  let highlightedExpression: string = '';
  let conceptsInExpression: string[] = [];
  
  $: if (expressionToEvaluate) {
    extractConceptsFromExpression(expressionToEvaluate);
  }
  
  function evaluateExpression() {
    if (!expressionToEvaluate.trim()) {
      return { error: 'Expression cannot be empty' };
    }
    
    try {
      // Extract concepts from the expression for highlighting
      extractConceptsFromExpression(expressionToEvaluate);
      
      // Use the evaluateConceptExpressionWithSteps function from stores
      const { result, steps } = evaluateConceptExpressionWithSteps(expressionToEvaluate.trim());
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
    
    // Generate highlighted expression
    updateHighlightedExpression();
  }
  
  function updateHighlightedExpression() {
    let highlighted = expressionToEvaluate;
    
    // Replace concepts with highlighted versions
    for (const concept of conceptsInExpression) {
      const isActive = conceptsSnapshot[concept]?.isActive ?? false;
      const value = conceptsSnapshot[concept]?.value ?? false;
      const cssClass = isActive ? (value ? 'concept-true' : 'concept-false') : 'concept-inactive';
      
      highlighted = highlighted.replace(
        new RegExp(`\\{${concept}\\}`, 'g'),
        `<span class="concept-highlight ${cssClass}" data-concept="${concept}">{${concept}}</span>`
      );
    }
    
    // Replace operators with highlighted versions
    highlighted = highlighted
      .replace(/\bAND\b/g, '<span class="operator-highlight">AND</span>')
      .replace(/\bOR\b/g, '<span class="operator-highlight">OR</span>')
      .replace(/\bNOT\b/g, '<span class="operator-highlight">NOT</span>');
    
    // Replace delimiters with highlighted versions
    highlighted = highlighted
      .replace(/\[%/g, '<span class="delimiter-highlight">[%</span>')
      .replace(/%\]/g, '<span class="delimiter-highlight">%]</span>');
    
    highlightedExpression = highlighted;
  }
  
  function toggleConcept(conceptName: string) {
    dispatch('toggleConcept', { conceptName });
  }
  
  function handleConceptClick(event: MouseEvent) {
    // Check if the clicked element is a concept
    if (event.target && event.target instanceof HTMLElement) {
      if (event.target.classList.contains('concept-highlight')) {
        const conceptName = event.target.getAttribute('data-concept');
        if (conceptName) {
          toggleConcept(conceptName);
        }
      }
    }
  }
  
  function handleConceptToggle(event: CustomEvent<{ name: string, newConcept: Concept | undefined }>) {
    const { name } = event.detail;
    toggleConcept(name);
  }
  
  // Expose the evaluateExpression method to parent components
  export { evaluateExpression };
</script>

{#if highlightedExpression}
  <div class="highlighted-expression" on:click={handleConceptClick}>
    {@html highlightedExpression}
  </div>
{/if}

{#if conceptsInExpression.length > 0}
  <div class="concepts-in-expression">
    <h4>Concepts in Expression</h4>
    <div class="concept-toggles">
      {#each conceptsInExpression as concept}
        <div class="concept-toggle">
          <ConceptIndicator 
            conceptName={concept}
            concept={conceptsSnapshot[concept]}
            showValue={true}
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

{#if evaluationResult !== null}
  <div class="evaluation-result">
    <span class="result-label">Result:</span>
    <span class="result-value {evaluationResult ? 'true' : 'false'}">
      {evaluationResult ? 'True' : 'False'}
    </span>
  </div>
{/if}

{#if evaluationSteps.length > 0}
  <div class="evaluation-steps">
    <h4>Step-by-Step Evaluation</h4>
    <div class="steps-container">
      {#each evaluationSteps as step, index}
        <div class="evaluation-step {step.isSubExpression ? 'sub-expression' : ''}">
          <div class="step-number">{index + 1}</div>
          <div class="step-content">
            <div class="step-explanation">{step.explanation}</div>
            <div class="step-expression">
              {#if step.isSubExpression}
                <ConceptIndicator 
                  conceptName={step.conceptName}
                  concept={{ value: step.result === true, isActive: true }}
                  showValue={true}
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

<style>
  .highlighted-expression {
    margin-top: 10px;
    padding: 10px;
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: monospace;
    font-size: 1rem;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }
  
  .concept-highlight {
    padding: 2px 4px;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .concept-highlight:hover {
    opacity: 0.8;
  }
  
  .concept-true {
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #a5d6a7;
  }
  
  .concept-false {
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ef9a9a;
  }
  
  .concept-inactive {
    background-color: #f5f5f5;
    color: #9e9e9e;
    border: 1px solid #e0e0e0;
  }
  
  .operator-highlight {
    color: #7b1fa2;
    font-weight: bold;
  }
  
  .delimiter-highlight {
    color: #0288d1;
    font-weight: bold;
  }
  
  .concepts-in-expression {
    margin-top: 15px;
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
    margin-top: 15px;
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
    margin-top: 15px;
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 4px;
  }
  
  .steps-container {
    margin-top: 10px;
  }
  
  .evaluation-step {
    display: flex;
    margin-bottom: 8px;
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