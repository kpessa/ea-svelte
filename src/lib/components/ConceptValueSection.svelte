<script lang="ts">
  import type { Concept } from '../types';
  import ConceptValue from './ConceptValue.svelte';
  import ConceptIndicator from './ConceptIndicator.svelte';
  
  export let title: string = 'Section Title';
  export let description: string = '';
  export let template: string = '';
  export let conceptsSnapshot: Record<string, Concept> = {};
  export let showIndicators: boolean = true;
  
  // Extract concept names from the template
  $: conceptNames = extractConceptNames(template);
  
  function extractConceptNames(text: string): string[] {
    const conceptValueRegex = /@concept\{([^{}]+)\.value\}/g;
    const names: string[] = [];
    let match;
    
    while ((match = conceptValueRegex.exec(text)) !== null) {
      const conceptName = match[1].trim();
      if (!names.includes(conceptName)) {
        names.push(conceptName);
      }
    }
    
    return names;
  }
</script>

<div class="concept-value-section">
  <div class="section-header">
    <h3>{title}</h3>
    {#if description}
      <p class="section-description">{description}</p>
    {/if}
  </div>
  
  <div class="section-content">
    <div class="template-content">
      <ConceptValue content={template} {conceptsSnapshot} />
    </div>
    
    {#if showIndicators && conceptNames.length > 0}
      <div class="concept-indicators">
        <h4>Concepts Used</h4>
        <div class="indicators-grid">
          {#each conceptNames as name}
            <div class="indicator-item">
              <ConceptIndicator 
                conceptName={name}
                concept={conceptsSnapshot[name]}
                showValue={true}
                showName={true}
                size="small"
                interactive={true}
                on:toggle
              />
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .concept-value-section {
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    margin-bottom: 20px;
    overflow: hidden;
  }
  
  .section-header {
    background-color: #f5f5f5;
    padding: 10px 15px;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .section-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.2rem;
  }
  
  .section-description {
    margin: 5px 0 0;
    color: #666;
    font-size: 0.9rem;
  }
  
  .section-content {
    padding: 15px;
  }
  
  .template-content {
    background-color: white;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #eee;
    margin-bottom: 15px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.5;
  }
  
  .concept-indicators {
    margin-top: 15px;
    padding: 10px;
    background-color: #f9f9f9;
    border-radius: 4px;
    border: 1px solid #eee;
  }
  
  .concept-indicators h4 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #333;
    font-size: 1rem;
  }
  
  .indicators-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .indicator-item {
    display: flex;
    align-items: center;
  }
</style> 