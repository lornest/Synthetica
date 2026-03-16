/**
 * Enhanced Knowledge Graph with Multi-Format Content and Versioning
 * ================================================================
 * 
 * Complete Phase 1 implementation with multi-format content support,
 * version control for idea evolution, and advanced AI discovery.
 */

// Import our Phase 1 components
let AdvancedSimilarityEngine, ContentProcessor, IdeaVersioning;

try {
    AdvancedSimilarityEngine = require('./advanced_similarity.js');
    ContentProcessor = require('./content-processor.js');  
    IdeaVersioning = require('./idea-versioning.js');
} catch (error) {
    console.log('Warning: Could not load Phase 1 modules:', error.message);
    // Fallback implementations for basic functionality
}

class EnhancedKnowledgeGraph {
    constructor() {
        this.nodes = new Map();
        this.connections = [];
        
        // Phase 1 core systems
        this.similarityEngine = new AdvancedSimilarityEngine();
        this.contentProcessor = new ContentProcessor();
        this.versioning = new IdeaVersioning();
        
        // Storage and persistence
        this.lastSaved = null;
        this.autoSave = true;
        
        // Event system for real-time updates
        this.eventListeners = new Map();
    }
    
    /**
     * Add a knowledge node with multi-format content support
     */
    addNode(title, content, domain, tags = [], contentType = 'text', metadata = {}) {
        // Process content based on its type
        const processedContent = this.contentProcessor.processContent(content, contentType, metadata);
        
        // Create node with enhanced data
        const node = {
            id: this.generateNodeId(),
            title: title,
            content: content,
            processedContent: processedContent,
            domain: domain,
            tags: [...tags, ...processedContent.extractedConcepts.slice(0, 10)], // Merge tags with extracted concepts
            contentType: contentType,
            metadata: metadata,
            created_at: new Date(),
            updated_at: new Date()
        };
        
        // Initialize versioning
        this.versioning.initializeNode(node);
        
        // Add to graph
        this.nodes.set(node.id, node);
        
        // Discover connections using enhanced similarity
        this._discoverAdvancedConnections(node);
        
        // Emit events
        this.emit('nodeAdded', { node, connections: this.getNodeConnections(node.id) });
        
        // Auto-save if enabled
        if (this.autoSave) {
            this.save();
        }
        
        return node;
    }
    
    /**
     * Update a knowledge node and track version history
     */
    updateNode(nodeId, updates, changeDescription) {
        const existingNode = this.nodes.get(nodeId);
        if (!existingNode) {
            throw new Error(`Node ${nodeId} not found`);
        }
        
        // Process updated content if content changed
        let processedContent = existingNode.processedContent;
        if (updates.content && updates.content !== existingNode.content) {
            processedContent = this.contentProcessor.processContent(
                updates.content, 
                updates.contentType || existingNode.contentType,
                updates.metadata || existingNode.metadata
            );
        }
        
        // Update node
        const updatedNode = {
            ...existingNode,
            ...updates,
            processedContent: processedContent,
            updated_at: new Date()
        };
        
        // Update tags with new extracted concepts if content changed
        if (processedContent !== existingNode.processedContent) {
            updatedNode.tags = [
                ...new Set([
                    ...(updates.tags || existingNode.tags),
                    ...processedContent.extractedConcepts.slice(0, 10)
                ])
            ];
        }
        
        // Create version in history
        this.versioning.updateNode(nodeId, updatedNode, changeDescription);
        
        // Update in graph
        this.nodes.set(nodeId, updatedNode);
        
        // Re-discover connections
        this._updateConnections(nodeId);
        
        // Emit events
        this.emit('nodeUpdated', { 
            nodeId, 
            node: updatedNode, 
            changes: updates,
            connections: this.getNodeConnections(nodeId)
        });
        
        // Auto-save
        if (this.autoSave) {
            this.save();
        }
        
        return updatedNode;
    }
    
    /**
     * Create a branch for experimental idea development
     */
    createBranch(nodeId, branchName, description) {
        return this.versioning.createBranch(nodeId, branchName, description);
    }
    
    /**
     * Update a node on a specific branch
     */
    updateBranch(nodeId, branchName, updates, changeDescription) {
        const version = this.versioning.updateBranch(nodeId, branchName, updates, changeDescription);
        
        // Emit branch update event
        this.emit('branchUpdated', { nodeId, branchName, version });
        
        return version;
    }
    
    /**
     * Merge branch back into main
     */
    mergeBranch(nodeId, branchName, mergeStrategy = 'auto') {
        const mergeVersion = this.versioning.mergeBranch(nodeId, branchName, mergeStrategy);
        
        // Update main node with merged state
        const mergedNode = { ...mergeVersion.nodeState, updated_at: new Date() };
        this.nodes.set(nodeId, mergedNode);
        
        // Re-discover connections for merged content
        this._updateConnections(nodeId);
        
        // Emit merge event
        this.emit('branchMerged', { nodeId, branchName, mergeVersion });
        
        return mergeVersion;
    }
    
    /**
     * Add different content types to existing nodes
     */
    addContentToNode(nodeId, content, contentType, metadata = {}) {
        const node = this.nodes.get(nodeId);
        if (!node) {
            throw new Error(`Node ${nodeId} not found`);
        }
        
        // Initialize multi-content array if it doesn't exist
        if (!node.multiContent) {
            node.multiContent = [];
        }
        
        // Process the additional content
        const processedContent = this.contentProcessor.processContent(content, contentType, metadata);
        
        // Add to node's multi-content
        const contentEntry = {
            id: this.generateContentId(),
            content: content,
            contentType: contentType,
            processedContent: processedContent,
            metadata: metadata,
            addedAt: new Date()
        };
        
        node.multiContent.push(contentEntry);
        
        // Merge extracted concepts into node tags
        const newConcepts = processedContent.extractedConcepts.slice(0, 5);
        node.tags = [...new Set([...node.tags, ...newConcepts])];
        
        // Update the node with versioning
        return this.updateNode(nodeId, node, `Added ${contentType} content`);
    }
    
    /**
     * Get version history for a node
     */
    getNodeHistory(nodeId, branchName = null) {
        return this.versioning.getVersionHistory(nodeId, branchName);
    }
    
    /**
     * Get evolution timeline for visualization
     */
    getNodeEvolution(nodeId) {
        const timeline = this.versioning.getEvolutionTimeline(nodeId);
        const node = this.nodes.get(nodeId);
        
        return {
            ...timeline,
            currentNode: node,
            connectionEvolution: this._analyzeConnectionEvolution(nodeId)
        };
    }
    
    /**
     * Compare two versions of a node
     */
    compareNodeVersions(nodeId, versionId1, versionId2) {
        return this.versioning.compareVersions(nodeId, versionId1, versionId2);
    }
    
    /**
     * Get enhanced statistics including version and content type data
     */
    getStats() {
        const basicStats = this._getBasicStats();
        
        // Add versioning statistics
        let totalVersions = 0;
        let nodesByContentType = {};
        let branchCount = 0;
        
        for (const [nodeId, node] of this.nodes) {
            const history = this.versioning.getVersionHistory(nodeId);
            totalVersions += history.length;
            
            // Count by content type
            const contentType = node.contentType || 'text';
            nodesByContentType[contentType] = (nodesByContentType[contentType] || 0) + 1;
            
            // Count branches
            const branches = this.versioning.branches.get(nodeId);
            if (branches) {
                branchCount += Object.keys(branches).length - 1; // Exclude 'main'
            }
        }
        
        return {
            ...basicStats,
            versioning: {
                totalVersions: totalVersions,
                averageVersionsPerNode: totalVersions / this.nodes.size,
                totalBranches: branchCount
            },
            contentTypes: nodesByContentType,
            multiContentNodes: Array.from(this.nodes.values())
                .filter(node => node.multiContent && node.multiContent.length > 0).length
        };
    }
    
    /**
     * Search nodes with enhanced content processing
     */
    searchNodes(query, options = {}) {
        const results = [];
        const searchTerms = query.toLowerCase().split(/\s+/);
        
        for (const [nodeId, node] of this.nodes) {
            let relevanceScore = 0;
            const matches = [];
            
            // Search in title
            if (node.title.toLowerCase().includes(query.toLowerCase())) {
                relevanceScore += 10;
                matches.push({ field: 'title', snippet: node.title });
            }
            
            // Search in content
            if (node.content.toLowerCase().includes(query.toLowerCase())) {
                relevanceScore += 5;
                matches.push({ field: 'content', snippet: this._getSnippet(node.content, query) });
            }
            
            // Search in processed content concepts
            const conceptMatches = node.processedContent.extractedConcepts
                .filter(concept => searchTerms.some(term => concept.includes(term)));
            if (conceptMatches.length > 0) {
                relevanceScore += conceptMatches.length * 2;
                matches.push({ field: 'concepts', snippet: conceptMatches.join(', ') });
            }
            
            // Search in tags
            const tagMatches = node.tags.filter(tag => 
                searchTerms.some(term => tag.toLowerCase().includes(term))
            );
            if (tagMatches.length > 0) {
                relevanceScore += tagMatches.length * 3;
                matches.push({ field: 'tags', snippet: tagMatches.join(', ') });
            }
            
            // Search in multi-content if exists
            if (node.multiContent) {
                for (const contentEntry of node.multiContent) {
                    if (contentEntry.content.toLowerCase().includes(query.toLowerCase())) {
                        relevanceScore += 3;
                        matches.push({ 
                            field: `${contentEntry.contentType}-content`, 
                            snippet: this._getSnippet(contentEntry.content, query) 
                        });
                    }
                }
            }
            
            if (relevanceScore > 0) {
                results.push({
                    node: node,
                    relevanceScore: relevanceScore,
                    matches: matches
                });
            }
        }
        
        // Sort by relevance
        results.sort((a, b) => b.relevanceScore - a.relevanceScore);
        
        return results.slice(0, options.limit || 20);
    }
    
    /**
     * Export enhanced data including versions and multi-content
     */
    exportData(options = {}) {
        const exportData = {
            metadata: {
                exportedAt: new Date(),
                version: '2.0',
                includeVersions: options.includeVersions !== false,
                includeConnections: options.includeConnections !== false
            },
            stats: this.getStats()
        };
        
        // Export nodes with full data
        exportData.nodes = Array.from(this.nodes.values()).map(node => ({
            ...node,
            versionHistory: options.includeVersions ? this.getNodeHistory(node.id) : undefined,
            evolution: options.includeVersions ? this.getNodeEvolution(node.id) : undefined
        }));
        
        // Export connections
        if (options.includeConnections !== false) {
            exportData.connections = this.connections;
        }
        
        return exportData;
    }
    
    // Private methods
    
    _getBasicStats() {
        const domains = {};
        const connectionTypes = {};
        
        for (const node of this.nodes.values()) {
            domains[node.domain] = (domains[node.domain] || 0) + 1;
        }
        
        for (const connection of this.connections) {
            connectionTypes[connection.connection_type] = (connectionTypes[connection.connection_type] || 0) + 1;
        }
        
        const crossDomainConnections = this.connections.filter(c => {
            const source = this.nodes.get(c.source_id);
            const target = this.nodes.get(c.target_id);
            return source && target && source.domain !== target.domain;
        }).length;
        
        return {
            total_nodes: this.nodes.size,
            total_connections: this.connections.length,
            domains: domains,
            connection_types: connectionTypes,
            cross_domain_connections: crossDomainConnections
        };
    }
    
    _discoverAdvancedConnections(newNode) {
        for (const [existingId, existingNode] of this.nodes) {
            if (existingId === newNode.id) continue;
            
            const analysis = this.similarityEngine.calculateSemanticSimilarity(newNode, existingNode);
            
            if (analysis.similarity > 0.2) {
                const connectionType = this.similarityEngine.determineConnectionType(
                    newNode, existingNode, analysis
                );
                
                const explanation = this.similarityEngine.explainConnection(
                    newNode, existingNode, connectionType, analysis
                );
                
                const connection = {
                    source_id: newNode.id,
                    target_id: existingId,
                    connection_type: connectionType,
                    strength: analysis.similarity,
                    discovered_by: "enhanced_ai_v2",
                    explanation: explanation,
                    analysis_details: analysis.factors,
                    shared_bridges: analysis.shared_bridges,
                    created_at: new Date()
                };
                
                this.connections.push(connection);
            }
        }
    }
    
    _updateConnections(nodeId) {
        // Remove existing connections for this node
        this.connections = this.connections.filter(c => 
            c.source_id !== nodeId && c.target_id !== nodeId
        );
        
        // Re-discover connections
        const node = this.nodes.get(nodeId);
        if (node) {
            this._discoverAdvancedConnections(node);
            
            // Track connection evolution
            this.versioning.trackConnectionEvolution(nodeId, this.getNodeConnections(nodeId));
        }
    }
    
    _analyzeConnectionEvolution(nodeId) {
        const currentVersion = this.versioning.getCurrentVersion(nodeId);
        if (!currentVersion || !currentVersion.nodeState.connectionEvolution) {
            return [];
        }
        
        return currentVersion.nodeState.connectionEvolution;
    }
    
    _getSnippet(text, query, maxLength = 100) {
        const index = text.toLowerCase().indexOf(query.toLowerCase());
        if (index === -1) return text.substring(0, maxLength) + '...';
        
        const start = Math.max(0, index - 30);
        const end = Math.min(text.length, index + query.length + 30);
        
        return (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
    }
    
    generateNodeId() {
        return `node_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }
    
    generateContentId() {
        return `content_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }
    
    getNodeConnections(nodeId) {
        return this.connections.filter(c => c.source_id === nodeId || c.target_id === nodeId);
    }
    
    findCrossDomainInsights() {
        const insights = [];
        
        for (const connection of this.connections) {
            const sourceNode = this.nodes.get(connection.source_id);
            const targetNode = this.nodes.get(connection.target_id);
            
            if (sourceNode && targetNode && sourceNode.domain !== targetNode.domain) {
                insights.push([sourceNode, targetNode, connection]);
            }
        }
        
        insights.sort((a, b) => b[2].strength - a[2].strength);
        return insights;
    }
    
    getNovelCombinations(nodeId) {
        return this.similarityEngine.suggestNovelCombinations(this, nodeId);
    }
    
    // Event system
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }
    
    emit(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => callback(data));
        }
    }
    
    save() {
        this.lastSaved = new Date();
        // In a full implementation, this would persist to storage
        return true;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined') {
    module.exports = EnhancedKnowledgeGraph;
}

// For browser environments
if (typeof window !== 'undefined') {
    window.EnhancedKnowledgeGraph = EnhancedKnowledgeGraph;
}