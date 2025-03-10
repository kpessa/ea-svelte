<script lang="ts">
  import type { Concept } from '../types';
  
  export let content: string = '';
  export let conceptsSnapshot: Record<string, Concept> = {};
  
  // Parse the content for @concept{CONCEPT.value} syntax
  $: parsedContent = parseConceptValues(content, conceptsSnapshot);
  
  function parseConceptValues(text: string, concepts: Record<string, Concept>): string {
    // Regular expression to match @concept{CONCEPT.value} pattern
    const conceptValueRegex = /@concept\{([^{}]+)\.value\}/g;
    
    // Replace all matches with the actual concept values
    return text.replace(conceptValueRegex, (match, conceptName) => {
      const concept = concepts[conceptName];
      
      if (!concept) {
        return `[${conceptName}: undefined]`;
      }
      
      // Format the value based on its type
      if (typeof concept.value === 'boolean') {
        return concept.value ? 'True' : 'False';
      } else if (typeof concept.value === 'number') {
        return concept.value.toString();
      } else if (concept.value === null || concept.value === undefined) {
        return 'undefined';
      } else {
        return String(concept.value);
      }
    });
  }
</script>

<div class="concept-value-display">
  {@html parsedContent}
</div>

<style>
  .concept-value-display {
    display: inline;
  }
</style> 