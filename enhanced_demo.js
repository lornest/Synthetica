#!/usr/bin/env node
/**
 * Enhanced Synthetica Demo - Advanced AI-Powered Knowledge Discovery
 * =================================================================
 * 
 * This demo showcases the enhanced similarity algorithms and cross-domain
 * insight generation capabilities of Synthetica.
 */

const fs = require('fs');
const path = require('path');

// Import our advanced similarity engine
const AdvancedSimilarityEngine = require('./src/core/advanced_similarity.js');

class EnhancedKnowledgeGraph {
    constructor() {
        this.nodes = new Map();
        this.connections = [];
        this.similarityEngine = new AdvancedSimilarityEngine();
    }
    
    addNode(title, content, domain, tags = []) {
        const node = {
            id: Math.random().toString(36).substring(2, 15),
            title: title,
            content: content,
            domain: domain,
            tags: tags,
            created_at: new Date()
        };
        
        this.nodes.set(node.id, node);
        
        // Enhanced connection discovery
        this._discoverAdvancedConnections(node);
        
        return node;
    }
    
    _discoverAdvancedConnections(newNode) {
        for (const [existingId, existingNode] of this.nodes) {
            if (existingId === newNode.id) continue;
            
            // Use advanced similarity analysis
            const analysis = this.similarityEngine.calculateSemanticSimilarity(newNode, existingNode);
            
            if (analysis.similarity > 0.2) { // Lower threshold for enhanced detection
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
                    discovered_by: "advanced_ai",
                    explanation: explanation,
                    analysis_details: analysis.factors,
                    shared_bridges: analysis.shared_bridges,
                    created_at: new Date()
                };
                
                this.connections.push(connection);
            }
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
        
        insights.sort((a, b) => b[2].strength - a[2].strength);
        return insights;
    }
    
    getNovelCombinations(nodeId) {
        return this.similarityEngine.suggestNovelCombinations(this, nodeId);
    }
    
    getStats() {
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
}

function main() {
    console.log("🧠 Enhanced Synthetica Knowledge Graph Demo");
    console.log("=".repeat(60));
    console.log("   Advanced AI-Powered Cross-Domain Discovery");
    console.log("");
    
    const kg = new EnhancedKnowledgeGraph();
    
    console.log("📝 Adding diverse knowledge across multiple domains...");
    console.log("");
    
    // Technology domain
    const neuralNets = kg.addNode(
        "Neural Networks",
        "Artificial neural networks are computing systems inspired by biological neural networks. They consist of interconnected layers of nodes that process information through weighted connections, enabling pattern recognition and learning through hierarchical feature extraction.",
        "technology",
        ["ai", "machine-learning", "computation", "layers", "connections", "pattern", "network"]
    );
    
    // Biology domain
    const brainStructure = kg.addNode(
        "Brain Neural Networks", 
        "The human brain consists of billions of interconnected neurons that process information through synaptic connections. Neural pathways form complex networks that enable pattern recognition, memory formation, and adaptive learning through structural plasticity.",
        "biology",
        ["neuroscience", "biology", "cognition", "neurons", "connections", "patterns", "network", "adaptation"]
    );
    
    // Art domain
    const musicalHarmony = kg.addNode(
        "Musical Harmony Systems",
        "Musical harmony involves the systematic organization of multiple notes into pleasing combinations. Harmonic progressions create structural patterns that guide emotional flow, using mathematical relationships between frequencies to achieve balance and resolution.",
        "art",
        ["music", "composition", "patterns", "combinations", "harmony", "structure", "balance", "system"]
    );
    
    // Science domain
    const ecosystems = kg.addNode(
        "Forest Ecosystem Networks",
        "Forest ecosystems are complex adaptive systems where trees, fungi, and organisms form intricate networks of mutual support. The mycorrhizal network enables information and resource sharing, creating emergent intelligence at the ecosystem level.",
        "science", 
        ["ecology", "networks", "connections", "systems", "adaptation", "intelligence", "information", "emergence"]
    );
    
    // Philosophy domain
    const collectiveIntelligence = kg.addNode(
        "Collective Intelligence Systems",
        "Collective intelligence emerges when groups of individuals collaborate, each contributing unique knowledge and perspectives. Through network effects and information sharing, collective systems can solve complex problems beyond individual cognitive capacity.",
        "philosophy",
        ["intelligence", "collaboration", "emergence", "networks", "collective", "information", "system", "complexity"]
    );
    
    // Mathematics domain
    const networkTheory = kg.addNode(
        "Graph Network Theory",
        "Graph theory studies mathematical structures consisting of vertices connected by edges. Network topology analysis reveals patterns of connection, clustering, and information flow that apply to systems ranging from social networks to neural circuits.",
        "mathematics",
        ["graph", "network", "connections", "structure", "patterns", "topology", "information", "system"]
    );
    
    // Psychology domain
    const cognitivePatterns = kg.addNode(
        "Cognitive Pattern Recognition",
        "Human cognitive systems excel at pattern recognition through hierarchical processing networks. The brain uses pattern matching and structural similarity to understand new concepts by connecting them to existing knowledge structures.",
        "psychology",
        ["cognition", "patterns", "recognition", "network", "structure", "connections", "intelligence", "adaptation"]
    );
    
    console.log(`✅ Added ${kg.nodes.size} knowledge nodes across ${Object.keys(kg.getStats().domains).length} domains`);
    
    // Show detailed statistics
    const stats = kg.getStats();
    console.log("\n📊 Enhanced Knowledge Graph Analysis:");
    console.log(`   • Total nodes: ${stats.total_nodes}`);
    console.log(`   • Total connections: ${stats.total_connections}`);
    console.log(`   • Cross-domain connections: ${stats.cross_domain_connections}`);
    console.log(`   • Domains: ${Object.keys(stats.domains).join(', ')}`);
    console.log(`   • Connection types discovered: ${Object.keys(stats.connection_types).length}`);
    
    // Show cross-domain insights with enhanced analysis
    console.log("\n🔗 Advanced Cross-Domain Insights Discovered:");
    const insights = kg.findCrossDomainInsights();
    
    insights.slice(0, 6).forEach((insight, i) => {
        const [source, target, connection] = insight;
        console.log(`\n   ${i + 1}. ${source.title} (${source.domain}) ↔ ${target.title} (${target.domain})`);
        console.log(`      Connection Type: ${connection.connection_type}`);
        console.log(`      Strength: ${connection.strength.toFixed(3)}`);
        console.log(`      Explanation: ${connection.explanation}`);
        
        if (connection.shared_bridges && connection.shared_bridges.length > 0) {
            console.log(`      Shared Concepts: ${connection.shared_bridges.join(', ')}`);
        }
        
        if (connection.analysis_details && connection.analysis_details.length > 0) {
            console.log(`      Analysis: ${connection.analysis_details.join('; ')}`);
        }
    });
    
    // Show novel combination suggestions
    console.log("\n💡 Novel Synthesis Opportunities:");
    const combinations = kg.getNovelCombinations(neuralNets.id);
    
    combinations.slice(0, 3).forEach((combo, i) => {
        console.log(`\n   ${i + 1}. Synthesize "${combo.target.title}" + "${combo.combination.title}"`);
        console.log(`      Domains: ${combo.target.domain} × ${combo.combination.domain}`);
        console.log(`      Novelty Score: ${combo.novelty.toFixed(3)}`);
        console.log(`      Connecting Concepts: ${combo.bridges.join(', ')}`);
        console.log(`      Reasoning: ${combo.reasoning}`);
        console.log(`      💭 Potential Question: "How might ${combo.combination.domain} principles revolutionize ${combo.target.domain}?"`);
    });
    
    // Show concept extraction example
    console.log("\n🧠 AI Concept Analysis Example:");
    const sampleAnalysis = kg.similarityEngine.extractConcepts(neuralNets.content, neuralNets.domain);
    console.log(`   Node: "${neuralNets.title}"`);
    console.log(`   Key Concepts: ${sampleAnalysis.keywords.slice(0, 5).join(', ')}`);
    console.log(`   Domain Concepts: ${sampleAnalysis.domain_concepts.join(', ')}`);
    console.log(`   Metaphorical Bridges: ${sampleAnalysis.metaphorical_bridges.join(', ')}`);
    
    console.log("\n🌟 Enhanced Synthetica Capabilities Demonstrated:");
    console.log("   ✅ Advanced semantic similarity analysis");
    console.log("   ✅ Metaphorical bridge detection for cross-domain insights");
    console.log("   ✅ Novel synthesis opportunity identification");
    console.log("   ✅ Detailed connection explanation with analysis factors");
    console.log("   ✅ Concept extraction with domain-specific patterns");
    console.log("   ✅ Multi-layered similarity scoring system");
    
    console.log("\n🚀 The Enhanced Living Knowledge Garden is thriving!");
    console.log("   Each connection discovered represents a potential breakthrough insight! 🌱✨");
}

// Run if called directly
if (typeof require !== 'undefined' && require.main === module) {
    main();
}

