#!/usr/bin/env python3
"""
Synthetica Demo - Knowledge Graph in Action
===========================================

This demo shows how Synthetica's knowledge graph automatically discovers
connections between ideas across different domains.
"""

import sys
sys.path.append('src')

from core.knowledge_graph import SyntheticaKnowledgeGraph

def main():
    print("🌱 Synthetica Knowledge Graph Demo")
    print("=" * 50)
    
    # Create knowledge graph
    kg = SyntheticaKnowledgeGraph()
    
    print("\n📝 Adding knowledge nodes...")
    
    # Technology domain
    neural_nets = kg.add_node(
        title="Neural Networks",
        content="Artificial neural networks are computing systems inspired by biological neural networks. They consist of layers of interconnected nodes that process information through weighted connections.",
        domain="technology",
        tags=["ai", "machine-learning", "computation", "layers", "connections"]
    )
    
    # Biology domain  
    brain = kg.add_node(
        title="Brain Structure",
        content="The human brain consists of billions of interconnected neurons that process information through synaptic connections. Information flows through neural pathways in complex patterns.",
        domain="biology", 
        tags=["neuroscience", "biology", "cognition", "neurons", "connections", "patterns"]
    )
    
    # Art domain
    music = kg.add_node(
        title="Musical Harmony",
        content="Harmony in music involves multiple notes played simultaneously to create pleasing combinations. Harmonic progressions create patterns that guide the listener through emotional journeys.",
        domain="art",
        tags=["music", "composition", "patterns", "combinations", "harmony"]
    )
    
    # Science domain
    ecosystems = kg.add_node(
        title="Forest Ecosystems", 
        content="Forest ecosystems are complex networks of interconnected organisms. Trees, fungi, and other organisms form intricate webs of mutual support and resource sharing.",
        domain="science",
        tags=["ecology", "networks", "connections", "systems", "mutual-support"]
    )
    
    # Philosophy domain
    knowledge = kg.add_node(
        title="Collective Intelligence",
        content="Collective intelligence emerges when groups of individuals work together, each contributing their unique knowledge and perspectives to create insights beyond what any individual could achieve alone.",
        domain="philosophy", 
        tags=["intelligence", "collaboration", "emergence", "networks", "collective"]
    )
    
    print(f"✅ Added {len(kg.nodes)} knowledge nodes")
    
    # Show statistics
    stats = kg.stats()
    print(f"\n📊 Knowledge Graph Statistics:")
    print(f"   • Total nodes: {stats['total_nodes']}")
    print(f"   • Total connections: {stats['total_connections']}")
    print(f"   • Cross-domain connections: {stats['cross_domain_connections']}")
    print(f"   • Domains: {', '.join(stats['domains'].keys())}")
    
    # Show cross-domain insights
    print(f"\n🔗 Cross-Domain Insights Discovered:")
    insights = kg.find_cross_domain_insights()
    
    for i, (source, target, connection) in enumerate(insights[:5], 1):
        print(f"\n   {i}. {source.title} ({source.domain}) ↔ {target.title} ({target.domain})")
        print(f"      Strength: {connection.strength:.2f}")
        print(f"      Type: {connection.connection_type}")
        print(f"      Explanation: {connection.explanation}")
    
    # Show novel combination suggestions
    print(f"\n💡 Novel Combination Suggestions:")
    suggestions = kg.suggest_novel_combinations(neural_nets.id)
    
    for i, suggestion in enumerate(suggestions[:3], 1):
        original = suggestion["original"]
        combination = suggestion["combination"] 
        bridge = suggestion["bridge"]
        
        print(f"\n   {i}. Combine '{original.title}' with '{combination.title}'")
        print(f"      Bridge concept: '{bridge.title}'")
        print(f"      Reasoning: {suggestion['reasoning']}")
        print(f"      Potential insight: What if we applied {combination.domain} principles to {original.domain}?")
    
    # Show local neighborhood
    print(f"\n🕸️  Knowledge Neighborhood around 'Neural Networks':")
    neighborhood = kg.get_node_neighborhood(neural_nets.id, depth=1)
    
    center_node = next(n for n in neighborhood["nodes"] if n.id == neural_nets.id)
    connected_nodes = [n for n in neighborhood["nodes"] if n.id != neural_nets.id]
    
    print(f"   Center: {center_node.title} ({center_node.domain})")
    for node in connected_nodes:
        connection = next((c for c in neighborhood["connections"] 
                          if c.source_id == neural_nets.id and c.target_id == node.id or
                             c.source_id == node.id and c.target_id == neural_nets.id), None)
        if connection:
            print(f"   Connected to: {node.title} ({node.domain}) - {connection.connection_type}")
    
    # Save the knowledge graph
    kg.save_data()
    print(f"\n💾 Knowledge graph saved to data/")
    
    print(f"\n🌟 This demonstrates Synthetica's core concept:")
    print(f"   • Automatic discovery of connections across domains")
    print(f"   • AI-powered insight generation")
    print(f"   • Novel combination suggestions for creative breakthroughs")
    print(f"\n   The 'Living Knowledge Garden' is growing! 🌱")

if __name__ == "__main__":
    main()