<script lang="ts">
    import { onMount } from 'svelte';
    import { EditorView, basicSetup } from 'codemirror';
    import { json } from '@codemirror/lang-json';
    import { linter, lintGutter } from '@codemirror/lint';
    import { configStore, currentConfigName, availableConfigs, ConfigService } from '../services/configService';
    import type { Config } from '../types';
    import { get } from 'svelte/store';

    export let onClose: () => void;
    export let isFullScreen: boolean = false;
    export let sectionToEdit: string | null = null;
    export let onSectionSave: ((updatedSection: any) => void) | null = null;

    let editorContainer: HTMLElement;
    let editorView: EditorView;
    let newConfigName: string = '';
    let showSaveAsDialog: boolean = false;
    let configToDelete: string | null = null;
    let showDeleteConfirmation: boolean = false;
    let editorContent: string = '';
    let jsonError: string | null = null;

    function handleSelectChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        loadConfig(select.value);
    }

    const jsonLinter = linter((view) => {
        try {
            JSON.parse(view.state.doc.toString());
            jsonError = null;
            return [];
        } catch (e) {
            jsonError = e instanceof Error ? e.message : 'Invalid JSON';
            return [{
                from: 0,
                to: view.state.doc.length,
                severity: 'error',
                message: jsonError
            }];
        }
    });

    onMount(() => {
        // Get the initial config directly
        const initialConfig = get(configStore);
        
        if (!initialConfig) {
            console.error('[ConfigEditor] Initial config is null on mount. Cannot create editor.');
            // Optionally show an error message to the user
            jsonError = 'Failed to load initial configuration.';
            return; // Stop if no initial config
        }

        // If we're editing a specific section, extract just that part
        let docContent = '';
        if (sectionToEdit) {
            try {
                const parts = sectionToEdit.split('.');
                let section = initialConfig as any;
                for (const part of parts) {
                    section = section[part];
                }
                docContent = JSON.stringify(section, null, 2);
            } catch (error) {
                console.error('Error extracting section on mount:', error);
                docContent = JSON.stringify(initialConfig, null, 2);
            }
        } else {
            docContent = JSON.stringify(initialConfig, null, 2);
        }
        
        editorContent = docContent;
        
        // Ensure container exists before creating editor
        if (editorContainer) {
             editorView = new EditorView({
                doc: docContent,
                extensions: [
                    basicSetup,
                    json(),
                    lintGutter(),
                    jsonLinter,
                    EditorView.theme({ // Reuse the theme definition
                        '&': { height: '100%', fontSize: '14px' },
                        '.cm-content': { fontFamily: 'monospace' },
                        '.cm-gutters': { backgroundColor: '#f5f5f5', borderRight: '1px solid #ddd' }
                    })
                ],
                parent: editorContainer
            });
        } else {
            console.error('[ConfigEditor] editorContainer is not available on mount.');
        }

        // Cleanup function
        return () => {
            if (editorView) {
                editorView.destroy();
            }
        };
    });

    function handleSave() {
        // --- Get current config name from store --- 
        const configNameToSave = get(currentConfigName);
        console.log(`Attempting to save changes for: ${configNameToSave}`);

        try {
            const content = editorView.state.doc.toString();
            let parsedContent: any;
            try {
                 parsedContent = JSON.parse(content);
            } catch (parseError) {
                 console.error('Invalid JSON in editor:', parseError);
                 jsonError = parseError instanceof Error ? parseError.message : 'Invalid JSON format';
                 return;
            }

            if (sectionToEdit && onSectionSave) {
                // For section editing, parse the content and call the callback
                console.log(`Saving section: ${sectionToEdit}`);
                onSectionSave(parsedContent); 
                onClose();
                return;
            }
            
            // --- Re-validate full config structure before saving --- 
            // (Basic validation similar to loadConfigFromLocalStorage)
            if (parsedContent && 
                typeof parsedContent === 'object' && 
                parsedContent.RCONFIG && 
                Array.isArray(parsedContent.RCONFIG.TABS) && 
                parsedContent.RCONFIG.TABS.every((tab: any) => tab && typeof tab === 'object' && tab.TAB_NAME && tab.TAB_KEY)) {

                 // For full config editing - use the correct config name
                 console.log(`Saving full config: ${configNameToSave}`);
                 ConfigService.saveConfig(parsedContent as Config); // Pass the validated config
                 jsonError = null; // Clear error on successful save
                 onClose();
             } else {
                 console.error('Config validation failed before saving. Aborting save.');
                 jsonError = 'Invalid configuration structure. Cannot save.';
             }

        } catch (error) {
            // Catch potential errors not caught by JSON.parse or validation (less likely)
            console.error('Failed to save config:', error);
            jsonError = error instanceof Error ? error.message : 'Failed to save config';
        }
    }
    
    function openSaveAsDialog() {
        showSaveAsDialog = true;
        newConfigName = '';
    }
    
    function handleSaveAs() {
        if (!newConfigName.trim()) {
            jsonError = 'Please enter a configuration name';
            return;
        }
        
        try {
            const content = editorView.state.doc.toString();
            const config = JSON.parse(content) as Config;
            
            // --- ADDED: Validate config structure before Save As --- 
            if (config && 
                typeof config === 'object' && 
                config.RCONFIG && 
                Array.isArray(config.RCONFIG.TABS) && 
                config.RCONFIG.TABS.every((tab: any) => tab && typeof tab === 'object' && tab.TAB_NAME && tab.TAB_KEY)) {
                
                ConfigService.saveConfigAs(newConfigName.trim(), config);
                showSaveAsDialog = false;
                jsonError = null;
            } else {
                 console.error('Config validation failed before Save As. Aborting save.');
                 jsonError = 'Invalid configuration structure. Cannot Save As.';
                 // Optionally keep the dialog open?
                 // showSaveAsDialog = true; 
            }
            // --- END VALIDATION --- 

        } catch (error) {
            console.error('Failed to save config as:', error);
            // Handle JSON parse errors or other unexpected issues
            jsonError = error instanceof Error ? error.message : 'Failed to save config';
        }
    }
    
    function loadConfig(configName: string) {
        const loaded = ConfigService.loadConfigByName(configName);
        if (!loaded) {
            // Config failed to load (invalid or not found)
            const lastValidConfigName = get(currentConfigName);
            jsonError = `Failed to load '${configName}'. It might be corrupted or missing. Reverted to '${lastValidConfigName}'.`;
            alert(jsonError); // Simple alert for now
            
            // Reset editor view to the last valid config
            const lastValidConfig = get(configStore);
            if (editorView && lastValidConfig) {
                 let docContent = '';
                 if (sectionToEdit) {
                     // Re-extract section if in section edit mode
                     try {
                         const parts = sectionToEdit.split('.');
                         let section = lastValidConfig as any;
                         for (const part of parts) { section = section[part]; }
                         docContent = JSON.stringify(section, null, 2);
                     } catch (error) {
                         console.error("Error re-extracting section after load:", error);
                         docContent = JSON.stringify(lastValidConfig, null, 2); // Fallback to full config
                     }
                 } else {
                     docContent = JSON.stringify(lastValidConfig, null, 2);
                 }
                 
                 console.log(`[ConfigEditor] Calculated docContent (length: ${docContent.length})`);
                 
                 // Use requestAnimationFrame to ensure updates happen after potential DOM changes
                 requestAnimationFrame(() => {
                     if (editorView) { 
                         console.log(`[ConfigEditor] Attempting state reconfiguration`);
                         try {
                             // Try setting the state directly
                             editorView.setState(editorView.state.update({changes: {from: 0, to: editorView.state.doc.length, insert: docContent}}).state);
                             console.log(`[ConfigEditor] setState successful (potentially)`);
                             // Verify state in the next frame
                             requestAnimationFrame(() => {
                                 if (editorView) {
                                     console.log(`[ConfigEditor] Editor state after setState (length: ${editorView.state.doc.length})`);
                                 }
                             });
                         } catch (reconfigError) {
                             console.error(`[ConfigEditor] Error during editorView.setState:`, reconfigError);
                         }
                     }
                 });
            }

            // Force dropdown back - Find the select element (this is a bit brittle, binding is better)
            const selectElement = document.querySelector('.config-select') as HTMLSelectElement | null;
            if (selectElement) {
                 selectElement.value = lastValidConfigName;
            }

        } else {
             console.log(`[ConfigEditor] Successfully loaded config: ${configName}`);
             // Successfully loaded - update the editor view
             jsonError = null; // Clear any previous error
             if (loaded && editorContainer) {
                 // --- Destroy existing editor and recreate --- 
                 if (editorView) {
                     editorView.destroy();
                 }

                 let docContent = '';
                 if (sectionToEdit) {
                     // Re-extract section if in section edit mode
                     try {
                         const parts = sectionToEdit.split('.');
                         let section = loaded as any;
                         for (const part of parts) { section = section[part]; }
                         docContent = JSON.stringify(section, null, 2);
                     } catch (error) {
                         console.error("Error re-extracting section after load:", error);
                         docContent = JSON.stringify(loaded, null, 2); // Fallback to full config
                     }
                 } else {
                     docContent = JSON.stringify(loaded, null, 2);
                 }
                 
                 console.log(`[ConfigEditor] Calculated docContent (length: ${docContent.length})`);
                 
                 console.log('[ConfigEditor] Creating new editorView instance.');
                 editorView = new EditorView({
                     doc: docContent,
                     extensions: [
                         basicSetup,
                         json(),
                         lintGutter(),
                         jsonLinter,
                         EditorView.theme({
                             '&': {
                                 height: '100%',
                                 fontSize: '14px'
                             },
                             '.cm-content': {
                                 fontFamily: 'monospace'
                             },
                             '.cm-gutters': {
                                 backgroundColor: '#f5f5f5',
                                 borderRight: '1px solid #ddd'
                             }
                         })
                     ],
                     parent: editorContainer
                 });
             }
        }
    }
    
    function confirmDelete(configName: string) {
        if (configName === 'default') {
            alert("The 'default' configuration cannot be deleted.");
            return;
        }
        configToDelete = configName;
        showDeleteConfirmation = true;
    }
    
    function handleDelete() {
        if (configToDelete) {
            ConfigService.deleteConfig(configToDelete);
            configToDelete = null;
            showDeleteConfirmation = false;
        }
    }
    
    function cancelDelete() {
        configToDelete = null;
        showDeleteConfirmation = false;
    }
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl w-full {isFullScreen ? 'h-full' : 'max-w-4xl h-[80vh]'} flex flex-col">
        <div class="p-4 border-b flex justify-between items-center">
            <div class="flex items-center space-x-2">
                <h2 class="text-xl font-semibold">
                    {#if sectionToEdit}
                        Edit Section: {sectionToEdit}
                    {:else}
                        Edit Configuration: {$currentConfigName}
                    {/if}
                </h2>
                
                {#if !sectionToEdit}
                    <div class="ml-4">
                        <select 
                            class="px-2 py-1 border rounded text-sm config-select"
                            value={$currentConfigName}
                            on:change={handleSelectChange}
                        >
                            {#each $availableConfigs as configName}
                                <option value={configName}>{configName}</option>
                            {/each}
                        </select>
                    </div>
                {/if}
            </div>
            <button 
                class="text-gray-500 hover:text-gray-700"
                on:click={onClose}
            >
                ✕
            </button>
        </div>
        
        {#if jsonError}
            <div class="bg-red-100 text-red-700 p-2 text-sm">
                {jsonError}
            </div>
        {/if}
        
        <div class="flex-1 overflow-hidden" bind:this={editorContainer}></div>
        
        <div class="p-4 border-t flex justify-between">
            <div>
                {#if !sectionToEdit}
                    <button 
                        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
                        on:click={openSaveAsDialog}
                    >
                        Save As...
                    </button>
                    
                    {#if $availableConfigs.length > 1}
                        <button 
                            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            on:click={() => confirmDelete($currentConfigName)}
                        >
                            Delete
                        </button>
                    {/if}
                {/if}
            </div>
            
            <div class="flex gap-2">
                <button 
                    class="px-4 py-2 text-gray-600 hover:text-gray-800 rounded"
                    on:click={onClose}
                >
                    Cancel
                </button>
                <button 
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    on:click={handleSave}
                    disabled={jsonError !== null}
                >
                    Save Changes
                </button>
            </div>
        </div>
    </div>
</div>

{#if showSaveAsDialog}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 class="text-lg font-semibold mb-4">Save Configuration As</h3>
            
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    Configuration Name
                </label>
                <input 
                    type="text" 
                    class="w-full px-3 py-2 border rounded-md"
                    bind:value={newConfigName}
                    placeholder="Enter configuration name"
                />
            </div>
            
            <div class="flex justify-end gap-2">
                <button 
                    class="px-4 py-2 text-gray-600 hover:text-gray-800 rounded"
                    on:click={() => showSaveAsDialog = false}
                >
                    Cancel
                </button>
                <button 
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    on:click={handleSaveAs}
                >
                    Save
                </button>
            </div>
        </div>
    </div>
{/if}

{#if showDeleteConfirmation}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 class="text-lg font-semibold mb-4">Confirm Deletion</h3>
            
            <p class="mb-4">
                Are you sure you want to delete the configuration "{configToDelete}"? This action cannot be undone.
            </p>
            
            <div class="flex justify-end gap-2">
                <button 
                    class="px-4 py-2 text-gray-600 hover:text-gray-800 rounded"
                    on:click={cancelDelete}
                >
                    Cancel
                </button>
                <button 
                    class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    on:click={handleDelete}
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    :global(.cm-editor) {
        height: 100%;
    }
    :global(.cm-scroller) {
        overflow: auto;
    }
</style> 