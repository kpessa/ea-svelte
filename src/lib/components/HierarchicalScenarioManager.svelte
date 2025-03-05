<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { TestScenario, TestSubScenario, ConceptChange, ExpectedResult } from '../types';
  import { concepts } from '../stores';
  import ConceptStatusIndicator from './ConceptStatusIndicator.svelte';
  
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
  function addSubScenario(parentId: string | null) {
    dispatch('addSubScenario', { parentId });
  }
  
  // Add a new expected result
  function addExpectedResult(scenarioId: string) {
    dispatch('addExpectedResult', { scenarioId });
  }
  
  // Add/edit concepts for a scenario
  function editConcepts(scenarioId: string) {
    dispatch('editConcepts', { scenarioId });
  }
</script>

<div class="hierarchical-scenario-manager">
  <div class="scenario-tree">
    {#if scenario.scenarios.length === 0}
      <div class="empty-state">
        <p>No scenarios defined yet.</p>
        {#if isEditable}
          <button class="add-scenario-btn" on:click={() => addSubScenario(null)}>
            <span class="btn-icon">+</span> Add Root Scenario
          </button>
        {/if}
      </div>
    {:else}
      {#each scenario.scenarios as subScenario}
        <div class="scenario-item {selectedScenarioId === subScenario.id ? 'selected' : ''}">
          <div class="scenario-header" on:click={() => handleScenarioSelect(subScenario)}>
            <div class="scenario-name">
              <span class="expand-icon">{subScenario.children.length > 0 ? '▼' : '▶'}</span> 
              {subScenario.name}
            </div>
            {#if isEditable}
              <div class="scenario-actions">
                <button class="action-btn edit-btn" on:click|stopPropagation={() => editConcepts(subScenario.id)}>
                  <span class="btn-icon">✏️</span> Edit Concepts
                </button>
                <button class="action-btn" on:click|stopPropagation={() => addExpectedResult(subScenario.id)}>
                  <span class="btn-icon">✓</span> Add Expected Result
                </button>
                <button class="action-btn" on:click|stopPropagation={() => addSubScenario(subScenario.id)}>
                  <span class="btn-icon">+</span> Add Sub-Scenario
                </button>
              </div>
            {/if}
          </div>
          
          {#if selectedScenarioId === subScenario.id}
            <div class="scenario-details">
              <div class="scenario-description">
                {subScenario.description || 'No description provided.'}
              </div>
              
              <div class="concept-summary">
                <h4>Concepts</h4>
                <ConceptStatusIndicator />
                
                {#if getActiveConcepts(subScenario, scenario.scenarios).length === 0}
                  <div class="no-concepts">
                    <p>No concepts defined for this scenario.</p>
                  </div>
                {:else}
                  <div class="concept-groups">
                    {#each Object.entries(groupConceptsByCategory(getActiveConcepts(subScenario, scenario.scenarios))) as [category, conceptList]}
                      <div class="concept-group">
                        <h5>{category}</h5>
                        <div class="concept-list">
                          {#each conceptList as concept}
                            <div class="concept-item {concept.inherited ? 'inherited' : ''}">
                              <div class="concept-details">
                                <span class="concept-name">{concept.conceptName.split('.').slice(1).join('.')}</span>
                                {#if concept.inherited}
                                  <span class="inherited-badge" title="Inherited from parent scenario">
                                    Inherited
                                  </span>
                                {/if}
                              </div>
                              <ConceptStatusIndicator value={concept.value} isActive={concept.isActive} conceptName={concept.conceptName} />
                            </div>
                          {/each}
                        </div>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
              
              {#if subScenario.expectedResults.length > 0}
                <div class="expected-results">
                  <h4>Expected Results</h4>
                  <ul>
                    {#each subScenario.expectedResults as result}
                      <li>
                        {result.type}: {result.target} should be {result.expectedVisibility ? 'visible' : 'hidden'}
                        {#if result.description}({result.description}){/if}
                      </li>
                    {/each}
                  </ul>
                </div>
              {/if}
              
              {#if isEditable && subScenario.concepts.length === 0}
                <div class="no-concepts-warning">
                  <p>This scenario has no concepts defined. Click "Edit Concepts" to add some.</p>
                  <button class="action-btn edit-btn" on:click={() => editConcepts(subScenario.id)}>
                    <span class="btn-icon">✏️</span> Edit Concepts
                  </button>
                </div>
              {/if}
            </div>
          {/if}
          
          {#if subScenario.children.length > 0}
            <div class="child-scenarios" style="padding-left: 20px">
              {#each subScenario.children as childScenario}
                <div class="scenario-item {selectedScenarioId === childScenario.id ? 'selected' : ''}">
                  <div class="scenario-header" on:click={() => handleScenarioSelect(childScenario)}>
                    <div class="scenario-name">
                      <span class="expand-icon">{childScenario.children.length > 0 ? '▼' : '▶'}</span> 
                      {childScenario.name}
                    </div>
                    {#if isEditable}
                      <div class="scenario-actions">
                        <button class="action-btn edit-btn" on:click|stopPropagation={() => editConcepts(childScenario.id)}>
                          <span class="btn-icon">✏️</span> Edit Concepts
                        </button>
                        <button class="action-btn" on:click|stopPropagation={() => addExpectedResult(childScenario.id)}>
                          <span class="btn-icon">✓</span> Add Expected Result
                        </button>
                        <button class="action-btn" on:click|stopPropagation={() => addSubScenario(childScenario.id)}>
                          <span class="btn-icon">+</span> Add Sub-Scenario
                        </button>
                      </div>
                    {/if}
                  </div>
                  
                  {#if selectedScenarioId === childScenario.id}
                    <div class="scenario-details">
                      <div class="scenario-description">
                        {childScenario.description || 'No description provided.'}
                      </div>
                      
                      <div class="concept-summary">
                        <h4>Concepts</h4>
                        <ConceptStatusIndicator />
                        
                        {#if getActiveConcepts(childScenario, scenario.scenarios).length === 0}
                          <div class="no-concepts">
                            <p>No concepts defined for this scenario.</p>
                          </div>
                        {:else}
                          <div class="concept-groups">
                            {#each Object.entries(groupConceptsByCategory(getActiveConcepts(childScenario, scenario.scenarios))) as [category, conceptList]}
                              <div class="concept-group">
                                <h5>{category}</h5>
                                <div class="concept-list">
                                  {#each conceptList as concept}
                                    <div class="concept-item {concept.inherited ? 'inherited' : ''}">
                                      <div class="concept-details">
                                        <span class="concept-name">{concept.conceptName.split('.').slice(1).join('.')}</span>
                                        {#if concept.inherited}
                                          <span class="inherited-badge" title="Inherited from parent scenario">
                                            Inherited
                                          </span>
                                        {/if}
                                      </div>
                                      <ConceptStatusIndicator value={concept.value} isActive={concept.isActive} conceptName={concept.conceptName} />
                                    </div>
                                  {/each}
                                </div>
                              </div>
                            {/each}
                          </div>
                        {/if}
                      </div>
                      
                      {#if childScenario.expectedResults.length > 0}
                        <div class="expected-results">
                          <h4>Expected Results</h4>
                          <ul>
                            {#each childScenario.expectedResults as result}
                              <li>
                                {result.type}: {result.target} should be {result.expectedVisibility ? 'visible' : 'hidden'}
                                {#if result.description}({result.description}){/if}
                              </li>
                            {/each}
                          </ul>
                        </div>
                      {/if}
                      
                      {#if isEditable && childScenario.concepts.length === 0}
                        <div class="no-concepts-warning">
                          <p>This scenario has no concepts defined. Click "Edit Concepts" to add some.</p>
                          <button class="action-btn edit-btn" on:click={() => editConcepts(childScenario.id)}>
                            <span class="btn-icon">✏️</span> Edit Concepts
                          </button>
                        </div>
                      {/if}
                    </div>
                  {/if}
                  
                  <!-- Recursively render deeper levels -->
                  {#if childScenario.children.length > 0}
                    <svelte:self 
                      scenario={{ scenarios: childScenario.children }} 
                      selectedScenarioId={selectedScenarioId}
                      onScenarioSelect={onScenarioSelect}
                      isEditable={isEditable}
                    />
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
      
      {#if isEditable}
        <div class="add-root-scenario">
          <button class="add-scenario-btn" on:click={() => addSubScenario(null)}>
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
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 4px;
    border: 1px solid #e0e0e0;
  }
  
  .scenario-tree {
    width: 100%;
  }
  
  .scenario-item {
    margin-bottom: 0.5rem;
    border-radius: 4px;
    transition: all 0.2s ease;
  }
  
  .scenario-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .scenario-header:hover {
    background-color: #f0f7ff;
  }
  
  .scenario-item.selected > .scenario-header {
    background-color: #e3f2fd;
    border-color: #2196f3;
  }
  
  .scenario-name {
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .expand-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    text-align: center;
    line-height: 16px;
    color: #666;
  }
  
  .scenario-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .action-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
    background-color: #f0f0f0;
    border: 1px solid #d0d0d0;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .action-btn:hover {
    background-color: #e0e0e0;
  }
  
  .edit-btn {
    background-color: #e3f2fd;
    border-color: #2196f3;
    color: #0d47a1;
  }
  
  .edit-btn:hover {
    background-color: #bbdefb;
  }
  
  .btn-icon {
    font-size: 0.9rem;
  }
  
  .scenario-details {
    padding: 1rem;
    background-color: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-top: none;
    border-radius: 0 0 4px 4px;
    margin-top: -4px;
  }
  
  .scenario-description {
    margin-bottom: 1rem;
    font-style: italic;
    color: #666;
  }
  
  .concept-summary {
    margin-top: 1rem;
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 0.75rem;
  }
  
  .concept-summary h4 {
    margin-top: 0;
    margin-bottom: 0.75rem;
    color: #333;
    font-size: 1rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
  }
  
  .no-concepts {
    padding: 1rem;
    background-color: #f9f9f9;
    border: 1px dashed #ccc;
    border-radius: 4px;
    text-align: center;
    color: #666;
    font-style: italic;
  }
  
  .concept-groups {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .concept-group {
    flex: 1;
    min-width: 250px;
    background-color: #f9f9f9;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 0.75rem;
  }
  
  .concept-group h5 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    color: #333;
    font-size: 0.9rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.25rem;
  }
  
  .concept-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .concept-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
  }
  
  .concept-item.inherited {
    border-left: 3px solid #9c27b0;
  }
  
  .concept-details {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .concept-name {
    font-size: 0.9rem;
    color: #555;
  }
  
  .inherited-badge {
    display: inline-block;
    padding: 0.1rem 0.3rem;
    background-color: #f3e5f5;
    color: #9c27b0;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 500;
  }
  
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
  
  .no-concepts-warning {
    background-color: #fff8e1;
    border: 1px solid #ffe082;
    border-radius: 4px;
    padding: 1rem;
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .no-concepts-warning p {
    margin: 0;
    color: #ff8f00;
    font-style: italic;
  }
  
  .child-scenarios {
    margin-left: 1rem;
    border-left: 2px solid #e0e0e0;
    padding-left: 0.5rem;
  }
</style> 