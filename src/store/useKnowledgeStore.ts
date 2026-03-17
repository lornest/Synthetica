import { create } from 'zustand'
import KnowledgeGraph from '@/core/knowledge-graph.js'
import type {
  KnowledgeNode,
  Connection,
  GraphStats,
  SearchResult,
  Domain,
  ContentType,
  Notification,
  VersionEntry,
  NovelCombination,
} from '@/types'

const STORAGE_KEY = 'synthetica-knowledge-graph'

interface KnowledgeState {
  nodes: Map<string, KnowledgeNode>
  connections: Connection[]
  stats: GraphStats
  selectedNodeId: string | null
  searchQuery: string
  searchResults: SearchResult[]
  highlightedNodeIds: Set<string>
  notifications: Notification[]

  addNode: (
    title: string,
    content: string,
    domain: Domain,
    tags?: string[],
    contentType?: ContentType,
    metadata?: Record<string, unknown>
  ) => KnowledgeNode
  updateNode: (nodeId: string, updates: Partial<KnowledgeNode>, description?: string) => void
  deleteNode: (nodeId: string) => void
  selectNode: (nodeId: string | null) => void
  search: (query: string) => void
  importData: (jsonString: string) => void

  getSelectedNode: () => KnowledgeNode | null
  getNodeConnections: (nodeId: string) => Connection[]
  getNodeHistory: (nodeId: string) => VersionEntry[]
  getNovelCombinations: (nodeId: string) => NovelCombination[]
  getCrossDomainInsights: () => Array<[KnowledgeNode, KnowledgeNode, Connection]>

  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void

  _engine: any
  _syncFromEngine: () => void
  _persistToStorage: () => void
}

// Singleton engine instance
const engine = new KnowledgeGraph()

const defaultStats: GraphStats = {
  total_nodes: 0,
  total_connections: 0,
  cross_domain_connections: 0,
  domains: {} as Record<string, number>,
  connection_types: {} as Record<string, number>,
  total_versions: 0,
}

export const useKnowledgeStore = create<KnowledgeState>((set, get) => ({
  nodes: new Map(),
  connections: [],
  stats: defaultStats,
  selectedNodeId: null,
  searchQuery: '',
  searchResults: [],
  highlightedNodeIds: new Set<string>(),
  notifications: [],
  _engine: engine,

  _syncFromEngine: () => {
    const stats = engine.getStats() as GraphStats
    set({
      nodes: new Map(engine.nodes),
      connections: [...engine.connections],
      stats,
    })
  },

  _persistToStorage: () => {
    try {
      const data = engine.exportData({ includeVersions: true })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.warn('Failed to persist to localStorage:', e)
    }
  },

  addNode: (title, content, domain, tags = [], contentType = 'text', metadata = {}) => {
    const node = engine.addNode(title, content, domain, tags, contentType, metadata) as KnowledgeNode
    get()._syncFromEngine()
    get()._persistToStorage()
    get().addNotification({
      type: 'success',
      title: 'Node Added',
      message: `"${node.title}" planted in ${node.domain}. Found ${engine.getNodeConnections(node.id).length} connections.`,
      duration: 4000,
    })
    return node
  },

  updateNode: (nodeId, updates, description) => {
    engine.updateNode(nodeId, updates, description)
    get()._syncFromEngine()
    get()._persistToStorage()
    const query = get().searchQuery
    if (query) get().search(query)
  },

  deleteNode: (nodeId) => {
    const node = engine.nodes.get(nodeId)
    engine.deleteNode(nodeId)
    const state = get()
    state._syncFromEngine()
    state._persistToStorage()
    if (state.selectedNodeId === nodeId) {
      set({ selectedNodeId: null })
    }
    if (node) {
      state.addNotification({
        type: 'info',
        title: 'Node Deleted',
        message: `"${node.title}" has been removed.`,
        duration: 3000,
      })
    }
    const query = get().searchQuery
    if (query) get().search(query)
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  search: (query) => {
    set({ searchQuery: query })
    if (!query.trim()) {
      set({ searchResults: [], highlightedNodeIds: new Set<string>() })
      return
    }
    const results = engine.searchNodes(query, { limit: 20 }) as SearchResult[]
    const highlighted = new Set<string>(results.map((r) => r.node.id))
    set({ searchResults: results, highlightedNodeIds: highlighted })
  },

  importData: (jsonString) => {
    try {
      const data = JSON.parse(jsonString)
      engine.importData(data)
      get()._syncFromEngine()
      get()._persistToStorage()
      get().addNotification({
        type: 'success',
        title: 'Data Imported',
        message: `Imported ${engine.nodes.size} nodes and ${engine.connections.length} connections.`,
        duration: 4000,
      })
    } catch (e) {
      get().addNotification({
        type: 'error',
        title: 'Import Failed',
        message: `Could not parse import file: ${e instanceof Error ? e.message : 'Unknown error'}`,
        duration: 5000,
      })
    }
  },

  getSelectedNode: () => {
    const { selectedNodeId, nodes } = get()
    if (!selectedNodeId) return null
    return nodes.get(selectedNodeId) || null
  },

  getNodeConnections: (nodeId) => {
    return engine.getNodeConnections(nodeId) as Connection[]
  },

  getNodeHistory: (nodeId) => {
    const timeline = engine.getNodeEvolution(nodeId)
    return (timeline?.versions || []) as VersionEntry[]
  },

  getNovelCombinations: (nodeId) => {
    return engine.getNovelCombinations(nodeId) as NovelCombination[]
  },

  getCrossDomainInsights: () => {
    return engine.findCrossDomainInsights() as Array<[KnowledgeNode, KnowledgeNode, Connection]>
  },

  addNotification: (notification) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    const notif = { ...notification, id }
    set((state) => ({ notifications: [...state.notifications, notif] }))
    if (notification.duration) {
      setTimeout(() => get().removeNotification(id), notification.duration)
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },
}))

// Hydrate from localStorage or seed with sample data
function hydrateStore() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      engine.importData(data)
      useKnowledgeStore.getState()._syncFromEngine()
      return
    }
  } catch (e) {
    console.warn('Failed to restore from localStorage:', e)
  }

  // No saved data — add samples
  engine.addNode(
    'Neural Network Architecture',
    'Modern neural networks use transformer architectures with attention mechanisms to process sequential data efficiently',
    'technology',
    ['ai', 'transformers'],
    'text'
  )
  engine.addNode(
    'Biological Neural Networks',
    'Neurons in the brain form complex networks that process information through electrical and chemical signals, exhibiting plasticity and learning',
    'biology',
    ['neurons', 'networks'],
    'text'
  )
  useKnowledgeStore.getState()._syncFromEngine()
  useKnowledgeStore.getState()._persistToStorage()
}

hydrateStore()
