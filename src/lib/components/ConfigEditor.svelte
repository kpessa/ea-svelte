<script lang="ts">
    import { onMount } from 'svelte';
    import { EditorView, basicSetup } from 'codemirror';
    import { json } from '@codemirror/lang-json';
    import { linter, lintGutter } from '@codemirror/lint';
    import { jsonParseLinter } from '@codemirror/lang-json';
    import { config } from '$lib/stores';
    import { ConfigService } from '$lib/services/configService';

    let editor: EditorView;
    let editorElement: HTMLElement;
    let errorMessage: string | null = null;

    onMount(() => {
        const configService = ConfigService.getInstance();
        const currentConfig = configService.getConfig();
        
        if (!currentConfig) {
            errorMessage = 'No configuration loaded';
            return;
        }

        editor = new EditorView({
            doc: JSON.stringify(currentConfig, null, 2),
            extensions: [
                basicSetup,
                json(),
                linter(jsonParseLinter()),
                lintGutter(),
                EditorView.updateListener.of(update => {
                    if (update.docChanged) {
                        try {
                            const newConfig = JSON.parse(update.state.doc.toString());
                            configService.validateConfig(newConfig);
                            config.set(newConfig);
                            errorMessage = null;
                        } catch (error) {
                            errorMessage = error instanceof Error ? error.message : 'Invalid JSON';
                        }
                    }
                })
            ],
            parent: editorElement
        });

        return () => {
            editor.destroy();
        };
    });
</script>

<div class="config-editor">
    <div class="editor-header">
        <h2 class="text-lg font-medium text-gray-900">Configuration Editor</h2>
        {#if errorMessage}
            <div class="error-message text-sm text-red-600">
                {errorMessage}
            </div>
        {/if}
    </div>
    <div class="editor-container" bind:this={editorElement}></div>
</div>

<style>
    .config-editor {
        display: flex;
        flex-direction: column;
        height: 100%;
        background-color: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .editor-header {
        padding: 1rem;
        border-bottom: 1px solid #e5e7eb;
    }

    .editor-container {
        flex: 1;
        overflow: auto;
        padding: 1rem;
    }

    .error-message {
        margin-top: 0.5rem;
        padding: 0.5rem;
        background-color: #fee2e2;
        border-radius: 0.25rem;
    }

    :global(.cm-editor) {
        height: 100%;
    }

    :global(.cm-scroller) {
        font-family: 'Fira Code', monospace;
    }

    :global(.cm-gutters) {
        background-color: #f9fafb;
        border-right: 1px solid #e5e7eb;
    }

    :global(.cm-line) {
        padding: 0 0.5rem;
    }

    :global(.cm-activeLine) {
        background-color: #f3f4f6;
    }
</style> 