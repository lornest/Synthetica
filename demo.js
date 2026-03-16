#!/usr/bin/env node
/**
 * Synthetica Demo - Knowledge Graph in Action
 * =========================================== 
 * 
 * This demo shows how Synthetica's knowledge graph automatically discovers
 * connections between ideas across different domains.
 */

class KnowledgeNode {
    constructor(title, content, domain, tags = []) {
        this.id = Math.random().toString(36).substring(2, 15);
        this.title = title;
        this.content = content;
        this.domain = domain;
        this.tags = tags;
        this.created_at = new Date();
    }
}

class KnowledgeConnection {
    constructor(sourceId, targetId, type, strength, explanation) {
        this.source_id = sourceId;
        this.target_id = targetId;
        this.connection_type = type;
        this.strength = strength;
        this.discovered_by = "ai";
        this.explanation = explanation;
        this.created_at = new Date();
    }
}

class SyntheticaKnowledgeGraph {
    constructor() {
        this.nodes = new Map();
        this.connections = [];
    }
    
    addNode(title, content, domain, tags = []) {
        const node = new KnowledgeNode(title, content, domain, tags);
        this.nodes.set(node.id, node);
        
        // Auto-discover connections with existing nodes
        this._discoverConnections(node);
        
        return node;
    }
    
    _discoverConnections(newNode) {
        for (const [existingId, existingNode] of this.nodes) {
            if (existingId === newNode.id) continue;
            
            const similarity = this._calculateSimilarity(newNode, existingNode);
            
            if (similarity > 0.3) {
                const connectionType = this._determineConnectionType(newNode, existingNode, similarity);
                const explanation = this._explainConnection(newNode, existingNode, connectionType);
                
                const connection = new KnowledgeConnection(
                    newNode.id,
                    existingId,
                    connectionType,
                    similarity,
                    explanation
                );
                
                this.connections.push(connection);
            }
        }
    }
    
    _calculateSimilarity(node1, node2) {
        const words1 = new Set([
            ...node1.content.toLowerCase().split(/\s+/),
            ...node1.tags,
            node1.domain
        ]);
        
        const words2 = new Set([
            ...node2.content.toLowerCase().split(/\s+/),
            ...node2.tags,
            node2.domain
        ]);
        
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        
        let similarity = intersection.size / union.size;
        
        // Boost cross-domain connections (more interesting!)
        if (node1.domain !== node2.domain && similarity > 0.1) {
            similarity *= 1.5;
        }
        
        return Math.min(similarity, 1.0);
    }
    
    _determineConnectionType(node1, node2, strength) {
        if (node1.domain === node2.domain) {
            if (strength > 0.7) return "very_similar";
            if (strength > 0.5) return "related";
            return "loosely_connected";
        } else {
            return "cross_domain_pattern";
        }
    }
    
    _explainConnection(node1, node2, connectionType) {
        const sharedTags = node1.tags.filter(tag => node2.tags.includes(tag));
        
        if (connectionType === "cross_domain_pattern") {
            return `Cross-domain pattern: ${node1.domain} and ${node2.domain} share conceptual similarities`;
        } else if (sharedTags.length > 0) {
            return `Connected through shared concepts: ${sharedTags.slice(0, 3).join(', ')}`;
        } else {
            return `Connected through content similarity (${connectionType})`;
        }
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
        
        // Sort by connection strength
        insights.sort((a, b) => b[2].strength - a[2].strength);
        
        return insights;
    }
    
    getStats() {
        const domains = {};
        const contentTypes = {};
        
        for (const node of this.nodes.values()) {
            domains[node.domain] = (domains[node.domain] || 0) + 1;
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
            cross_domain_connections: crossDomainConnections
        };
    }
}

// Demo execution
function main() {
    console.log("🌱 Synthetica Knowledge Graph Demo");
    console.log("=".repeat(50));
    
    const kg = new SyntheticaKnowledgeGraph();
    
    console.log("\n📝 Adding knowledge nodes...");
    
    // Add diverse knowledge across domains
    const neuralNets = kg.addNode(
        "Neural Networks",
        "Artificial neural networks are computing systems inspired by biological neural networks. They consist of layers of interconnected nodes that process information through weighted connections.",
        "technology",
        ["ai", "machine-learning", "computation", "layers", "connections"]
    );
    
    const brain = kg.addNode(
        "Brain Structure", 
        "The human brain consists of billions of interconnected neurons that process information through synaptic connections. Information flows through neural pathways in complex patterns.",
        "biology",
        ["neuroscience", "biology", "cognition", "neurons", "connections", "patterns"]
    );
    
    const music = kg.addNode(
        "Musical Harmony",
        "Harmony in music involves multiple notes played simultaneously to create pleasing combinations. Harmonic progressions create patterns that guide the listener through emotional journeys.",
        "art",
        ["music", "composition", "patterns", "combinations", "harmony"]
    );
    
    const ecosystems = kg.addNode(
        "Forest Ecosystems",
        "Forest ecosystems are complex networks of interconnected organisms. Trees, fungi, and other organisms form intricate webs of mutual support and resource sharing.",
        "science", 
        ["ecology", "networks", "connections", "systems", "mutual-support"]
    );
    
    const intelligence = kg.addNode(
        "Collective Intelligence",
        "Collective intelligence emerges when groups of individuals work together, each contributing their unique knowledge and perspectives to create insights beyond what any individual could achieve alone.",
        "philosophy",
        ["intelligence", "collaboration", "emergence", "networks", "collective"]
    );
    
    console.log(`✅ Added ${kg.nodes.size} knowledge nodes`);
    
    // Show statistics
    const stats = kg.getStats();
    console.log("\n📊 Knowledge Graph Statistics:");
    console.log(`   • Total nodes: ${stats.total_nodes}`);
    console.log(`   • Total connections: ${stats.total_connections}`);
    console.log(`   • Cross-domain connections: ${stats.cross_domain_connections}`);
    console.log(`   • Domains: ${Object.keys(stats.domains).join(', ')}`);
    
    // Show cross-domain insights
    console.log("\n🔗 Cross-Domain Insights Discovered:");
    const insights = kg.findCrossDomainInsights();
    
    insights.slice(0, 5).forEach((insight, i) => {
        const [source, target, connection] = insight;
        console.log(`\n   ${i + 1}. ${source.title} (${source.domain}) ↔ ${target.title} (${target.domain})`);
        console.log(`      Strength: ${connection.strength.toFixed(2)}`);
        console.log(`      Type: ${connection.connection_type}`);
        console.log(`      Explanation: ${connection.explanation}`);
    });
    
    console.log("\n🌟 This demonstrates Synthetica's core concept:");
    console.log("   • Automatic discovery of connections across domains");
    console.log("   • AI-powered insight generation");
    console.log("   • Cross-pollination of ideas for creative breakthroughs");
    console.log("\n   The 'Living Knowledge Garden' is growing! 🌱");
}

// Check if we're running in Node.js
if (typeof require !== 'undefined' && require.main === module) {
    main();
}

// Export for potential web use
if (typeof module !== 'undefined') {
    module.exports = { SyntheticaKnowledgeGraph, KnowledgeNode, KnowledgeConnection };
}