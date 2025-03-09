import type { TestSubScenario, ConceptChange } from '../types';

// Function to get all active concepts for a scenario (including inherited from parents)
export function getActiveConcepts(subScenario: TestSubScenario, allScenarios: TestSubScenario[]): ConceptChange[] {
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
export function findScenarioById(id: string, scenarios: TestSubScenario[]): TestSubScenario | null {
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
export function groupConceptsByCategory(conceptChanges: ConceptChange[]): Record<string, ConceptChange[]> {
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