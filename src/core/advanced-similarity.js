/**
 * Advanced Similarity Algorithms for Synthetica
 * Converted to ES module from src/core/advanced_similarity.js
 */

class AdvancedSimilarityEngine {
    constructor() {
        this.stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
            'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
        ]);

        this.domainPatterns = {
            'technology': {
                keywords: ['algorithm', 'data', 'system', 'network', 'process', 'computation', 'digital'],
                concepts: ['structure', 'flow', 'optimization', 'efficiency', 'automation', 'intelligence']
            },
            'biology': {
                keywords: ['cell', 'organism', 'evolution', 'adaptation', 'ecosystem', 'genetics', 'neural'],
                concepts: ['growth', 'adaptation', 'interaction', 'survival', 'reproduction', 'complexity']
            },
            'art': {
                keywords: ['color', 'form', 'composition', 'harmony', 'rhythm', 'expression', 'aesthetic'],
                concepts: ['balance', 'contrast', 'unity', 'movement', 'emotion', 'creativity']
            },
            'science': {
                keywords: ['theory', 'hypothesis', 'experiment', 'observation', 'measurement', 'analysis'],
                concepts: ['causation', 'correlation', 'pattern', 'law', 'principle', 'relationship']
            },
            'philosophy': {
                keywords: ['truth', 'knowledge', 'reality', 'consciousness', 'ethics', 'logic', 'meaning'],
                concepts: ['existence', 'thought', 'belief', 'value', 'purpose', 'understanding']
            }
        };

        this.metaphoricalBridges = [
            'network', 'system', 'pattern', 'structure', 'flow', 'balance', 'harmony',
            'complexity', 'emergence', 'adaptation', 'intelligence', 'information',
            'connection', 'interaction', 'relationship', 'hierarchy', 'organization'
        ];
    }

    extractConcepts(text, domain = null) {
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2 && !this.stopWords.has(word));

        const concepts = {
            keywords: [],
            phrases: [],
            domain_concepts: [],
            metaphorical_bridges: []
        };

        const wordFreq = {};
        words.forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        });

        concepts.keywords = Object.entries(wordFreq)
            .filter(([word, freq]) => freq > 1 || word.length > 6)
            .map(([word]) => word)
            .slice(0, 10);

        for (let i = 0; i < words.length - 1; i++) {
            concepts.phrases.push(`${words[i]} ${words[i + 1]}`);
        }

        if (domain && this.domainPatterns[domain]) {
            const domainInfo = this.domainPatterns[domain];
            concepts.domain_concepts = words.filter(word =>
                domainInfo.keywords.includes(word) || domainInfo.concepts.includes(word)
            );
        }

        concepts.metaphorical_bridges = words.filter(word =>
            this.metaphoricalBridges.includes(word)
        );

        return concepts;
    }

    calculateSemanticSimilarity(node1, node2) {
        const concepts1 = this.extractConcepts(node1.content, node1.domain);
        const concepts2 = this.extractConcepts(node2.content, node2.domain);

        let similarity = 0;
        const factors = [];

        const keywordSim = this.jaccardSimilarity(
            new Set([...concepts1.keywords, ...node1.tags]),
            new Set([...concepts2.keywords, ...node2.tags])
        );
        similarity += keywordSim * 0.3;
        factors.push(`keyword overlap: ${keywordSim.toFixed(2)}`);

        const phraseSim = this.jaccardSimilarity(
            new Set(concepts1.phrases),
            new Set(concepts2.phrases)
        );
        similarity += phraseSim * 0.2;
        factors.push(`phrase similarity: ${phraseSim.toFixed(2)}`);

        const domainSim = this.jaccardSimilarity(
            new Set(concepts1.domain_concepts),
            new Set(concepts2.domain_concepts)
        );
        similarity += domainSim * 0.2;
        factors.push(`domain concepts: ${domainSim.toFixed(2)}`);

        const metaphorSim = this.jaccardSimilarity(
            new Set(concepts1.metaphorical_bridges),
            new Set(concepts2.metaphorical_bridges)
        );
        similarity += metaphorSim * 0.3;
        if (metaphorSim > 0) {
            factors.push(`metaphorical bridges: ${metaphorSim.toFixed(2)}`);
        }

        if (node1.domain !== node2.domain && similarity > 0.1) {
            const crossDomainBonus = 0.2;
            similarity += crossDomainBonus;
            factors.push(`cross-domain bonus: ${crossDomainBonus}`);
        }

        return {
            similarity: Math.min(similarity, 1.0),
            factors,
            shared_bridges: concepts1.metaphorical_bridges.filter(b =>
                concepts2.metaphorical_bridges.includes(b)
            )
        };
    }

    jaccardSimilarity(set1, set2) {
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return union.size === 0 ? 0 : intersection.size / union.size;
    }

    determineConnectionType(node1, node2, analysisResult) {
        const { similarity, shared_bridges } = analysisResult;

        if (node1.domain === node2.domain) {
            if (similarity > 0.8) return "highly_related";
            if (similarity > 0.6) return "related";
            if (similarity > 0.4) return "loosely_connected";
            return "tangentially_connected";
        } else {
            if (shared_bridges.length > 0) {
                if (shared_bridges.length > 2) return "strong_cross_domain_pattern";
                if (shared_bridges.includes('network') || shared_bridges.includes('system')) {
                    return "structural_analogy";
                }
                if (shared_bridges.includes('pattern') || shared_bridges.includes('harmony')) {
                    return "pattern_similarity";
                }
                return "conceptual_bridge";
            } else {
                return "cross_domain_connection";
            }
        }
    }

    explainConnection(node1, node2, connectionType, analysisResult) {
        const { factors, shared_bridges } = analysisResult;
        let explanation = '';

        if (connectionType.includes('cross_domain')) {
            explanation = `Cross-domain connection between ${node1.domain} and ${node2.domain}`;
            if (shared_bridges.length > 0) {
                explanation += ` through shared concepts: ${shared_bridges.join(', ')}`;
            }
        } else {
            explanation = `Within-domain connection in ${node1.domain}`;
        }

        const strongestFactor = factors.reduce((max, current) => {
            const currentValue = parseFloat(current.split(': ')[1]);
            const maxValue = parseFloat(max.split(': ')[1]);
            return currentValue > maxValue ? current : max;
        }, factors[0]);

        if (strongestFactor) {
            explanation += `. Strongest signal: ${strongestFactor}`;
        }

        return explanation;
    }

    suggestNovelCombinations(knowledgeGraph, nodeId, maxSuggestions = 5) {
        const suggestions = [];
        const targetNode = knowledgeGraph.nodes.get(nodeId);
        if (!targetNode) return suggestions;

        const directConnections = knowledgeGraph.connections
            .filter(c => c.source_id === nodeId || c.target_id === nodeId)
            .map(c => c.source_id === nodeId ? c.target_id : c.source_id);

        const targetConcepts = this.extractConcepts(targetNode.content, targetNode.domain);

        for (const [otherId, otherNode] of knowledgeGraph.nodes) {
            if (otherId === nodeId || directConnections.includes(otherId)) continue;

            const otherConcepts = this.extractConcepts(otherNode.content, otherNode.domain);
            const sharedBridges = targetConcepts.metaphorical_bridges.filter(b =>
                otherConcepts.metaphorical_bridges.includes(b)
            );

            if (sharedBridges.length > 0) {
                const novelty = this.calculateNovelty(targetNode, otherNode, sharedBridges);
                if (novelty > 0.3) {
                    suggestions.push({
                        target: targetNode,
                        combination: otherNode,
                        bridges: sharedBridges,
                        novelty,
                        reasoning: `Both involve ${sharedBridges.join(' and ')} - suggests potential for ${targetNode.domain}-${otherNode.domain} synthesis`
                    });
                }
            }
        }

        suggestions.sort((a, b) => b.novelty - a.novelty);
        return suggestions.slice(0, maxSuggestions);
    }

    calculateNovelty(node1, node2, sharedBridges) {
        let novelty = 0;
        if (node1.domain !== node2.domain) novelty += 0.4;
        novelty += sharedBridges.length * 0.2;
        const powerfulBridges = ['system', 'pattern', 'structure', 'intelligence', 'emergence'];
        const powerfulCount = sharedBridges.filter(b => powerfulBridges.includes(b)).length;
        novelty += powerfulCount * 0.3;
        return Math.min(novelty, 1.0);
    }
}

export default AdvancedSimilarityEngine;
