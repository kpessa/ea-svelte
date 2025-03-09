<!-- ExpectedResults.svelte -->
<script lang="ts">
  import type { ExpectedResult } from '../types';
  
  export let results: ExpectedResult[];
</script>

<div class="expected-results">
  <h4>Expected Results</h4>
  <ul>
    {#each results as result}
      <li>
        {result.type}: {result.target} should be {result.expectedVisibility ? 'visible' : 'hidden'}
        {#if result.description}({result.description}){/if}
      </li>
    {/each}
  </ul>
</div>

<style>
  .expected-results {
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 0.75rem;
  }

  .expected-results h4 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    color: #333;
    font-size: 0.9rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.25rem;
  }

  .expected-results ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .expected-results li {
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
  }
</style> 