#!/usr/bin/env python3
"""
Synthetica Core Knowledge Graph Engine
=====================================

This is the foundational component of Synthetica - a dynamic knowledge graph
that actively discovers connections and suggests novel combinations.

The graph stores 'knowledge nodes' (ideas, concepts, insights) and automatically
discovers relationships between them using AI-powered analysis.
"""

import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Set
from dataclasses import dataclass, asdict
import networkx as nx
from pathlib import Path


@dataclass
class KnowledgeNode:
    """
    A single unit of knowledge in the graph.
    
    This could represent an idea, concept, insight, or any piece of information
    that can be connected to other knowledge.
    """
    id: str
    title: str
    content: str
    content_type: str  # 'text', 'code', 'image', 'audio', 'link', etc.
    domain: str  # 'science', 'art', 'technology', 'philosophy', etc.
    tags: List[str]
    created_at: datetime
    updated_at: datetime
    metadata: Dict  # Flexible additional data
    
    def __post_init__(self):
        if isinstance(self.created_at, str):
            self.created_at = datetime.fromisoformat(self.created_at)
        if isinstance(self.updated_at, str):
            self.updated_at = datetime.fromisoformat(self.updated_at)


@dataclass
class KnowledgeConnection:
    """
    A relationship between two knowledge nodes.
    
    Connections have types and strengths, and can be discovered automatically
    or created manually by users.
    """
    source_id: str
    target_id: str
    connection_type: str  # 'similar', 'contrary', 'builds_on', 'example_of', 'metaphor', etc.
    strength: float  # 0.0 to 1.0
    discovered_by: str  # 'ai', 'user', 'system'
    explanation: str  # Why this connection exists
    created_at: datetime
    
    def __post_init__(self):
        if isinstance(self.created_at, str):
            self.created_at = datetime.fromisoformat(self.created_at)


class SyntheticaKnowledgeGraph:
    """
    The core knowledge graph engine for Synthetica.
    
    This class manages a dynamic graph of knowledge nodes and their connections,
    with AI-powered discovery of new relationships and cross-domain insights.
    """
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        # NetworkX graph for efficient operations
        self.graph = nx.Graph()
        
        # Storage
        self.nodes: Dict[str, KnowledgeNode] = {}
        self.connections: List[KnowledgeConnection] = []
        
        # Load existing data
        self._load_data()
    
    def add_node(self, title: str, content: str, content_type: str = "text", 
                 domain: str = "general", tags: List[str] = None, 
                 metadata: Dict = None) -> KnowledgeNode:
        """Add a new knowledge node to the graph."""
        
        node_id = str(uuid.uuid4())
        now = datetime.now()
        
        node = KnowledgeNode(
            id=node_id,
            title=title,
            content=content,
            content_type=content_type,
            domain=domain,
            tags=tags or [],
            created_at=now,
            updated_at=now,
            metadata=metadata or {}
        )
        
        # Store the node
        self.nodes[node_id] = node
        self.graph.add_node(node_id, **asdict(node))
        
        # Auto-discover connections with existing nodes
        self._discover_connections(node)
        
        return node
    
    def _discover_connections(self, new_node: KnowledgeNode):
        """
        AI-powered connection discovery.
        
        This is where the magic happens - automatically finding relationships
        between the new node and existing knowledge.
        """
        
        # For now, implement basic similarity matching
        # TODO: Replace with more sophisticated AI analysis
        
        for existing_id, existing_node in self.nodes.items():
            if existing_id == new_node.id:
                continue
                
            # Simple keyword overlap for demonstration
            connection_strength = self._calculate_similarity(new_node, existing_node)
            
            if connection_strength > 0.3:  # Threshold for meaningful connections
                connection_type = self._determine_connection_type(new_node, existing_node, connection_strength)
                explanation = self._explain_connection(new_node, existing_node, connection_type)
                
                connection = KnowledgeConnection(
                    source_id=new_node.id,
                    target_id=existing_id,
                    connection_type=connection_type,
                    strength=connection_strength,
                    discovered_by="ai",
                    explanation=explanation,
                    created_at=datetime.now()
                )
                
                self.add_connection(connection)
    
    def _calculate_similarity(self, node1: KnowledgeNode, node2: KnowledgeNode) -> float:
        """Calculate similarity between two nodes."""
        
        # Simple implementation - count shared keywords
        words1 = set(node1.content.lower().split() + node1.tags + [node1.domain])
        words2 = set(node2.content.lower().split() + node2.tags + [node2.domain])
        
        if not words1 or not words2:
            return 0.0
            
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        
        similarity = intersection / union if union > 0 else 0.0
        
        # Boost cross-domain connections (more interesting!)
        if node1.domain != node2.domain and similarity > 0.1:
            similarity *= 1.5  # Cross-domain bonus
            
        return min(similarity, 1.0)
    
    def _determine_connection_type(self, node1: KnowledgeNode, node2: KnowledgeNode, strength: float) -> str:
        """Determine the type of connection between nodes."""
        
        # Simple heuristics for demo
        if node1.domain == node2.domain:
            if strength > 0.7:
                return "very_similar"
            elif strength > 0.5:
                return "related"
            else:
                return "loosely_connected"
        else:
            # Cross-domain connections are often metaphorical or analogical
            return "cross_domain_pattern"
    
    def _explain_connection(self, node1: KnowledgeNode, node2: KnowledgeNode, connection_type: str) -> str:
        """Generate an explanation for why nodes are connected."""
        
        shared_tags = set(node1.tags).intersection(set(node2.tags))
        
        if connection_type == "cross_domain_pattern":
            return f"Cross-domain pattern: {node1.domain} and {node2.domain} share conceptual similarities"
        elif shared_tags:
            return f"Connected through shared concepts: {', '.join(list(shared_tags)[:3])}"
        else:
            return f"Connected through content similarity ({connection_type})"
    
    def add_connection(self, connection: KnowledgeConnection):
        """Add a connection between nodes."""
        
        self.connections.append(connection)
        
        # Add to NetworkX graph
        self.graph.add_edge(
            connection.source_id,
            connection.target_id,
            **asdict(connection)
        )
    
    def find_cross_domain_insights(self, domain: str = None) -> List[Tuple[KnowledgeNode, KnowledgeNode, KnowledgeConnection]]:
        """Find interesting cross-domain connections."""
        
        cross_domain_insights = []
        
        for connection in self.connections:
            source_node = self.nodes.get(connection.source_id)
            target_node = self.nodes.get(connection.target_id)
            
            if source_node and target_node:
                # Cross-domain connection
                if source_node.domain != target_node.domain:
                    # Filter by domain if specified
                    if domain is None or source_node.domain == domain or target_node.domain == domain:
                        cross_domain_insights.append((source_node, target_node, connection))
        
        # Sort by connection strength
        cross_domain_insights.sort(key=lambda x: x[2].strength, reverse=True)
        
        return cross_domain_insights
    
    def suggest_novel_combinations(self, node_id: str, max_suggestions: int = 5) -> List[Dict]:
        """Suggest novel combinations based on a given node."""
        
        if node_id not in self.nodes:
            return []
        
        # Find nodes connected to this one
        connected_nodes = list(self.graph.neighbors(node_id))
        
        suggestions = []
        
        # Look for indirect connections (nodes connected to connected nodes)
        for connected_id in connected_nodes[:3]:  # Limit search
            second_degree = list(self.graph.neighbors(connected_id))
            
            for second_id in second_degree:
                if second_id != node_id and second_id not in connected_nodes:
                    # This is a potential novel combination
                    original_node = self.nodes[node_id]
                    indirect_node = self.nodes[second_id]
                    bridge_node = self.nodes[connected_id]
                    
                    suggestion = {
                        "original": original_node,
                        "combination": indirect_node,
                        "bridge": bridge_node,
                        "reasoning": f"Both connected to '{bridge_node.title}' - suggests potential synthesis"
                    }
                    
                    suggestions.append(suggestion)
        
        return suggestions[:max_suggestions]
    
    def get_node_neighborhood(self, node_id: str, depth: int = 2) -> Dict:
        """Get a node and its local neighborhood for visualization."""
        
        if node_id not in self.nodes:
            return {}
        
        # Get nodes within specified depth
        subgraph_nodes = set([node_id])
        current_level = {node_id}
        
        for _ in range(depth):
            next_level = set()
            for node in current_level:
                neighbors = set(self.graph.neighbors(node))
                next_level.update(neighbors)
                subgraph_nodes.update(neighbors)
            current_level = next_level
        
        # Build subgraph data
        subgraph = {
            "nodes": [self.nodes[nid] for nid in subgraph_nodes if nid in self.nodes],
            "connections": [
                conn for conn in self.connections
                if conn.source_id in subgraph_nodes and conn.target_id in subgraph_nodes
            ]
        }
        
        return subgraph
    
    def _load_data(self):
        """Load knowledge graph from disk."""
        
        nodes_file = self.data_dir / "nodes.json"
        connections_file = self.data_dir / "connections.json"
        
        # Load nodes
        if nodes_file.exists():
            with open(nodes_file, 'r') as f:
                nodes_data = json.load(f)
                for node_data in nodes_data:
                    node = KnowledgeNode(**node_data)
                    self.nodes[node.id] = node
                    self.graph.add_node(node.id, **asdict(node))
        
        # Load connections
        if connections_file.exists():
            with open(connections_file, 'r') as f:
                connections_data = json.load(f)
                for conn_data in connections_data:
                    connection = KnowledgeConnection(**conn_data)
                    self.connections.append(connection)
                    self.graph.add_edge(
                        connection.source_id,
                        connection.target_id,
                        **asdict(connection)
                    )
    
    def save_data(self):
        """Save knowledge graph to disk."""
        
        # Save nodes
        nodes_data = []
        for node in self.nodes.values():
            node_dict = asdict(node)
            node_dict['created_at'] = node.created_at.isoformat()
            node_dict['updated_at'] = node.updated_at.isoformat()
            nodes_data.append(node_dict)
        
        with open(self.data_dir / "nodes.json", 'w') as f:
            json.dump(nodes_data, f, indent=2)
        
        # Save connections
        connections_data = []
        for connection in self.connections:
            conn_dict = asdict(connection)
            conn_dict['created_at'] = connection.created_at.isoformat()
            connections_data.append(conn_dict)
        
        with open(self.data_dir / "connections.json", 'w') as f:
            json.dump(connections_data, f, indent=2)
    
    def stats(self) -> Dict:
        """Get statistics about the knowledge graph."""
        
        domains = {}
        content_types = {}
        
        for node in self.nodes.values():
            domains[node.domain] = domains.get(node.domain, 0) + 1
            content_types[node.content_type] = content_types.get(node.content_type, 0) + 1
        
        return {
            "total_nodes": len(self.nodes),
            "total_connections": len(self.connections),
            "domains": domains,
            "content_types": content_types,
            "cross_domain_connections": len([
                c for c in self.connections
                if self.nodes[c.source_id].domain != self.nodes[c.target_id].domain
            ])
        }


if __name__ == "__main__":
    # Demo usage
    kg = SyntheticaKnowledgeGraph()
    
    # Add some sample knowledge
    node1 = kg.add_node(
        title="Neural Networks",
        content="Artificial neural networks are computing systems inspired by biological neural networks",
        domain="technology",
        tags=["ai", "machine-learning", "computation"]
    )
    
    node2 = kg.add_node(
        title="Brain Structure",
        content="The human brain consists of interconnected neurons that process information",
        domain="biology",
        tags=["neuroscience", "biology", "cognition"]
    )
    
    node3 = kg.add_node(
        title="Musical Harmony",
        content="Harmony in music involves multiple notes played simultaneously to create pleasing combinations",
        domain="art",
        tags=["music", "composition", "patterns"]
    )
    
    print("Knowledge Graph Stats:", kg.stats())
    print("\nCross-domain insights:")
    for insight in kg.find_cross_domain_insights()[:3]:
        source, target, connection = insight
        print(f"- {source.title} ({source.domain}) → {target.title} ({target.domain})")
        print(f"  {connection.explanation}")