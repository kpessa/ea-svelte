<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { EditorView, basicSetup } from 'codemirror';
    import { json } from '@codemirror/lang-json';
    import { linter, lintGutter } from '@codemirror/lint';
    import type { OrderSection } from '../types';

    const dispatch = createEventDispatcher<{
        save: { section: OrderSection };
        cancel: void;
    }>();

    export let section: OrderSection;
    export let sectionName: string;

    let editorContainer: HTMLElement;
    let editorView: EditorView | null = null;
    let jsonError: string | null = null;

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
        const editorContent = JSON.stringify(section, null, 2);
        
        editorView = new EditorView({
            doc: editorContent,
            extensions: [
                basicSetup,
                json(),
                lintGutter(),
                jsonLinter,
                EditorView.theme({
                    '&': {
                        height: '300px',
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

        return () => {
            if (editorView) {
                editorView.destroy();
            }
        };
    });

    function handleSave() {
        if (!editorView) return;
        
        try {
            const content = editorView.state.doc.toString();
            const updatedSection = JSON.parse(content) as OrderSection;
            dispatch('save', { section: updatedSection });
            jsonError = null;
        } catch (error) {
            console.error('Failed to save section:', error);
            jsonError = error instanceof Error ? error.message : 'Failed to save section';
        }
    }

    function handleCancel() {
        dispatch('cancel');
    }
</script>

<div class="inline-editor-container">
    <div class="inline-editor-header">
        <h3>Editing: {sectionName}</h3>
    </div>
    
    {#if jsonError}
        <div class="json-error">
            {jsonError}
        </div>
    {/if}
    
    <div class="editor-wrapper" bind:this={editorContainer}></div>
    
    <div class="inline-editor-actions">
        <button 
            class="cancel-btn" 
            on:click={handleCancel}
        >
            Cancel
        </button>
        <button 
            class="save-btn" 
            on:click={handleSave}
            disabled={!!jsonError}
        >
            Save
        </button>
    </div>
</div>

<style>
    .inline-editor-container {
        border-top: 1px solid #ddd;
        background-color: #f8f8f8;
        padding: 15px;
        margin-top: 0;
    }
    
    .inline-editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }
    
    .inline-editor-header h3 {
        margin: 0;
        font-size: 16px;
        color: #333;
    }
    
    .editor-wrapper {
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: white;
        height: 300px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .inline-editor-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 12px;
    }
    
    .save-btn, .cancel-btn {
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        border: 1px solid transparent;
        transition: background-color 0.2s;
    }
    
    .save-btn {
        background-color: #4caf50;
        color: white;
    }
    
    .save-btn:hover:not(:disabled) {
        background-color: #45a049;
    }
    
    .save-btn:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }
    
    .cancel-btn {
        background-color: #f44336;
        color: white;
    }
    
    .cancel-btn:hover {
        background-color: #d32f2f;
    }
    
    .json-error {
        padding: 10px;
        margin-bottom: 12px;
        background-color: #ffebee;
        color: #c62828;
        border-radius: 4px;
        font-size: 14px;
        border-left: 4px solid #ef5350;
    }
    
    :global(.cm-editor) {
        height: 100%;
    }
    
    :global(.cm-scroller) {
        overflow: auto;
    }
</style> 