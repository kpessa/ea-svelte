<script lang="ts">
  import { onMount } from 'svelte';
  import { concepts } from '../stores';
  import { evaluateConceptExpression, evaluateConceptExpressionWithSteps, setConceptValue, toggleConceptActive, type EvaluationStep } from '../stores';
  import { configStore } from '../services/configService';
  import { ConceptExtractionService } from '../services/conceptExtractionService';
  import { ConceptTestService, testScenarios, testResults } from '../services/conceptTestService';
  import ConceptHierarchySelector from './ConceptHierarchySelector.svelte';
  import type { Concept, ConceptReference, TestScenario, TestResult } from '../types';
  
  let showModal = false;
  let conceptsSnapshot: Record<string, Concept> = {};
  let searchTerm = '';
  let newConceptName = '';
  let newConceptValue = false;
  let expressionToEvaluate = '';
  let evaluationResult: boolean | null = null;
  let evaluationSteps: EvaluationStep[] = [];
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
  let selectedScenarioId: string | null = null;
  let selectedPathId: string | null = null;
  let newStepName = '';
  let selectedTab: 'add' | 'apply' = 'add';
  
  // For concept evaluation visualization
  let showEvaluationDetails = false;
  let conceptEvaluationDetails: Record<string, { value: boolean, expression: string, dependencies: string[] }> = {};
  
  // For section rendering control
  let sectionVisibilityControl: Record<string, boolean> = {};
  let showSectionControl = false;
  
  let configExpressions: { expression: string, path: string }[] = [];
  let highlightedExpression = '';
  let conceptsInExpression: string[] = [];
  
  $: selectedScenario = selectedScenarioId 
    ? $testScenarios.find(s => s.id === selectedScenarioId) 
    : null;
    
  $: selectedPath = selectedScenario && selectedPathId 
    ? selectedScenario.paths.find(p => p.id === selectedPathId) 
    : null;
  
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
        conceptChangeValues[name] = concept.value;
        conceptChangeActive[name] = concept.isActive;
      }
    });
  }
  
  function toggleModal() {
    showModal = !showModal;
    if (showModal) {
      // Reset state when opening modal
      searchTerm = '';
      newConceptName = '';
      newConceptValue = false;
      expressionToEvaluate = '';
      evaluationResult = null;
      evaluationSteps = [];
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
  
  // Close modal when clicking outside of it
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('concept-modal')) {
      showModal = false;
    }
  }
  
  // Close modal when pressing Escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && showModal) {
      showModal = false;
    }
  }
  
  function createNewConcept() {
    if (!newConceptName.trim()) {
      validationError = 'Concept name cannot be empty';
      return;
    }
    
    // Check for duplicate names
    if (conceptsSnapshot[newConceptName.trim()]) {
      validationError = 'A concept with this name already exists';
      return;
    }
    
    validationError = '';
    
    // Add new concept to the store
    concepts.update((state: Record<string, Concept>) => ({
      ...state,
      [newConceptName.trim()]: {
        value: newConceptValue,
        isActive: true
      }
    }));
    
    // Reset form
    newConceptName = '';
    newConceptValue = false;
  }
  
  function startEditConcept(conceptName: string) {
    editMode = true;
    editingConceptOriginalName = conceptName;
    editingConceptName = conceptName;
    newConceptValue = conceptsSnapshot[conceptName]?.value || false;
  }
  
  function saveEditedConcept() {
    if (!editingConceptName.trim()) {
      validationError = 'Concept name cannot be empty';
      return;
    }
    
    // Check for duplicate names (excluding the current concept)
    if (editingConceptName !== editingConceptOriginalName && 
        conceptsSnapshot[editingConceptName.trim()]) {
      validationError = 'A concept with this name already exists';
      return;
    }
    
    validationError = '';
    
    // If name changed, we need to remove the old one and add a new one
    if (editingConceptName !== editingConceptOriginalName) {
      concepts.update((state: Record<string, Concept>) => {
        const newState = { ...state };
        const conceptValue = newState[editingConceptOriginalName]?.value || false;
        const conceptActive = newState[editingConceptOriginalName]?.isActive || true;
        
        // Remove old concept
        delete newState[editingConceptOriginalName];
        
        // Add with new name
        newState[editingConceptName.trim()] = {
          value: newConceptValue,
          isActive: conceptActive
        };
        
        return newState;
      });
    } else {
      // Just update the value
      setConceptValue(editingConceptName, newConceptValue);
    }
    
    // Reset edit mode
    editMode = false;
    editingConceptName = '';
    editingConceptOriginalName = '';
    newConceptValue = false;
  }
  
  function cancelEdit() {
    editMode = false;
    editingConceptName = '';
    editingConceptOriginalName = '';
    newConceptValue = false;
    validationError = '';
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
  
  function toggleConceptActiveState(conceptName: string) {
    toggleConceptActive(conceptName);
  }
  
  function evaluateExpression() {
    if (!expressionToEvaluate.trim()) {
      validationError = 'Expression cannot be empty';
      return;
    }
    
    validationError = '';
    
    try {
      // Extract concepts from the expression for highlighting
      extractConceptsFromExpression(expressionToEvaluate);
      
      // Use the evaluateConceptExpressionWithSteps function from stores
      const { result, steps } = evaluateConceptExpressionWithSteps(expressionToEvaluate.trim());
      evaluationResult = result;
      evaluationSteps = steps;
    } catch (error) {
      validationError = `Error evaluating expression: ${error instanceof Error ? error.message : 'Unknown error'}`;
      evaluationResult = null;
      evaluationSteps = [];
    }
  }
  
  function extractConceptsFromExpression(expression: string) {
    // Extract concepts between curly braces
    const conceptRegex = /\{([^{}]+)\}/g;
    let match;
    conceptsInExpression = [];
    
    while ((match = conceptRegex.exec(expression)) !== null) {
      const conceptName = match[1].trim();
      if (!conceptsInExpression.includes(conceptName)) {
        conceptsInExpression.push(conceptName);
      }
    }
    
    // Generate highlighted expression
    updateHighlightedExpression();
  }
  
  function updateHighlightedExpression() {
    let highlighted = expressionToEvaluate;
    
    // Replace concepts with highlighted versions
    for (const concept of conceptsInExpression) {
      const isActive = conceptsSnapshot[concept]?.isActive ?? false;
      const value = conceptsSnapshot[concept]?.value ?? false;
      const cssClass = isActive ? (value ? 'concept-true' : 'concept-false') : 'concept-inactive';
      
      highlighted = highlighted.replace(
        new RegExp(`\\{${concept}\\}`, 'g'),
        `<span class="concept-highlight ${cssClass}" data-concept="${concept}">{${concept}}</span>`
      );
    }
    
    // Replace operators with highlighted versions
    highlighted = highlighted
      .replace(/\bAND\b/g, '<span class="operator-highlight">AND</span>')
      .replace(/\bOR\b/g, '<span class="operator-highlight">OR</span>')
      .replace(/\bNOT\b/g, '<span class="operator-highlight">NOT</span>');
    
    // Replace delimiters with highlighted versions
    highlighted = highlighted
      .replace(/\[%/g, '<span class="delimiter-highlight">[%</span>')
      .replace(/%\]/g, '<span class="delimiter-highlight">%]</span>');
    
    highlightedExpression = highlighted;
  }
  
  function toggleConcept(conceptName: string) {
    // Toggle the concept's value
    const currentValue = conceptsSnapshot[conceptName]?.value ?? false;
    setConceptValue(conceptName, !currentValue);
    
    // Make sure the concept is active
    if (!conceptsSnapshot[conceptName]?.isActive) {
      toggleConceptActive(conceptName);
    }
    
    // Update the highlighted expression
    updateHighlightedExpression();
    
    // Re-evaluate the expression
    evaluateExpression();
  }
  
  function exportConcepts() {
    const dataStr = JSON.stringify(conceptsSnapshot, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'concepts.json';
    
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
        if (typeof importedData !== 'object' || importedData === null || Array.isArray(importedData)) {
          alert('Invalid import file format. Expected an object.');
          return;
        }
        
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
      } catch (error) {
        alert('Error importing concepts: ' + error);
      }
    };
    reader.readAsText(file);
  }
  
  function extractConceptsFromConfig() {
    if (conceptReferences.length > 0) {
      ConceptExtractionService.initializeConceptsFromReferences(conceptReferences);
      alert(`Extracted ${conceptReferences.length} concept references from the configuration.`);
    } else {
      alert('No concepts found in the configuration.');
    }
  }
  
  function toggleConceptReport() {
    showConceptReport = !showConceptReport;
  }
  
  function toggleTestIntegration() {
    showTestIntegration = !showTestIntegration;
    
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
  
  function addToTestScenario() {
    if (!selectedScenarioId || !selectedPathId || !newStepName.trim() || selectedConcepts.length === 0) {
      alert('Please select a scenario, path, enter a step name, and select at least one concept.');
      return;
    }
    
    const conceptChanges = selectedConcepts.map(conceptName => ({
      conceptName,
      value: conceptChangeValues[conceptName] || false,
      isActive: conceptChangeActive[conceptName] || true
    }));
    
    ConceptTestService.addStepToPath(selectedScenarioId, selectedPathId, newStepName, conceptChanges);
    
    alert('Concept state added to test scenario successfully!');
    newStepName = '';
  }
  
  function updateConceptEvaluationDetails() {
    // Extract concept dependencies and expressions from references
    conceptEvaluationDetails = {};
    
    conceptReferences.forEach(ref => {
      // Check if the reference has an expression property
      const expression = (ref as any).expression || '';
      if (expression) {
        // Extract dependencies from expression - use a simple regex approach if the service method doesn't exist
        const dependencies = extractDependenciesFromExpression(expression);
        
        conceptEvaluationDetails[ref.name] = {
          value: conceptsSnapshot[ref.name]?.value || false,
          expression: expression,
          dependencies
        };
      }
    });
  }
  
  // Helper function to extract dependencies from an expression
  function extractDependenciesFromExpression(expression: string): string[] {
    // Simple regex to find concept names in the expression
    // This is a basic implementation - might need to be enhanced based on actual expression format
    const conceptNameRegex = /\b([a-zA-Z][a-zA-Z0-9_]*)\b/g;
    const matches = expression.match(conceptNameRegex) || [];
    
    // Filter out JavaScript keywords and operators
    const jsKeywords = ['if', 'else', 'return', 'true', 'false', 'null', 'undefined', 'function', 'var', 'let', 'const'];
    return [...new Set(matches)].filter(name => !jsKeywords.includes(name));
  }
  
  function toggleEvaluationDetails() {
    showEvaluationDetails = !showEvaluationDetails;
    if (showEvaluationDetails) {
      updateConceptEvaluationDetails();
    }
  }
  
  function toggleSectionControl() {
    showSectionControl = !showSectionControl;
    
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
  
  function toggleSectionVisibility(section: string) {
    sectionVisibilityControl[section] = !sectionVisibilityControl[section];
    
    // Apply section visibility to the application
    ConceptTestService.updateSectionVisibility(sectionVisibilityControl);
  }
  
  function applyConceptsFromScenarioStep(scenarioId: string, pathId: string, stepIndex: number) {
    if (!scenarioId || !pathId) return;
    
    const scenario = $testScenarios.find(s => s.id === scenarioId);
    if (!scenario) return;
    
    const path = scenario.paths.find(p => p.id === pathId);
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
  
  // Filter concepts based on search term
  $: filteredConcepts = Object.entries(conceptsSnapshot).filter(([name]) => 
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
        
        // Process criteria
        if (tab.CRITERIA) {
          tab.CRITERIA.forEach((criterion, criterionIndex) => {
            if (criterion.CONCEPT_NAME) {
              expressions.push({
                expression: criterion.CONCEPT_NAME,
                path: `Tab ${tabName} Criterion: ${criterion.LABEL}`
              });
            }
          });
        }
        
        // Process order sections
        if (tab.ORDER_SECTIONS) {
          tab.ORDER_SECTIONS.forEach((section, sectionIndex) => {
            if (section.CONCEPT_NAME) {
              expressions.push({
                expression: section.CONCEPT_NAME,
                path: `Tab ${tabName} Section: ${section.SECTION_NAME}`
              });
            }
          });
        }
        
        // Process CONCEPTS array if it exists
        if (tab.CONCEPTS) {
          tab.CONCEPTS.forEach((conceptItem, conceptIndex) => {
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
  
  function selectConfigExpression(expression: string) {
    expressionToEvaluate = expression;
    evaluateExpression();
  }
  
  onMount(() => {
    // Subscribe to concepts store
    const unsubConcepts = concepts.subscribe(value => {
      conceptsSnapshot = { ...value };
    });
    
    // Subscribe to config store
    const unsubConfig = configStore.subscribe(config => {
      if (config) {
        // Extract concept expressions from config
        extractConfigExpressions();
      }
    });
    
    // Subscribe to test results
    const unsubTestResults = testResults.subscribe(() => {
      // Update test results when they change
    });
    
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      unsubConcepts();
      unsubConfig();
      unsubTestResults();
    };
  });
</script>

<div class="concept-icon-container">
  <button 
    class="concept-icon {showModal ? 'active' : ''}" 
    on:click={toggleModal}
    aria-label="Concept Manager"
  >
    🧠
  </button>
</div>

{#if showModal}
  <div 
    class="concept-modal" 
    style="display: block;" 
    on:click={handleClickOutside}
    on:keydown={handleKeydown}
    role="dialog"
    aria-labelledby="concept-modal-title"
  >
    <div class="concept-modal-content">
      <div class="concept-modal-header">
        <h2 class="concept-modal-title" id="concept-modal-title">Concept Manager</h2>
        <button 
          class="concept-modal-close" 
          on:click={toggleModal}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div class="concept-modal-body">
        <!-- Config Extraction Tools -->
        <div class="extraction-tools">
          <h3>Configuration Tools</h3>
          <div class="extraction-actions">
            <button 
              class="extraction-btn" 
              on:click={extractConceptsFromConfig}
            >
              Extract Concepts from Config
            </button>
            <button 
              class="extraction-btn" 
              on:click={toggleConceptReport}
            >
              {showConceptReport ? 'Hide' : 'Show'} Concept Usage Report
            </button>
            <button 
              class="extraction-btn" 
              on:click={toggleEvaluationDetails}
            >
              {showEvaluationDetails ? 'Hide' : 'Show'} Evaluation Details
            </button>
            <button 
              class="extraction-btn" 
              on:click={toggleSectionControl}
            >
              {showSectionControl ? 'Hide' : 'Show'} Section Control
            </button>
            <button 
              class="extraction-btn test-integration-btn" 
              on:click={toggleTestIntegration}
            >
              {showTestIntegration ? 'Hide' : 'Show'} Test Integration
            </button>
          </div>
          
          {#if showConceptReport && conceptReport}
            <div class="concept-report">
              <pre>{conceptReport}</pre>
            </div>
          {/if}
          
          {#if showEvaluationDetails && Object.keys(conceptEvaluationDetails).length > 0}
            <div class="evaluation-details">
              <h4>Concept Evaluation Details</h4>
              <div class="evaluation-grid">
                {#each Object.entries(conceptEvaluationDetails) as [conceptName, details]}
                  <div class="evaluation-card">
                    <div class="evaluation-header">
                      <span class="concept-name">{conceptName}</span>
                      <span class="concept-value {details.value ? 'true' : 'false'}">
                        {details.value ? 'True' : 'False'}
                      </span>
                    </div>
                    <div class="evaluation-body">
                      <div class="expression">
                        <span class="label">Expression:</span>
                        <code>{details.expression}</code>
                      </div>
                      <div class="dependencies">
                        <span class="label">Dependencies:</span>
                        <div class="dependency-list">
                          {#each details.dependencies as dependency}
                            <span class="dependency-tag {conceptsSnapshot[dependency]?.value ? 'true' : 'false'}">
                              {dependency}: {conceptsSnapshot[dependency]?.value ? 'True' : 'False'}
                            </span>
                          {/each}
                        </div>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          
          {#if showSectionControl && Object.keys(sectionVisibilityControl).length > 0}
            <div class="section-control">
              <h4>Section Visibility Control</h4>
              <div class="section-control-grid">
                {#each Object.entries(sectionVisibilityControl) as [section, isVisible]}
                  <div class="section-control-item">
                    <label class="section-control-label">
                      <input 
                        type="checkbox" 
                        checked={isVisible} 
                        on:change={() => toggleSectionVisibility(section)}
                      />
                      <span class="section-name">{section}</span>
                    </label>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
        
        <!-- Hierarchical Concept Selector -->
        <div class="concept-section">
          <h3>Concepts</h3>
          
          <div class="concept-hierarchy">
            <ConceptHierarchySelector 
              bind:selectedConcepts={selectedConcepts}
              bind:conceptChangeValues={conceptChangeValues}
              bind:conceptChangeActive={conceptChangeActive}
              on:conceptsChanged={handleConceptsChanged}
            />
          </div>
        </div>
        
        <!-- Test Integration Section -->
        {#if showTestIntegration}
          <div class="test-integration">
            <h3>Test Framework Integration</h3>
            
            <div class="integration-tabs">
              <button 
                class="tab-button {selectedTab === 'add' ? 'active' : ''}" 
                on:click={() => selectedTab = 'add'}
              >
                Add to Test
              </button>
              <button 
                class="tab-button {selectedTab === 'apply' ? 'active' : ''}" 
                on:click={() => selectedTab = 'apply'}
              >
                Apply from Test
              </button>
            </div>
            
            {#if selectedTab === 'add'}
              <p class="integration-info">
                Add the current concept state to a test scenario step.
              </p>
              
              <div class="form-group">
                <label for="scenario-select">Select Scenario:</label>
                <select 
                  id="scenario-select" 
                  bind:value={selectedScenarioId}
                >
                  <option value="">-- Select a Scenario --</option>
                  {#each $testScenarios as scenario}
                    <option value={scenario.id}>{scenario.name}</option>
                  {/each}
                </select>
              </div>
              
              {#if selectedScenario}
                <div class="form-group">
                  <label for="path-select">Select Path:</label>
                  <select 
                    id="path-select" 
                    bind:value={selectedPathId}
                  >
                    <option value="">-- Select a Path --</option>
                    {#each selectedScenario.paths as path}
                      <option value={path.id}>{path.name}</option>
                    {/each}
                  </select>
                </div>
              {/if}
              
              {#if selectedPath}
                <div class="form-group">
                  <label for="step-name">Step Name:</label>
                  <input 
                    type="text" 
                    id="step-name" 
                    bind:value={newStepName}
                    placeholder="Enter step name"
                  />
                </div>
                
                <button 
                  class="form-btn add-to-test-btn" 
                  on:click={addToTestScenario}
                  disabled={!newStepName.trim() || selectedConcepts.length === 0}
                >
                  Add to Test Scenario
                </button>
              {/if}
            {:else if selectedTab === 'apply'}
              <p class="integration-info">
                Apply concept states from an existing test scenario step.
              </p>
              
              <div class="form-group">
                <label for="apply-scenario-select">Select Scenario:</label>
                <select 
                  id="apply-scenario-select" 
                  bind:value={selectedScenarioId}
                >
                  <option value="">-- Select a Scenario --</option>
                  {#each $testScenarios as scenario}
                    <option value={scenario.id}>{scenario.name}</option>
                  {/each}
                </select>
              </div>
              
              {#if selectedScenario}
                <div class="form-group">
                  <label for="apply-path-select">Select Path:</label>
                  <select 
                    id="apply-path-select" 
                    bind:value={selectedPathId}
                  >
                    <option value="">-- Select a Path --</option>
                    {#each selectedScenario.paths as path}
                      <option value={path.id}>{path.name}</option>
                    {/each}
                  </select>
                </div>
              {/if}
              
              {#if selectedPath}
                <div class="form-group">
                  <label for="step-select">Select Step:</label>
                  <div class="step-list">
                    {#each selectedPath.steps as step, index}
                      <div class="step-item">
                        <button 
                          class="step-button" 
                          on:click={() => {
                            if (selectedScenarioId && selectedPathId) {
                              applyConceptsFromScenarioStep(selectedScenarioId, selectedPathId, index);
                            }
                          }}
                        >
                          {step.name}
                        </button>
                        <div class="step-concepts">
                          {step.conceptChanges.length} concept changes
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
            {/if}
          </div>
        {/if}
        
        <!-- Create/Edit Concept Form -->
        <div class="concept-form">
          <h3>{editMode ? 'Edit Concept' : 'Create New Concept'}</h3>
          
          <div class="form-group">
            <label for="concept-name">Concept Name:</label>
            {#if editMode}
              <input 
                type="text" 
                id="concept-name" 
                bind:value={editingConceptName}
                placeholder="Enter concept name"
              />
            {:else}
              <input 
                type="text" 
                id="concept-name" 
                bind:value={newConceptName}
                placeholder="Enter concept name"
              />
            {/if}
          </div>
          
          <div class="form-group">
            <label for="concept-value">Concept Value:</label>
            <div class="toggle-switch">
              <input 
                type="checkbox" 
                id="concept-value" 
                bind:checked={newConceptValue}
              />
              <label for="concept-value" class="toggle-label">
                {newConceptValue ? 'True' : 'False'}
              </label>
            </div>
          </div>
          
          {#if validationError}
            <div class="validation-error">{validationError}</div>
          {/if}
          
          <div class="form-actions">
            {#if editMode}
              <button class="form-btn save-btn" on:click={saveEditedConcept}>
                Save Changes
              </button>
              <button class="form-btn cancel-btn" on:click={cancelEdit}>
                Cancel
              </button>
            {:else}
              <button class="form-btn create-btn" on:click={createNewConcept}>
                Create Concept
              </button>
            {/if}
          </div>
        </div>
        
        <!-- Expression Evaluator -->
        <div class="expression-evaluator">
          <h3>Expression Evaluator</h3>
          
          <div class="form-group">
            <label for="expression">Enter Expression:</label>
            <input 
              type="text" 
              id="expression" 
              bind:value={expressionToEvaluate} 
              on:input={() => extractConceptsFromExpression(expressionToEvaluate)}
              placeholder="Enter concept expression to evaluate"
            />
          </div>
          
          {#if highlightedExpression}
            <div class="highlighted-expression" 
              on:click={(e) => {
                // Check if the clicked element is a concept
                const target = e.target as HTMLElement;
                if (target.classList.contains('concept-highlight')) {
                  const conceptName = target.getAttribute('data-concept');
                  if (conceptName) {
                    toggleConcept(conceptName);
                  }
                }
              }}
            >
              {@html highlightedExpression}
            </div>
          {/if}
          
          {#if conceptsInExpression.length > 0}
            <div class="concepts-in-expression">
              <h4>Concepts in Expression</h4>
              <div class="concept-toggles">
                {#each conceptsInExpression as concept}
                  <div class="concept-toggle">
                    <span class="concept-name">{concept}</span>
                    <label class="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={conceptsSnapshot[concept]?.value ?? false} 
                        on:change={() => toggleConcept(concept)}
                      />
                      <span class="toggle-slider"></span>
                    </label>
                    <span class="concept-value-label">
                      {conceptsSnapshot[concept]?.value ? 'True' : 'False'}
                    </span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          
          <button class="form-btn evaluate-btn" on:click={evaluateExpression}>
            Evaluate
          </button>
          
          {#if configExpressions.length > 0}
            <div class="config-expressions">
              <h4>Select from Configuration</h4>
              <div class="expressions-list">
                {#each configExpressions as expr}
                  <div class="expression-item" on:click={() => selectConfigExpression(expr.expression)}>
                    <div class="expression-text">{expr.expression}</div>
                    <div class="expression-path">{expr.path}</div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          
          {#if evaluationResult !== null}
            <div class="evaluation-result">
              <span class="result-label">Result:</span>
              <span class="result-value {evaluationResult ? 'true' : 'false'}">
                {evaluationResult ? 'True' : 'False'}
              </span>
            </div>
          {/if}
          
          {#if evaluationSteps.length > 0}
            <div class="evaluation-steps">
              <h4>Step-by-Step Evaluation</h4>
              <div class="steps-container">
                {#each evaluationSteps as step, index}
                  <div class="evaluation-step {step.isSubExpression ? 'sub-expression' : ''}">
                    <div class="step-number">{index + 1}</div>
                    <div class="step-content">
                      <div class="step-explanation">{step.explanation}</div>
                      <div class="step-expression">
                        {#if step.isSubExpression}
                          <span class="concept-name">{step.conceptName}</span>: 
                          <span class="concept-value {step.result ? 'true' : 'false'}">
                            {step.result ? 'True' : 'False'}
                          </span>
                        {:else}
                          <code>{step.expression}</code>
                          {#if step.result !== null}
                            <span class="result-indicator {step.result ? 'true' : 'false'}">
                              {step.result ? 'True' : 'False'}
                            </span>
                          {/if}
                        {/if}
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
        
        <!-- Import/Export Section -->
        <div class="import-export-section">
          <h3>Import/Export</h3>
          <div class="import-export-actions">
            <button class="import-export-btn" on:click={exportConcepts}>
              Export Concepts
            </button>
            <label class="import-btn">
              Import Concepts
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
  .concept-icon-container {
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 1000;
  }
  
  .concept-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #9c27b0;
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
  
  .concept-icon:hover, .concept-icon.active {
    background-color: #7b1fa2;
    transform: scale(1.05);
  }
  
  .concept-modal {
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
  
  .concept-modal-content {
    background-color: white;
    border-radius: 5px;
    width: 95%;
    max-width: 1400px;
    height: 95vh;
    overflow-y: auto;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  }
  
  .concept-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 10;
  }
  
  .concept-modal-title {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }
  
  .concept-modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }
  
  .concept-modal-close:hover {
    color: #333;
  }
  
  .concept-modal-body {
    padding: 20px;
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
  }
  
  .extraction-tools {
    grid-column: 1 / -1;
  }
  
  .concept-section {
    grid-column: 1 / 2;
    grid-row: span 3;
  }
  
  .test-integration {
    grid-column: 2 / 3;
  }
  
  .concept-form, .expression-evaluator, .import-export-section, .test-integration {
    border: 1px solid #eee;
    border-radius: 5px;
    padding: 15px;
    background-color: #f9f9f9;
  }
  
  .extraction-tools h3, .concept-section h3, .concept-form h3, 
  .expression-evaluator h3, .import-export-section h3, .test-integration h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 15px;
  }
  
  .extraction-actions {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }
  
  .extraction-btn {
    padding: 8px 15px;
    border-radius: 4px;
    border: 1px solid #673ab7;
    background-color: #673ab7;
    color: white;
    cursor: pointer;
    font-weight: bold;
  }
  
  .test-integration-btn {
    background-color: #2196f3;
    border-color: #2196f3;
  }
  
  .concept-report {
    margin-top: 10px;
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;
    font-family: monospace;
    font-size: 12px;
    white-space: pre-wrap;
  }
  
  .concept-hierarchy {
    height: 650px;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 20px;
  }
  
  .evaluation-details, .section-control {
    margin-top: 15px;
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 4px;
    max-height: 300px;
    overflow-y: auto;
  }
  
  .evaluation-details h4, .section-control h4 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #333;
  }
  
  .evaluation-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 10px;
  }
  
  .evaluation-card {
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
    background-color: white;
  }
  
  .evaluation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;
    background-color: #f0f0f0;
    border-bottom: 1px solid #ddd;
  }
  
  .evaluation-body {
    padding: 10px;
  }
  
  .concept-value {
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: bold;
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
  
  .expression, .dependencies {
    margin-bottom: 8px;
  }
  
  .label {
    font-weight: bold;
    margin-right: 5px;
    color: #555;
  }
  
  code {
    background-color: #f5f5f5;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9rem;
    word-break: break-all;
  }
  
  .dependency-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 5px;
  }
  
  .dependency-tag {
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.8rem;
    white-space: nowrap;
  }
  
  .dependency-tag.true {
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #a5d6a7;
  }
  
  .dependency-tag.false {
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ef9a9a;
  }
  
  .section-control-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }
  
  .section-control-item {
    padding: 5px;
  }
  
  .section-control-label {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  
  .section-control-label input {
    margin-right: 8px;
  }
  
  .integration-tabs {
    display: flex;
    margin-bottom: 15px;
    border-bottom: 1px solid #ddd;
  }
  
  .tab-button {
    padding: 8px 15px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-weight: bold;
    color: #666;
  }
  
  .tab-button.active {
    color: #2196f3;
    border-bottom-color: #2196f3;
  }
  
  .step-list {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .step-item {
    padding: 8px;
    border-bottom: 1px solid #eee;
  }
  
  .step-item:last-child {
    border-bottom: none;
  }
  
  .step-button {
    display: block;
    width: 100%;
    text-align: left;
    padding: 5px;
    background: none;
    border: none;
    cursor: pointer;
    font-weight: bold;
    color: #2196f3;
  }
  
  .step-button:hover {
    background-color: #f5f5f5;
  }
  
  .step-concepts {
    font-size: 0.8rem;
    color: #666;
    margin-top: 3px;
  }
  
  .validation-error {
    color: #f44336;
    font-size: 12px;
    margin-top: 5px;
    margin-bottom: 10px;
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
  
  .evaluate-btn {
    background-color: #673ab7;
    color: white;
  }
  
  .add-to-test-btn {
    background-color: #2196f3;
    color: white;
    width: 100%;
  }
  
  .add-to-test-btn:disabled {
    background-color: #b0bec5;
    cursor: not-allowed;
  }
  
  .evaluation-result {
    margin-top: 10px;
    padding: 10px;
    border-radius: 4px;
    background-color: #f5f5f5;
  }
  
  .result-label {
    font-weight: bold;
    margin-right: 10px;
  }
  
  .result-value {
    font-weight: bold;
    padding: 2px 5px;
    border-radius: 3px;
  }
  
  .result-value.true {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .result-value.false {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .evaluation-steps {
    margin-top: 10px;
    padding: 10px;
    border-radius: 4px;
    background-color: #f5f5f5;
  }
  
  .steps-container {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
  }
  
  .evaluation-step {
    padding: 12px;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: flex-start;
  }
  
  .evaluation-step:last-child {
    border-bottom: none;
  }
  
  .evaluation-step.sub-expression {
    margin-left: 20px;
    background-color: #f9f9f9;
    border-left: 3px solid #2196f3;
  }
  
  .step-number {
    font-weight: bold;
    margin-right: 10px;
    background-color: #2196f3;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .step-content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  
  .step-explanation {
    margin-bottom: 5px;
    color: #555;
    font-style: italic;
  }
  
  .step-expression {
    font-family: monospace;
    font-size: 1rem;
    padding: 5px;
    background-color: #f5f5f5;
    border-radius: 3px;
    display: flex;
    align-items: center;
  }
  
  .concept-name {
    font-weight: bold;
    color: #2196f3;
  }
  
  .concept-value {
    margin-left: 5px;
    padding: 2px 5px;
    border-radius: 3px;
    font-weight: bold;
  }
  
  .concept-value.true, .result-indicator.true {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .concept-value.false, .result-indicator.false {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .result-indicator {
    margin-left: 10px;
    padding: 2px 5px;
    border-radius: 3px;
    font-weight: bold;
  }
  
  .code {
    background-color: transparent;
    padding: 0;
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
  
  .config-expressions {
    margin-top: 15px;
    padding: 10px;
    border-radius: 4px;
    background-color: #f5f5f5;
  }
  
  .expressions-list {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
  }
  
  .expression-item {
    padding: 8px 12px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .expression-item:hover {
    background-color: #e3f2fd;
  }
  
  .expression-item:last-child {
    border-bottom: none;
  }
  
  .expression-text {
    font-family: monospace;
    font-weight: bold;
    margin-bottom: 3px;
  }
  
  .expression-path {
    font-size: 0.8rem;
    color: #666;
  }
  
  .highlighted-expression {
    margin-top: 10px;
    padding: 10px;
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: monospace;
    font-size: 1rem;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }
  
  .concept-highlight {
    padding: 2px 4px;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .concept-highlight:hover {
    opacity: 0.8;
  }
  
  .concept-true {
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #a5d6a7;
  }
  
  .concept-false {
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ef9a9a;
  }
  
  .concept-inactive {
    background-color: #f5f5f5;
    color: #9e9e9e;
    border: 1px solid #e0e0e0;
  }
  
  .operator-highlight {
    color: #7b1fa2;
    font-weight: bold;
  }
  
  .delimiter-highlight {
    color: #0288d1;
    font-weight: bold;
  }
  
  .concepts-in-expression {
    margin-top: 15px;
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 4px;
  }
  
  .concept-toggles {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
  }
  
  .concept-toggle {
    display: flex;
    align-items: center;
    padding: 5px 10px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
    margin: 0 10px;
  }
  
  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 20px;
  }
  
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
  
  input:checked + .toggle-slider {
    background-color: #4caf50;
  }
  
  input:checked + .toggle-slider:before {
    transform: translateX(20px);
  }
  
  .concept-value-label {
    font-size: 0.8rem;
    font-weight: bold;
  }
  
  @media (max-width: 768px) {
    .concept-modal-content {
      width: 95%;
      height: 95vh;
    }
    
    .concept-modal-body {
      grid-template-columns: 1fr;
    }
    
    .concept-section {
      grid-column: 1 / -1;
      grid-row: auto;
    }
    
    .test-integration {
      grid-column: 1 / -1;
    }
  }
</style> 