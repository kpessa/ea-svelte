import { writable, get } from 'svelte/store';
import type { 
  TestScenario, 
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
      paths: [],
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
   * Add a new path to a test scenario
   * @param scenarioId The ID of the scenario to add the path to
   * @param name The name of the path
   * @param description The description of the path
   * @param parentId Optional parent path ID for hierarchical paths
   * @returns The newly created path, or null if the scenario was not found
   */
  static addPathToScenario(scenarioId: string, name: string, description: string, parentId: string | null = null): TestPath | null {
    let addedPath: TestPath | null = null;
    
    testScenarios.update(scenarios => {
      const scenarioIndex = scenarios.findIndex(s => s.id === scenarioId);
      if (scenarioIndex === -1) return scenarios;
      
      const newPath: TestPath = {
        id: uuidv4(),
        name,
        description,
        steps: [],
        expectedResults: [],
        parentId
      };
      
      addedPath = newPath;
      
      // Update the scenario with the new path
      const updatedScenario = {
        ...scenarios[scenarioIndex],
        paths: [...scenarios[scenarioIndex].paths, newPath],
        updatedAt: new Date().toISOString()
      };
      
      // Replace the scenario in the array
      const updatedScenarios = [...scenarios];
      updatedScenarios[scenarioIndex] = updatedScenario;
      
      return updatedScenarios;
    });
    
    return addedPath;
  }
  
  /**
   * Add a step to a test path
   */
  static addStepToPath(
    scenarioId: string, 
    pathId: string, 
    name: string, 
    conceptChanges: ConceptChange[],
    useDefaultValues: boolean = true
  ): TestStep | null {
    let addedStep: TestStep | null = null;
    
    // If useDefaultValues is true, apply default values to any concepts not explicitly set
    if (useDefaultValues) {
      const defaults = get(defaultConceptValues);
      const allConcepts = Object.keys(get(concepts));
      const changedConceptNames = conceptChanges.map(c => c.conceptName);
      
      // For each concept that's not explicitly changed, add it with default values if available
      allConcepts.forEach(conceptName => {
        if (!changedConceptNames.includes(conceptName) && defaults[conceptName]) {
          conceptChanges.push({
            conceptName,
            value: defaults[conceptName].value,
            isActive: defaults[conceptName].isActive
          });
        }
      });
    }
    
    testScenarios.update(scenarios => {
      const scenarioIndex = scenarios.findIndex(s => s.id === scenarioId);
      if (scenarioIndex === -1) return scenarios;
      
      const pathIndex = scenarios[scenarioIndex].paths.findIndex(p => p.id === pathId);
      if (pathIndex === -1) return scenarios;
      
      const newStep: TestStep = {
        id: uuidv4(),
        name,
        conceptChanges,
        order: scenarios[scenarioIndex].paths[pathIndex].steps.length
      };
      
      addedStep = newStep;
      
      // Create a deep copy of the scenarios array
      const updatedScenarios = [...scenarios];
      
      // Update the path with the new step
      const updatedPath = {
        ...updatedScenarios[scenarioIndex].paths[pathIndex],
        steps: [...updatedScenarios[scenarioIndex].paths[pathIndex].steps, newStep]
      };
      
      // Update the paths array
      updatedScenarios[scenarioIndex].paths = [
        ...updatedScenarios[scenarioIndex].paths.slice(0, pathIndex),
        updatedPath,
        ...updatedScenarios[scenarioIndex].paths.slice(pathIndex + 1)
      ];
      
      // Update the timestamp
      updatedScenarios[scenarioIndex].updatedAt = new Date().toISOString();
      
      return updatedScenarios;
    });
    
    return addedStep;
  }
  
  /**
   * Add an expected result to a path
   */
  static addExpectedResultToPath(scenarioId: string, pathId: string, expectedResult: ExpectedResult): boolean {
    let success = false;
    
    testScenarios.update(scenarios => {
      const scenarioIndex = scenarios.findIndex(s => s.id === scenarioId);
      if (scenarioIndex === -1) return scenarios;
      
      const pathIndex = scenarios[scenarioIndex].paths.findIndex(p => p.id === pathId);
      if (pathIndex === -1) return scenarios;
      
      // Create a deep copy of the scenarios array
      const updatedScenarios = [...scenarios];
      
      // Update the path with the new expected result
      const updatedPath = {
        ...updatedScenarios[scenarioIndex].paths[pathIndex],
        expectedResults: [
          ...updatedScenarios[scenarioIndex].paths[pathIndex].expectedResults,
          expectedResult
        ]
      };
      
      // Update the paths array
      updatedScenarios[scenarioIndex].paths = [
        ...updatedScenarios[scenarioIndex].paths.slice(0, pathIndex),
        updatedPath,
        ...updatedScenarios[scenarioIndex].paths.slice(pathIndex + 1)
      ];
      
      // Update the timestamp
      updatedScenarios[scenarioIndex].updatedAt = new Date().toISOString();
      
      success = true;
      return updatedScenarios;
    });
    
    return success;
  }
  
  /**
   * Execute a test path
   */
  static async executeTestPath(scenarioId: string, pathId: string): Promise<TestResult> {
    const scenarios = get(testScenarios);
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      throw new Error(`Scenario with ID ${scenarioId} not found`);
    }
    
    const path = scenario.paths.find(p => p.id === pathId);
    if (!path) {
      throw new Error(`Path with ID ${pathId} not found in scenario ${scenarioId}`);
    }
    
    // Save the original concept states to restore later
    const originalConcepts = get(concepts);
    
    // Initialize test result
    const testResult: TestResult = {
      scenarioId,
      pathId,
      timestamp: new Date().toISOString(),
      steps: [],
      success: true
    };
    
    try {
      // Execute each step in the path
      for (const step of path.steps) {
        // Apply concept changes for this step
        this.applyConceptChanges(step.conceptChanges);
        
        // Evaluate expected results
        const stepResult = this.evaluateExpectedResults(path.expectedResults);
        
        // Add step result to test result
        testResult.steps.push({
          stepId: step.id,
          conceptStates: { ...get(concepts) },
          results: stepResult.results,
          success: stepResult.success
        });
        
        // If any step fails, mark the test as failed
        if (!stepResult.success) {
          testResult.success = false;
          testResult.failureReason = `Step "${step.name}" failed: ${stepResult.failureReason}`;
        }
      }
    } catch (error) {
      testResult.success = false;
      testResult.failureReason = `Error executing test: ${error instanceof Error ? error.message : 'Unknown error'}`;
    } finally {
      // Restore original concept states
      concepts.set(originalConcepts);
    }
    
    // Save the test result
    testResults.update(results => [...results, testResult]);
    
    return testResult;
  }
  
  /**
   * Apply concept changes to the concept store
   */
  static applyConceptChanges(conceptChanges: ConceptChange[]): void {
    concepts.update(state => {
      const newState = { ...state };
      
      conceptChanges.forEach(change => {
        newState[change.conceptName] = {
          value: change.value,
          isActive: change.isActive,
          description: newState[change.conceptName]?.description
        };
      });
      
      return newState;
    });
  }
  
  /**
   * Evaluate expected results against current state
   */
  private static evaluateExpectedResults(expectedResults: ExpectedResult[]): {
    results: ExpectedResultOutcome[];
    success: boolean;
    failureReason?: string;
  } {
    const config = get(configStore);
    if (!config) {
      return {
        results: [],
        success: false,
        failureReason: 'No configuration loaded'
      };
    }
    
    const results: ExpectedResultOutcome[] = [];
    let success = true;
    let failureReason = '';
    
    for (const expectedResult of expectedResults) {
      let actualVisibility = false;
      
      // Determine actual visibility based on the type of expected result
      switch (expectedResult.type) {
        case 'tab':
          actualVisibility = this.isTabVisible(config, expectedResult.target);
          break;
        case 'section':
          actualVisibility = this.isSectionVisible(config, expectedResult.target);
          break;
        case 'order':
          actualVisibility = this.isOrderVisible(config, expectedResult.target);
          break;
        case 'criterion':
          actualVisibility = this.isCriterionVisible(config, expectedResult.target);
          break;
      }
      
      const resultSuccess = actualVisibility === expectedResult.expectedVisibility;
      
      results.push({
        expectedResult,
        actualVisibility,
        success: resultSuccess
      });
      
      if (!resultSuccess) {
        success = false;
        failureReason += `${expectedResult.type} "${expectedResult.target}" expected to be ${expectedResult.expectedVisibility ? 'visible' : 'hidden'} but was ${actualVisibility ? 'visible' : 'hidden'}. `;
      }
    }
    
    return {
      results,
      success,
      failureReason: failureReason.trim()
    };
  }
  
  /**
   * Check if a tab is visible based on current concept states
   */
  private static isTabVisible(config: Config, tabKey: string): boolean {
    const tab = config.RCONFIG.TABS.find(t => t.TAB_KEY === tabKey);
    if (!tab) return false;
    
    // If the tab has a FLAG_ON_CONCEPT, evaluate it
    if (tab.FLAG_ON_CONCEPT) {
      try {
        return this.evaluateConceptExpression(tab.FLAG_ON_CONCEPT);
      } catch (error) {
        console.error(`Error evaluating tab visibility for ${tabKey}:`, error);
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Check if a section is visible based on current concept states
   */
  private static isSectionVisible(config: Config, sectionPath: string): boolean {
    // sectionPath format: "tabKey:sectionName"
    const [tabKey, sectionName] = sectionPath.split(':');
    
    const tab = config.RCONFIG.TABS.find(t => t.TAB_KEY === tabKey);
    if (!tab) return false;
    
    const section = tab.ORDER_SECTIONS.find(s => s.SECTION_NAME === sectionName);
    if (!section) return false;
    
    // If the section has a CONCEPT_NAME, evaluate it
    if (section.CONCEPT_NAME) {
      try {
        return this.evaluateConceptExpression(section.CONCEPT_NAME);
      } catch (error) {
        console.error(`Error evaluating section visibility for ${sectionPath}:`, error);
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Check if an order is visible based on current concept states
   */
  private static isOrderVisible(config: Config, orderPath: string): boolean {
    // orderPath format: "tabKey:sectionName:orderMnemonic"
    const [tabKey, sectionName, orderMnemonic] = orderPath.split(':');
    
    // First check if the section is visible
    if (!this.isSectionVisible(config, `${tabKey}:${sectionName}`)) {
      return false;
    }
    
    const tab = config.RCONFIG.TABS.find(t => t.TAB_KEY === tabKey);
    if (!tab) return false;
    
    const section = tab.ORDER_SECTIONS.find(s => s.SECTION_NAME === sectionName);
    if (!section) return false;
    
    // Check if the order exists in the section
    return section.ORDERS.some(o => o.MNEMONIC === orderMnemonic);
  }
  
  /**
   * Check if a criterion is visible based on current concept states
   */
  private static isCriterionVisible(config: Config, criterionPath: string): boolean {
    // criterionPath format: "tabKey:criterionLabel"
    const [tabKey, criterionLabel] = criterionPath.split(':');
    
    const tab = config.RCONFIG.TABS.find(t => t.TAB_KEY === tabKey);
    if (!tab) return false;
    
    const criterion = tab.CRITERIA.find(c => c.LABEL === criterionLabel);
    if (!criterion) return false;
    
    // If the criterion has a CONCEPT_NAME, evaluate it
    if (criterion.CONCEPT_NAME) {
      try {
        return this.evaluateConceptExpression(criterion.CONCEPT_NAME);
      } catch (error) {
        console.error(`Error evaluating criterion visibility for ${criterionPath}:`, error);
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Evaluate a concept expression
   * This is a simplified version - in a real implementation, you would use
   * the actual evaluateConceptExpression function from your stores
   */
  private static evaluateConceptExpression(expression: string): boolean {
    // Get the current concept states
    const currentConcepts = get(concepts);
    
    // Extract concept names from the expression
    const conceptReferences: ConceptReference[] = [];
    const extractedReferences = ConceptExtractionService.extractConceptsFromExpression(
      expression, 
      'Test Evaluation', 
      'runtime',
      conceptReferences
    );
    
    const conceptNames = extractedReferences.map((ref: ConceptReference) => ref.name);
    
    // For this simplified implementation, we'll just check if all concepts are true
    // In a real implementation, you would parse and evaluate the expression
    return conceptNames.every((name: string) => 
      currentConcepts[name]?.value === true && 
      currentConcepts[name]?.isActive === true
    );
  }
  
  /**
   * Generate test paths from concepts
   */
  static generateTestPathsFromConcepts(
    scenarioId: string, 
    conceptNames: string[], 
    pathNamePrefix: string = 'Auto-generated path',
    useDefaultValues: boolean = true
  ): TestPath[] {
    // Get all possible combinations of concept values
    // For n concepts, there are 2^n possible combinations
    const numCombinations = Math.pow(2, conceptNames.length);
    const generatedPaths: TestPath[] = [];
    
    for (let i = 0; i < numCombinations; i++) {
      // Create a binary representation of the current combination
      const binaryStr = i.toString(2).padStart(conceptNames.length, '0');
      
      // Create concept changes based on the binary representation
      const conceptChanges: ConceptChange[] = conceptNames.map((name, index) => ({
        conceptName: name,
        value: binaryStr[index] === '1',
        isActive: true
      }));
      
      // Create a descriptive name for this path
      const pathDescription = conceptChanges
        .map(change => `${change.conceptName}=${change.value ? 'true' : 'false'}`)
        .join(', ');
      
      // Add the path to the scenario
      const pathName = `${pathNamePrefix} ${i + 1}`;
      const newPath = this.addPathToScenario(
        scenarioId,
        pathName,
        `Test with ${pathDescription}`,
        null
      );
      
      if (newPath) {
        // Add a single step with all concept changes
        this.addStepToPath(
          scenarioId,
          newPath.id,
          'Set concept values',
          conceptChanges,
          useDefaultValues
        );
        
        generatedPaths.push(newPath);
      }
    }
    
    return generatedPaths;
  }
  
  /**
   * Save test scenarios to local storage
   */
  static saveTestScenarios(): void {
    const scenarios = get(testScenarios);
    localStorage.setItem('conceptTestScenarios', JSON.stringify(scenarios));
  }
  
  /**
   * Load test scenarios from local storage
   */
  static loadTestScenarios(): void {
    const savedScenarios = localStorage.getItem('conceptTestScenarios');
    if (savedScenarios) {
      try {
        const scenarios = JSON.parse(savedScenarios);
        testScenarios.set(scenarios);
      } catch (error) {
        console.error('Error loading test scenarios:', error);
      }
    }
  }
  
  /**
   * Clear all test results
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
} 