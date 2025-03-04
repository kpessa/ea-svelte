<script lang="ts">
  import { onMount } from 'svelte';
  import { testCases, selectedTestCase, concepts } from '$lib/stores';
  import { TestPatientService } from '$lib/services/testPatientService';
  import type { TestCase, Concept } from '$lib/types';
  
  let showModal = false;
  let testPatientService = TestPatientService.getInstance();
  let allTestCases: TestCase[] = [];
  let currentTestCase: string = '';
  let editMode = false;
  let newTestCaseName = '';
  let editingTestCase: TestCase | null = null;
  let conceptsSnapshot: Record<string, Concept> = {};
  let validationError = '';
  
  // Subscribe to stores
  const unsubTestCases = testCases.subscribe((value: TestCase[]) => {
    allTestCases = value;
  });
  
  const unsubSelectedTestCase = selectedTestCase.subscribe((value: string) => {
    currentTestCase = value;
  });
  
  const unsubConcepts = concepts.subscribe((value: Record<string, Concept>) => {
    conceptsSnapshot = { ...value };
  });
  
  function toggleModal() {
    showModal = !showModal;
    if (showModal) {
      // Reset state when opening modal
      editMode = false;
      newTestCaseName = '';
      editingTestCase = null;
      validationError = '';
    }
  }
  
  // Close modal when clicking outside of it
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('test-patient-modal')) {
      showModal = false;
    }
  }
  
  // Close modal when pressing Escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && showModal) {
      showModal = false;
    }
  }
  
  function createNewTestCase() {
    if (!newTestCaseName.trim()) {
      validationError = 'Test case name cannot be empty';
      return;
    }
    
    // Check for duplicate names
    if (allTestCases.some(tc => tc.name === newTestCaseName.trim())) {
      validationError = 'A test case with this name already exists';
      return;
    }
    
    validationError = '';
    const newCase = testPatientService.addTestCase(newTestCaseName.trim(), conceptsSnapshot);
    newTestCaseName = '';
    
    // Automatically select the new test case
    applyTestCase(newCase.id);
  }
  
  function startEditTestCase(testCase: TestCase) {
    editMode = true;
    editingTestCase = { ...testCase };
    newTestCaseName = testCase.name;
  }
  
  function saveEditedTestCase() {
    if (!editingTestCase) return;
    
    if (!newTestCaseName.trim()) {
      validationError = 'Test case name cannot be empty';
      return;
    }
    
    // Check for duplicate names (excluding the current test case)
    if (allTestCases.some(tc => tc.name === newTestCaseName.trim() && tc.id !== editingTestCase?.id)) {
      validationError = 'A test case with this name already exists';
      return;
    }
    
    validationError = '';
    testPatientService.updateTestCase(editingTestCase.id, {
      name: newTestCaseName.trim(),
      concepts: conceptsSnapshot
    });
    
    // Reset edit mode
    editMode = false;
    editingTestCase = null;
    newTestCaseName = '';
  }
  
  function cancelEdit() {
    editMode = false;
    editingTestCase = null;
    newTestCaseName = '';
    validationError = '';
  }
  
  function deleteTestCase(id: string) {
    if (confirm('Are you sure you want to delete this test case?')) {
      testPatientService.deleteTestCase(id);
    }
  }
  
  function applyTestCase(id: string) {
    const testCase = testPatientService.getTestCase(id);
    if (!testCase) return;
    
    // Apply the test case concepts to the current state
    concepts.update((state: Record<string, Concept>) => {
      const newState = { ...state };
      
      // Update existing concepts with values from the test case
      Object.entries(testCase.concepts).forEach(([key, concept]) => {
        newState[key] = { ...concept as Concept };
      });
      
      return newState;
    });
    
    // Set as selected test case
    testPatientService.applyTestCase(id);
  }
  
  function captureCurrentState() {
    if (currentTestCase) {
      // Update the current test case with the current concept values
      testPatientService.updateTestCase(currentTestCase, {
        concepts: conceptsSnapshot
      });
    }
  }
  
  function exportTestCases() {
    const dataStr = JSON.stringify(allTestCases, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'test-cases.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
  
  function handleFileImport(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Validate imported data
        if (!Array.isArray(importedData)) {
          alert('Invalid import file format');
          return;
        }
        
        // Import each test case
        importedData.forEach((testCase: any) => {
          if (testCase.id && testCase.name && testCase.concepts) {
            // Check if test case with this ID already exists
            const existingIndex = allTestCases.findIndex(tc => tc.id === testCase.id);
            
            if (existingIndex >= 0) {
              // Update existing test case
              testPatientService.updateTestCase(testCase.id, testCase);
            } else {
              // Add as new test case
              testPatientService.addTestCase(testCase.name, testCase.concepts);
            }
          }
        });
        
        alert('Test cases imported successfully');
      } catch (error) {
        alert('Error importing test cases: ' + error);
      }
    };
    reader.readAsText(file);
  }
  
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      unsubTestCases();
      unsubSelectedTestCase();
      unsubConcepts();
    };
  });
</script>

<div class="test-patient-icon-container">
  <button 
    class="test-patient-icon {showModal ? 'active' : ''}" 
    on:click={toggleModal}
    aria-label="Test Patient Manager"
  >
    👤
  </button>
</div>

{#if showModal}
  <div 
    class="test-patient-modal" 
    style="display: block;" 
    on:click={handleClickOutside}
  >
    <div class="test-patient-modal-content">
      <div class="test-patient-modal-header">
        <h2 class="test-patient-modal-title">Test Patient Manager</h2>
        <button 
          class="test-patient-modal-close" 
          on:click={toggleModal}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div class="test-patient-modal-body">
        <!-- Test Case List -->
        <div class="test-case-section">
          <h3>Test Cases</h3>
          
          {#if allTestCases.length > 0}
            <div class="test-case-list">
              {#each allTestCases as testCase}
                <div class="test-case-item {currentTestCase === testCase.id ? 'active' : ''}">
                  <div class="test-case-name">{testCase.name}</div>
                  <div class="test-case-actions">
                    <button 
                      class="test-case-action-btn apply-btn" 
                      on:click={() => applyTestCase(testCase.id)}
                      disabled={currentTestCase === testCase.id}
                    >
                      Apply
                    </button>
                    <button 
                      class="test-case-action-btn edit-btn" 
                      on:click={() => startEditTestCase(testCase)}
                    >
                      Edit
                    </button>
                    <button 
                      class="test-case-action-btn delete-btn" 
                      on:click={() => deleteTestCase(testCase.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="no-test-cases">
              No test cases available. Create a new test case to get started.
            </div>
          {/if}
        </div>
        
        <!-- Create/Edit Test Case Form -->
        <div class="test-case-form">
          <h3>{editMode ? 'Edit Test Case' : 'Create New Test Case'}</h3>
          
          <div class="form-group">
            <label for="test-case-name">Test Case Name:</label>
            <input 
              type="text" 
              id="test-case-name" 
              bind:value={newTestCaseName} 
              placeholder="Enter test case name"
            />
            {#if validationError}
              <div class="validation-error">{validationError}</div>
            {/if}
          </div>
          
          <div class="form-actions">
            {#if editMode}
              <button class="form-btn save-btn" on:click={saveEditedTestCase}>
                Save Changes
              </button>
              <button class="form-btn cancel-btn" on:click={cancelEdit}>
                Cancel
              </button>
            {:else}
              <button class="form-btn create-btn" on:click={createNewTestCase}>
                Create Test Case
              </button>
              <button class="form-btn capture-btn" on:click={captureCurrentState} disabled={!currentTestCase}>
                Update Current Test Case
              </button>
            {/if}
          </div>
        </div>
        
        <!-- Import/Export Section -->
        <div class="import-export-section">
          <h3>Import/Export</h3>
          <div class="import-export-actions">
            <button class="import-export-btn" on:click={exportTestCases}>
              Export Test Cases
            </button>
            <label class="import-btn">
              Import Test Cases
              <input 
                type="file" 
                accept=".json" 
                on:change={handleFileImport} 
                style="display: none;"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .test-patient-icon-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
  }
  
  .test-patient-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #4a90e2;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  }
  
  .test-patient-icon:hover, .test-patient-icon.active {
    background-color: #3a7bc8;
    transform: scale(1.05);
  }
  
  .test-patient-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1001;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .test-patient-modal-content {
    background-color: white;
    border-radius: 5px;
    width: 80%;
    max-width: 700px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  }
  
  .test-patient-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
  }
  
  .test-patient-modal-title {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }
  
  .test-patient-modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }
  
  .test-patient-modal-close:hover {
    color: #333;
  }
  
  .test-patient-modal-body {
    padding: 20px;
  }
  
  .test-case-section, .test-case-form, .import-export-section {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
  }
  
  .test-case-section h3, .test-case-form h3, .import-export-section h3 {
    margin-top: 0;
    color: #333;
  }
  
  .test-case-list {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .test-case-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #eee;
  }
  
  .test-case-item:last-child {
    border-bottom: none;
  }
  
  .test-case-item.active {
    background-color: #f0f7ff;
  }
  
  .test-case-name {
    font-weight: bold;
  }
  
  .test-case-actions {
    display: flex;
    gap: 5px;
  }
  
  .test-case-action-btn {
    padding: 3px 8px;
    border-radius: 3px;
    border: 1px solid #ccc;
    background-color: #f5f5f5;
    cursor: pointer;
    font-size: 12px;
  }
  
  .apply-btn {
    background-color: #4caf50;
    color: white;
    border-color: #4caf50;
  }
  
  .apply-btn:disabled {
    background-color: #a5d6a7;
    border-color: #a5d6a7;
    cursor: not-allowed;
  }
  
  .edit-btn {
    background-color: #2196f3;
    color: white;
    border-color: #2196f3;
  }
  
  .delete-btn {
    background-color: #f44336;
    color: white;
    border-color: #f44336;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  .form-group input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .validation-error {
    color: #f44336;
    font-size: 12px;
    margin-top: 5px;
  }
  
  .form-actions {
    display: flex;
    gap: 10px;
  }
  
  .form-btn {
    padding: 8px 15px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-weight: bold;
  }
  
  .create-btn, .save-btn {
    background-color: #4caf50;
    color: white;
  }
  
  .cancel-btn {
    background-color: #9e9e9e;
    color: white;
  }
  
  .capture-btn {
    background-color: #ff9800;
    color: white;
  }
  
  .capture-btn:disabled {
    background-color: #ffcc80;
    cursor: not-allowed;
  }
  
  .import-export-actions {
    display: flex;
    gap: 10px;
  }
  
  .import-export-btn, .import-btn {
    padding: 8px 15px;
    border-radius: 4px;
    border: 1px solid #ddd;
    background-color: #f5f5f5;
    cursor: pointer;
    text-align: center;
  }
  
  .no-test-cases {
    padding: 15px;
    text-align: center;
    color: #666;
    font-style: italic;
  }
</style> 