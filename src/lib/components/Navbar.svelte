<script lang="ts">
    import type { SvelteComponent } from 'svelte';

    interface $$Slots {
        default: {};
        actions: {};
    }
</script>

<nav class="bg-white shadow-md border-b border-gray-200">
    <div class="container-fluid mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex items-center">
                <div class="flex-shrink-0 flex items-center">
                    <h1 class="text-xl font-bold text-primary-700">Electrolyte Advisor</h1>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <slot name="actions" />
            </div>
        </div>
    </div>
</nav>

<style>
    /* Remove custom styles in favor of utility classes */
</style> 