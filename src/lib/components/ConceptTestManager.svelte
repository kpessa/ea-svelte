<script lang="ts">
  import { onMount } from 'svelte';
  import { ConceptTestService, testScenarios, testResults } from '../services/conceptTestService';
  import { configStore } from '../services/configService';
  import type { TestScenario, TestSubScenario, ExpectedResult, ConceptChange, NavigationTab } from '../types';
  import { concepts } from '../stores';
  import ConceptHierarchySelector from './ConceptHierarchySelector.svelte';
  import HierarchicalScenarioManager from './HierarchicalScenarioManager.svelte';
  import ScenarioConceptEditor from './ScenarioConceptEditor.svelte';
  import ScenarioForm from './ScenarioForm.svelte';
  import SubScenarioForm from './SubScenarioForm.svelte';
  import ExpectedResultForm from './ExpectedResultForm.svelte';
  import ConceptSummaryModal from './ConceptSummaryModal.svelte';
  import ScenarioActionPanel from './ScenarioActionPanel.svelte';
  import ScenarioSelector from './ScenarioSelector.svelte';
  import ManagerHeader from './ManagerHeader.svelte';
  
  interface OrderSection {
    CONCEPT_NAME?: string;
    // Add other properties as needed
  }
  
  let scenarios: TestScenario[] = [];
  let selectedScenarioId: string | null = null;
  let selectedSubScenarioId: string | null = null;
  let isEditMode: boolean = false;
  let showCreateScenarioForm = false;
  let showCreateSubScenarioForm = false;
  let showConceptEditor = false;
  let showExpectedResultForm = false;
  let parentSubScenarioId: string | null = null;
  let showAppliedConceptsSummary = false;
  let appliedConcepts: ConceptChange[] = [];
  let inheritedConcepts: ConceptChange[] = [];
  
  // For editing concepts
  let editingSubScenario: TestSubScenario | null = null;
  let parentConcepts: ConceptChange[] = [];
  
  $: selectedScenario = selectedScenarioId 
    ? scenarios.find(s => s.id === selectedScenarioId) 
    : null;
  
  $: availableConcepts = Object.keys($concepts).sort();
  
  onMount(() => {
    loadScenarios();
    
    // Set up auto-save for scenarios
    const unsubscribe = testScenarios.subscribe(value => {
      // Don't save on initial load
      if (value.length > 0) {
        console.log('Auto-saving test scenarios...');
        ConceptTestService.saveTestScenarios();
      }
    });
    
    return () => {
      unsubscribe();
    };
  });
  
  async function loadScenarios() {
    ConceptTestService.loadTestScenarios();
    scenarios = $testScenarios;
    
    // If no scenarios exist, create default scenarios
    if (scenarios.length === 0) {
      console.log('No saved scenarios found, creating default scenarios');
      
      // Create a general default scenario
      const defaultScenario = ConceptTestService.createScenario(
        'Default Scenario', 
        'This is a default scenario created automatically'
      );
      
      // Create a Magnesium-specific scenario
      const magnesiumScenario = ConceptTestService.createDefaultMagnesiumScenario();
      
      // Refresh the scenarios list
      scenarios = $testScenarios;
      
      // Select the Magnesium scenario by default
      selectedScenarioId = magnesiumScenario.id;
    } else {
      console.log('Loaded', scenarios.length, 'scenarios from storage');
      selectedScenarioId = scenarios[0].id;
    }
  }
  
  function handleScenarioChange({ scenarioId }: { scenarioId: string }) {
    selectedScenarioId = scenarioId;
    selectedSubScenarioId = null;
  }
  
  function handleSubScenarioSelect(subScenarioId: string) {
    selectedSubScenarioId = subScenarioId;
  }
  
  function handleScenarioFormSave(event: CustomEvent<{ name: string; description: string }>) {
    const { name, description } = event.detail;
    const newScenario = ConceptTestService.createScenario(name, description);
    showCreateScenarioForm = false;
    loadScenarios();
    // Select the newly created scenario
    if (newScenario) {
      selectedScenarioId = newScenario.id;
    }
  }
  
  function handleScenarioFormCancel() {
    showCreateScenarioForm = false;
  }
  
  function handleSubScenarioFormSave(event: CustomEvent<{ name: string; description: string; parentId: string | null }>) {
    const { name, description, parentId } = event.detail;
    if (selectedScenarioId) {
      const newSubScenario = ConceptTestService.addSubScenarioToScenario(
        selectedScenarioId,
        name,
        description,
        parentId
      );
      
      showCreateSubScenarioForm = false;
      
      // Force refresh of the scenarios
      scenarios = [...$testScenarios];
      
      // Select the newly created sub-scenario
      if (newSubScenario) {
        selectedSubScenarioId = newSubScenario.id;
      }
    }
  }
  
  function handleSubScenarioFormCancel() {
    showCreateSubScenarioForm = false;
    parentSubScenarioId = null;
  }
  
  function handleAddSubScenario(event: CustomEvent) {
    parentSubScenarioId = event.detail.parentId;
    showCreateSubScenarioForm = true;
  }
  
  function editSelectedSubScenario() {
    if (selectedScenarioId && selectedSubScenarioId) {
      editingSubScenario = ConceptTestService.findSubScenarioById(selectedScenarioId, selectedSubScenarioId);
      
      // If this sub-scenario has a parent, get the parent's concepts
      if (editingSubScenario && editingSubScenario.parentId) {
        parentConcepts = ConceptTestService.getActiveConceptsForSubScenario(
          selectedScenarioId, 
          editingSubScenario.parentId
        );
      } else {
        parentConcepts = [];
      }
      
      showConceptEditor = true;
    }
  }
  
  function handleEditConcepts(event: CustomEvent) {
    const subScenarioId = event.detail.scenarioId;
    
    if (selectedScenarioId && subScenarioId) {
      editingSubScenario = ConceptTestService.findSubScenarioById(selectedScenarioId, subScenarioId);
      
      // If this sub-scenario has a parent, get the parent's concepts
      if (editingSubScenario && editingSubScenario.parentId) {
        parentConcepts = ConceptTestService.getActiveConceptsForSubScenario(
          selectedScenarioId, 
          editingSubScenario.parentId
        );
      } else {
        parentConcepts = [];
      }
      
      showConceptEditor = true;
    }
  }
  
  function handleAddExpectedResult(event: CustomEvent) {
    const subScenarioId = event.detail.scenarioId;
    
    if (selectedScenarioId && subScenarioId) {
      selectedSubScenarioId = subScenarioId;
      showExpectedResultForm = true;
    }
  }
  
  function handleDeleteSubScenario(event: CustomEvent) {
    const subScenarioId = event.detail.scenarioId;
    
    if (selectedScenarioId && subScenarioId) {
      if (confirm('Are you sure you want to delete this sub-scenario? This action cannot be undone.')) {
        if (ConceptTestService.deleteSubScenario(selectedScenarioId, subScenarioId)) {
          if (selectedSubScenarioId === subScenarioId) {
            selectedSubScenarioId = null;
          }
          loadScenarios();
        } else {
          alert('Failed to delete sub-scenario.');
        }
      }
    }
  }
  
  function handleExpectedResultFormSave(event: CustomEvent<{
    type: ExpectedResult['type'];
    target: string;
    expectedVisibility: boolean;
    description: string;
  }>) {
    const { type, target, expectedVisibility, description } = event.detail;
    if (selectedScenarioId && selectedSubScenarioId) {
      ConceptTestService.addExpectedResultToSubScenario(
        selectedScenarioId,
        selectedSubScenarioId,
        {
          type,
          target,
          expectedVisibility,
          description
        }
      );
      showExpectedResultForm = false;
      
      // Force refresh of the scenarios
      scenarios = [...$testScenarios];
    }
  }
  
  function handleExpectedResultFormCancel() {
    showExpectedResultForm = false;
  }
  
  function handleSaveConcepts(event: CustomEvent) {
    const { conceptChanges } = event.detail;
    
    if (selectedScenarioId && editingSubScenario && conceptChanges) {
      ConceptTestService.updateSubScenarioConcepts(
        selectedScenarioId,
        editingSubScenario.id,
        conceptChanges
      );
      
      showConceptEditor = false;
      editingSubScenario = null;
      parentConcepts = [];
      
      // Force refresh of the scenarios
      scenarios = [...$testScenarios];
    }
  }
  
  function handleCancelEditConcepts() {
    showConceptEditor = false;
    editingSubScenario = null;
    parentConcepts = [];
  }
  
  async function executeTest() {
    if (selectedScenarioId && selectedSubScenarioId) {
      await ConceptTestService.executeSubScenarioTest(selectedScenarioId, selectedSubScenarioId);
    }
  }
  
  function applySubScenarioConcepts() {
    if (selectedScenarioId && selectedSubScenarioId) {
      console.log('Starting to apply concepts for scenario:', selectedScenarioId, 'sub-scenario:', selectedSubScenarioId);
      
      // Get all active concepts for the selected sub-scenario
      const allConcepts = ConceptTestService.getActiveConceptsForSubScenario(
        selectedScenarioId, 
        selectedSubScenarioId
      );
      
      console.log('Retrieved active concepts:', allConcepts);
      
      // Find the selected sub-scenario
      const subScenario = ConceptTestService.findSubScenarioById(
        selectedScenarioId, 
        selectedSubScenarioId
      );
      
      if (subScenario) {
        // Separate directly defined concepts from inherited ones
        const directConcepts = subScenario.concepts;
        inheritedConcepts = allConcepts.filter(concept => 
          !directConcepts.some(dc => dc.conceptName === concept.conceptName)
        );
        
        // Store all applied concepts for display
        appliedConcepts = allConcepts;
        
        console.log('About to call ConceptTestService.applySubScenarioConcepts');
        // Apply the concepts
        ConceptTestService.applySubScenarioConcepts(selectedScenarioId, selectedSubScenarioId);
        console.log('Concepts applied via ConceptTestService');
        
        // Dispatch a custom event to notify the application to re-evaluate visibility
        const event = new CustomEvent('concepts-applied', { 
          detail: { concepts: allConcepts },
          bubbles: true 
        });
        console.log('Dispatching concepts-applied event:', event);
        document.dispatchEvent(event);
        console.log('Event dispatched');
        
        // Show the summary
        showAppliedConceptsSummary = true;
      }
    }
  }
  
  function handleConceptSummaryClose() {
    showAppliedConceptsSummary = false;
  }
  
  function clearAllConcepts() {
    ConceptTestService.clearConcepts();
  }
  
  function saveScenarios() {
    ConceptTestService.saveTestScenarios();
  }
  
  function clearTestResults() {
    ConceptTestService.clearTestResults();
  }
  
  function toggleEditMode() {
    isEditMode = !isEditMode;
  }
  
  function toggleCreateScenarioForm() {
    showCreateScenarioForm = !showCreateScenarioForm;
  }
  
  function toggleCreateSubScenarioForm() {
    showCreateSubScenarioForm = !showCreateSubScenarioForm;
    parentSubScenarioId = null;
  }
  
  function toggleExpectedResultForm() {
    showExpectedResultForm = !showExpectedResultForm;
  }
  
  function createMagnesiumScenario() {
    const magnesiumScenario = ConceptTestService.createDefaultMagnesiumScenario();
    selectedScenarioId = magnesiumScenario.id;
    alert('Magnesium scenario created successfully!');
  }
  
  function deleteScenario() {
    if (selectedScenarioId && confirm('Are you sure you want to delete this scenario? This action cannot be undone.')) {
      if (ConceptTestService.deleteScenario(selectedScenarioId)) {
        selectedScenarioId = null;
        selectedSubScenarioId = null;
        loadScenarios();
      } else {
        alert('Failed to delete scenario.');
      }
    }
  }
  
  function deleteSubScenario() {
    if (selectedScenarioId && selectedSubScenarioId && confirm('Are you sure you want to delete this sub-scenario? This action cannot be undone.')) {
      if (ConceptTestService.deleteSubScenario(selectedScenarioId, selectedSubScenarioId)) {
        selectedSubScenarioId = null;
        loadScenarios();
      } else {
        alert('Failed to delete sub-scenario.');
      }
    }
  }
  
  function setMagnesiumConcepts() {
    // Directly set the concepts needed for Magnesium orders
    concepts.update(state => {
      const newState = { ...state };
      
      // Set all the required concepts for Magnesium
      newState['EASHOWMAGORDERS'] = { value: true, isActive: true };
      newState['EACRITERIAVALIDMAGRESULT4H'] = { value: true, isActive: true };
      newState['EALABMAGBTW00AND13'] = { value: true, isActive: true };
      newState['EAPROTOCOLMAGIV'] = { value: true, isActive: true };
      newState['EAPROTOCOLMAGORAL'] = { value: true, isActive: true };
      newState['EACRITERIANOTNPO'] = { value: false, isActive: true };
      newState['EALABMAGBTW14AND19'] = { value: true, isActive: true };
      
      console.log('Directly set Magnesium concepts:', newState);
      
      // Dispatch a custom event to notify the application to re-evaluate visibility
      const event = new CustomEvent('concepts-applied', { 
        detail: { concepts: Object.keys(newState).map(key => ({ 
          conceptName: key, 
          value: newState[key].value, 
          isActive: newState[key].isActive 
        })) },
        bubbles: true 
      });
      console.log('Dispatching concepts-applied event after direct set:', event);
      document.dispatchEvent(event);
      
      // Also dispatch an event to force re-evaluation of order sections
      const evaluateEvent = new CustomEvent('evaluate-order-sections', { bubbles: true });
      console.log('Dispatching evaluate-order-sections event');
      document.dispatchEvent(evaluateEvent);
      
      return newState;
    });
    
    alert('Magnesium concepts set directly!');
  }
  
  function setConceptsDirectly() {
    // Get all tabs from the config
    const allTabs = $configStore?.RCONFIG.TABS || [];
    
    if (allTabs.length === 0) {
      console.error('No tabs found in config');
      return;
    }
    
    console.log('Setting concepts for all tabs');
    
    // Get all the concept expressions from all sections in all tabs
    const conceptExpressions: string[] = [];
    allTabs.forEach(tab => {
      // Check if tab has ORDER_SECTIONS
      const sections = (tab as any).ORDER_SECTIONS || [];
      sections.forEach((section: any) => {
        if (section.CONCEPT_NAME) {
          conceptExpressions.push(section.CONCEPT_NAME);
        }
      });
    });
    
    console.log('Setting concepts directly from expressions:', conceptExpressions);
    
    // Extract all concept names from the expressions
    const conceptNames = new Set<string>();
    conceptExpressions.forEach(expr => {
      // Simple regex to extract concept names from expressions like {CONCEPTNAME}
      const matches = expr.match(/\{([^}]+)\}/g);
      if (matches) {
        matches.forEach(match => {
          // Remove the curly braces
          const conceptName = match.substring(1, match.length - 1);
          conceptNames.add(conceptName);
        });
      }
    });
    
    console.log('Extracted concept names:', Array.from(conceptNames));
    
    // Set all concepts to true
    const conceptChanges: Record<string, { value: boolean, isActive: boolean }> = {};
    conceptNames.forEach(name => {
      conceptChanges[name] = { value: true, isActive: true };
    });
    
    // Update the concepts store
    concepts.update(state => {
      const newState = { ...state, ...conceptChanges };
      console.log('Updated concepts store:', newState);
      return newState;
    });
    
    // Dispatch the concepts-applied event
    const event = new CustomEvent('concepts-applied', { 
      detail: { concepts: Array.from(conceptNames).map(name => ({ conceptName: name, value: true, isActive: true })) },
      bubbles: true 
    });
    console.log('Dispatching concepts-applied event after direct set:', event);
    document.dispatchEvent(event);
    
    // Also dispatch the evaluate-order-sections event
    const evaluateEvent = new CustomEvent('evaluate-order-sections', { bubbles: true });
    console.log('Dispatching evaluate-order-sections event');
    document.dispatchEvent(evaluateEvent);
    
    alert(`All concepts (${conceptNames.size}) have been set to TRUE. The sections should now be visible.`);
  }
</script>

<div class="concept-test-manager">
  <ManagerHeader
    {isEditMode}
    on:saveScenarios={saveScenarios}
    on:clearTestResults={clearTestResults}
    on:toggleEditMode={toggleEditMode}
  />
  
  <ScenarioSelector
    {scenarios}
    {selectedScenarioId}
    {isEditMode}
    on:scenarioChange={(event) => handleScenarioChange(event.detail)}
    on:createScenario={toggleCreateScenarioForm}
    on:createDefaultScenario={createMagnesiumScenario}
    on:setAllConcepts={setConceptsDirectly}
    on:deleteScenario={deleteScenario}
  />
  
  <ScenarioForm 
    isOpen={showCreateScenarioForm}
    on:save={handleScenarioFormSave}
    on:cancel={handleScenarioFormCancel}
  />
  
  <SubScenarioForm 
    isOpen={showCreateSubScenarioForm}
    parentId={parentSubScenarioId}
    on:save={handleSubScenarioFormSave}
    on:cancel={handleSubScenarioFormCancel}
  />
  
  <ExpectedResultForm
    isOpen={showExpectedResultForm}
    on:save={handleExpectedResultFormSave}
    on:cancel={handleExpectedResultFormCancel}
  />
  
  <ConceptSummaryModal
    isOpen={showAppliedConceptsSummary}
    appliedConcepts={appliedConcepts}
    inheritedConcepts={inheritedConcepts}
    totalConceptCount={appliedConcepts.length + inheritedConcepts.length}
    on:close={handleConceptSummaryClose}
  />
  
  {#if selectedScenario}
    <div class="scenario-content">
      <div class="scenario-info">
        <h3>{selectedScenario.name}</h3>
        <p>{selectedScenario.description}</p>
        
        <div class="scenario-primary-actions">
          {#if isEditMode}
            <button class="action-btn primary" on:click={toggleCreateSubScenarioForm}>
              Add Root Scenario
            </button>
          {/if}
        </div>
      </div>
      
      {#if selectedScenario.scenarios.length === 0}
        <div class="empty-scenarios">
          <p>No scenarios defined yet for this test case.</p>
          {#if isEditMode}
            <button class="add-first-scenario-btn" on:click={toggleCreateSubScenarioForm}>
              Add Your First Scenario
            </button>
          {/if}
        </div>
      {:else}
        <div class="scenario-manager">
          <HierarchicalScenarioManager 
            scenario={selectedScenario}
            selectedScenarioId={selectedSubScenarioId}
            onScenarioSelect={handleSubScenarioSelect}
            isEditable={isEditMode}
            on:addSubScenario={handleAddSubScenario}
            on:editConcepts={handleEditConcepts}
            on:addExpectedResult={handleAddExpectedResult}
            on:deleteSubScenario={handleDeleteSubScenario}
          />
        </div>
      {/if}
      
      {#if selectedSubScenarioId}
        <ScenarioActionPanel
          {selectedScenarioId}
          {selectedSubScenarioId}
          on:editConcepts={editSelectedSubScenario}
          on:addExpectedResult={toggleExpectedResultForm}
          on:applyConcepts={applySubScenarioConcepts}
          on:clearConcepts={clearAllConcepts}
          on:setMagnesiumConcepts={setMagnesiumConcepts}
          on:executeTest={executeTest}
          on:deleteSubScenario={deleteSubScenario}
        />
      {/if}
    </div>
  {:else}
    <div class="empty-state">
      <p>No scenarios available. Create a new scenario to get started.</p>
    </div>
  {/if}
  
  {#if showConceptEditor && editingSubScenario}
    <div class="modal-overlay">
      <div class="modal-content">
        <ScenarioConceptEditor 
          scenario={editingSubScenario}
          parentConcepts={parentConcepts}
          on:save={handleSaveConcepts}
          on:cancel={handleCancelEditConcepts}
        />
      </div>
    </div>
  {/if}
</div>

<style>
  .concept-test-manager {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  
  .manager-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #f0f0f0;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .manager-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }
  
  .header-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .scenario-selection {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #f9f9f9;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .scenario-select {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .scenario-select label {
    font-weight: 500;
    color: #333;
  }
  
  .scenario-select select {
    padding: 0.5rem;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    min-width: 200px;
  }
  
  .scenario-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .action-btn {
    padding: 0.5rem 1rem;
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .action-btn:hover {
    background-color: #e0e0e0;
  }
  
  .action-btn.active {
    background-color: #e3f2fd;
    border-color: #2196f3;
    color: #0d47a1;
  }
  
  .action-btn.primary {
    background-color: #2196f3;
    color: white;
    border-color: #1976d2;
  }
  
  .action-btn.primary:hover {
    background-color: #1976d2;
  }
  
  .scenario-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .scenario-info {
    padding: 1rem;
    background-color: #f9f9f9;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .scenario-info h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  .scenario-info p {
    margin: 0;
    margin-bottom: 1rem;
    color: #666;
  }
  
  .scenario-primary-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .scenario-manager {
    flex: 1;
    overflow: auto;
    padding: 1rem;
  }
  
  .selected-subscenario-actions {
    padding: 1rem;
    background-color: #f0f0f0;
    border-top: 1px solid #e0e0e0;
  }
  
  .action-panel {
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 1rem;
  }
  
  .action-panel h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #333;
    font-size: 1rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
  }
  
  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    background-color: #f9f9f9;
    border: 1px dashed #ccc;
    border-radius: 4px;
    margin: 1rem;
    color: #999;
    font-style: italic;
  }
  
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
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    width: 80%;
    max-width: 1000px;
    height: 80%;
    max-height: 800px;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
  }
  
  .empty-scenarios {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    background-color: #f9f9f9;
    border: 1px dashed #ccc;
    border-radius: 4px;
    margin: 1rem;
    text-align: center;
  }
  
  .empty-scenarios p {
    margin-bottom: 1.5rem;
    color: #666;
    font-style: italic;
  }
  
  .add-first-scenario-btn {
    padding: 0.75rem 1.5rem;
    background-color: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .add-first-scenario-btn:hover {
    background-color: #1976d2;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .summary-modal {
    width: 600px;
    max-width: 90%;
    height: auto;
    max-height: 80%;
  }
  
  .summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #f0f0f0;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .summary-header h3 {
    margin: 0;
    color: #333;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }
  
  .summary-content {
    padding: 1rem;
    overflow-y: auto;
    max-height: 400px;
  }
  
  .inherited-concepts-summary {
    margin-top: 1rem;
    background-color: #f9f9f9;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 1rem;
  }
  
  .inherited-concepts-summary h4 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  .summary-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0.5rem;
  }
  
  .summary-table th,
  .summary-table td {
    padding: 0.5rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .summary-table th {
    background-color: #f0f0f0;
    font-weight: 500;
  }
  
  .concept-value,
  .concept-active {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
  }
  
  .concept-value.true {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .concept-value.false {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .concept-active.active {
    background-color: #e3f2fd;
    color: #0d47a1;
  }
  
  .concept-active.inactive {
    background-color: #f5f5f5;
    color: #757575;
  }
  
  .summary-actions {
    padding: 1rem;
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid #e0e0e0;
  }
  
  .delete-btn {
    background-color: #dc3545;
    color: white;
    border-color: #dc3545;
  }
  
  .delete-btn:hover {
    background-color: #c82333;
    border-color: #bd2130;
  }
</style> 