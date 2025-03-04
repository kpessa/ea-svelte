<script lang="ts">
    import { config } from '$lib/stores';

    function toggleDebugMode() {
        debugMode.update(value => !value);
    }
</script>

<nav class="bg-white shadow-sm">
    <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
            <div class="flex items-center">
                <h1 class="text-xl font-semibold text-gray-900">Electrolyte Advisor</h1>
            </div>
            <div class="flex items-center space-x-4">
                <button class="btn-secondary">
                    <span class="sr-only">Save</span>
                    Save
                </button>
                <button class="btn-primary">
                    <span class="sr-only">Export</span>
                    Export
                </button>
            </div>
        </div>
    </div>
</nav>

<style>
    .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 1rem;
        background-color: #2c3e50;
        color: white;
    }

    .navbar-brand {
        font-size: 1.5rem;
        font-weight: bold;
    }

    .navbar-controls {
        display: flex;
        gap: 0.5rem;
    }

    .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        background-color: #3498db;
        color: white;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .btn:hover {
        background-color: #2980b9;
    }
</style> 