<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Concept } from '../types';
    import ConceptEvaluator from './ConceptEvaluator.svelte';

    const dispatch = createEventDispatcher<{
        close: void;
    }>();

    export let expression: string;
    export let concepts: Record<string, Concept>;

    let evaluatorComponent: ConceptEvaluator;

    function closeModal() {
        dispatch('close');
    }
</script>

<div class="evaluation-modal">
    <div class="evaluation-modal-content">
        <div class="evaluation-modal-header">
            <h3>Expression Evaluation</h3>
            <button class="close-btn" on:click={closeModal}>×</button>
        </div>
        <div class="evaluation-modal-body">
            <ConceptEvaluator
                bind:this={evaluatorComponent}
                expressionToEvaluate={expression}
                conceptsSnapshot={concepts}
                on:toggleConcept
            />
        </div>
    </div>
</div>

<style>
    .evaluation-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .evaluation-modal-content {
        background-color: white;
        border-radius: 4px;
        width: 80%;
        max-width: 800px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .evaluation-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #e5e5e5;
    }
    
    .evaluation-modal-header h3 {
        margin: 0;
        font-size: 18px;
    }
    
    .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #666;
    }
    
    .close-btn:hover {
        color: #333;
    }
    
    .evaluation-modal-body {
        padding: 16px;
        overflow-y: auto;
    }
</style> 