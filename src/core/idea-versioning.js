/**
 * Idea Versioning System for Synthetica
 * Converted to ES module
 */

class IdeaVersioning {
    constructor() {
        this.versions = new Map();
        this.branches = new Map();
        this.mergeHistory = new Map();
    }

    initializeNode(node) {
        const version = this.createVersion(node, 'initial', 'Node created');
        this.versions.set(node.id, [version]);
        this.branches.set(node.id, {
            main: { name: 'main', currentVersion: version.versionId, created: new Date() }
        });
        return version;
    }

    updateNode(nodeId, updates, changeDescription) {
        if (!this.versions.has(nodeId)) {
            throw new Error(`Node ${nodeId} not found in version history`);
        }
        const currentVersions = this.versions.get(nodeId);
        const currentVersion = currentVersions[currentVersions.length - 1];
        const newNode = { ...currentVersion.nodeState, ...updates };
        const newVersion = this.createVersion(newNode, 'update', changeDescription || 'Node updated', currentVersion.versionId);
        currentVersions.push(newVersion);
        const branches = this.branches.get(nodeId);
        branches.main.currentVersion = newVersion.versionId;
        return newVersion;
    }

    createBranch(nodeId, branchName, description) {
        if (!this.versions.has(nodeId)) throw new Error(`Node ${nodeId} not found`);
        const branches = this.branches.get(nodeId);
        if (branches[branchName]) throw new Error(`Branch ${branchName} already exists`);
        const currentVersions = this.versions.get(nodeId);
        const currentVersion = currentVersions[currentVersions.length - 1];
        branches[branchName] = {
            name: branchName,
            currentVersion: currentVersion.versionId,
            parentVersion: currentVersion.versionId,
            created: new Date(),
            description: description || `Branch created from version ${currentVersion.versionId}`
        };
        return branches[branchName];
    }

    updateBranch(nodeId, branchName, updates, changeDescription) {
        const branches = this.branches.get(nodeId);
        if (!branches || !branches[branchName]) throw new Error(`Branch ${branchName} not found for node ${nodeId}`);
        const currentVersions = this.versions.get(nodeId);
        const baseVersion = currentVersions.find(v => v.versionId === branches[branchName].currentVersion);
        if (!baseVersion) throw new Error(`Version not found`);
        const newNode = { ...baseVersion.nodeState, ...updates };
        const newVersion = this.createVersion(newNode, 'branch-update', changeDescription || `Updated ${branchName} branch`, baseVersion.versionId);
        newVersion.branch = branchName;
        currentVersions.push(newVersion);
        branches[branchName].currentVersion = newVersion.versionId;
        return newVersion;
    }

    mergeBranch(nodeId, branchName, mergeStrategy = 'auto') {
        const branches = this.branches.get(nodeId);
        if (!branches || !branches[branchName] || branchName === 'main') throw new Error(`Cannot merge branch ${branchName}`);
        const currentVersions = this.versions.get(nodeId);
        const mainVersion = currentVersions.find(v => v.versionId === branches.main.currentVersion);
        const branchVersion = currentVersions.find(v => v.versionId === branches[branchName].currentVersion);
        const mergedNode = this.performMerge(mainVersion.nodeState, branchVersion.nodeState, mergeStrategy);
        const mergeVersion = this.createVersion(mergedNode, 'merge', `Merged ${branchName} into main`, mainVersion.versionId);
        mergeVersion.mergeInfo = {
            sourceBranch: branchName, sourceVersion: branchVersion.versionId,
            targetBranch: 'main', targetVersion: mainVersion.versionId, strategy: mergeStrategy
        };
        currentVersions.push(mergeVersion);
        branches.main.currentVersion = mergeVersion.versionId;
        if (!this.mergeHistory.has(nodeId)) this.mergeHistory.set(nodeId, []);
        this.mergeHistory.get(nodeId).push({
            timestamp: new Date(), operation: 'merge',
            sourceBranch: branchName, targetBranch: 'main', versionId: mergeVersion.versionId
        });
        return mergeVersion;
    }

    getVersionHistory(nodeId, branchName = null) {
        if (!this.versions.has(nodeId)) return [];
        const versions = this.versions.get(nodeId);
        if (branchName) {
            return versions.filter(v => v.branch === branchName || (branchName === 'main' && !v.branch));
        }
        return versions;
    }

    getVersion(nodeId, versionId) {
        if (!this.versions.has(nodeId)) return null;
        return this.versions.get(nodeId).find(v => v.versionId === versionId);
    }

    getCurrentVersion(nodeId, branchName = 'main') {
        const branches = this.branches.get(nodeId);
        if (!branches || !branches[branchName]) return null;
        return this.getVersion(nodeId, branches[branchName].currentVersion);
    }

    compareVersions(nodeId, versionId1, versionId2) {
        const version1 = this.getVersion(nodeId, versionId1);
        const version2 = this.getVersion(nodeId, versionId2);
        if (!version1 || !version2) throw new Error('One or both versions not found');
        return {
            version1, version2,
            differences: this.computeDifferences(version1.nodeState, version2.nodeState),
            timeDifference: version2.timestamp - version1.timestamp
        };
    }

    getEvolutionTimeline(nodeId) {
        const versions = this.getVersionHistory(nodeId);
        const branches = this.branches.get(nodeId) || {};
        const merges = this.mergeHistory.get(nodeId) || [];
        return {
            nodeId,
            versions: versions.map(v => ({
                versionId: v.versionId, timestamp: v.timestamp,
                changeType: v.changeType, description: v.changeDescription,
                branch: v.branch || 'main',
                metadata: v.metadata
            })),
            branches: Object.values(branches),
            merges,
            totalVersions: versions.length,
            createdAt: versions[0]?.timestamp,
            lastUpdated: versions[versions.length - 1]?.timestamp
        };
    }

    trackConnectionEvolution(nodeId, connections) {
        const currentVersion = this.getCurrentVersion(nodeId);
        if (!currentVersion) return;
        const previousConnections = currentVersion.nodeState.connections || [];
        const analysis = {
            new: connections.filter(c => !previousConnections.some(p => p.target_id === c.target_id)),
            removed: previousConnections.filter(p => !connections.some(c => c.target_id === p.target_id)),
            strengthChanged: [],
            timestamp: new Date()
        };
        connections.forEach(conn => {
            const prevConn = previousConnections.find(p => p.target_id === conn.target_id);
            if (prevConn && Math.abs(prevConn.strength - conn.strength) > 0.1) {
                analysis.strengthChanged.push({
                    target_id: conn.target_id, oldStrength: prevConn.strength,
                    newStrength: conn.strength, change: conn.strength - prevConn.strength
                });
            }
        });
        if (!currentVersion.nodeState.connectionEvolution) {
            currentVersion.nodeState.connectionEvolution = [];
        }
        currentVersion.nodeState.connectionEvolution.push(analysis);
        return analysis;
    }

    createVersion(nodeState, changeType, changeDescription, parentVersionId = null) {
        return {
            versionId: this.generateVersionId(),
            nodeState: JSON.parse(JSON.stringify(nodeState)),
            timestamp: new Date(),
            changeType, changeDescription, parentVersionId,
            author: 'user',
            metadata: {
                wordCount: this.countWords(nodeState.content || ''),
                conceptCount: (nodeState.tags || []).length,
                connectionCount: (nodeState.connections || []).length
            }
        };
    }

    performMerge(mainState, branchState, strategy) {
        switch (strategy) {
            case 'auto':
                return {
                    ...mainState,
                    title: branchState.title || mainState.title,
                    content: this.mergeContent(mainState.content, branchState.content),
                    tags: [...new Set([...(mainState.tags || []), ...(branchState.tags || [])])],
                    domain: branchState.domain || mainState.domain
                };
            case 'branch-wins': return branchState;
            case 'main-wins': return mainState;
            default: throw new Error(`Unknown merge strategy: ${strategy}`);
        }
    }

    mergeContent(mainContent, branchContent) {
        if (!mainContent) return branchContent;
        if (!branchContent) return mainContent;
        if (mainContent === branchContent) return mainContent;
        if (branchContent.length > mainContent.length * 1.5) return branchContent;
        return mainContent;
    }

    computeDifferences(state1, state2) {
        const differences = {};
        ['title', 'content', 'domain', 'tags'].forEach(field => {
            if (state1[field] !== state2[field]) {
                differences[field] = { from: state1[field], to: state2[field] };
            }
        });
        return differences;
    }

    generateVersionId() {
        return `v${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }

    countWords(text) {
        if (!text) return 0;
        return text.split(/\s+/).filter(word => word.length > 0).length;
    }

    exportState() {
        const versions = {};
        for (const [nodeId, versionList] of this.versions) {
            versions[nodeId] = versionList;
        }
        const branches = {};
        for (const [nodeId, branchMap] of this.branches) {
            branches[nodeId] = branchMap;
        }
        const mergeHistory = {};
        for (const [nodeId, merges] of this.mergeHistory) {
            mergeHistory[nodeId] = merges;
        }
        return { versions, branches, mergeHistory };
    }

    importState(data) {
        this.versions = new Map();
        this.branches = new Map();
        this.mergeHistory = new Map();

        if (data.versions) {
            for (const [nodeId, versionList] of Object.entries(data.versions)) {
                this.versions.set(nodeId, versionList.map(v => ({
                    ...v,
                    timestamp: new Date(v.timestamp)
                })));
            }
        }
        if (data.branches) {
            for (const [nodeId, branchMap] of Object.entries(data.branches)) {
                const restored = {};
                for (const [name, branch] of Object.entries(branchMap)) {
                    restored[name] = { ...branch, created: new Date(branch.created) };
                }
                this.branches.set(nodeId, restored);
            }
        }
        if (data.mergeHistory) {
            for (const [nodeId, merges] of Object.entries(data.mergeHistory)) {
                this.mergeHistory.set(nodeId, merges.map(m => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                })));
            }
        }
    }
}

export default IdeaVersioning;
