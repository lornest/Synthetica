export type Domain =
  | 'technology'
  | 'biology'
  | 'art'
  | 'science'
  | 'philosophy'
  | 'mathematics'
  | 'psychology'
  | 'economics'
  | 'general';

export type ContentType = 'text' | 'markdown' | 'code' | 'link' | 'image' | 'audio';

export interface ProcessedContent {
  originalContent: string;
  contentType: string;
  processedContent: string;
  extractedConcepts: string[];
  metadata: Record<string, unknown>;
  processedAt: Date;
  renderHtml?: string;
  codeAnalysis?: {
    language: string;
    functions: string[];
    classes: string[];
    lines: number;
  };
  structure?: {
    headers: number;
    links: number;
    codeBlocks: number;
    emphasis: number;
  };
  linkAnalysis?: {
    domain: string;
    path: string;
    protocol: string;
  };
}

export interface KnowledgeNode {
  id: string;
  title: string;
  content: string;
  processedContent: ProcessedContent;
  domain: Domain;
  tags: string[];
  contentType: ContentType;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
  multiContent?: ContentEntry[];
}

export interface ContentEntry {
  id: string;
  content: string;
  contentType: ContentType;
  processedContent: ProcessedContent;
  metadata: Record<string, unknown>;
  addedAt: Date;
}

export interface Connection {
  source_id: string;
  target_id: string;
  connection_type: string;
  strength: number;
  explanation: string;
  analysis_details: string[];
  shared_bridges: string[];
  created_at: Date;
}

export interface GraphStats {
  total_nodes: number;
  total_connections: number;
  cross_domain_connections: number;
  domains: Record<string, number>;
  connection_types: Record<string, number>;
  total_versions: number;
}

export interface SearchResult {
  node: KnowledgeNode;
  relevanceScore: number;
  matches: SearchMatch[];
}

export interface SearchMatch {
  field: string;
  snippet: string;
}

export interface VersionEntry {
  versionId: string;
  timestamp: Date;
  changeType: 'initial' | 'update' | 'branch-update' | 'merge';
  description: string;
  branch: string;
  metadata: {
    wordCount: number;
    conceptCount: number;
    connectionCount: number;
  };
}

export interface NovelCombination {
  target: KnowledgeNode;
  combination: KnowledgeNode;
  bridges: string[];
  novelty: number;
  reasoning: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
}
