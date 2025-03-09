<script lang="ts">
    import { onMount } from 'svelte';
    import { EditorView, basicSetup } from 'codemirror';
    import { json } from '@codemirror/lang-json';
    import { linter, lintGutter } from '@codemirror/lint';
    import { configStore, currentConfigName, availableConfigs, ConfigService } from '../services/configService';
    import type { Config } from '../types';

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
        const startState = configStore.subscribe((config) => {
            if (!config) return;
            
            // If we're editing a specific section, extract just that part
            let docContent = '';
            if (sectionToEdit) {
                try {
                    // Navigate to the specific section in the config
                    const parts = sectionToEdit.split('.');
                    let section = config as any;
                    for (const part of parts) {
                        section = section[part];
                    }
                    docContent = JSON.stringify(section, null, 2);
                } catch (error) {
                    console.error('Error extracting section:', error);
                    docContent = JSON.stringify(config, null, 2);
                }
            } else {
                docContent = JSON.stringify(config, null, 2);
            }
            
            editorContent = docContent;
            
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
        });

        return () => {
            startState();
            if (editorView) {
                editorView.destroy();
            }
        };
    });

    function handleSave() {
        try {
            const content = editorView.state.doc.toString();
            
            if (sectionToEdit && onSectionSave) {
                // For section editing, parse the content and call the callback
                const sectionContent = JSON.parse(content);
                onSectionSave(sectionContent);
                onClose();
                return;
            }
            
            // For full config editing
            const config = JSON.parse(content) as Config;
            ConfigService.saveConfig(config);
            onClose();
        } catch (error) {
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
            ConfigService.saveConfigAs(newConfigName.trim(), config);
            showSaveAsDialog = false;
            jsonError = null;
        } catch (error) {
            console.error('Failed to save config as:', error);
            jsonError = error instanceof Error ? error.message : 'Failed to save config';
        }
    }
    
    function loadConfig(configName: string) {
        ConfigService.loadConfigByName(configName);
    }
    
    function confirmDelete(configName: string) {
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
                            class="px-2 py-1 border rounded text-sm"
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