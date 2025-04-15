<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    type Electrolyte = 'Magnesium' | 'Potassium' | 'Phosphorus' | 'Calcium';

    const dispatch = createEventDispatcher<{ 
        updateLab: { electrolyte: Electrolyte, value: number | null }
    }>();

    let selectedElectrolyte: Electrolyte = 'Magnesium';
    let labValue: number | null = null;
    let inputError: string | null = null;

    function handleSubmit() {
        if (labValue === null || isNaN(labValue)) {
            inputError = 'Please enter a valid number.';
            return;
        }
        inputError = null;
        dispatch('updateLab', { electrolyte: selectedElectrolyte, value: labValue });
    }

    function handleClear() {
        labValue = null;
        inputError = null;
        // Optionally dispatch an event to reset concepts if needed
        // dispatch('updateLab', { electrolyte: selectedElectrolyte, value: null });
         alert('Lab value cleared. Concept logic reset may need specific implementation.');
    }

    function handleInputChange() {
        if (inputError) {
            inputError = null; // Clear error message on input change
        }
    }

</script>

<div class="lab-input-panel card bg-light-gray p-4 rounded shadow-sm border border-gray-200 mb-4">
    <h3 class="text-lg font-semibold mb-3 text-gray-700">Enter Lab Value</h3>
    <div class="flex flex-wrap items-end gap-3">
        <div class="flex-grow">
            <label for="electrolyte-select" class="block text-sm font-medium text-gray-600 mb-1">Electrolyte:</label>
            <select id="electrolyte-select" bind:value={selectedElectrolyte} class="input input-bordered w-full">
                <option value="Magnesium">Magnesium</option>
                <option value="Potassium">Potassium</option>
                <option value="Phosphorus">Phosphorus</option>
                <option value="Calcium">Calcium</option>
            </select>
        </div>
        <div class="flex-grow">
            <label for="lab-value-input" class="block text-sm font-medium text-gray-600 mb-1">Value:</label>
            <input 
                id="lab-value-input" 
                type="number" 
                step="any" 
                bind:value={labValue} 
                on:input={handleInputChange}
                placeholder="Enter value" 
                class="input input-bordered w-full {inputError ? 'border-red-500' : ''}"
            />
        </div>
        <div class="flex gap-2">
             <button class="btn btn-primary" on:click={handleSubmit}>
                Apply
            </button>
             <button class="btn btn-secondary" on:click={handleClear} title="Clear input and potentially reset concepts">
                Clear
            </button>
        </div>
    </div>
    {#if inputError}
        <p class="text-red-600 text-sm mt-2">{inputError}</p>
    {/if}
</div>

<style>
    .input {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        width: 100%;
    }
    .btn {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
    }
    .btn-primary {
        background-color: #0056b3;
        color: white;
        border: 1px solid #0056b3;
    }
    .btn-primary:hover {
        background-color: #004494;
    }
    .btn-secondary {
         background-color: #6c757d;
         color: white;
         border: 1px solid #6c757d;
    }
     .btn-secondary:hover {
         background-color: #5a6268;
    }
    .card {
         /* Add card styles if not globally defined */
    }
    .bg-light-gray {
         background-color: #f8f9fa; /* Example light gray */
    }
</style> 