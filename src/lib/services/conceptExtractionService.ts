import type { Config } from '../types';
import { concepts } from '../stores';
import type { Concept, ConceptItem, ConceptReference } from '../types';

export class ConceptExtractionService {
  /**
   * Extract all concepts from the config
   * @param config The configuration object
   * @returns Array of concept references with their locations
   */
  static extractConcepts(config: Config): ConceptReference[] {
    const conceptReferences: ConceptReference[] = [];
    
    // Process each tab in the config
    if (config?.RCONFIG?.TABS) {
      config.RCONFIG.TABS.forEach((tab, tabIndex) => {
        const tabName = tab.TAB_NAME;
        
        // Check FLAG_ON_CONCEPT if it exists
        if ('FLAG_ON_CONCEPT' in tab) {
          this.extractConceptsFromExpression(
            tab.FLAG_ON_CONCEPT as string, 
            `Tab ${tabName} Flag`, 
            `RCONFIG.TABS[${tabIndex}].FLAG_ON_CONCEPT`,
            conceptReferences
          );
        }
        
        // Check CONCEPT_FOR_DISMISS if it exists
        if (tab.CONCEPT_FOR_DISMISS) {
          conceptReferences.push({
            name: tab.CONCEPT_FOR_DISMISS,
            section: `Tab ${tabName} Dismiss`,
            path: `RCONFIG.TABS[${tabIndex}].CONCEPT_FOR_DISMISS`,
            isExpression: false
          });
        }
        
        // Process CONCEPTS array if it exists
        if (tab.CONCEPTS) {
          tab.CONCEPTS.forEach((conceptItem: ConceptItem, conceptIndex: number) => {
            if (conceptItem.Concept) {
              this.extractConceptsFromExpression(
                conceptItem.Concept as string,
                `Tab ${tabName} Concepts`,
                `RCONFIG.TABS[${tabIndex}].CONCEPTS[${conceptIndex}].Concept`,
                conceptReferences
              );
            }
          });
        }
        
        // Process CRITERIA array if it exists
        if (tab.CRITERIA) {
          tab.CRITERIA.forEach((criterion, criterionIndex) => {
            if (criterion.CONCEPT_NAME) {
              this.extractConceptsFromExpression(
                criterion.CONCEPT_NAME as string,
                `Tab ${tabName} Criteria`,
                `RCONFIG.TABS[${tabIndex}].CRITERIA[${criterionIndex}].CONCEPT_NAME`,
                conceptReferences
              );
            }
          });
        }
        
        // Process ORDER_SECTIONS array if it exists
        if (tab.ORDER_SECTIONS) {
          tab.ORDER_SECTIONS.forEach((section, sectionIndex) => {
            if (section.CONCEPT_NAME) {
              this.extractConceptsFromExpression(
                section.CONCEPT_NAME as string,
                `Tab ${tabName} Order Section: ${section.SECTION_NAME}`,
                `RCONFIG.TABS[${tabIndex}].ORDER_SECTIONS[${sectionIndex}].CONCEPT_NAME`,
                conceptReferences
              );
            }
          });
        }
      });
    }
    
    return conceptReferences;
  }
  
  /**
   * Extract individual concepts from a concept expression
   * @param expression The concept expression string
   * @param section The section name for context
   * @param path The path to the expression in the config
   * @param conceptReferences Array to add extracted concepts to
   */
  static extractConceptsFromExpression(
    expression: string, 
    section: string, 
    path: string,
    conceptReferences: ConceptReference[]
  ): ConceptReference[] {
    if (!expression) return [];
    
    const extractedReferences: ConceptReference[] = [];
    
    // Simple regex to extract concept names from expressions
    // This handles basic cases like {CONCEPT_NAME} or {CONCEPT_NAME} AND {ANOTHER_CONCEPT}
    const conceptRegex = /\{([^{}]+)\}/g;
    let match;
    
    while ((match = conceptRegex.exec(expression)) !== null) {
      const conceptName = match[1].trim();
      const reference = {
        name: conceptName,
        section,
        path,
        isExpression: true
      };
      
      extractedReferences.push(reference);
      conceptReferences.push(reference);
    }
    
    // If no matches were found but there's text, it might be a direct concept name
    if (!conceptRegex.test(expression) && expression.trim()) {
      const reference = {
        name: expression.trim(),
        section,
        path,
        isExpression: false
      };
      
      extractedReferences.push(reference);
      conceptReferences.push(reference);
    }
    
    return extractedReferences;
  }
  
  /**
   * Initialize concepts in the store from extracted references
   * @param conceptReferences Array of concept references
   */
  static initializeConceptsFromReferences(conceptReferences: ConceptReference[]): void {
    // Get unique concept names
    const uniqueConceptNames = [...new Set(
      conceptReferences.map(ref => ref.isExpression ? ref.name : ref.name)
    )];
    
    // Update the concepts store
    concepts.update(state => {
      const newState = { ...state };
      
      uniqueConceptNames.forEach(name => {
        // Only add if it doesn't already exist
        if (!newState[name]) {
          newState[name] = {
            value: false,
            isActive: true
          };
        }
      });
      
      return newState;
    });
  }
  
  /**
   * Get a report of all concepts and their usage
   * @param conceptReferences Array of concept references
   * @returns Formatted report of concepts and their usage
   */
  static generateConceptUsageReport(conceptReferences: ConceptReference[]): string {
    const conceptUsage: Record<string, string[]> = {};
    
    // Group by concept name
    conceptReferences.forEach(ref => {
      const name = ref.name;
      if (!conceptUsage[name]) {
        conceptUsage[name] = [];
      }
      conceptUsage[name].push(`${ref.section} (${ref.path})`);
    });
    
    // Format the report
    let report = "Concept Usage Report:\n\n";
    
    Object.entries(conceptUsage).forEach(([name, usages]) => {
      report += `Concept: ${name}\n`;
      report += `Used in ${usages.length} place(s):\n`;
      usages.forEach(usage => {
        report += `  - ${usage}\n`;
      });
      report += "\n";
    });
    
    return report;
  }
} 