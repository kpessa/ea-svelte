import { writable, get } from 'svelte/store';
import type { 
  TestScenario, 
  TestSubScenario,
  TestPath, 
  TestStep, 
  TestResult, 
  ExpectedResult,
  ConceptChange,
  Concept,
  TestStepResult,
  ExpectedResultOutcome,
  Config,
  ConceptReference
} from '../types';
import { concepts } from '../stores';
import { configStore } from './configService';
import { v4 as uuidv4 } from 'uuid';
import { ConceptExtractionService } from './conceptExtractionService';

// Store for test scenarios
export const testScenarios = writable<TestScenario[]>([]);

// Store for current test results
export const testResults = writable<TestResult[]>([]);

// Store for default concept values for new steps
export const defaultConceptValues = writable<Record<string, { value: boolean, isActive: boolean }>>({});

// Store for section visibility control
export const sectionVisibility = writable<Record<string, boolean>>({});

export class ConceptTestService {
  /**
   * Create a new test scenario
   */
  static createScenario(name: string, description: string): TestScenario {
    const newScenario: TestScenario = {
      id: uuidv4(),
      name,
      description,
      scenarios: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    testScenarios.update(scenarios => [...scenarios, newScenario]);
    return newScenario;
  }
  
  /**
   * Get concept references grouped by tab and section
   */
  static getConceptReferencesByTabAndSection(): Record<string, Record<string, string[]>> {
    const config = get(configStore);
    if (!config) return {};
    
    const conceptReferences = ConceptExtractionService.extractConcepts(config);
    const groupedConcepts: Record<string, Record<string, string[]>> = {};
    
    // Group concepts by tab and section
    conceptReferences.forEach(ref => {
      // Extract tab name from section (format is usually "Tab {tabName} {sectionType}")
      const tabMatch = ref.section.match(/Tab\s+([^\s]+)/);
      const tabName = tabMatch ? tabMatch[1] : 'Other';
      
      // Initialize tab if it doesn't exist
      if (!groupedConcepts[tabName]) {
        groupedConcepts[tabName] = {};
      }
      
      // Use the full section name as the section key
      const sectionName = ref.section;
      
      // Initialize section if it doesn't exist
      if (!groupedConcepts[tabName][sectionName]) {
        groupedConcepts[tabName][sectionName] = [];
      }
      
      // Add concept to section if not already there
      if (!groupedConcepts[tabName][sectionName].includes(ref.name)) {
        groupedConcepts[tabName][sectionName].push(ref.name);
      }
    });
    
    return groupedConcepts;
  }
  
  /**
   * Set default concept values for new steps
   */
  static setDefaultConceptValues(conceptValues: Record<string, { value: boolean, isActive: boolean }>): void {
    defaultConceptValues.set(conceptValues);
  }
  
  /**
   * Add a new sub-scenario to a test scenario
   * @param scenarioId The ID of the scenario to add the sub-scenario to
   * @param name The name of the sub-scenario
   * @param description The description of the sub-scenario
   * @param parentId Optional parent sub-scenario ID for hierarchical structure
   * @returns The newly created sub-scenario, or null if the scenario was not found
   */
  static addSubScenarioToScenario(
    scenarioId: string, 
    name: string, 
    description: string, 
    parentId: string | null = null
  ): TestSubScenario | null {
    let addedSubScenario: TestSubScenario | null = null;
    
    testScenarios.update(scenarios => {
      const scenarioIndex = scenarios.findIndex(s => s.id === scenarioId);
      if (scenarioIndex === -1) return scenarios;
      
      const newSubScenario: TestSubScenario = {
        id: uuidv4(),
        name,
        description,
        parentId,
        level: 0, // Will be calculated when added to the tree
        concepts: [],
        children: [],
        expectedResults: []
      };
      
      addedSubScenario = newSubScenario;
      
      // Create a deep copy of the scenarios array
      const updatedScenarios = [...scenarios];
      
      if (parentId) {
        // This is a child scenario, add it to its parent
        const addToParent = (subScenarios: TestSubScenario[]): boolean => {
          for (let i = 0; i < subScenarios.length; i++) {
            if (subScenarios[i].id === parentId) {
              // Found the parent, add the new sub-scenario as a child
              newSubScenario.level = subScenarios[i].level + 1;
              subScenarios[i].children.push(newSubScenario);
              return true;
            }
            
            // Recursively check children
            if (subScenarios[i].children.length > 0) {
              if (addToParent(subScenarios[i].children)) {
                return true;
              }
            }
          }
          
          return false;
        };
        
        // Try to add to parent
        if (!addToParent(updatedScenarios[scenarioIndex].scenarios)) {
          // Parent not found, add as a root scenario
          newSubScenario.parentId = null;
          updatedScenarios[scenarioIndex].scenarios.push(newSubScenario);
        }
      } else {
        // This is a root scenario
        updatedScenarios[scenarioIndex].scenarios.push(newSubScenario);
      }
      
      // Update the timestamp
      updatedScenarios[scenarioIndex].updatedAt = new Date().toISOString();
      
      return updatedScenarios;
    });
    
    return addedSubScenario;
  }
  
  /**
   * Update concepts for a sub-scenario
   */
  static updateSubScenarioConcepts(
    scenarioId: string,
    subScenarioId: string,
    concepts: ConceptChange[]
  ): boolean {
    let success = false;
    
    testScenarios.update(scenarios => {
      const scenarioIndex = scenarios.findIndex(s => s.id === scenarioId);
      if (scenarioIndex === -1) return scenarios;
      
      // Create a deep copy of the scenarios array
      const updatedScenarios = [...scenarios];
      
      // Helper function to find and update the sub-scenario
      const updateConcepts = (subScenarios: TestSubScenario[]): boolean => {
        for (let i = 0; i < subScenarios.length; i++) {
          if (subScenarios[i].id === subScenarioId) {
            // Found the sub-scenario, update its concepts
            subScenarios[i].concepts = concepts;
            return true;
          }
          
          // Recursively check children
          if (subScenarios[i].children.length > 0) {
            if (updateConcepts(subScenarios[i].children)) {
              return true;
            }
          }
        }
        
        return false;
      };
      
      // Try to update the sub-scenario
      success = updateConcepts(updatedScenarios[scenarioIndex].scenarios);
      
      // Update the timestamp if successful
      if (success) {
        updatedScenarios[scenarioIndex].updatedAt = new Date().toISOString();
      }
      
      return updatedScenarios;
    });
    
    return success;
  }
  
  /**
   * Add an expected result to a sub-scenario
   */
  static addExpectedResultToSubScenario(
    scenarioId: string,
    subScenarioId: string,
    expectedResult: ExpectedResult
  ): boolean {
    let success = false;
    
    testScenarios.update(scenarios => {
      const scenarioIndex = scenarios.findIndex(s => s.id === scenarioId);
      if (scenarioIndex === -1) return scenarios;
      
      // Create a deep copy of the scenarios array
      const updatedScenarios = [...scenarios];
      
      // Helper function to find and update the sub-scenario
      const addExpectedResult = (subScenarios: TestSubScenario[]): boolean => {
        for (let i = 0; i < subScenarios.length; i++) {
          if (subScenarios[i].id === subScenarioId) {
            // Found the sub-scenario, add the expected result
            subScenarios[i].expectedResults.push(expectedResult);
            return true;
          }
          
          // Recursively check children
          if (subScenarios[i].children.length > 0) {
            if (addExpectedResult(subScenarios[i].children)) {
              return true;
            }
          }
        }
        
        return false;
      };
      
      // Try to update the sub-scenario
      success = addExpectedResult(updatedScenarios[scenarioIndex].scenarios);
      
      // Update the timestamp if successful
      if (success) {
        updatedScenarios[scenarioIndex].updatedAt = new Date().toISOString();
      }
      
      return updatedScenarios;
    });
    
    return success;
  }
  
  /**
   * Find a sub-scenario by ID
   */
  static findSubScenarioById(
    scenarioId: string,
    subScenarioId: string
  ): TestSubScenario | null {
    const scenarios = get(testScenarios);
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return null;
    
    // Helper function to find the sub-scenario
    const findSubScenario = (subScenarios: TestSubScenario[]): TestSubScenario | null => {
      for (const subScenario of subScenarios) {
        if (subScenario.id === subScenarioId) {
          return subScenario;
        }
        
        if (subScenario.children.length > 0) {
          const found = findSubScenario(subScenario.children);
          if (found) {
            return found;
          }
        }
      }
      
      return null;
    };
    
    return findSubScenario(scenario.scenarios);
  }
  
  /**
   * Get all active concepts for a sub-scenario (including inherited from parents)
   */
  static getActiveConceptsForSubScenario(
    scenarioId: string,
    subScenarioId: string
  ): ConceptChange[] {
    const subScenario = this.findSubScenarioById(scenarioId, subScenarioId);
    if (!subScenario) return [];
    
    let activeConcepts: ConceptChange[] = [...subScenario.concepts];
    
    // If this sub-scenario has a parent, get concepts from parent
    if (subScenario.parentId) {
      const parentConcepts = this.getActiveConceptsForSubScenario(scenarioId, subScenario.parentId);
      
      // Merge parent concepts with this sub-scenario's concepts
      // If a concept exists in both, the child's value takes precedence
      parentConcepts.forEach(parentConcept => {
        if (!activeConcepts.some(c => c.conceptName === parentConcept.conceptName)) {
          activeConcepts.push(parentConcept);
        }
      });
    }
    
    return activeConcepts;
  }
  
  /**
   * Clear all concepts and reset to default state
   */
  static clearConcepts(): void {
    concepts.update(state => {
      const newState: Record<string, { value: boolean, isActive: boolean }> = {};
      
      // Reset all concepts to false and inactive
      Object.keys(state).forEach(key => {
        newState[key] = { value: false, isActive: false };
      });
      
      return newState;
    });
    
    // Dispatch events to update UI
    const evaluateEvent = new CustomEvent('evaluate-order-sections', { bubbles: true });
    document.dispatchEvent(evaluateEvent);
    
    const conceptsEvent = new CustomEvent('concepts-applied', {
      detail: { concepts: [] },
      bubbles: true
    });
    document.dispatchEvent(conceptsEvent);
  }
  
  /**
   * Apply concepts from a sub-scenario to the current state
   */
  static applySubScenarioConcepts(scenarioId: string, subScenarioId: string): void {
    // First clear all concepts
    this.clearConcepts();
    
    const activeConcepts = this.getActiveConceptsForSubScenario(scenarioId, subScenarioId);
    
    // Get all concept names from the active concepts
    const activeConceptNames = new Set(activeConcepts.map(c => c.conceptName));
    
    // Update the concepts store directly
    concepts.update(state => {
      // Start with a fresh state
      const newState: Record<string, { value: boolean, isActive: boolean }> = {};
      
      // First, copy over any existing concepts as inactive
      Object.entries(state).forEach(([key, concept]) => {
        if (!activeConceptNames.has(key)) {
          newState[key] = { value: false, isActive: false };
        }
      });
      
      // Apply each concept change from the current scenario
      activeConcepts.forEach(change => {
        newState[change.conceptName] = {
          value: change.value,
          isActive: change.isActive
        };
      });
      
      return newState;
    });
    
    // Dispatch an event to force re-evaluation of order sections
    const evaluateEvent = new CustomEvent('evaluate-order-sections', { bubbles: true });
    document.dispatchEvent(evaluateEvent);
    
    // Dispatch a concepts-applied event to trigger UI updates
    const conceptsEvent = new CustomEvent('concepts-applied', {
      detail: { concepts: activeConcepts },
      bubbles: true
    });
    document.dispatchEvent(conceptsEvent);
  }
  
  /**
   * Execute a test for a sub-scenario
   */
  static async executeSubScenarioTest(scenarioId: string, subScenarioId: string): Promise<TestResult | null> {
    const subScenario = this.findSubScenarioById(scenarioId, subScenarioId);
    if (!subScenario) return null;
    
    // Apply the concepts from the sub-scenario
    this.applySubScenarioConcepts(scenarioId, subScenarioId);
    
    // TODO: Implement test execution logic for the new structure
    // This would evaluate the expected results against the current state
    
    return null;
  }
  
  /**
   * Save test scenarios to local storage
   */
  static saveTestScenarios(): void {
    const scenarios = get(testScenarios);
    localStorage.setItem('testScenarios', JSON.stringify(scenarios));
  }
  
  /**
   * Load test scenarios from local storage
   */
  static loadTestScenarios(): void {
    const savedScenarios = localStorage.getItem('testScenarios');
    if (savedScenarios) {
      try {
        const parsedScenarios = JSON.parse(savedScenarios) as TestScenario[];
        testScenarios.set(parsedScenarios);
      } catch (error) {
        console.error('Failed to parse saved test scenarios:', error);
      }
    }
  }
  
  /**
   * Clear test results
   */
  static clearTestResults(): void {
    testResults.set([]);
  }
  
  /**
   * Update section visibility based on user selection
   */
  static updateSectionVisibility(visibilityMap: Record<string, boolean>): void {
    sectionVisibility.set(visibilityMap);
  }
  
  /**
   * Check if a section should be visible based on the visibility map
   */
  static checkSectionVisibility(sectionName: string): boolean {
    const visibilityMap = get(sectionVisibility);
    
    // If the section is not in the map, default to visible
    if (visibilityMap[sectionName] === undefined) {
      return true;
    }
    
    return visibilityMap[sectionName];
  }
  
  /**
   * Create a default Magnesium test scenario with required concepts
   */
  static createDefaultMagnesiumScenario(): TestScenario {
    const scenario = this.createScenario(
      'Magnesium Test Scenario', 
      'Default scenario for testing Magnesium tab visibility'
    );
    
    // Create a root sub-scenario
    const rootSubScenario = this.addSubScenarioToScenario(
      scenario.id,
      'Show Magnesium Orders',
      'This scenario enables the key concepts needed to show Magnesium orders'
    );
    
    if (rootSubScenario) {
      // Add the required concepts
      const concepts: ConceptChange[] = [
        { conceptName: 'EASHOWMAGORDERS', value: true, isActive: true },
        { conceptName: 'EACRITERIAVALIDMAGRESULT4H', value: true, isActive: true },
        { conceptName: 'EALABMAGBTW00AND13', value: true, isActive: true },
        { conceptName: 'EAPROTOCOLMAGIV', value: true, isActive: true },
        { conceptName: 'EAPROTOCOLMAGORAL', value: true, isActive: true },
        { conceptName: 'EACRITERIANOTNPO', value: true, isActive: true },
        { conceptName: 'EALABMAGBTW14AND19', value: true, isActive: true }
      ];
      
      this.updateSubScenarioConcepts(scenario.id, rootSubScenario.id, concepts);
    }
    
    return scenario;
  }
} 