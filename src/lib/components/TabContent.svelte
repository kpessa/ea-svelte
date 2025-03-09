<script lang="ts">
    import type { Tab } from '../types';
    import CriteriaPanel from './CriteriaPanel.svelte';
    import OrdersPanel from './OrdersPanel.svelte';
    import { onMount } from 'svelte';

    export let selectedTab: Tab;
    export let debugMode = false;
    
    // For resizable container
    let containerWidth = 350; // Increased default width from 300 to 350
    let isDragging = false;
    let startX = 0;
    let startWidth = 0;
    let criteriaContainer: HTMLElement;
    let contentGrid: HTMLElement;
    
    // Initialize container with stored width if available
    onMount(() => {
        const storedWidth = localStorage.getItem('criteriaContainerWidth');
        if (storedWidth) {
            containerWidth = parseInt(storedWidth, 10);
            updateGridTemplateColumns();
        }
        
        // Add event listener for debugging
        console.log('TabContent: Setting up concepts-applied event listener');
        document.addEventListener('concepts-applied', (event: Event) => {
            console.log('TabContent: concepts-applied event detected:', event);
            console.log('TabContent: Current selected tab:', selectedTab);
        });
    });
    
    // Handle mouse down on the resizer
    function handleMouseDown(event: MouseEvent) {
        isDragging = true;
        startX = event.clientX;
        startWidth = containerWidth;
        
        // Add event listeners for dragging
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        
        // Prevent text selection during drag
        event.preventDefault();
        
        // Add a class to the body to indicate dragging is in progress
        document.body.classList.add('resizing');
    }
    
    // Handle mouse move during drag
    function handleMouseMove(event: MouseEvent) {
        if (!isDragging) return;
        
        const deltaX = event.clientX - startX;
        const newWidth = Math.max(250, Math.min(1000, startWidth + deltaX)); // Min 250px, Max 1000px (increased from 800)
        
        containerWidth = newWidth;
        updateGridTemplateColumns();
    }
    
    // Handle mouse up to end dragging
    function handleMouseUp() {
        isDragging = false;
        
        // Remove event listeners
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        
        // Save width to localStorage
        localStorage.setItem('criteriaContainerWidth', containerWidth.toString());
        
        // Remove the resizing class
        document.body.classList.remove('resizing');
    }
    
    // Update the grid template columns
    function updateGridTemplateColumns() {
        if (contentGrid) {
            contentGrid.style.gridTemplateColumns = `${containerWidth}px 1fr`;
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            const delta = event.key === 'ArrowLeft' ? -10 : 10;
            const newWidth = Math.max(250, Math.min(1000, containerWidth + delta));
            containerWidth = newWidth;
            updateGridTemplateColumns();
            localStorage.setItem('criteriaContainerWidth', containerWidth.toString());
            event.preventDefault();
        }
    }
</script>

<div class="tab-content bg-gray-50 rounded-md">
    <div class="content-grid flex-col lg:flex-row" bind:this={contentGrid}>
        <div class="criteria-container relative" bind:this={criteriaContainer}>
            <CriteriaPanel {selectedTab} {debugMode} />
            
            <!-- Resizer handle -->
            <div 
                class="resizer absolute right-0 top-0 bottom-0 w-2 bg-transparent hover:bg-primary-200 hover:opacity-70 cursor-ew-resize z-10 transition-colors duration-150"
                role="separator"
                aria-label="Resize panel"
                tabindex="0"
                on:mousedown={handleMouseDown}
                on:keydown={handleKeyDown}
                title="Drag to resize or use left/right arrow keys"
            ></div>
        </div>
        <div class="orders-container">
            <OrdersPanel {selectedTab} {debugMode} />
        </div>
    </div>
</div>

<style>
    .content-grid {
        display: grid;
        grid-template-columns: 350px 1fr; /* Updated from 300px to 350px */
        gap: 1rem;
    }
    
    .criteria-container {
        background-color: transparent;
        min-height: 300px;
    }
    
    .orders-container {
        min-height: 300px;
    }
    
    /* Style for when resizing is active */
    :global(body.resizing) {
        cursor: ew-resize !important;
        user-select: none;
    }
    
    :global(body.resizing *) {
        pointer-events: none;
    }
    
    :global(body.resizing .resizer) {
        pointer-events: auto;
    }

    @media (max-width: 768px) {
        .content-grid {
            grid-template-columns: 1fr;
        }
        
        .resizer {
            display: none;
        }
    }
</style> 