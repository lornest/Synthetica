/**
 * Consolidated Knowledge Graph for Synthetica
 * Merges EnhancedKnowledgeGraph + Phase1KnowledgeGraph into a single ES module.
 * Adds deleteNode() method.
 */

import AdvancedSimilarityEngine from './advanced-similarity.js'
import ContentProcessor from './content-processor.js'
import IdeaVersioning from './idea-versioning.js'

class KnowledgeGraph {
    constructor() {
        this.nodes = new Map();
        this.connections = [];
        this.similarityEngine = new AdvancedSimilarityEngine();
        this.contentProcessor = new ContentProcessor();
        this.versioning = new IdeaVersioning();
        this.eventListeners = new Map();
    }

    addNode(title, content, domain, tags = [], contentType = 'text', metadata = {}) {
        const processedContent = this.contentProcessor.processContent(content, contentType, metadata);

        const node = {
            id: this._generateId(),
            title,
            content,
            processedContent,
            domain,
            tags: [...(Array.isArray(tags) ? tags : []), ...processedContent.extractedConcepts.slice(0, 5)],
            contentType,
            metadata,
            created_at: new Date(),
            updated_at: new Date()
        };

        this.versioning.initializeNode(node);
        this.nodes.set(node.id, node);
        this._discoverConnections(node);
        this.emit('nodeAdded', { node, connections: this.getNodeConnections(node.id) });
        return node;
    }

    updateNode(nodeId, updates, changeDescription) {
        const existingNode = this.nodes.get(nodeId);
        if (!existingNode) throw new Error(`Node ${nodeId} not found`);

        let processedContent = existingNode.processedContent;
        if (updates.content && updates.content !== existingNode.content) {
            processedContent = this.contentProcessor.processContent(
                updates.content,
                updates.contentType || existingNode.contentType,
                updates.metadata || existingNode.metadata
            );
        }

        const updatedNode = {
            ...existingNode,
            ...updates,
            processedContent,
            updated_at: new Date()
        };

        if (processedContent !== existingNode.processedContent) {
            updatedNode.tags = [
                ...new Set([
                    ...(updates.tags || existingNode.tags),
                    ...processedContent.extractedConcepts.slice(0, 10)
                ])
            ];
        }

        this.versioning.updateNode(nodeId, updatedNode, changeDescription);
        this.nodes.set(nodeId, updatedNode);
        this._updateConnections(nodeId);
        this.emit('nodeUpdated', { nodeId, node: updatedNode, changes: updates });
        return updatedNode;
    }

    deleteNode(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node) throw new Error(`Node ${nodeId} not found`);

        // Remove all connections involving this node
        this.connections = this.connections.filter(
            c => c.source_id !== nodeId && c.target_id !== nodeId
        );

        // Remove from nodes map
        this.nodes.delete(nodeId);

        this.emit('nodeDeleted', { nodeId, node });
        return node;
    }

    getNodeConnections(nodeId) {
        return this.connections.filter(c => c.source_id === nodeId || c.target_id === nodeId);
    }

    getStats() {
        const domains = {};
        const connectionTypes = {};
        let totalVersions = 0;

        for (const [nodeId, node] of this.nodes) {
            domains[node.domain] = (domains[node.domain] || 0) + 1;
            totalVersions += this.versioning.getVersionHistory(nodeId).length;
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
            cross_domain_connections: crossDomainConnections,
            domains,
            connection_types: connectionTypes,
            total_versions: totalVersions
        };
    }

    searchNodes(query, options = {}) {
        const results = [];
        const searchTerms = query.toLowerCase().split(/\s+/);

        for (const [, node] of this.nodes) {
            let relevanceScore = 0;
            const matches = [];

            if (node.title.toLowerCase().includes(query.toLowerCase())) {
                relevanceScore += 10;
                matches.push({ field: 'title', snippet: node.title });
            }

            if (node.content.toLowerCase().includes(query.toLowerCase())) {
                relevanceScore += 5;
                matches.push({ field: 'content', snippet: this._getSnippet(node.content, query) });
            }

            const conceptMatches = (node.processedContent?.extractedConcepts || [])
                .filter(concept => searchTerms.some(term => concept.includes(term)));
            if (conceptMatches.length > 0) {
                relevanceScore += conceptMatches.length * 2;
                matches.push({ field: 'concepts', snippet: conceptMatches.join(', ') });
            }

            const tagMatches = (node.tags || []).filter(tag =>
                searchTerms.some(term => tag.toLowerCase().includes(term))
            );
            if (tagMatches.length > 0) {
                relevanceScore += tagMatches.length * 3;
                matches.push({ field: 'tags', snippet: tagMatches.join(', ') });
            }

            if (relevanceScore > 0) {
                results.push({ node, relevanceScore, matches });
            }
        }

        results.sort((a, b) => b.relevanceScore - a.relevanceScore);
        return results.slice(0, options.limit || 20);
    }

    findCrossDomainInsights() {
        return this.connections
            .map(c => {
                const source = this.nodes.get(c.source_id);
                const target = this.nodes.get(c.target_id);
                return source && target && source.domain !== target.domain ? [source, target, c] : null;
            })
            .filter(Boolean)
            .sort((a, b) => b[2].strength - a[2].strength);
    }

    getNovelCombinations(nodeId) {
        return this.similarityEngine.suggestNovelCombinations(this, nodeId);
    }

    getNodeHistory(nodeId, branchName = null) {
        return this.versioning.getVersionHistory(nodeId, branchName);
    }

    getNodeEvolution(nodeId) {
        return this.versioning.getEvolutionTimeline(nodeId);
    }

    compareNodeVersions(nodeId, versionId1, versionId2) {
        return this.versioning.compareVersions(nodeId, versionId1, versionId2);
    }

    createBranch(nodeId, branchName, description) {
        return this.versioning.createBranch(nodeId, branchName, description);
    }

    mergeBranch(nodeId, branchName, mergeStrategy = 'auto') {
        const mergeVersion = this.versioning.mergeBranch(nodeId, branchName, mergeStrategy);
        const mergedNode = { ...mergeVersion.nodeState, updated_at: new Date() };
        this.nodes.set(nodeId, mergedNode);
        this._updateConnections(nodeId);
        this.emit('branchMerged', { nodeId, branchName, mergeVersion });
        return mergeVersion;
    }

    exportData(options = {}) {
        const data = {
            metadata: { exportedAt: new Date(), version: '2.0' },
            stats: this.getStats(),
            nodes: Array.from(this.nodes.values()),
            connections: options.includeConnections !== false ? this.connections : undefined
        };
        if (options.includeVersions) {
            data.versioning = this.versioning.exportState();
        }
        return data;
    }

    importData(data) {
        this.nodes = new Map();
        this.connections = [];

        if (data.nodes) {
            for (const node of data.nodes) {
                const restored = {
                    ...node,
                    created_at: new Date(node.created_at),
                    updated_at: new Date(node.updated_at)
                };
                this.nodes.set(restored.id, restored);
            }
        }

        if (data.connections) {
            this.connections = data.connections.map(c => ({
                ...c,
                created_at: new Date(c.created_at)
            }));
        }

        if (data.versioning) {
            this.versioning.importState(data.versioning);
        } else {
            // Re-initialize versioning for nodes that don't have it
            this.versioning = new IdeaVersioning();
            for (const [, node] of this.nodes) {
                this.versioning.initializeNode(node);
            }
        }
    }

    // Event system
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            this.eventListeners.set(event, listeners.filter(cb => cb !== callback));
        }
    }

    emit(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => callback(data));
        }
    }

    // Private methods
    _discoverConnections(newNode) {
        for (const [existingId, existingNode] of this.nodes) {
            if (existingId === newNode.id) continue;
            const analysis = this.similarityEngine.calculateSemanticSimilarity(newNode, existingNode);
            if (analysis.similarity > 0.01) {
                const connectionType = this.similarityEngine.determineConnectionType(newNode, existingNode, analysis);
                const explanation = this.similarityEngine.explainConnection(newNode, existingNode, connectionType, analysis);
                this.connections.push({
                    source_id: newNode.id,
                    target_id: existingId,
                    connection_type: connectionType,
                    strength: analysis.similarity,
                    explanation,
                    analysis_details: analysis.factors,
                    shared_bridges: analysis.shared_bridges,
                    created_at: new Date()
                });
            }
        }
    }

    _updateConnections(nodeId) {
        this.connections = this.connections.filter(c => c.source_id !== nodeId && c.target_id !== nodeId);
        const node = this.nodes.get(nodeId);
        if (node) this._discoverConnections(node);
    }

    _getSnippet(text, query, maxLength = 100) {
        const index = text.toLowerCase().indexOf(query.toLowerCase());
        if (index === -1) return text.substring(0, maxLength) + '...';
        const start = Math.max(0, index - 30);
        const end = Math.min(text.length, index + query.length + 30);
        return (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
    }

    _generateId() {
        return `node_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }
}

export default KnowledgeGraph;
