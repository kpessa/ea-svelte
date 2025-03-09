<script lang="ts">
  import type { Concept } from '../types';
  
  export let conceptsSnapshot: Record<string, Concept> = {};
  
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
        
        // Dispatch event to notify parent component
        const importEvent = new CustomEvent('importConcepts', {
          detail: { importedData }
        });
        dispatchEvent(importEvent);
        
      } catch (error) {
        alert('Error importing concepts: ' + error);
      }
    };
    reader.readAsText(file);
  }
</script>

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

<style>
  .import-export-section {
    border: 1px solid #eee;
    border-radius: 5px;
    padding: 15px;
    background-color: #f9f9f9;
  }
  
  .import-export-section h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 15px;
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
    font-weight: bold;
    color: #333;
  }
  
  .import-export-btn:hover, .import-btn:hover {
    background-color: #e0e0e0;
  }
</style> 