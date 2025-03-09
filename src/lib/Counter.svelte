<script lang="ts">
  export let count = 0;
  
  const increment = () => {
    count += 1;
  };
</script>

<button on:click={increment} class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  count is {count}
</button>
