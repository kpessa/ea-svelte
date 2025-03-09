<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { TestScenario, TestSubScenario, ConceptChange, ExpectedResult } from '../types';
  import { concepts } from '../stores';
  import ConceptStatusIndicator from './ConceptStatusIndicator.svelte';
  import GlobalConceptStatus from './GlobalConceptStatus.svelte';
  import ScenarioItem from './ScenarioItem.svelte';
  
  export let scenario: TestScenario;
  export let selectedScenarioId: string | null = null;
  export let onScenarioSelect: (scenarioId: string) => void;
  export let isEditable: boolean = false;
  
  const dispatch = createEventDispatcher();
  
  // Function to get all active concepts for a scenario (including inherited from parents)
  function getActiveConcepts(subScenario: TestSubScenario, allScenarios: TestSubScenario[]): ConceptChange[] {
    let activeConcepts: ConceptChange[] = [...subScenario.concepts];
    
    // If this scenario has a parent, get concepts from parent
    if (subScenario.parentId) {
      const parent = findScenarioById(subScenario.parentId, allScenarios);
      if (parent) {
        // Get parent concepts (recursively)
        const parentConcepts = getActiveConcepts(parent, allScenarios);
        
        // Merge parent concepts with this scenario's concepts
        // If a concept exists in both, the child's value takes precedence
        parentConcepts.forEach(parentConcept => {
          if (!activeConcepts.some(c => c.conceptName === parentConcept.conceptName)) {
            activeConcepts.push({
              ...parentConcept,
              inherited: true // Mark as inherited
            });
          }
        });
      }
    }
    
    return activeConcepts;
  }
  
  // Helper function to find a scenario by ID in a flat or nested structure
  function findScenarioById(id: string, scenarios: TestSubScenario[]): TestSubScenario | null {
    for (const scenario of scenarios) {
      if (scenario.id === id) {
        return scenario;
      }
      
      if (scenario.children && scenario.children.length > 0) {
        const found = findScenarioById(id, scenario.children);
        if (found) {
          return found;
        }
      }
    }
    
    return null;
  }
  
  // Group concepts by category for better organization
  function groupConceptsByCategory(conceptChanges: ConceptChange[]): Record<string, ConceptChange[]> {
    const grouped: Record<string, ConceptChange[]> = {};
    
    conceptChanges.forEach(concept => {
      // Extract category from concept name (e.g., "MAGNESIUM.LEVEL" -> "MAGNESIUM")
      const category = concept.conceptName.split('.')[0] || 'Other';
      
      if (!grouped[category]) {
        grouped[category] = [];
      }
      
      grouped[category].push(concept);
    });
    
    return grouped;
  }
  
  // Handle scenario selection
  function handleScenarioSelect(subScenario: TestSubScenario) {
    onScenarioSelect(subScenario.id);
  }
  
  // Add a new sub-scenario
  function handleAddSubScenario(parentId: string | null) {
    dispatch('addSubScenario', { parentId });
  }
  
  // Add a new expected result
  function handleAddExpectedResult(scenarioId: string) {
    dispatch('addExpectedResult', { scenarioId });
  }
  
  // Add/edit concepts for a scenario
  function handleEditConcepts(scenarioId: string) {
    dispatch('editConcepts', { scenarioId });
  }

  // Delete a sub-scenario
  function handleDeleteScenario(scenarioId: string) {
    dispatch('deleteSubScenario', { scenarioId });
  }
</script>

<div class="hierarchical-scenario-manager">
  <GlobalConceptStatus />

  <div class="scenario-tree">
    {#if scenario.scenarios.length === 0}
      <div class="empty-state">
        <p>No scenarios defined yet.</p>
        {#if isEditable}
          <button class="add-scenario-btn" on:click={() => handleAddSubScenario(null)}>
            <span class="btn-icon">+</span> Add Root Scenario
          </button>
        {/if}
      </div>
    {:else}
      {#each scenario.scenarios as subScenario}
        <ScenarioItem
          scenario={subScenario}
          allScenarios={scenario.scenarios}
          {selectedScenarioId}
          {onScenarioSelect}
          {isEditable}
          onAddSubScenario={handleAddSubScenario}
          onAddExpectedResult={handleAddExpectedResult}
          onEditConcepts={handleEditConcepts}
          onDeleteScenario={handleDeleteScenario}
        />
      {/each}
      
      {#if isEditable}
        <div class="add-root-scenario">
          <button class="add-scenario-btn" on:click={() => handleAddSubScenario(null)}>
            <span class="btn-icon">+</span> Add Root Scenario
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .hierarchical-scenario-manager {
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 1.5rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }
  
  .scenario-tree {
    width: 100%;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background-color: white;
    border: 1px dashed #ccc;
    border-radius: 4px;
  }
  
  .add-root-scenario {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
  }
  
  .add-scenario-btn {
    padding: 0.5rem 1rem;
    background-color: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .add-scenario-btn:hover {
    background-color: #1976d2;
  }
  
  .btn-icon {
    font-size: 0.9rem;
  }
</style> 