#!/usr/bin/env node
/**
 * Synthetica Phase 1 Focused Demo
 * ==============================
 * 
 * Focused demonstration of core Phase 1 features working together.
 */

const AdvancedSimilarityEngine = require('./src/core/advanced_similarity.js');
const ContentProcessor = require('./src/core/content-processor.js');
const IdeaVersioning = require('./src/core/idea-versioning.js');

// Simple knowledge graph class that combines all Phase 1 features
class Phase1KnowledgeGraph {
    constructor() {
        this.nodes = new Map();
        this.connections = [];
        this.similarityEngine = new AdvancedSimilarityEngine();
        this.contentProcessor = new ContentProcessor();
        this.versioning = new IdeaVersioning();
    }
    
    addNode(title, content, domain, tags = [], contentType = 'text', metadata = {}) {
        // Process content using Phase 1 processor
        const processedContent = this.contentProcessor.processContent(content, contentType, metadata);
        
        const node = {
            id: Math.random().toString(36).substring(2, 15),
            title,
            content,
            processedContent,
            domain,
            tags: [...tags, ...processedContent.extractedConcepts.slice(0, 5)],
            contentType,
            metadata,
            created_at: new Date()
        };
        
        // Initialize versioning
        this.versioning.initializeNode(node);
        
        this.nodes.set(node.id, node);
        
        // Discover connections
        this._discoverConnections(node);
        
        return node;
    }
    
    updateNode(nodeId, updates, description) {
        const node = this.nodes.get(nodeId);
        if (!node) return null;
        
        const updatedNode = { ...node, ...updates, updated_at: new Date() };
        this.versioning.updateNode(nodeId, updatedNode, description);
        this.nodes.set(nodeId, updatedNode);
        
        // Re-discover connections
        this._updateConnections(nodeId);
        
        return updatedNode;
    }
    
    createBranch(nodeId, branchName, description) {
        return this.versioning.createBranch(nodeId, branchName, description);
    }
    
    updateBranch(nodeId, branchName, updates, description) {
        return this.versioning.updateBranch(nodeId, branchName, updates, description);
    }
    
    mergeBranch(nodeId, branchName, strategy = 'auto') {
        const result = this.versioning.mergeBranch(nodeId, branchName, strategy);
        
        // Update the actual node
        const mergedNode = { ...result.nodeState, updated_at: new Date() };
        this.nodes.set(nodeId, mergedNode);
        this._updateConnections(nodeId);
        
        return result;
    }
    
    _discoverConnections(newNode) {
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
        // Remove old connections
        this.connections = this.connections.filter(c => 
            c.source_id !== nodeId && c.target_id !== nodeId
        );
        
        // Re-discover
        const node = this.nodes.get(nodeId);
        if (node) this._discoverConnections(node);
    }
    
    getStats() {
        const domains = {};
        for (const node of this.nodes.values()) {
            domains[node.domain] = (domains[node.domain] || 0) + 1;
        }
        
        const crossDomainConnections = this.connections.filter(c => {
            const source = this.nodes.get(c.source_id);
            const target = this.nodes.get(c.target_id);
            return source && target && source.domain !== target.domain;
        }).length;
        
        let totalVersions = 0;
        for (const [nodeId] of this.nodes) {
            totalVersions += this.versioning.getVersionHistory(nodeId).length;
        }
        
        return {
            total_nodes: this.nodes.size,
            total_connections: this.connections.length,
            cross_domain_connections: crossDomainConnections,
            domains,
            total_versions: totalVersions
        };
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
    
    getVersionHistory(nodeId) {
        return this.versioning.getVersionHistory(nodeId);
    }
}

function main() {
    console.log("🌱 Synthetica Phase 1 - Complete Foundation Demo");
    console.log("=".repeat(55));
    
    const kg = new Phase1KnowledgeGraph();
    
    console.log("\n📝 Multi-Format Content Processing:");
    
    // Text content
    const textNode = kg.addNode(
        "Neural Networks",
        "Neural networks are computational models inspired by biological neural networks that process information through interconnected nodes",
        "technology",
        ["ai", "computation"],
        "text"
    );
    console.log(`✅ Added text node: "${textNode.title}"`);
    console.log(`   Extracted concepts: ${textNode.processedContent.extractedConcepts.slice(0, 5).join(', ')}`);
    
    // Markdown content  
    const markdownNode = kg.addNode(
        "AI Research Overview",
        "# Artificial Intelligence Research\\n\\n## Key Areas\\n- **Machine Learning**: Pattern recognition and prediction\\n- **Neural Networks**: Brain-inspired computing\\n- **Deep Learning**: Multi-layer neural architectures",
        "science", 
        ["research"],
        "markdown"
    );
    console.log(`✅ Added markdown node: "${markdownNode.title}"`);
    console.log(`   Structure: ${markdownNode.processedContent.structure.headers} headers, ${markdownNode.processedContent.structure.emphasis} emphasis`);
    
    // Code content
    const codeNode = kg.addNode(
        "Simple Neural Net",
        "function neuralNetwork(inputs, weights) {\\n  return inputs.map((input, i) => input * weights[i])\\n    .reduce((sum, val) => sum + val, 0);\\n}",
        "technology",
        ["implementation"],
        "code",
        { language: "javascript" }
    );
    console.log(`✅ Added code node: "${codeNode.title}"`);
    console.log(`   Language: ${codeNode.processedContent.codeAnalysis.language}, Functions: ${codeNode.processedContent.codeAnalysis.functions.join(', ') || 'none detected'}`);
    
    console.log("\n🔄 Version Control & Evolution:");
    
    // Create branch
    kg.createBranch(textNode.id, "improvements", "Exploring enhanced concepts");
    console.log("✅ Created experimental branch 'improvements'");
    
    // Update branch
    kg.updateBranch(textNode.id, "improvements", {
        content: textNode.content + " with advanced features like attention mechanisms and transformer architectures",
        tags: [...textNode.tags, "attention", "transformers"]
    }, "Added modern architectures");
    console.log("✅ Updated branch with modern concepts");
    
    // Update main
    kg.updateNode(textNode.id, {
        content: textNode.content + " using backpropagation for training",
        tags: [...textNode.tags, "backpropagation", "training"]  
    }, "Added training information");
    console.log("✅ Updated main branch in parallel");
    
    // Merge
    const merged = kg.mergeBranch(textNode.id, "improvements");
    console.log(`✅ Merged branches - New version: ${merged.versionId}`);
    
    // Show version history
    const history = kg.getVersionHistory(textNode.id);
    console.log(`\\n📚 Version History (${history.length} versions):`);
    history.forEach((v, i) => {
        console.log(`   ${i + 1}. ${v.changeType}: ${v.changeDescription}`);
    });
    
    console.log("\n🧠 AI Connection Discovery:");
    
    // Add cross-domain nodes
    const bioNode = kg.addNode(
        "Brain Neural Networks",
        "Biological neural networks in the brain consist of interconnected neurons that process information through synaptic connections and exhibit learning through plasticity",
        "biology",
        ["neurons", "synapses", "plasticity"],
        "text"
    );
    
    const musicNode = kg.addNode(
        "Musical Pattern Recognition", 
        "Music involves complex pattern recognition where the brain processes rhythmic, harmonic, and melodic structures to create understanding and emotional response",
        "art",
        ["music", "patterns", "harmony"],
        "text"
    );
    
    console.log(`✅ Added cross-domain nodes for connection discovery`);
    
    const stats = kg.getStats();
    console.log(`\\n📊 Final Statistics:`);
    console.log(`   • Nodes: ${stats.total_nodes}`);
    console.log(`   • Connections: ${stats.total_connections}`); 
    console.log(`   • Cross-domain: ${stats.cross_domain_connections}`);
    console.log(`   • Total versions: ${stats.total_versions}`);
    
    const insights = kg.findCrossDomainInsights();
    if (insights.length > 0) {
        console.log(`\\n🔗 Cross-Domain Insights:`);
        insights.slice(0, 3).forEach((insight, i) => {
            const [source, target, connection] = insight;
            console.log(`\\n   ${i + 1}. ${source.title} (${source.domain}) ↔ ${target.title} (${target.domain})`);
            console.log(`      Strength: ${connection.strength.toFixed(3)}`);
            console.log(`      Type: ${connection.connection_type}`);
            console.log(`      Explanation: ${connection.explanation}`);
            if (connection.shared_bridges?.length > 0) {
                console.log(`      Bridges: ${connection.shared_bridges.join(', ')}`);
            }
        });
    }
    
    const combinations = kg.getNovelCombinations(textNode.id);
    if (combinations.length > 0) {
        console.log(`\\n💡 Novel Synthesis Opportunities:`);
        combinations.slice(0, 2).forEach((combo, i) => {
            console.log(`\\n   ${i + 1}. "${combo.target.title}" + "${combo.combination.title}"`);
            console.log(`      Domains: ${combo.target.domain} × ${combo.combination.domain}`);
            console.log(`      Novelty: ${combo.novelty.toFixed(3)}`);
            console.log(`      Reasoning: ${combo.reasoning}`);
        });
    }
    
    console.log("\\n" + "=".repeat(55));
    console.log("🎉 Phase 1 Foundation Complete!");
    console.log("✅ Multi-format content processing");
    console.log("✅ Version control and branching");  
    console.log("✅ Advanced AI connection discovery");
    console.log("✅ Cross-domain insight generation");
    console.log("🚀 Ready for Phase 2: Visual Networks!");
    console.log("=".repeat(55));
}

if (typeof require !== 'undefined' && require.main === module) {
    main();
}