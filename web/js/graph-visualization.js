/**
 * Synthetica Interactive Insight Canvas
 * ===================================== 
 * 
 * Beautiful D3.js visualization of the knowledge graph with interactive
 * exploration, domain-colored clustering, and real-time animations.
 */

class InteractiveInsightCanvas {
    constructor(containerId, knowledgeGraph) {
        this.container = d3.select(`#${containerId}`);
        this.kg = knowledgeGraph;
        
        // Visualization settings
        this.width = 800;
        this.height = 600;
        this.nodeRadius = {
            min: 8,
            max: 20,
            default: 12
        };
        
        // Domain color scheme
        this.domainColors = {
            'technology': '#667eea',
            'biology': '#48bb78',  
            'art': '#ed64a6',
            'science': '#4299e1',
            'philosophy': '#9f7aea',
            'mathematics': '#f56500',
            'psychology': '#38b2ac',
            'economics': '#d69e2e',
            'general': '#718096'
        };
        
        // D3 force simulation
        this.simulation = null;
        this.svg = null;
        this.links = null;
        this.nodes = null;
        
        // Interaction state
        this.selectedNode = null;
        this.hoveredNode = null;
        
        this.initVisualization();
    }
    
    initVisualization() {
        // Clear container
        this.container.html('');
        
        // Create SVG
        this.svg = this.container
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .style('background', 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)');
        
        // Create groups for different elements
        this.linksGroup = this.svg.append('g').attr('class', 'links');
        this.nodesGroup = this.svg.append('g').attr('class', 'nodes');
        this.labelsGroup = this.svg.append('g').attr('class', 'labels');
        
        // Add zoom and pan behavior
        const zoom = d3.zoom()
            .scaleExtent([0.3, 3])
            .on('zoom', (event) => {
                this.svg.selectAll('g').attr('transform', event.transform);
            });
        
        this.svg.call(zoom);
        
        // Initialize force simulation
        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id).distance(80).strength(0.5))
            .force('charge', d3.forceManyBody().strength(-200))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide().radius(d => this.getNodeRadius(d) + 5));
    }
    
    update() {
        const graphData = this.prepareGraphData();
        
        this.updateLinks(graphData.links);
        this.updateNodes(graphData.nodes);
        this.updateLabels(graphData.nodes);
        
        // Restart simulation
        this.simulation
            .nodes(graphData.nodes)
            .on('tick', () => this.ticked());
        
        this.simulation
            .force('link')
            .links(graphData.links);
        
        this.simulation.alpha(1).restart();
    }
    
    prepareGraphData() {
        // Convert knowledge graph to D3-compatible format
        const nodes = Array.from(this.kg.nodes.values()).map(node => ({
            id: node.id,
            title: node.title,
            domain: node.domain,
            content: node.content,
            tags: node.tags,
            connectionCount: this.getConnectionCount(node.id)
        }));
        
        const links = this.kg.connections.map(conn => ({
            source: conn.source_id,
            target: conn.target_id,
            strength: conn.strength,
            type: conn.connection_type,
            explanation: conn.explanation,
            shared_bridges: conn.shared_bridges || []
        }));
        
        return { nodes, links };
    }
    
    updateLinks(linksData) {
        this.links = this.linksGroup
            .selectAll('.link')
            .data(linksData, d => `${d.source.id || d.source}-${d.target.id || d.target}`);
        
        // Remove old links
        this.links.exit()
            .transition()
            .duration(300)
            .style('opacity', 0)
            .remove();
        
        // Add new links
        const linkEnter = this.links.enter()
            .append('line')
            .attr('class', 'link')
            .style('opacity', 0);
        
        // Merge and update all links
        this.links = linkEnter.merge(this.links);
        
        this.links
            .transition()
            .duration(500)
            .style('opacity', 0.6)
            .attr('stroke', d => this.getLinkColor(d))
            .attr('stroke-width', d => Math.max(1, d.strength * 4))
            .attr('stroke-dasharray', d => d.type.includes('cross_domain') ? '5,5' : 'none');
        
        // Add hover effects to links
        this.links
            .on('mouseover', (event, d) => this.onLinkHover(event, d))
            .on('mouseout', (event, d) => this.onLinkHoverEnd(event, d));
    }
    
    updateNodes(nodesData) {
        this.nodes = this.nodesGroup
            .selectAll('.node')
            .data(nodesData, d => d.id);
        
        // Remove old nodes
        this.nodes.exit()
            .transition()
            .duration(300)
            .attr('r', 0)
            .style('opacity', 0)
            .remove();
        
        // Add new nodes
        const nodeEnter = this.nodes.enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', 0)
            .style('opacity', 0)
            .call(this.setupNodeDrag());
        
        // Merge and update all nodes
        this.nodes = nodeEnter.merge(this.nodes);
        
        this.nodes
            .transition()
            .duration(500)
            .attr('r', d => this.getNodeRadius(d))
            .style('opacity', 1)
            .attr('fill', d => this.domainColors[d.domain] || this.domainColors.general)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);
        
        // Add interactions
        this.nodes
            .on('click', (event, d) => this.onNodeClick(event, d))
            .on('mouseover', (event, d) => this.onNodeHover(event, d))
            .on('mouseout', (event, d) => this.onNodeHoverEnd(event, d));
    }
    
    updateLabels(nodesData) {
        this.labels = this.labelsGroup
            .selectAll('.label')
            .data(nodesData, d => d.id);
        
        // Remove old labels
        this.labels.exit().remove();
        
        // Add new labels
        const labelEnter = this.labels.enter()
            .append('text')
            .attr('class', 'label')
            .style('opacity', 0);
        
        // Merge and update all labels
        this.labels = labelEnter.merge(this.labels);
        
        this.labels
            .transition()
            .duration(500)
            .style('opacity', 1)
            .text(d => d.title)
            .attr('text-anchor', 'middle')
            .attr('font-family', 'system-ui, sans-serif')
            .attr('font-size', '12px')
            .attr('font-weight', '500')
            .attr('fill', '#4a5568')
            .attr('dy', d => this.getNodeRadius(d) + 16)
            .style('pointer-events', 'none');
    }
    
    ticked() {
        if (this.links) {
            this.links
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
        }
        
        if (this.nodes) {
            this.nodes
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        }
        
        if (this.labels) {
            this.labels
                .attr('x', d => d.x)
                .attr('y', d => d.y);
        }
    }
    
    setupNodeDrag() {
        return d3.drag()
            .on('start', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });
    }
    
    onNodeClick(event, node) {
        if (this.selectedNode === node) {
            // Deselect
            this.selectedNode = null;
            this.highlightConnections(null);
            this.showNodeDetails(null);
        } else {
            // Select new node
            this.selectedNode = node;
            this.highlightConnections(node);
            this.showNodeDetails(node);
        }
        
        event.stopPropagation();
    }
    
    onNodeHover(event, node) {
        this.hoveredNode = node;
        
        // Increase node size
        d3.select(event.target)
            .transition()
            .duration(200)
            .attr('r', this.getNodeRadius(node) * 1.3)
            .attr('stroke-width', 3);
        
        // Show tooltip
        this.showTooltip(event, node);
    }
    
    onNodeHoverEnd(event, node) {
        this.hoveredNode = null;
        
        // Reset node size
        d3.select(event.target)
            .transition()
            .duration(200)
            .attr('r', this.getNodeRadius(node))
            .attr('stroke-width', 2);
        
        // Hide tooltip
        this.hideTooltip();
    }
    
    onLinkHover(event, link) {
        // Highlight the connection
        d3.select(event.target)
            .transition()
            .duration(200)
            .style('opacity', 1)
            .attr('stroke-width', Math.max(3, link.strength * 6));
        
        // Show connection details
        this.showConnectionTooltip(event, link);
    }
    
    onLinkHoverEnd(event, link) {
        d3.select(event.target)
            .transition()
            .duration(200)
            .style('opacity', 0.6)
            .attr('stroke-width', Math.max(1, link.strength * 4));
        
        this.hideTooltip();
    }
    
    highlightConnections(centerNode) {
        if (!centerNode) {
            // Reset all highlighting
            this.links.style('opacity', 0.6);
            this.nodes.style('opacity', 1);
            return;
        }
        
        // Dim all elements first
        this.links.style('opacity', 0.1);
        this.nodes.style('opacity', 0.3);
        
        // Highlight center node
        this.nodes.filter(d => d.id === centerNode.id).style('opacity', 1);
        
        // Highlight connected nodes and links
        this.links
            .filter(d => d.source.id === centerNode.id || d.target.id === centerNode.id)
            .style('opacity', 0.9);
        
        this.nodes
            .filter(d => {
                return this.kg.connections.some(conn => 
                    (conn.source_id === centerNode.id && conn.target_id === d.id) ||
                    (conn.target_id === centerNode.id && conn.source_id === d.id)
                );
            })
            .style('opacity', 1);
    }
    
    getNodeRadius(node) {
        // Base radius on connection count for importance
        const baseRadius = this.nodeRadius.default;
        const connectionBonus = Math.min(8, node.connectionCount * 2);
        return baseRadius + connectionBonus;
    }
    
    getConnectionCount(nodeId) {
        return this.kg.connections.filter(conn => 
            conn.source_id === nodeId || conn.target_id === nodeId
        ).length;
    }
    
    getLinkColor(link) {
        if (link.type.includes('cross_domain')) {
            return '#e53e3e'; // Red for cross-domain connections
        } else if (link.shared_bridges && link.shared_bridges.length > 0) {
            return '#38a169'; // Green for metaphorical bridges
        } else {
            return '#a0aec0'; // Gray for regular connections
        }
    }
    
    showTooltip(event, node) {
        // Implementation for showing node tooltip
        console.log('Show tooltip for:', node.title);
    }
    
    showConnectionTooltip(event, link) {
        // Implementation for showing connection tooltip  
        console.log('Show connection tooltip:', link.explanation);
    }
    
    hideTooltip() {
        // Implementation for hiding tooltip
    }
    
    showNodeDetails(node) {
        // Emit event for external detail panel
        const event = new CustomEvent('nodeSelected', { detail: node });
        document.dispatchEvent(event);
    }
    
    // Public methods for external control
    focusNode(nodeId) {
        const node = this.nodes.data().find(d => d.id === nodeId);
        if (node) {
            this.onNodeClick({stopPropagation: () => {}}, node);
        }
    }
    
    addNodeToVisualization(node) {
        // Add node to knowledge graph and update visualization
        this.kg.addNode(node.title, node.content, node.domain, node.tags);
        this.update();
    }
    
    resize() {
        const rect = this.container.node().getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        
        this.svg
            .attr('viewBox', `0 0 ${this.width} ${this.height}`);
        
        this.simulation
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .restart();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined') {
    module.exports = InteractiveInsightCanvas;
}

// For browser environments
if (typeof window !== 'undefined') {
    window.InteractiveInsightCanvas = InteractiveInsightCanvas;
}