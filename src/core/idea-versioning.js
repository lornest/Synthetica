/**
 * Idea Versioning System for Synthetica
 * ====================================
 * 
 * Tracks how knowledge nodes evolve over time, allowing users to see
 * the progression of their thinking and discover patterns in their
 * creative development.
 */

class IdeaVersioning {
    constructor() {
        this.versions = new Map(); // nodeId -> array of versions
        this.branches = new Map(); // nodeId -> branches
        this.mergeHistory = new Map(); // nodeId -> merge operations
    }
    
    /**
     * Create initial version of a knowledge node
     */
    initializeNode(node) {
        const version = this.createVersion(node, 'initial', 'Node created');
        
        this.versions.set(node.id, [version]);
        this.branches.set(node.id, {
            main: {
                name: 'main',
                currentVersion: version.versionId,
                created: new Date()
            }
        });
        
        return version;
    }
    
    /**
     * Update a knowledge node and create new version
     */
    updateNode(nodeId, updates, changeDescription) {
        if (!this.versions.has(nodeId)) {
            throw new Error(`Node ${nodeId} not found in version history`);
        }
        
        const currentVersions = this.versions.get(nodeId);
        const currentVersion = currentVersions[currentVersions.length - 1];
        
        // Create new version with updates
        const newNode = { ...currentVersion.nodeState, ...updates };
        const newVersion = this.createVersion(
            newNode, 
            'update', 
            changeDescription || 'Node updated',
            currentVersion.versionId
        );
        
        // Add to version history
        currentVersions.push(newVersion);
        
        // Update branch pointer
        const branches = this.branches.get(nodeId);
        branches.main.currentVersion = newVersion.versionId;
        
        return newVersion;
    }
    
    /**
     * Create a new branch from current version
     */
    createBranch(nodeId, branchName, description) {
        if (!this.versions.has(nodeId)) {
            throw new Error(`Node ${nodeId} not found`);
        }
        
        const branches = this.branches.get(nodeId);
        if (branches[branchName]) {
            throw new Error(`Branch ${branchName} already exists`);
        }
        
        const currentVersions = this.versions.get(nodeId);
        const currentVersion = currentVersions[currentVersions.length - 1];
        
        // Create branch from current version
        branches[branchName] = {
            name: branchName,
            currentVersion: currentVersion.versionId,
            parentVersion: currentVersion.versionId,
            created: new Date(),
            description: description || `Branch created from version ${currentVersion.versionId}`
        };
        
        return branches[branchName];
    }
    
    /**
     * Update a specific branch
     */
    updateBranch(nodeId, branchName, updates, changeDescription) {
        const branches = this.branches.get(nodeId);
        if (!branches || !branches[branchName]) {
            throw new Error(`Branch ${branchName} not found for node ${nodeId}`);
        }
        
        const currentVersions = this.versions.get(nodeId);
        const branchCurrentVersion = branches[branchName].currentVersion;
        
        // Find the current version for this branch
        const baseVersion = currentVersions.find(v => v.versionId === branchCurrentVersion);
        if (!baseVersion) {
            throw new Error(`Version ${branchCurrentVersion} not found`);
        }
        
        // Create new version on this branch
        const newNode = { ...baseVersion.nodeState, ...updates };
        const newVersion = this.createVersion(
            newNode,
            'branch-update',
            changeDescription || `Updated ${branchName} branch`,
            baseVersion.versionId
        );
        
        newVersion.branch = branchName;
        
        // Add to version history
        currentVersions.push(newVersion);
        
        // Update branch pointer
        branches[branchName].currentVersion = newVersion.versionId;
        
        return newVersion;
    }
    
    /**
     * Merge a branch back into main
     */
    mergeBranch(nodeId, branchName, mergeStrategy = 'auto') {
        const branches = this.branches.get(nodeId);
        if (!branches || !branches[branchName] || branchName === 'main') {
            throw new Error(`Cannot merge branch ${branchName}`);
        }
        
        const currentVersions = this.versions.get(nodeId);
        const mainVersion = currentVersions.find(v => v.versionId === branches.main.currentVersion);
        const branchVersion = currentVersions.find(v => v.versionId === branches[branchName].currentVersion);
        
        // Perform merge based on strategy
        const mergedNode = this.performMerge(mainVersion.nodeState, branchVersion.nodeState, mergeStrategy);
        
        const mergeVersion = this.createVersion(
            mergedNode,
            'merge',
            `Merged ${branchName} into main`,
            mainVersion.versionId
        );
        
        mergeVersion.mergeInfo = {
            sourceBranch: branchName,
            sourceVersion: branchVersion.versionId,
            targetBranch: 'main',
            targetVersion: mainVersion.versionId,
            strategy: mergeStrategy
        };
        
        // Add to version history
        currentVersions.push(mergeVersion);
        
        // Update main branch pointer
        branches.main.currentVersion = mergeVersion.versionId;
        
        // Record merge operation
        if (!this.mergeHistory.has(nodeId)) {
            this.mergeHistory.set(nodeId, []);
        }
        this.mergeHistory.get(nodeId).push({
            timestamp: new Date(),
            operation: 'merge',
            sourceBranch: branchName,
            targetBranch: 'main',
            versionId: mergeVersion.versionId
        });
        
        return mergeVersion;
    }
    
    /**
     * Get version history for a node
     */
    getVersionHistory(nodeId, branchName = null) {
        if (!this.versions.has(nodeId)) {
            return [];
        }
        
        const versions = this.versions.get(nodeId);
        
        if (branchName) {
            // Filter to specific branch
            return versions.filter(v => 
                v.branch === branchName || 
                (branchName === 'main' && !v.branch)
            );
        }
        
        return versions;
    }
    
    /**
     * Get specific version of a node
     */
    getVersion(nodeId, versionId) {
        if (!this.versions.has(nodeId)) {
            return null;
        }
        
        return this.versions.get(nodeId).find(v => v.versionId === versionId);
    }
    
    /**
     * Get current version of a node on specific branch
     */
    getCurrentVersion(nodeId, branchName = 'main') {
        const branches = this.branches.get(nodeId);
        if (!branches || !branches[branchName]) {
            return null;
        }
        
        const currentVersionId = branches[branchName].currentVersion;
        return this.getVersion(nodeId, currentVersionId);
    }
    
    /**
     * Compare two versions and show differences
     */
    compareVersions(nodeId, versionId1, versionId2) {
        const version1 = this.getVersion(nodeId, versionId1);
        const version2 = this.getVersion(nodeId, versionId2);
        
        if (!version1 || !version2) {
            throw new Error('One or both versions not found');
        }
        
        return {
            version1: version1,
            version2: version2,
            differences: this.computeDifferences(version1.nodeState, version2.nodeState),
            timeDifference: version2.timestamp - version1.timestamp
        };
    }
    
    /**
     * Get evolution timeline for visualization
     */
    getEvolutionTimeline(nodeId) {
        const versions = this.getVersionHistory(nodeId);
        const branches = this.branches.get(nodeId) || {};
        const merges = this.mergeHistory.get(nodeId) || [];
        
        return {
            nodeId: nodeId,
            versions: versions.map(v => ({
                versionId: v.versionId,
                timestamp: v.timestamp,
                changeType: v.changeType,
                description: v.changeDescription,
                branch: v.branch || 'main'
            })),
            branches: Object.values(branches),
            merges: merges,
            totalVersions: versions.length,
            createdAt: versions[0]?.timestamp,
            lastUpdated: versions[versions.length - 1]?.timestamp
        };
    }
    
    /**
     * Track how connections evolve over time
     */
    trackConnectionEvolution(nodeId, connections) {
        const currentVersion = this.getCurrentVersion(nodeId);
        if (!currentVersion) return;
        
        const previousConnections = currentVersion.nodeState.connections || [];
        
        // Identify new, removed, and changed connections
        const analysis = {
            new: connections.filter(c => !previousConnections.some(p => p.target_id === c.target_id)),
            removed: previousConnections.filter(p => !connections.some(c => c.target_id === p.target_id)),
            strengthChanged: [],
            timestamp: new Date()
        };
        
        // Check for strength changes
        connections.forEach(conn => {
            const prevConn = previousConnections.find(p => p.target_id === conn.target_id);
            if (prevConn && Math.abs(prevConn.strength - conn.strength) > 0.1) {
                analysis.strengthChanged.push({
                    target_id: conn.target_id,
                    oldStrength: prevConn.strength,
                    newStrength: conn.strength,
                    change: conn.strength - prevConn.strength
                });
            }
        });
        
        // Store evolution data
        if (!currentVersion.nodeState.connectionEvolution) {
            currentVersion.nodeState.connectionEvolution = [];
        }
        currentVersion.nodeState.connectionEvolution.push(analysis);
        
        return analysis;
    }
    
    /**
     * Create a new version object
     */
    createVersion(nodeState, changeType, changeDescription, parentVersionId = null) {
        return {
            versionId: this.generateVersionId(),
            nodeState: JSON.parse(JSON.stringify(nodeState)), // Deep copy
            timestamp: new Date(),
            changeType: changeType,
            changeDescription: changeDescription,
            parentVersionId: parentVersionId,
            author: 'user', // Could be expanded for multi-user scenarios
            metadata: {
                wordCount: this.countWords(nodeState.content || ''),
                conceptCount: (nodeState.tags || []).length,
                connectionCount: (nodeState.connections || []).length
            }
        };
    }
    
    /**
     * Perform merge operation between two node states
     */
    performMerge(mainState, branchState, strategy) {
        switch (strategy) {
            case 'auto':
                // Automatic merge - combine non-conflicting changes
                return {
                    ...mainState,
                    title: branchState.title || mainState.title,
                    content: this.mergeContent(mainState.content, branchState.content),
                    tags: [...new Set([...(mainState.tags || []), ...(branchState.tags || [])])],
                    domain: branchState.domain || mainState.domain
                };
                
            case 'branch-wins':
                return branchState;
                
            case 'main-wins':
                return mainState;
                
            default:
                throw new Error(`Unknown merge strategy: ${strategy}`);
        }
    }
    
    /**
     * Merge content intelligently
     */
    mergeContent(mainContent, branchContent) {
        if (!mainContent) return branchContent;
        if (!branchContent) return mainContent;
        
        // Simple merge - in production you'd want more sophisticated logic
        if (mainContent === branchContent) return mainContent;
        
        // If branch content is significantly longer, prefer it
        if (branchContent.length > mainContent.length * 1.5) {
            return branchContent;
        }
        
        // Otherwise keep main content
        return mainContent;
    }
    
    /**
     * Compute differences between two node states
     */
    computeDifferences(state1, state2) {
        const differences = {};
        
        // Compare each field
        const fields = ['title', 'content', 'domain', 'tags'];
        
        fields.forEach(field => {
            if (state1[field] !== state2[field]) {
                differences[field] = {
                    from: state1[field],
                    to: state2[field]
                };
            }
        });
        
        return differences;
    }
    
    /**
     * Generate unique version ID
     */
    generateVersionId() {
        return `v${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }
    
    /**
     * Count words in text
     */
    countWords(text) {
        if (!text) return 0;
        return text.split(/\s+/).filter(word => word.length > 0).length;
    }
    
    /**
     * Export version history as JSON
     */
    exportHistory(nodeId) {
        return {
            nodeId: nodeId,
            versions: this.getVersionHistory(nodeId),
            branches: this.branches.get(nodeId),
            merges: this.mergeHistory.get(nodeId),
            timeline: this.getEvolutionTimeline(nodeId),
            exportedAt: new Date()
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined') {
    module.exports = IdeaVersioning;
}

// For browser environments
if (typeof window !== 'undefined') {
    window.IdeaVersioning = IdeaVersioning;
}