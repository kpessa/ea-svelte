<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { ExpectedResult } from '../types';

  export let isOpen: boolean = false;

  let resultType: 'tab' | 'section' | 'order' | 'criterion' = 'tab';
  let target: string = '';
  let visibility: boolean = true;
  let description: string = '';

  const dispatch = createEventDispatcher<{
    save: {
      type: ExpectedResult['type'];
      target: string;
      expectedVisibility: boolean;
      description: string;
    };
    cancel: void;
  }>();

  function handleSubmit() {
    if (target.trim()) {
      dispatch('save', {
        type: resultType,
        target,
        expectedVisibility: visibility,
        description
      });
      resetForm();
    }
  }

  function handleCancel() {
    resetForm();
    dispatch('cancel');
  }

  function resetForm() {
    resultType = 'tab';
    target = '';
    visibility = true;
    description = '';
  }
</script>

{#if isOpen}
  <div class="form-panel">
    <h3>Add Expected Result</h3>
    
    <div class="form-group">
      <label for="expected-result-type">Type:</label>
      <select id="expected-result-type" bind:value={resultType}>
        <option value="tab">Tab</option>
        <option value="section">Section</option>
        <option value="order">Order</option>
        <option value="criterion">Criterion</option>
      </select>
    </div>
    
    <div class="form-group">
      <label for="expected-result-target">Target:</label>
      <input 
        type="text" 
        id="expected-result-target" 
        bind:value={target} 
        placeholder="Enter target (e.g., MAGNESIUM for tab)"
      />
    </div>
    
    <div class="form-group">
      <label for="expected-result-visibility">Expected Visibility:</label>
      <div class="toggle-switch">
        <input 
          type="checkbox" 
          id="expected-result-visibility" 
          bind:checked={visibility} 
        />
        <label for="expected-result-visibility"></label>
        <span>{visibility ? 'Visible' : 'Hidden'}</span>
      </div>
    </div>
    
    <div class="form-group">
      <label for="expected-result-description">Description:</label>
      <textarea 
        id="expected-result-description" 
        bind:value={description} 
        placeholder="Enter description (optional)"
      ></textarea>
    </div>
    
    <div class="form-actions">
      <button class="cancel-btn" on:click={handleCancel}>Cancel</button>
      <button class="submit-btn" on:click={handleSubmit}>Add Expected Result</button>
    </div>
  </div>
{/if}

<style>
  .form-panel {
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 1rem;
    margin: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .form-panel h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
    color: #333;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
  }

  .form-group textarea {
    min-height: 100px;
    resize: vertical;
  }

  .toggle-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-switch label {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
    background-color: #ccc;
    border-radius: 20px;
    transition: .4s;
    cursor: pointer;
  }

  .toggle-switch label:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    border-radius: 50%;
    transition: .4s;
  }

  .toggle-switch input:checked + label {
    background-color: #2196F3;
  }

  .toggle-switch input:checked + label:before {
    transform: translateX(20px);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .cancel-btn {
    padding: 0.5rem 1rem;
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-btn:hover {
    background-color: #e0e0e0;
  }

  .submit-btn {
    padding: 0.5rem 1rem;
    background-color: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .submit-btn:hover {
    background-color: #1976d2;
  }
</style> 