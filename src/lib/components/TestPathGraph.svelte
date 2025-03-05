<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import type { TestScenario, TestPath, TestStep, ConceptChange } from '../types';
  import { concepts } from '../stores';
  import { configStore } from '../services/configService';
  import { ConceptTestService } from '../services/conceptTestService';
  
  export let scenario: TestScenario;
  export let selectedPathId: string | null = null;
  export let onPathSelect: (pathId: string) => void;
  export let isEditable: boolean = false;
  
  let graphContainer: HTMLElement;
  let graphWidth = 0;
  let graphHeight = 0;
  let nodeRadius = 40;
  let horizontalSpacing = 180;
  let verticalSpacing = 120;
  let editingNode: GraphNode | null = null;
  let showNodeEditor = false;
  let newNodeLabel = '';
  let newNodeType: 'decision' | 'level' | 'npo' | 'not-npo' = 'decision';
  let zoomLevel = 1;
  let panOffset = { x: 0, y: 0 };
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  
  // Graph data structure
  interface GraphNode {
    id: string;
    label: string;
    type: 'decision' | 'level' | 'npo' | 'not-npo';
    x: number;
    y: number;
    pathId?: string;
    conceptChanges?: ConceptChange[];
    children?: GraphNode[];
    parent?: GraphNode;
  }
  
  interface GraphEdge {
    source: GraphNode;
    target: GraphNode;
    label?: string;
  }
  
  let rootNode: GraphNode;
  let nodes: GraphNode[] = [];
  let edges: GraphEdge[] = [];
  
  // Colors
  const colors = {
    decision: '#1e88e5',
    level: '#43a047',
    npo: '#5e35b1',
    'not-npo': '#e53935',
    selected: '#ff9800',
    text: '#ffffff',
    edge: '#90a4ae',
    edgeText: '#37474f'
  };
  
  // Build the graph from the scenario
  function buildGraph() {
    // Reset graph data
    nodes = [];
    edges = [];
    
    if (!scenario || !scenario.paths || scenario.paths.length === 0) {
      // Create a placeholder node for empty scenarios
      rootNode = {
        id: 'empty-root',
        label: 'No Test Paths\nAvailable',
        type: 'decision',
        x: 0,
        y: 0,
        children: []
      };
      nodes.push(rootNode);
      return;
    }
    
    // Create root node (Magnesium)
    rootNode = {
      id: 'root',
      label: 'Magnesium',
      type: 'decision',
      x: 0,
      y: 0,
      children: []
    };
    nodes.push(rootNode);
    
    // First level: Route (Oral, IV, Oral & IV)
    const routeNodes = [
      { id: 'oral', label: 'Oral', type: 'decision' as const },
      { id: 'iv', label: 'IV', type: 'decision' as const },
      { id: 'oral-iv', label: 'Oral & IV', type: 'decision' as const }
    ];
    
    // Position first level nodes
    routeNodes.forEach((node, index) => {
      const y = (index - (routeNodes.length - 1) / 2) * verticalSpacing;
      const graphNode: GraphNode = {
        ...node,
        x: horizontalSpacing,
        y,
        children: [],
        parent: rootNode
      };
      nodes.push(graphNode);
      rootNode.children = [...(rootNode.children || []), graphNode];
      
      // Add edge from root to this node
      edges.push({
        source: rootNode,
        target: graphNode
      });
      
      // For Oral and IV, add NPO/NOT NPO decision nodes
      if (node.id !== 'oral-iv') {
        const npoNode: GraphNode = {
          id: `${node.id}-npo`,
          label: 'NPO',
          type: 'npo',
          x: graphNode.x + horizontalSpacing,
          y: graphNode.y - verticalSpacing / 2,
          children: [],
          parent: graphNode
        };
        
        const notNpoNode: GraphNode = {
          id: `${node.id}-not-npo`,
          label: 'NOT NPO',
          type: 'not-npo',
          x: graphNode.x + horizontalSpacing,
          y: graphNode.y + verticalSpacing / 2,
          children: [],
          parent: graphNode
        };
        
        nodes.push(npoNode, notNpoNode);
        graphNode.children = [npoNode, notNpoNode];
        
        edges.push(
          { source: graphNode, target: npoNode, label: '{EAMAGPROTOPAL}' },
          { source: graphNode, target: notNpoNode, label: '{EAMAGPROTIV}' }
        );
        
        // Add level nodes for each NPO/NOT NPO node
        const levelNodes = [
          { id: `${npoNode.id}-level1`, label: 'Level < 1.3', type: 'level' as const },
          { id: `${npoNode.id}-level2`, label: 'Level 1.4 - 2', type: 'level' as const },
          { id: `${notNpoNode.id}-level1`, label: 'Level < 1.3', type: 'level' as const },
          { id: `${notNpoNode.id}-level2`, label: 'Level 1.4 - 2', type: 'level' as const }
        ];
        
        levelNodes.forEach((levelNode, i) => {
          const parentNode = i < 2 ? npoNode : notNpoNode;
          const offset = i % 2 === 0 ? -verticalSpacing / 3 : verticalSpacing / 3;
          
          const graphLevelNode: GraphNode = {
            ...levelNode,
            x: parentNode.x + horizontalSpacing,
            y: parentNode.y + offset,
            parent: parentNode
          };
          
          nodes.push(graphLevelNode);
          parentNode.children = [...(parentNode.children || []), graphLevelNode];
          
          edges.push({
            source: parentNode,
            target: graphLevelNode
          });
        });
      } else {
        // For Oral & IV, add NPO/NOT NPO decision nodes
        const npoNode: GraphNode = {
          id: `${node.id}-npo`,
          label: 'NPO',
          type: 'npo',
          x: graphNode.x + horizontalSpacing,
          y: graphNode.y - verticalSpacing / 2,
          children: [],
          parent: graphNode
        };
        
        const notNpoNode: GraphNode = {
          id: `${node.id}-not-npo`,
          label: 'NOT NPO',
          type: 'not-npo',
          x: graphNode.x + horizontalSpacing,
          y: graphNode.y + verticalSpacing / 2,
          children: [],
          parent: graphNode
        };
        
        nodes.push(npoNode, notNpoNode);
        graphNode.children = [npoNode, notNpoNode];
        
        edges.push(
          { 
            source: graphNode, 
            target: npoNode, 
            label: '{EAMAGPROTOPAL}\n{EAMAGPROTIV}' 
          },
          { 
            source: graphNode, 
            target: notNpoNode, 
            label: '{EAMAGPROTOPAL}\n{EAMAGPROTIV}' 
          }
        );
        
        // Add level nodes for each NPO/NOT NPO node
        const levelNodes = [
          { id: `${npoNode.id}-level1`, label: 'Level < 1.3', type: 'level' as const },
          { id: `${npoNode.id}-level2`, label: 'Level 1.4 - 2', type: 'level' as const },
          { id: `${notNpoNode.id}-level1`, label: 'Level < 1.3', type: 'level' as const },
          { id: `${notNpoNode.id}-level2`, label: 'Level 1.4 - 2', type: 'level' as const }
        ];
        
        levelNodes.forEach((levelNode, i) => {
          const parentNode = i < 2 ? npoNode : notNpoNode;
          const offset = i % 2 === 0 ? -verticalSpacing / 3 : verticalSpacing / 3;
          
          const graphLevelNode: GraphNode = {
            ...levelNode,
            x: parentNode.x + horizontalSpacing,
            y: parentNode.y + offset,
            parent: parentNode
          };
          
          nodes.push(graphLevelNode);
          parentNode.children = [...(parentNode.children || []), graphLevelNode];
          
          edges.push({
            source: parentNode,
            target: graphLevelNode
          });
        });
      }
    });
    
    // Map test paths to graph nodes
    mapPathsToNodes();
  }
  
  // Map test paths to graph nodes
  function mapPathsToNodes() {
    if (!scenario) return;
    
    scenario.paths.forEach(path => {
      // Find the leaf node that matches this path's concept changes
      const leafNode = findMatchingLeafNode(path);
      if (leafNode) {
        leafNode.pathId = path.id;
      }
    });
  }
  
  // Find a leaf node that matches the concept changes in a path
  function findMatchingLeafNode(path: TestPath): GraphNode | null {
    // This is a simplified matching logic
    // In a real implementation, you would need to analyze the concept changes
    // and find the corresponding node in the graph
    
    // For now, we'll just assign paths to leaf nodes in order
    const leafNodes = nodes.filter(node => !node.children || node.children.length === 0);
    const pathIndex = scenario.paths.indexOf(path);
    
    if (pathIndex >= 0 && pathIndex < leafNodes.length) {
      return leafNodes[pathIndex];
    }
    
    return null;
  }
  
  // Draw the graph
  function drawGraph() {
    if (!graphContainer) return;
    
    // Clear the container
    graphContainer.innerHTML = '';
    
    // Calculate graph dimensions
    const nodePositions = nodes.map(node => ({ x: node.x, y: node.y }));
    const minX = Math.min(...nodePositions.map(p => p.x)) - nodeRadius * 2;
    const maxX = Math.max(...nodePositions.map(p => p.x)) + nodeRadius * 2;
    const minY = Math.min(...nodePositions.map(p => p.y)) - nodeRadius * 2;
    const maxY = Math.max(...nodePositions.map(p => p.y)) + nodeRadius * 2;
    
    graphWidth = maxX - minX;
    graphHeight = maxY - minY;
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `${minX} ${minY} ${graphWidth} ${graphHeight}`);
    
    // Add zoom and pan controls
    svg.style.transform = `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`;
    
    // Add event listeners for panning
    if (isEditable) {
      svg.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // Left mouse button
          isDragging = true;
          dragStart = { x: e.clientX, y: e.clientY };
        }
      });
      
      svg.addEventListener('mousemove', (e) => {
        if (isDragging) {
          const dx = e.clientX - dragStart.x;
          const dy = e.clientY - dragStart.y;
          panOffset.x += dx / zoomLevel;
          panOffset.y += dy / zoomLevel;
          dragStart = { x: e.clientX, y: e.clientY };
          svg.style.transform = `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`;
        }
      });
      
      svg.addEventListener('mouseup', () => {
        isDragging = false;
      });
      
      svg.addEventListener('mouseleave', () => {
        isDragging = false;
      });
    }
    
    graphContainer.appendChild(svg);
    
    // Create a group for edges
    const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(edgesGroup);
    
    // Draw edges
    edges.forEach(edge => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      
      // Calculate path
      const sourceX = edge.source.x;
      const sourceY = edge.source.y;
      const targetX = edge.target.x;
      const targetY = edge.target.y;
      
      // Draw a straight line
      const pathData = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
      
      path.setAttribute('d', pathData);
      path.setAttribute('stroke', colors.edge);
      path.setAttribute('stroke-width', '2');
      path.setAttribute('fill', 'none');
      
      edgesGroup.appendChild(path);
      
      // Add edge label if it exists
      if (edge.label) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        const midX = (sourceX + targetX) / 2;
        const midY = (sourceY + targetY) / 2;
        
        text.setAttribute('x', midX.toString());
        text.setAttribute('y', midY.toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', colors.edgeText);
        text.setAttribute('font-size', '12');
        
        // Handle multi-line labels
        const lines = edge.label.split('\n');
        lines.forEach((line, i) => {
          const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          tspan.setAttribute('x', midX.toString());
          tspan.setAttribute('dy', i === 0 ? '0' : '1.2em');
          tspan.textContent = line;
          text.appendChild(tspan);
        });
        
        edgesGroup.appendChild(text);
      }
    });
    
    // Create a group for nodes
    const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(nodesGroup);
    
    // Draw nodes
    nodes.forEach(node => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('transform', `translate(${node.x}, ${node.y})`);
      
      // Create node circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', nodeRadius.toString());
      
      // Set color based on node type
      const isSelected = node.pathId === selectedPathId;
      circle.setAttribute('fill', isSelected ? colors.selected : colors[node.type]);
      
      // Add click handler if node has a path
      if (node.pathId) {
        group.style.cursor = 'pointer';
        group.addEventListener('click', () => {
          onPathSelect(node.pathId!);
        });
      }
      
      group.appendChild(circle);
      
      // Create node label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', colors.text);
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', 'bold');
      
      // Handle multi-line labels
      const lines = node.label.split('\n');
      lines.forEach((line, i) => {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', '0');
        tspan.setAttribute('dy', i === 0 ? '0' : '1.2em');
        tspan.textContent = line;
        text.appendChild(tspan);
      });
      
      group.appendChild(text);
      
      // Add "Add Descendant" button if in edit mode
      if (isEditable) {
        const addButton = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        addButton.setAttribute('cx', nodeRadius.toString());
        addButton.setAttribute('cy', '0');
        addButton.setAttribute('r', '12');
        addButton.setAttribute('fill', '#52c41a');
        addButton.setAttribute('stroke', 'white');
        addButton.setAttribute('stroke-width', '2');
        
        const plusSign = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        plusSign.setAttribute('x', nodeRadius.toString());
        plusSign.setAttribute('y', '0');
        plusSign.setAttribute('text-anchor', 'middle');
        plusSign.setAttribute('dominant-baseline', 'middle');
        plusSign.setAttribute('fill', 'white');
        plusSign.setAttribute('font-size', '16');
        plusSign.setAttribute('font-weight', 'bold');
        plusSign.textContent = '+';
        
        addButton.addEventListener('click', (e) => {
          e.stopPropagation();
          editingNode = node;
          showNodeEditor = true;
          newNodeLabel = '';
          newNodeType = 'decision';
        });
        
        group.appendChild(addButton);
        group.appendChild(plusSign);
      }
      
      nodesGroup.appendChild(group);
    });
  }
  
  // Handle node click
  function handleNodeClick(node: GraphNode) {
    if (node.pathId) {
      onPathSelect(node.pathId);
    }
  }
  
  // Add a new node as a descendant of the editing node
  function addDescendantNode() {
    if (!editingNode) return;
    
    const newNode: GraphNode = {
      id: `node-${Date.now()}`,
      label: newNodeLabel,
      type: newNodeType,
      x: editingNode.x + horizontalSpacing,
      y: editingNode.y,
      parent: editingNode,
      children: []
    };
    
    nodes.push(newNode);
    
    // Update parent's children
    if (!editingNode.children) {
      editingNode.children = [];
    }
    editingNode.children.push(newNode);
    
    // Add edge
    edges.push({
      source: editingNode,
      target: newNode
    });
    
    // Reset editing state
    showNodeEditor = false;
    editingNode = null;
    
    // Redraw the graph
    drawGraph();
  }
  
  // Zoom in
  function zoomIn() {
    zoomLevel = Math.min(zoomLevel + 0.1, 2);
    if (graphContainer) {
      const svg = graphContainer.querySelector('svg');
      if (svg) {
        svg.style.transform = `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`;
      }
    }
  }
  
  // Zoom out
  function zoomOut() {
    zoomLevel = Math.max(zoomLevel - 0.1, 0.5);
    if (graphContainer) {
      const svg = graphContainer.querySelector('svg');
      if (svg) {
        svg.style.transform = `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`;
      }
    }
  }
  
  // Reset zoom and pan
  function resetView() {
    zoomLevel = 1;
    panOffset = { x: 0, y: 0 };
    if (graphContainer) {
      const svg = graphContainer.querySelector('svg');
      if (svg) {
        svg.style.transform = `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`;
      }
    }
  }
  
  onMount(() => {
    buildGraph();
    drawGraph();
  });
  
  afterUpdate(() => {
    buildGraph();
    drawGraph();
  });
</script>

<div class="test-path-graph">
  {#if isEditable}
    <div class="graph-controls">
      <button class="zoom-button" on:click={zoomIn}>+</button>
      <button class="zoom-button" on:click={zoomOut}>-</button>
      <button class="reset-button" on:click={resetView}>Reset</button>
    </div>
  {/if}
  
  <div class="graph-container" bind:this={graphContainer}></div>
  
  {#if showNodeEditor}
    <div class="node-editor-overlay">
      <div class="node-editor">
        <h3>Add Descendant Node</h3>
        
        <div class="form-group">
          <label for="node-label">Node Label:</label>
          <input 
            type="text" 
            id="node-label" 
            bind:value={newNodeLabel} 
            placeholder="Enter node label"
          />
        </div>
        
        <div class="form-group">
          <label for="node-type">Node Type:</label>
          <select id="node-type" bind:value={newNodeType}>
            <option value="decision">Decision</option>
            <option value="npo">NPO</option>
            <option value="not-npo">NOT NPO</option>
            <option value="level">Level</option>
          </select>
        </div>
        
        <div class="form-actions">
          <button class="cancel-button" on:click={() => showNodeEditor = false}>
            Cancel
          </button>
          <button 
            class="add-button" 
            on:click={addDescendantNode} 
            disabled={!newNodeLabel.trim()}
          >
            Add Node
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .test-path-graph {
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: #f9f9f9;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    position: relative;
  }
  
  .graph-container {
    width: 100%;
    height: 500px;
    min-height: 500px;
  }
  
  .graph-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
    display: flex;
    gap: 5px;
  }
  
  .zoom-button, .reset-button {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: white;
    border: 1px solid #d9d9d9;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .reset-button {
    width: auto;
    border-radius: 15px;
    padding: 0 10px;
  }
  
  .node-editor-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .node-editor {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    width: 400px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .node-editor h3 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: #333;
  }
  
  .form-group input,
  .form-group select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  
  .cancel-button {
    padding: 8px 16px;
    background-color: white;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .add-button {
    padding: 8px 16px;
    background-color: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .add-button:disabled {
    background-color: #d9d9d9;
    cursor: not-allowed;
  }
</style> 