/**
 * D3.js Network Visualization for Synthetica
 * ==========================================
 * 
 * Proper force-directed graph visualization with interactive features
 */

class D3NetworkGraph {
    constructor(containerId) {
        if (typeof d3 === 'undefined') {
            throw new Error('D3.js is not loaded');
        }
        
        const element = document.getElementById(containerId);
        if (!element) {
            throw new Error(`Element with id '${containerId}' not found`);
        }
        
        // Clear any existing content first
        element.innerHTML = '';
        this.container = d3.select(`#${containerId}`);
        
        // Set up dimensions
        this.width = 800;
        this.height = 600;
        this.nodes = [];
        this.links = [];
        
        // Create SVG
        this.svg = this.container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .style('background', 'transparent');
        
        // Create groups for links and nodes
        this.linkGroup = this.svg.append('g').attr('class', 'links');
        this.nodeGroup = this.svg.append('g').attr('class', 'nodes');
        
        // Define domain colors
        this.domainColors = {
            'technology': '#4299e1',
            'biology': '#48bb78',
            'history': '#ed8936',
            'art': '#9f7aea',
            'science': '#4299e1',
            'philosophy': '#9f7aea',
            'mathematics': '#f56500',
            'psychology': '#38b2ac',
            'economics': '#d69e2e',
            'general': '#718096'
        };
    }
    
    updateData(nodes, connections) {
        this.nodes = nodes.map(node => ({
            ...node,
            x: node.x || Math.random() * this.width,
            y: node.y || Math.random() * this.height
        }));
        
        this.links = connections.map(conn => ({
            source: conn.source_id,
            target: conn.target_id,
            strength: conn.strength,
            type: conn.connection_type,
            explanation: conn.explanation,
            bridges: conn.shared_bridges,
            crossDomain: this.isCrossDomain(conn, nodes)
        }));
        
        this.render();
    }
    
    render() {
        // Clear existing elements
        this.linkGroup.selectAll('*').remove();
        this.nodeGroup.selectAll('*').remove();
        
        if (this.nodes.length === 0) {
            this.svg.append('text')
                .attr('x', this.width / 2)
                .attr('y', this.height / 2)
                .attr('text-anchor', 'middle')
                .attr('fill', '#718096')
                .style('font-size', '1.25rem')
                .text('🌱 Add knowledge nodes and watch connections grow!');
            return;
        }
        
        // Draw links
        const links = this.linkGroup.selectAll('line')
            .data(this.links)
            .enter()
            .append('line')
            .attr('stroke', d => d.crossDomain ? '#e53e3e' : '#cbd5e0')
            .attr('stroke-width', d => Math.max(1, d.strength * 10))
            .attr('stroke-opacity', 0.6)
            .attr('x1', d => {
                const source = this.nodes.find(n => n.id === d.source);
                return source ? source.x : 0;
            })
            .attr('y1', d => {
                const source = this.nodes.find(n => n.id === d.source);
                return source ? source.y : 0;
            })
            .attr('x2', d => {
                const target = this.nodes.find(n => n.id === d.target);
                return target ? target.x : 0;
            })
            .attr('y2', d => {
                const target = this.nodes.find(n => n.id === d.target);
                return target ? target.y : 0;
            });
        
        // Draw nodes
        const nodes = this.nodeGroup.selectAll('circle')
            .data(this.nodes)
            .enter()
            .append('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 20)
            .attr('fill', d => this.domainColors[d.domain] || this.domainColors.general)
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer');
        
        // Add node labels
        const labels = this.nodeGroup.selectAll('text')
            .data(this.nodes)
            .enter()
            .append('text')
            .attr('x', d => d.x)
            .attr('y', d => d.y + 35)
            .attr('text-anchor', 'middle')
            .attr('fill', '#2d3748')
            .style('font-size', '0.75rem')
            .style('font-weight', '500')
            .text(d => d.title.length > 15 ? d.title.substring(0, 15) + '...' : d.title);
        
        // Add tooltips
        nodes.append('title')
            .text(d => `${d.title}\nDomain: ${d.domain}\nConnections: ${this.links.filter(l => l.source === d.id || l.target === d.id).length}`);
    }
    
    isCrossDomain(connection, nodes) {
        const sourceNode = nodes.find(n => n.id === connection.source_id);
        const targetNode = nodes.find(n => n.id === connection.target_id);
        return sourceNode && targetNode && sourceNode.domain !== targetNode.domain;
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.D3NetworkGraph = D3NetworkGraph;
}