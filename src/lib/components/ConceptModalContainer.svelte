<script lang="ts">
  import { onMount } from 'svelte';
  
  export let showModal: boolean = false;
  
  function toggleModal() {
    showModal = !showModal;
    
    // Dispatch event to notify parent component
    const event = new CustomEvent('toggleModal', {
      detail: { showModal }
    });
    dispatchEvent(event);
  }
  
  // Close modal when clicking outside of it
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('concept-modal')) {
      toggleModal();
    }
  }
  
  // Close modal when pressing Escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && showModal) {
      toggleModal();
    }
  }
  
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<div class="concept-icon-container">
  <button 
    class="concept-icon {showModal ? 'active' : ''}" 
    on:click={toggleModal}
    aria-label="Concept Manager"
  >
    🧠
  </button>
</div>

{#if showModal}
  <div 
    class="concept-modal" 
    style="display: block;" 
    on:click={handleClickOutside}
    on:keydown={handleKeydown}
    role="dialog"
    aria-labelledby="concept-modal-title"
  >
    <div class="concept-modal-content">
      <div class="concept-modal-header">
        <h2 class="concept-modal-title" id="concept-modal-title">Concept Manager</h2>
        <button 
          class="concept-modal-close" 
          on:click={toggleModal}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div class="concept-modal-body">
        <slot></slot>
      </div>
    </div>
  </div>
{/if}

<style>
  .concept-icon-container {
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 1000;
  }
  
  .concept-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #9c27b0;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  }
  
  .concept-icon:hover, .concept-icon.active {
    background-color: #7b1fa2;
    transform: scale(1.05);
  }
  
  .concept-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1001;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .concept-modal-content {
    background-color: white;
    border-radius: 5px;
    width: 95%;
    max-width: 1400px;
    height: 95vh;
    overflow-y: auto;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  }
  
  .concept-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 10;
  }
  
  .concept-modal-title {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }
  
  .concept-modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }
  
  .concept-modal-close:hover {
    color: #333;
  }
  
  .concept-modal-body {
    padding: 20px;
  }
  
  @media (max-width: 768px) {
    .concept-modal-content {
      width: 95%;
      height: 95vh;
    }
  }
</style> 