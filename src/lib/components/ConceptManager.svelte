<script lang="ts">
  import { onMount } from 'svelte';
  import { concepts } from '../stores';
  import { evaluateConceptExpression, setConceptValue, toggleConceptActive, type EvaluationStep } from '../stores';
  import { configStore } from '../services/configService';
  import { ConceptExtractionService } from '../services/conceptExtractionService';
  import { ConceptTestService, testScenarios, testResults } from '../services/conceptTestService';
  import ConceptHierarchySelector from './ConceptHierarchySelector.svelte';
  import type { Concept, ConceptReference, TestScenario, TestResult, TestPath } from '../types';
  
  // Import the new components
  import ExtractToolsPanel from './ExtractToolsPanel.svelte';
  import ConceptReportPanel from './ConceptReportPanel.svelte';
  import ConceptFormPanel from './ConceptFormPanel.svelte';
  import ConceptExpressionPanel from './ConceptExpressionPanel.svelte';
  import TestIntegrationPanel from './TestIntegrationPanel.svelte';
  import ImportExportPanel from './ImportExportPanel.svelte';

  export let show = false;

  let conceptsSnapshot: Record<string, Concept> = {};
  let searchTerm = '';
  let newConceptName = '';
  let newConceptValue = false;
  let expressionToEvaluate = '';
  let validationError = '';
  let editMode = false;
  let editingConceptName = '';
  let editingConceptOriginalName = '';
  let conceptReferences: ConceptReference[] = [];
  let showConceptReport = false;
  let conceptReport = '';
  
  // For hierarchical concept selector
  let selectedConcepts: string[] = [];
  let conceptChangeValues: Record<string, boolean> = {};
  let conceptChangeActive: Record<string, boolean> = {};
  
  // For test scenario integration
  let showTestIntegration = false;
  
  // For concept evaluation visualization
  let showEvaluationDetails = false;
  let conceptEvaluationDetails: Record<string, { value: boolean, expression: string, dependencies: string[] }> = {};
  
  // For section rendering control
  let sectionVisibilityControl: Record<string, boolean> = {};
  let showSectionControl = false;
  
  let configExpressions: { expression: string, path: string }[] = [];
  
  // Subscribe to concepts store
  const unsubConcepts = concepts.subscribe((value: Record<string, Concept>) => {
    conceptsSnapshot = { ...value };
    
    // Update selected concepts when concept store changes
    updateSelectedConceptsFromStore();
  });
  
  // Subscribe to config store to extract concepts when config changes
  const unsubConfig = configStore.subscribe(config => {
    if (config) {
      try {
        conceptReferences = ConceptExtractionService.extractConcepts(config);
        conceptReport = ConceptExtractionService.generateConceptUsageReport(conceptReferences);
        extractConfigExpressions();
      } catch (error) {
        console.error('Error extracting concepts:', error);
      }
    }
  });
  
  // Subscribe to test results for visualization
  const unsubTestResults = testResults.subscribe((results: TestResult[]) => {
    // Update visualization when test results change
    if (results.length > 0) {
      updateConceptEvaluationDetails();
    }
  });
  
  function updateSelectedConceptsFromStore() {
    // Clear previous selections
    selectedConcepts = [];
    conceptChangeValues = {};
    conceptChangeActive = {};
    
    // Add all active concepts to the selection
    Object.entries(conceptsSnapshot).forEach(([name, concept]) => {
      if (concept.isActive) {
        selectedConcepts.push(name);
        conceptChangeValues[name] = typeof concept.value === 'boolean' ? concept.value : false;
        conceptChangeActive[name] = concept.isActive;
      }
    });
  }
  
  function handleToggleModal(event: CustomEvent) {
    show = event.detail.showModal;
    
    if (show) {
      // Reset state when opening modal
      searchTerm = '';
      newConceptName = '';
      newConceptValue = false;
      expressionToEvaluate = '';
      validationError = '';
      editMode = false;
      editingConceptName = '';
      editingConceptOriginalName = '';
      showConceptReport = false;
      showTestIntegration = false;
      
      // Update selected concepts from store
      updateSelectedConceptsFromStore();
    }
  }
  
  function handleCreateConcept(event: CustomEvent) {
    const { name, value } = event.detail;
    
    // Add new concept to the store
    concepts.update((state: Record<string, Concept>) => ({
      ...state,
      [name]: {
        value,
        isActive: true
      }
    }));
    
    // Reset form
    newConceptName = '';
    newConceptValue = false;
  }
  
  function handleSaveConcept(event: CustomEvent) {
    const { originalName, newName, value } = event.detail;
    
    // If name changed, we need to remove the old one and add a new one
    if (newName !== originalName) {
      concepts.update((state: Record<string, Concept>) => {
        const newState = { ...state };
        const conceptValue = newState[originalName]?.value || false;
        const conceptActive = newState[originalName]?.isActive || true;
        
        // Remove old concept
        delete newState[originalName];
        
        // Add with new name
        newState[newName] = {
          value,
          isActive: conceptActive
        };
        
        return newState;
      });
    } else {
      // Just update the value
      setConceptValue(newName, value);
    }
    
    // Reset edit mode
    editMode = false;
    editingConceptName = '';
    editingConceptOriginalName = '';
    newConceptValue = false;
  }
  
  function handleCancelEdit() {
    editMode = false;
    editingConceptName = '';
    editingConceptOriginalName = '';
    newConceptValue = false;
    validationError = '';
  }
  
  function startEditConcept(conceptName: string) {
    editMode = true;
    editingConceptOriginalName = conceptName;
    editingConceptName = conceptName;
    const value = conceptsSnapshot[conceptName]?.value;
    newConceptValue = typeof value === 'boolean' ? value : false;
  }
  
  function deleteConcept(conceptName: string) {
    if (confirm(`Are you sure you want to delete the concept "${conceptName}"?`)) {
      concepts.update((state: Record<string, Concept>) => {
        const newState = { ...state };
        delete newState[conceptName];
        return newState;
      });
    }
  }
  
  function handleToggleConcept(event: CustomEvent) {
    const { conceptName } = event.detail;
    
    // Toggle the concept's value
    const currentValue = conceptsSnapshot[conceptName]?.value ?? false;
    setConceptValue(conceptName, !currentValue);
    
    // Make sure the concept is active
    if (!conceptsSnapshot[conceptName]?.isActive) {
      toggleConceptActive(conceptName);
    }
  }
  
  function handleImportConcepts(event: CustomEvent) {
    const { importedData } = event.detail;
    
    // Import concepts
    concepts.update((state: Record<string, Concept>) => {
      const newState = { ...state };
      
      Object.entries(importedData).forEach(([key, value]) => {
        // Validate each concept
        if (typeof value === 'object' && value !== null && 
            'value' in value && 'isActive' in value) {
          newState[key] = {
            value: Boolean((value as any).value),
            isActive: Boolean((value as any).isActive)
          };
        }
      });
      
      return newState;
    });
    
    alert('Concepts imported successfully');
  }
  
  function handleExtractConcepts() {
    if (conceptReferences.length > 0) {
      ConceptExtractionService.initializeConceptsFromReferences(conceptReferences);
      alert(`Extracted ${conceptReferences.length} concept references from the configuration.`);
    } else {
      alert('No concepts found in the configuration.');
    }
  }
  
  function handleToggleConceptReport(event: CustomEvent) {
    showConceptReport = event.detail.showConceptReport;
  }
  
  function handleToggleEvaluationDetails(event: CustomEvent) {
    showEvaluationDetails = event.detail.showEvaluationDetails;
    if (showEvaluationDetails) {
      updateConceptEvaluationDetails();
    }
  }
  
  function handleToggleSectionControl(event: CustomEvent) {
    showSectionControl = event.detail.showSectionControl;
    
    // Initialize section visibility control if not already done
    if (showSectionControl && Object.keys(sectionVisibilityControl).length === 0) {
      // Extract unique section names from concept references
      const sectionNames = [...new Set(conceptReferences.map(ref => ref.section))];
      
      // Initialize all sections as visible
      sectionNames.forEach(section => {
        sectionVisibilityControl[section] = true;
      });
    }
  }
  
  function handleToggleSectionVisibility(event: CustomEvent) {
    const { section } = event.detail;
    sectionVisibilityControl[section] = !sectionVisibilityControl[section];
    
    // Apply section visibility to the application
    ConceptTestService.updateSectionVisibility(sectionVisibilityControl);
  }
  
  function handleToggleTestIntegration(event: CustomEvent) {
    showTestIntegration = event.detail.showTestIntegration;
    
    // Load test scenarios if showing test integration
    if (showTestIntegration) {
      ConceptTestService.loadTestScenarios();
    }
  }
  
  function handleConceptsChanged(event: CustomEvent) {
    const { selectedConcepts: newSelectedConcepts, conceptChangeValues: newValues, conceptChangeActive: newActive } = event.detail;
    
    if (newSelectedConcepts) {
      selectedConcepts = newSelectedConcepts;
    }
    
    if (newValues) {
      conceptChangeValues = newValues;
    }
    
    if (newActive) {
      conceptChangeActive = newActive;
    }
    
    // Update the concept store based on selections
    concepts.update((state: Record<string, Concept>) => {
      const newState = { ...state };
      
      // First, set all concepts to inactive
      Object.keys(newState).forEach(name => {
        newState[name].isActive = false;
      });
      
      // Then activate and set values for selected concepts
      selectedConcepts.forEach(name => {
        if (newState[name]) {
          newState[name].value = conceptChangeValues[name] || false;
          newState[name].isActive = conceptChangeActive[name] || true;
        } else {
          // Create new concept if it doesn't exist
          newState[name] = {
            value: conceptChangeValues[name] || false,
            isActive: conceptChangeActive[name] || true
          };
        }
      });
      
      return newState;
    });
  }
  
  function handleAddToTestScenario(event: CustomEvent) {
    const { scenarioId, pathId, stepName, conceptChanges } = event.detail;
    
    // Add step to path using the ConceptTestService
    // Note: We need to add this method to the service if it doesn't exist
    ConceptTestService.addStepToPath(scenarioId, pathId, stepName, conceptChanges);
    
    alert('Concept state added to test scenario successfully!');
  }
  
  function handleApplyFromTestScenario(event: CustomEvent) {
    const { scenarioId, pathId, stepIndex } = event.detail;
    
    const scenario = $testScenarios.find(s => s.id === scenarioId);
    if (!scenario) return;
    
    // We need to cast scenario to include the paths property
    interface ExtendedScenario extends TestScenario {
      paths: TestPath[];
    }
    
    const extendedScenario = scenario as unknown as ExtendedScenario;
    const path = extendedScenario.paths.find(p => p.id === pathId);
    if (!path || !path.steps[stepIndex]) return;
    
    const step = path.steps[stepIndex];
    
    // Apply concept changes from the step
    concepts.update(state => {
      const newState = { ...state };
      
      // First reset all concepts to inactive
      Object.keys(newState).forEach(name => {
        newState[name].isActive = false;
      });
      
      // Then apply the changes from the step
      step.conceptChanges.forEach(change => {
        if (newState[change.conceptName]) {
          newState[change.conceptName].value = change.value;
          newState[change.conceptName].isActive = change.isActive;
        } else {
          // Create concept if it doesn't exist
          newState[change.conceptName] = {
            value: change.value,
            isActive: change.isActive
          };
        }
      });
      
      return newState;
    });
    
    alert(`Applied concept state from "${step.name}" in scenario "${scenario.name}"`);
  }
  
  function updateConceptEvaluationDetails() {
    // Extract concept dependencies and expressions from references
    conceptEvaluationDetails = {};
    
    conceptReferences.forEach(ref => {
      // Check if the reference has an expression property
      const expression = (ref as any).expression || '';
      if (expression) {
        // Extract dependencies from expression
        const dependencies = extractDependenciesFromExpression(expression);
        const value = conceptsSnapshot[ref.name]?.value;
        
        conceptEvaluationDetails[ref.name] = {
          value: typeof value === 'boolean' ? value : false,
          expression: expression,
          dependencies
        };
      }
    });
  }
  
  // Helper function to extract dependencies from an expression
  function extractDependenciesFromExpression(expression: string): string[] {
    // Simple regex to find concept names in the expression
    const conceptNameRegex = /\b([a-zA-Z][a-zA-Z0-9_]*)\b/g;
    const matches = expression.match(conceptNameRegex) || [];
    
    // Filter out JavaScript keywords and operators
    const jsKeywords = ['if', 'else', 'return', 'true', 'false', 'null', 'undefined', 'function', 'var', 'let', 'const'];
    return [...new Set(matches)].filter(name => !jsKeywords.includes(name));
  }
  
  function extractConfigExpressions() {
    const config = $configStore;
    if (!config) return;
    
    const expressions: { expression: string, path: string }[] = [];
    
    // Process each tab in the config
    if (config?.RCONFIG?.TABS) {
      config.RCONFIG.TABS.forEach((tab, tabIndex) => {
        const tabName = tab.TAB_NAME;
        
        // Check FLAG_ON_CONCEPT if it exists
        if ('FLAG_ON_CONCEPT' in tab) {
          expressions.push({
            expression: tab.FLAG_ON_CONCEPT as string,
            path: `Tab ${tabName} Flag`
          });
        }
        
        // Process criteria if it exists
        if ('CRITERIA' in tab) {
          const criteria = (tab as any).CRITERIA || [];
          criteria.forEach((criterion: any, criterionIndex: number) => {
            if (criterion.CONCEPT_NAME) {
              expressions.push({
                expression: criterion.CONCEPT_NAME,
                path: `Tab ${tabName} Criterion: ${criterion.LABEL}`
              });
            }
          });
        }
        
        // Process order sections if it exists
        if ('ORDER_SECTIONS' in tab) {
          const orderSections = (tab as any).ORDER_SECTIONS || [];
          orderSections.forEach((section: any, sectionIndex: number) => {
            if (section.CONCEPT_NAME) {
              expressions.push({
                expression: section.CONCEPT_NAME,
                path: `Tab ${tabName} Section: ${section.SECTION_NAME}`
              });
            }
          });
        }
        
        // Process CONCEPTS array if it exists
        if ('CONCEPTS' in tab) {
          const conceptItems = (tab as any).CONCEPTS || [];
          conceptItems.forEach((conceptItem: any, conceptIndex: number) => {
            if (conceptItem.Concept) {
              expressions.push({
                expression: conceptItem.Concept as string,
                path: `Tab ${tabName} Concept #${conceptIndex + 1}`
              });
            }
          });
        }
      });
    }
    
    // Remove duplicates
    const uniqueExpressions = expressions.filter((expr, index, self) =>
      index === self.findIndex(e => e.expression === expr.expression)
    );
    
    configExpressions = uniqueExpressions;
  }
  
  // Filter concepts based on search term
  $: filteredConcepts = Object.entries(conceptsSnapshot).filter(([name]) => 
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  onMount(() => {
    return () => {
      unsubConcepts();
      unsubConfig();
      unsubTestResults();
    };
  });
</script>

<div class="concept-manager">
  <div class="concept-modal-grid">
    <!-- Configuration Tools -->
    <ExtractToolsPanel
      bind:showConceptReport
      bind:showEvaluationDetails
      bind:showSectionControl
      bind:showTestIntegration
      on:extractConcepts={handleExtractConcepts}
      on:toggleConceptReport={handleToggleConceptReport}
      on:toggleEvaluationDetails={handleToggleEvaluationDetails}
      on:toggleSectionControl={handleToggleSectionControl}
      on:toggleTestIntegration={handleToggleTestIntegration}
    />
    
    <!-- Concept Reports and Evaluation Details -->
    <ConceptReportPanel
      {conceptReport}
      {showConceptReport}
      {showEvaluationDetails}
      {conceptEvaluationDetails}
      {conceptsSnapshot}
      {showSectionControl}
      {sectionVisibilityControl}
      on:toggleSectionVisibility={handleToggleSectionVisibility}
    />
    
    <!-- Main Content Area -->
    <div class="concept-main-content">
      <!-- Hierarchical Concept Selector -->
      <div class="concept-section">
        <h3>Concepts</h3>
        
        <div class="concept-hierarchy">
          <ConceptHierarchySelector 
            bind:selectedConcepts
            bind:conceptChangeValues
            bind:conceptChangeActive
            on:conceptsChanged={handleConceptsChanged}
          />
        </div>
      </div>
      
      <!-- Concept List -->
      <div class="concept-list-section">
        <h3>Concept List</h3>
        
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search concepts..." 
            bind:value={searchTerm}
          />
        </div>
        
        <div class="concept-list">
          {#each filteredConcepts as [name, concept]}
            <div class="concept-item">
              <div class="concept-info">
                <span class="concept-name">{name}</span>
                <span class="concept-value {concept.value ? 'true' : 'false'}">
                  {concept.value ? 'True' : 'False'}
                </span>
                <span class="concept-status {concept.isActive ? 'active' : 'inactive'}">
                  {concept.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div class="concept-actions">
                <button class="action-btn edit-btn" on:click={() => startEditConcept(name)}>
                  Edit
                </button>
                <button class="action-btn delete-btn" on:click={() => deleteConcept(name)}>
                  Delete
                </button>
                <button 
                  class="action-btn toggle-btn" 
                  on:click={() => toggleConceptActive(name)}
                >
                  {concept.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
    
    <!-- Sidebar -->
    <div class="concept-sidebar">
      <!-- Create/Edit Concept Form -->
      <ConceptFormPanel
        {conceptsSnapshot}
        {editMode}
        bind:newConceptName
        bind:newConceptValue
        bind:editingConceptName
        bind:editingConceptOriginalName
        bind:validationError
        on:createConcept={handleCreateConcept}
        on:saveConcept={handleSaveConcept}
        on:cancelEdit={handleCancelEdit}
      />
      
      <!-- Expression Evaluator -->
      <ConceptExpressionPanel
        {conceptsSnapshot}
        {configExpressions}
        on:toggleConcept={handleToggleConcept}
      />
      
      <!-- Import/Export Section -->
      <ImportExportPanel
        {conceptsSnapshot}
        on:importConcepts={handleImportConcepts}
      />
    </div>
    
    <!-- Test Integration Section -->
    {#if showTestIntegration}
      <div class="test-integration-container">
        <TestIntegrationPanel
          testScenarios={$testScenarios}
          {selectedConcepts}
          {conceptChangeValues}
          {conceptChangeActive}
          on:addToTestScenario={handleAddToTestScenario}
          on:applyFromTestScenario={handleApplyFromTestScenario}
        />
      </div>
    {/if}
  </div>
</div>

<style>
  .concept-manager {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .concept-modal-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: auto auto 1fr;
    gap: 20px;
  }
  
  .concept-main-content {
    grid-column: 1 / 2;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    gap: 20px;
  }
  
  .concept-sidebar {
    grid-column: 2 / 3;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .test-integration-container {
    grid-column: 1 / -1;
  }
  
  .concept-section {
    border: 1px solid #eee;
    border-radius: 5px;
    padding: 15px;
    background-color: #f9f9f9;
  }
  
  .concept-section h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 15px;
  }
  
  .concept-hierarchy {
    height: 300px;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .concept-list-section {
    border: 1px solid #eee;
    border-radius: 5px;
    padding: 15px;
    background-color: #f9f9f9;
  }
  
  .concept-list-section h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 15px;
  }
  
  .search-box {
    margin-bottom: 15px;
  }
  
  .search-box input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .concept-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
  }
  
  .concept-item {
    padding: 10px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .concept-item:last-child {
    border-bottom: none;
  }
  
  .concept-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .concept-name {
    font-weight: bold;
    color: #333;
  }
  
  .concept-value {
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.8rem;
    font-weight: bold;
  }
  
  .concept-value.true {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .concept-value.false {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .concept-status {
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.8rem;
  }
  
  .concept-status.active {
    background-color: #e3f2fd;
    color: #1565c0;
  }
  
  .concept-status.inactive {
    background-color: #f5f5f5;
    color: #757575;
  }
  
  .concept-actions {
    display: flex;
    gap: 5px;
  }
  
  .action-btn {
    padding: 4px 8px;
    border-radius: 3px;
    border: none;
    font-size: 0.8rem;
    cursor: pointer;
    color: white;
  }
  
  .edit-btn {
    background-color: #2196f3;
  }
  
  .delete-btn {
    background-color: #f44336;
  }
  
  .toggle-btn {
    background-color: #9e9e9e;
  }
  
  @media (max-width: 768px) {
    .concept-modal-grid {
      grid-template-columns: 1fr;
    }
    
    .concept-main-content {
      grid-column: 1 / -1;
    }
    
    .concept-sidebar {
      grid-column: 1 / -1;
    }
  }
</style> 