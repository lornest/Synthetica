/**
 * D3.js Network Visualization for Synthetica
 * ==========================================
 * 
 * Proper force-directed graph visualization with interactive features
 */

class D3NetworkGraph {
    constructor(containerId) {
        console.log('D3NetworkGraph constructor called with:', containerId);
        
        if (typeof d3 === 'undefined') {
            throw new Error('D3.js is not loaded');
        }
        
        const element = document.getElementById(containerId);
        if (!element) {
            throw new Error(`Element with id '${containerId}' not found`);
        }
        
        // Clear any existing content first - this might be the issue!
        element.innerHTML = '';
        console.log('Cleared existing HTML content from container');
        
        this.container = d3.select(`#${containerId}`);
        console.log('D3 container selected:', this.container.node());
        console.log('Container empty?', this.container.empty());
        this.width = 800;
        this.height = 600;
        
        // Create SVG
        console.log('About to create SVG...');
        console.log('Container node before SVG:', this.container.node());
        
        this.svg = this.container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .style('background', 'rgba(255,0,0,0.1)'); // Red tint to see SVG area
            
        console.log('SVG created:', this.svg.node());
        console.log('SVG empty?', this.svg.empty());
        console.log('Container after SVG:', this.container.node().innerHTML);
        
        // Create groups for links and nodes
        this.linkGroup = this.svg.append('g').attr('class', 'links');
        this.nodeGroup = this.svg.append('g').attr('class', 'nodes');
        
        // Create force simulation
        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id).distance(120))
            .force('charge', d3.forceManyBody().strength(-400))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide().radius(35));
        
        this.nodes = [];
        this.links = [];
        
        // Domain colors
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
    }
    
    updateData(nodes, connections) {
        console.log('D3NetworkGraph.updateData called with:', nodes.length, 'nodes,', connections.length, 'connections');
        
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
        
        console.log('Mapped nodes:', this.nodes.length);
        console.log('Mapped links:', this.links.length);
        
        this.render();
    }
    
    isCrossDomain(connection, nodes) {
        const source = nodes.find(n => n.id === connection.source_id);
        const target = nodes.find(n => n.id === connection.target_id);
        return source && target && source.domain !== target.domain;
    }
    
    render() {
        console.log('D3NetworkGraph.render called');
        console.log('SVG element:', this.svg.node());
        console.log('Container dimensions:', this.container.node()?.getBoundingClientRect());
        
        // Clear existing elements
        this.linkGroup.selectAll('*').remove();
        this.nodeGroup.selectAll('*').remove();
        
        // Always add test elements to see if SVG is working
        console.log('Adding test elements...');
        
        const testCircle = this.svg.append('circle')
            .attr('cx', 100)
            .attr('cy', 100)
            .attr('r', 30)
            .attr('fill', 'red')
            .attr('stroke', 'black')
            .attr('stroke-width', 3);
            
        const testText = this.svg.append('text')
            .attr('x', 100)
            .attr('y', 200)
            .attr('text-anchor', 'middle')
            .attr('fill', 'blue')
            .style('font-size', '20px')
            .style('font-weight', 'bold')
            .text(`TEST: ${this.nodes.length} nodes, ${this.links.length} links`);
            
        console.log('Test circle created:', testCircle.node());
        console.log('Test text created:', testText.node());
        
        // Also try direct DOM manipulation as a backup test
        const element = document.getElementById('visualization');
        if (element) {
            const directDiv = document.createElement('div');
            directDiv.innerHTML = '<div style="color: red; font-size: 20px; padding: 20px; background: yellow;">DIRECT DOM TEST - If you see this, DOM works</div>';
            element.appendChild(directDiv);
            console.log('Direct DOM element added');
        }
            
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
        
        // Create links
        const link = this.linkGroup
            .selectAll('line')
            .data(this.links)
            .enter().append('line')
            .attr('stroke', d => d.crossDomain ? '#e53e3e' : '#999')
            .attr('stroke-width', d => Math.max(1, d.strength * 6))
            .attr('stroke-opacity', 0.7)
            .attr('stroke-dasharray', d => d.type === 'conceptual_bridge' ? '5,5' : null);
        
        // Create node groups
        const nodeGroups = this.nodeGroup
            .selectAll('g')
            .data(this.nodes)
            .enter().append('g')
            .attr('class', 'node-group')
            .call(d3.drag()
                .on('start', (event, d) => this.dragstarted(event, d))
                .on('drag', (event, d) => this.dragged(event, d))
                .on('end', (event, d) => this.dragended(event, d)));
        
        // Add circles
        nodeGroups.append('circle')
            .attr('r', 30)
            .attr('fill', d => this.domainColors[d.domain] || '#718096')
            .attr('stroke', '#fff')
            .attr('stroke-width', 3)
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                if (window.selectNode) {
                    window.selectNode(d.id);
                }
            })
            .on('mouseover', function(event, d) {
                d3.select(this).attr('r', 35);
            })
            .on('mouseout', function(event, d) {
                d3.select(this).attr('r', 30);
            });
        
        // Add content type icons
        nodeGroups.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .style('font-size', '18px')
            .style('cursor', 'pointer')
            .text(d => this.getContentTypeIcon(d.contentType))
            .on('click', (event, d) => {
                if (window.selectNode) {
                    window.selectNode(d.id);
                }
            });
        
        // Add labels
        nodeGroups.append('text')
            .attr('dy', -40)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#4a5568')
            .style('font-weight', 'bold')
            .style('pointer-events', 'none')
            .text(d => d.title.length > 16 ? d.title.substring(0, 16) + '...' : d.title);
        
        // Update simulation
        this.simulation
            .nodes(this.nodes)
            .on('tick', () => this.ticked());
        
        this.simulation.force('link')
            .links(this.links);
        
        this.simulation.alpha(1).restart();
        
        // Store references for tick function
        this.linkElements = link;
        this.nodeElements = nodeGroups;
    }
    
    getContentTypeIcon(contentType) {
        switch(contentType) {
            case 'code': return '💻';
            case 'link': return '🔗';
            case 'image': return '🖼️';
            case 'audio': return '🎵';
            case 'markdown': return '📖';
            default: return '📝';
        }
    }
    
    ticked() {
        this.linkElements
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        this.nodeElements
            .attr('transform', d => `translate(${d.x},${d.y})`);
    }
    
    dragstarted(event, d) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    dragended(event, d) {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    
    highlightNode(nodeId) {
        this.nodeElements.select('circle')
            .attr('stroke', d => d.id === nodeId ? '#ffd700' : '#fff')
            .attr('stroke-width', d => d.id === nodeId ? 4 : 3);
    }
    
    reset() {
        this.simulation.alpha(1).restart();
    }
}

if (typeof window !== 'undefined') {
    window.D3NetworkGraph = D3NetworkGraph;
}