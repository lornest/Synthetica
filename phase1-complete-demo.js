#!/usr/bin/env node
/**
 * Synthetica Phase 1 Complete Demo
 * ===============================
 * 
 * Comprehensive demonstration of all Phase 1 features:
 * • Multi-format content support (text, markdown, code, links, images)
 * • Version control and idea evolution tracking
 * • Enhanced AI-powered connection discovery
 * • Cross-domain insight generation
 */

const fs = require('fs');
const path = require('path');

// Import Phase 1 complete system
const EnhancedKnowledgeGraph = require('./src/core/enhanced-knowledge-graph.js');

function main() {
    console.log("🌱 Synthetica Phase 1 Complete - Multi-Format Knowledge Garden");
    console.log("=".repeat(70));
    console.log("   Demonstrating: Content Processing • Versioning • AI Discovery");
    console.log("");
    
    const kg = new EnhancedKnowledgeGraph();
    
    // Set up event listeners to show real-time activity
    kg.on('nodeAdded', (data) => {
        console.log(`   ✨ Node "${data.node.title}" added with ${data.connections.length} connections discovered`);
    });
    
    kg.on('nodeUpdated', (data) => {
        console.log(`   🔄 Node "${data.node.title}" updated - ${Object.keys(data.changes).join(', ')} changed`);
    });
    
    console.log("📝 Phase 1A: Multi-Format Content Processing");
    console.log("-".repeat(50));
    
    // 1. Text content
    console.log("\n1. Adding text-based knowledge...");
    const textNode = kg.addNode(
        "Neural Network Fundamentals",
        "Neural networks are computational models inspired by biological neural networks. They consist of interconnected nodes (neurons) that process information through weighted connections, enabling pattern recognition and learning.",
        "technology",
        ["ai", "machine-learning", "patterns"],
        "text"
    );
    
    // 2. Markdown content
    console.log("2. Adding markdown documentation...");
    const markdownContent = `# Machine Learning Pipeline
    
## Data Processing
The first step involves **data preprocessing** and *feature engineering*.

## Model Training
- Split data into training/validation sets
- Apply cross-validation techniques
- Tune hyperparameters for optimal performance

## Evaluation
Use metrics like accuracy, precision, and recall.

[Reference Paper](https://arxiv.org/abs/1234.5678)
`;
    
    const markdownNode = kg.addNode(
        "ML Pipeline Documentation", 
        markdownContent,
        "technology",
        ["documentation", "process"],
        "markdown"
    );
    
    // 3. Code content
    console.log("3. Adding code implementation...");
    const codeContent = `function createNeuralNetwork(layers) {
    class NeuralNetwork {
        constructor(layers) {
            this.layers = layers;
            this.weights = this.initializeWeights();
        }
        
        initializeWeights() {
            return layers.map((size, i) => 
                i === 0 ? null : Array(size).fill().map(() => 
                    Array(layers[i-1]).fill().map(() => Math.random() - 0.5)
                )
            );
        }
        
        predict(inputs) {
            return this.forwardPass(inputs);
        }
    }
    
    return new NeuralNetwork(layers);
}`;
    
    const codeNode = kg.addNode(
        "Neural Network Implementation",
        codeContent,
        "technology", 
        ["implementation", "algorithm"],
        "code",
        { language: "javascript", filename: "neural-network.js" }
    );
    
    // 4. Link content
    console.log("4. Adding external reference...");
    const linkNode = kg.addNode(
        "Deep Learning Research",
        "https://arxiv.org/abs/1706.03762",
        "science",
        ["research", "reference"],
        "link",
        { title: "Attention Is All You Need", domain: "arxiv.org" }
    );
    
    // 5. Image content (simulated)
    console.log("5. Adding visual diagram...");
    const imageNode = kg.addNode(
        "Network Architecture Diagram",
        "/images/neural-net-diagram.png",
        "technology",
        ["visualization", "architecture"],
        "image",
        { 
            filename: "neural-net-diagram.png",
            alt: "Diagram showing neural network layers with input, hidden, and output layers connected by weighted edges",
            type: "diagram"
        }
    );
    
    console.log("\n🔄 Phase 1B: Version Control and Idea Evolution");
    console.log("-".repeat(50));
    
    // Demonstrate versioning
    console.log("\n1. Creating experimental branch...");
    kg.createBranch(textNode.id, "advanced-concepts", "Exploring advanced neural network concepts");
    
    console.log("2. Updating branch with new ideas...");
    kg.updateBranch(textNode.id, "advanced-concepts", {
        content: textNode.content + "\\n\\nAdvanced concepts include attention mechanisms, transformer architectures, and self-supervised learning approaches that revolutionize how networks process sequential data.",
        tags: [...textNode.tags, "attention", "transformers", "self-supervised"]
    }, "Added advanced concepts and attention mechanisms");
    
    console.log("3. Making parallel updates to main branch...");
    kg.updateNode(textNode.id, {
        content: textNode.content + "\\n\\nThese networks can be trained using backpropagation algorithms and gradient descent optimization techniques.",
        tags: [...textNode.tags, "backpropagation", "optimization"]
    }, "Added training methodology information");
    
    console.log("4. Merging experimental branch...");
    const mergeResult = kg.mergeBranch(textNode.id, "advanced-concepts", "auto");
    console.log(`   ✅ Merged successfully - Version: ${mergeResult.versionId}`);
    
    // Show version history
    console.log("\\n5. Version evolution timeline:");
    const evolution = kg.getNodeEvolution(textNode.id);
    evolution.versions.forEach((v, i) => {
        console.log(`   ${i + 1}. ${v.timestamp.toISOString().split('T')[0]} - ${v.changeType}: ${v.description}`);
    });
    
    console.log("\n🧠 Phase 1C: Advanced AI Connection Discovery");
    console.log("-".repeat(50));
    
    // Add some cross-domain content to trigger interesting connections
    const biologyNode = kg.addNode(
        "Biological Neural Networks",
        "Biological neural networks consist of interconnected neurons that communicate through synapses. These networks exhibit plasticity, adaptation, and emergent intelligence through complex patterns of activation and inhibition.",
        "biology",
        ["neurons", "synapses", "plasticity", "intelligence"],
        "text"
    );
    
    const musicNode = kg.addNode(
        "Musical Harmony Patterns", 
        "Musical harmony involves systematic patterns of chord progressions and voice leading. These patterns create structural frameworks that guide emotional flow and establish musical intelligence through mathematical relationships between frequencies.",
        "art",
        ["harmony", "patterns", "structure", "intelligence"],
        "text"
    );
    
    // Add multi-format content to existing node
    console.log("\n1. Adding supplementary content to existing nodes...");
    kg.addContentToNode(biologyNode.id, `
## Synaptic Plasticity

Synaptic plasticity is the ability of synapses to strengthen or weaken over time:

- **Long-term potentiation (LTP)**: Strengthening of synapses
- **Long-term depression (LTD)**: Weakening of synapses
- **Homeostatic plasticity**: Overall network stability

This plasticity enables learning and memory formation.
`, "markdown", { title: "Plasticity Mechanisms" });
    
    // Show comprehensive statistics
    console.log("\n📊 Phase 1 Complete: Enhanced Knowledge Graph Analysis");
    console.log("-".repeat(50));
    
    const stats = kg.getStats();
    console.log(`\\n🌟 Comprehensive Statistics:`);
    console.log(`   • Total nodes: ${stats.total_nodes}`);
    console.log(`   • Total connections: ${stats.total_connections}`);
    console.log(`   • Cross-domain connections: ${stats.cross_domain_connections}`);
    console.log(`   • Total versions across all nodes: ${stats.versioning.totalVersions}`);
    console.log(`   • Average versions per node: ${stats.versioning.averageVersionsPerNode.toFixed(1)}`);
    console.log(`   • Experimental branches created: ${stats.versioning.totalBranches}`);
    console.log(`   • Multi-content nodes: ${stats.multiContentNodes}`);
    
    console.log(`\\n📁 Content Type Distribution:`);
    Object.entries(stats.contentTypes).forEach(([type, count]) => {
        console.log(`   • ${type}: ${count} node${count !== 1 ? 's' : ''}`);
    });
    
    console.log(`\\n🏷️ Domain Distribution:`);
    Object.entries(stats.domains).forEach(([domain, count]) => {
        console.log(`   • ${domain}: ${count} node${count !== 1 ? 's' : ''}`);
    });
    
    // Show cross-domain insights
    console.log("\n🔗 Enhanced Cross-Domain Insights:");
    const insights = kg.findCrossDomainInsights();
    
    insights.slice(0, 5).forEach((insight, i) => {
        const [source, target, connection] = insight;
        console.log(`\\n   ${i + 1}. ${source.title} (${source.domain}) ↔ ${target.title} (${target.domain})`);
        console.log(`      🎯 Type: ${connection.connection_type}`);
        console.log(`      💪 Strength: ${connection.strength.toFixed(3)}`);
        console.log(`      🧠 AI Analysis: ${connection.explanation}`);
        
        if (connection.shared_bridges && connection.shared_bridges.length > 0) {
            console.log(`      🌉 Bridges: ${connection.shared_bridges.join(', ')}`);
        }
        
        console.log(`      📝 Factors: ${connection.analysis_details.join('; ')}`);
    });
    
    // Demonstrate search functionality
    console.log("\\n🔍 Enhanced Search Capabilities:");
    console.log("-".repeat(30));
    
    const searchResults = kg.searchNodes("neural patterns intelligence", { limit: 3 });
    searchResults.forEach((result, i) => {
        console.log(`\\n   ${i + 1}. "${result.node.title}" (Relevance: ${result.relevanceScore})`);
        console.log(`      📍 Domain: ${result.node.domain}`);
        console.log(`      🔍 Matches: ${result.matches.map(m => `${m.field}: "${m.snippet}"`).join('; ')}`);
    });
    
    // Show novel synthesis opportunities
    console.log("\\n💡 Novel Synthesis Opportunities:");
    console.log("-".repeat(30));
    
    const combinations = kg.getNovelCombinations(textNode.id);
    combinations.slice(0, 3).forEach((combo, i) => {
        console.log(`\\n   ${i + 1}. Synthesize "${combo.target.title}" + "${combo.combination.title}"`);
        console.log(`      🌐 Cross-domain: ${combo.target.domain} × ${combo.combination.domain}`);
        console.log(`      ⭐ Novelty Score: ${combo.novelty.toFixed(3)}`);
        console.log(`      🌉 Bridges: ${combo.bridges.join(', ')}`);
        console.log(`      🧠 AI Reasoning: ${combo.reasoning}`);
        console.log(`      💭 Research Question: "How might ${combo.combination.domain} principles enhance ${combo.target.domain} approaches?"`);
    });
    
    // Export demonstration
    console.log("\\n📤 Export Capabilities:");
    console.log("-".repeat(20));
    
    const exportData = kg.exportData({ 
        includeVersions: true, 
        includeConnections: true 
    });
    
    console.log(`   ✅ Complete data export ready:`);
    console.log(`      • ${exportData.nodes.length} nodes with full version history`);
    console.log(`      • ${exportData.connections.length} AI-discovered connections`);
    console.log(`      • ${exportData.stats.versioning.totalVersions} version entries`);
    console.log(`      • Rich metadata and processing results included`);
    
    // Phase 1 completion summary
    console.log("\\n" + "=".repeat(70));
    console.log("🎉 PHASE 1 COMPLETE: Foundation Features Fully Implemented!");
    console.log("=".repeat(70));
    
    console.log("\\n✅ Multi-Format Content Support:");
    console.log("   • Text, Markdown, Code, Links, Images, Audio processing");
    console.log("   • Automatic concept extraction from all content types");
    console.log("   • Language-specific analysis for code content");
    console.log("   • Rich metadata and rendering capabilities");
    
    console.log("\\n✅ Version Control & Idea Evolution:");
    console.log("   • Complete version history tracking");
    console.log("   • Branch/merge workflow for experimental ideas");
    console.log("   • Automatic change detection and description");
    console.log("   • Connection evolution timeline analysis");
    
    console.log("\\n✅ Enhanced AI Discovery Engine:");
    console.log("   • Multi-factor similarity analysis");
    console.log("   • Metaphorical bridge detection");
    console.log("   • Cross-domain insight generation");
    console.log("   • Novel synthesis opportunity identification");
    
    console.log("\\n✅ Professional Features:");
    console.log("   • Event-driven real-time updates");
    console.log("   • Advanced search with relevance scoring");
    console.log("   • Comprehensive statistics and analytics");
    console.log("   • Full data export with version history");
    
    console.log("\\n🚀 Ready for Phase 2: Visual Knowledge Networks!");
    console.log("   The foundation is solid - now we can build amazing");
    console.log("   interactive visualizations and collaborative features! 🌱✨");
}

if (typeof require !== 'undefined' && require.main === module) {
    main();
}

// Export for testing
if (typeof module !== 'undefined') {
    module.exports = { main };
}