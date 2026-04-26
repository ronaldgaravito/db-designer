import { create } from 'zustand'
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'db-designer-state'

const generateId = () => `tbl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
const generateColId = () => `col_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

const defaultColumn = (overrides = {}) => ({
  id: generateColId(),
  name: 'new_column',
  type: 'VARCHAR',
  isPrimaryKey: false,
  isNotNull: false,
  isUnique: false,
  defaultValue: '',
  ...overrides,
})

// ── Templates ──────────────────────────────────────────────
const TEMPLATES = {
  ecommerce: {
    nodes: [
      {
        id: 'tbl_users', type: 'tableNode',
        position: { x: 60, y: 80 },
        data: {
          tableName: 'users',
          columns: [
            { id: 'c1', name: 'id',         type: 'BIGINT',    isPrimaryKey: true,  isNotNull: true,  isUnique: true },
            { id: 'c2', name: 'email',       type: 'VARCHAR',   isPrimaryKey: false, isNotNull: true,  isUnique: true },
            { id: 'c3', name: 'name',        type: 'VARCHAR',   isPrimaryKey: false, isNotNull: true,  isUnique: false },
            { id: 'c4', name: 'created_at',  type: 'TIMESTAMP', isPrimaryKey: false, isNotNull: true,  isUnique: false },
          ],
        },
      },
      {
        id: 'tbl_products', type: 'tableNode',
        position: { x: 380, y: 80 },
        data: {
          tableName: 'products',
          columns: [
            { id: 'c5', name: 'id',          type: 'BIGINT',  isPrimaryKey: true,  isNotNull: true,  isUnique: true },
            { id: 'c6', name: 'name',         type: 'VARCHAR', isPrimaryKey: false, isNotNull: true,  isUnique: false },
            { id: 'c7', name: 'price',        type: 'DECIMAL', isPrimaryKey: false, isNotNull: true,  isUnique: false },
            { id: 'c8', name: 'stock',        type: 'INT',     isPrimaryKey: false, isNotNull: true,  isUnique: false },
            { id: 'c9', name: 'category_id',  type: 'BIGINT',  isPrimaryKey: false, isNotNull: false, isUnique: false },
          ],
        },
      },
      {
        id: 'tbl_orders', type: 'tableNode',
        position: { x: 700, y: 80 },
        data: {
          tableName: 'orders',
          columns: [
            { id: 'c10', name: 'id',          type: 'BIGINT',    isPrimaryKey: true,  isNotNull: true,  isUnique: true },
            { id: 'c11', name: 'user_id',      type: 'BIGINT',    isPrimaryKey: false, isNotNull: true,  isUnique: false },
            { id: 'c12', name: 'total',        type: 'DECIMAL',   isPrimaryKey: false, isNotNull: true,  isUnique: false },
            { id: 'c13', name: 'status',       type: 'VARCHAR',   isPrimaryKey: false, isNotNull: true,  isUnique: false },
            { id: 'c14', name: 'created_at',   type: 'TIMESTAMP', isPrimaryKey: false, isNotNull: true,  isUnique: false },
          ],
        },
      },
      {
        id: 'tbl_order_items', type: 'tableNode',
        position: { x: 700, y: 360 },
        data: {
          tableName: 'order_items',
          columns: [
            { id: 'c15', name: 'id',           type: 'BIGINT',  isPrimaryKey: true,  isNotNull: true,  isUnique: true },
            { id: 'c16', name: 'order_id',      type: 'BIGINT',  isPrimaryKey: false, isNotNull: true,  isUnique: false },
            { id: 'c17', name: 'product_id',    type: 'BIGINT',  isPrimaryKey: false, isNotNull: true,  isUnique: false },
            { id: 'c18', name: 'quantity',      type: 'INT',     isPrimaryKey: false, isNotNull: true,  isUnique: false },
            { id: 'c19', name: 'unit_price',    type: 'DECIMAL', isPrimaryKey: false, isNotNull: true,  isUnique: false },
          ],
        },
      },
      {
        id: 'tbl_categories', type: 'tableNode',
        position: { x: 380, y: 360 },
        data: {
          tableName: 'categories',
          columns: [
            { id: 'c20', name: 'id',           type: 'BIGINT',  isPrimaryKey: true,  isNotNull: true,  isUnique: true },
            { id: 'c21', name: 'name',          type: 'VARCHAR', isPrimaryKey: false, isNotNull: true,  isUnique: true },
            { id: 'c22', name: 'description',   type: 'TEXT',    isPrimaryKey: false, isNotNull: false, isUnique: false },
          ],
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'tbl_users',      target: 'tbl_orders',      label: '1:N', animated: true, style: { stroke: '#6C63FF', strokeWidth: 2 } },
      { id: 'e2', source: 'tbl_orders',     target: 'tbl_order_items', label: '1:N', animated: true, style: { stroke: '#6C63FF', strokeWidth: 2 } },
      { id: 'e3', source: 'tbl_products',   target: 'tbl_order_items', label: '1:N', animated: true, style: { stroke: '#6C63FF', strokeWidth: 2 } },
      { id: 'e4', source: 'tbl_categories', target: 'tbl_products',    label: '1:N', animated: true, style: { stroke: '#6C63FF', strokeWidth: 2 } },
    ],
  },

  blog: {
    nodes: [
      {
        id: 'tbl_users', type: 'tableNode',
        position: { x: 60, y: 100 },
        data: {
          tableName: 'users',
          columns: [
            { id: 'b1', name: 'id',          type: 'BIGINT',  isPrimaryKey: true,  isNotNull: true,  isUnique: true },
            { id: 'b2', name: 'username',     type: 'VARCHAR', isPrimaryKey: false, isNotNull: true,  isUnique: true },
            { id: 'b3', name: 'email',        type: 'VARCHAR', isPrimaryKey: false, isNotNull: true,  isUnique: true },
            { id: 'b4', name: 'avatar_url',   type: 'TEXT',    isPrimaryKey: false, isNotNull: false, isUnique: false },
          ],
        },
      },
      {
        id: 'tbl_posts', type: 'tableNode',
        position: { x: 360, y: 100 },
        data: {
          tableName: 'posts',
          columns: [
            { id: 'b5', name: 'id',          type: 'BIGINT',    isPrimaryKey: true,  isNotNull: true,  isUnique: true },
            { id: 'b6', name: 'title',        type: 'VARCHAR',   isPrimaryKey: false, isNotNull: true,  isUnique: false },
            { id: 'b7', name: 'content',      type: 'TEXT',      isPrimaryKey: false, isNotNull: true,  isUnique: false },
            { id: 'b8', name: 'author_id',    type: 'BIGINT',    isPrimaryKey: false, isNotNull: true,  isUnique: false },
            { id: 'b9', name: 'published_at', type: 'TIMESTAMP', isPrimaryKey: false, isNotNull: false, isUnique: false },
          ],
        },
      },
      {
        id: 'tbl_comments', type: 'tableNode',
        position: { x: 660, y: 100 },
        data: {
          tableName: 'comments',
          columns: [
            { id: 'b10', name: 'id',       type: 'BIGINT',    isPrimaryKey: true,  isNotNull: true,  isUnique: true },
            { id: 'b11', name: 'post_id',  type: 'BIGINT',    isPrimaryKey: false, isNotNull: true,  isUnique: false },
            { id: 'b12', name: 'user_id',  type: 'BIGINT',    isPrimaryKey: false, isNotNull: true,  isUnique: false },
            { id: 'b13', name: 'content',  type: 'TEXT',      isPrimaryKey: false, isNotNull: true,  isUnique: false },
            { id: 'b14', name: 'created_at', type: 'TIMESTAMP', isPrimaryKey: false, isNotNull: true, isUnique: false },
          ],
        },
      },
      {
        id: 'tbl_tags', type: 'tableNode',
        position: { x: 360, y: 380 },
        data: {
          tableName: 'tags',
          columns: [
            { id: 'b15', name: 'id',       type: 'BIGINT',  isPrimaryKey: true,  isNotNull: true,  isUnique: true },
            { id: 'b16', name: 'name',     type: 'VARCHAR', isPrimaryKey: false, isNotNull: true,  isUnique: true },
            { id: 'b17', name: 'slug',     type: 'VARCHAR', isPrimaryKey: false, isNotNull: true,  isUnique: true },
          ],
        },
      },
    ],
    edges: [
      { id: 'be1', source: 'tbl_users', target: 'tbl_posts',    label: '1:N', animated: true, style: { stroke: '#6C63FF', strokeWidth: 2 } },
      { id: 'be2', source: 'tbl_posts', target: 'tbl_comments', label: '1:N', animated: true, style: { stroke: '#6C63FF', strokeWidth: 2 } },
      { id: 'be3', source: 'tbl_users', target: 'tbl_comments', label: '1:N', animated: true, style: { stroke: '#6C63FF', strokeWidth: 2 } },
      { id: 'be4', source: 'tbl_posts', target: 'tbl_tags',     label: 'N:M', animated: true, style: { stroke: '#38BDF8', strokeWidth: 2 } },
    ],
  },
}

// ── Load from localStorage ──
const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return null
}

const saveState = (nodes, edges) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }))
  } catch (_) {}
}

const saved = loadState()

// ── Store ──────────────────────────────────────────────────
export const useStore = create((set, get) => ({
  nodes: saved?.nodes ?? [],
  edges: saved?.edges ?? [],
  selectedNodeId: null,
  showExportModal: false,
  currentDiagramId: null,
  userDiagrams: [],
  isSaving: false,

  // ── React Flow change handlers (use official helpers) ──
  onNodesChange: (changes) => {
    const nodes = applyNodeChanges(changes, get().nodes)
    set({ nodes })
    saveState(nodes, get().edges)
  },

  onEdgesChange: (changes) => {
    const edges = applyEdgeChanges(changes, get().edges)
    set({ edges })
    saveState(get().nodes, edges)
  },

  // ── Node operations ──
  addTable: () => {
    const id = generateId()
    const newNode = {
      id,
      type: 'tableNode',
      position: { x: 200 + Math.random() * 200, y: 150 + Math.random() * 150 },
      data: {
        tableName: `table_${get().nodes.length + 1}`,
        columns: [
          { id: generateColId(), name: 'id', type: 'BIGINT', isPrimaryKey: true, isNotNull: true, isUnique: true },
        ],
      },
    }
    const nodes = [...get().nodes, newNode]
    set({ nodes, selectedNodeId: id })
    saveState(nodes, get().edges)
  },

  updateNodes: (nodes) => {
    set({ nodes })
    saveState(nodes, get().edges)
  },

  onConnect: (connection) => {
    const newEdge = {
      ...connection,
      id: `edge_${Date.now()}`,
      label: '1:N',
      animated: true,
      style: { stroke: '#6C63FF', strokeWidth: 2 },
    }
    const edges = addEdge(newEdge, get().edges)
    set({ edges })
    saveState(get().nodes, edges)
  },

  selectNode: (id) => set({ selectedNodeId: id }),
  deselectAll: () => set({ selectedNodeId: null }),

  // ── Update table data ──
  updateTableName: (nodeId, name) => {
    const nodes = get().nodes.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, tableName: name } } : n
    )
    set({ nodes })
    saveState(nodes, get().edges)
  },

  addColumn: (nodeId) => {
    const nodes = get().nodes.map(n => {
      if (n.id !== nodeId) return n
      return { ...n, data: { ...n.data, columns: [...n.data.columns, defaultColumn()] } }
    })
    set({ nodes })
    saveState(nodes, get().edges)
  },

  updateColumn: (nodeId, colId, updates) => {
    const nodes = get().nodes.map(n => {
      if (n.id !== nodeId) return n
      return {
        ...n,
        data: {
          ...n.data,
          columns: n.data.columns.map(c => c.id === colId ? { ...c, ...updates } : c),
        },
      }
    })
    set({ nodes })
    saveState(nodes, get().edges)
  },

  deleteColumn: (nodeId, colId) => {
    const nodes = get().nodes.map(n => {
      if (n.id !== nodeId) return n
      return { ...n, data: { ...n.data, columns: n.data.columns.filter(c => c.id !== colId) } }
    })
    set({ nodes })
    saveState(nodes, get().edges)
  },

  deleteTable: (nodeId) => {
    const nodes = get().nodes.filter(n => n.id !== nodeId)
    const edges = get().edges.filter(e => e.source !== nodeId && e.target !== nodeId)
    set({ nodes, edges, selectedNodeId: null })
    saveState(nodes, edges)
  },

  updateEdgeLabel: (edgeId, label) => {
    const edges = get().edges.map(e => e.id === edgeId ? { ...e, label } : e)
    set({ edges })
    saveState(get().nodes, edges)
  },

  // ── Templates ──
  loadTemplate: (name) => {
    const tpl = TEMPLATES[name]
    if (!tpl) return
    set({ nodes: tpl.nodes, edges: tpl.edges, selectedNodeId: null })
    saveState(tpl.nodes, tpl.edges)
  },

  clearAll: () => {
    set({ nodes: [], edges: [], selectedNodeId: null, currentDiagramId: null })
    localStorage.removeItem(STORAGE_KEY)
  },

  // ── Export modal ──
  openExportModal: () => set({ showExportModal: true }),
  closeExportModal: () => set({ showExportModal: false }),

  // ── Supabase Cloud Operations ──
  saveToCloud: async (userId, name = 'Untitled Diagram') => {
    if (!userId) return
    set({ isSaving: true })
    const { nodes, edges, currentDiagramId } = get()
    
    const diagramData = {
      user_id: userId,
      name,
      nodes,
      edges,
    }

    let result
    if (currentDiagramId) {
      result = await supabase
        .from('diagrams')
        .update(diagramData)
        .eq('id', currentDiagramId)
        .select()
    } else {
      result = await supabase
        .from('diagrams')
        .insert(diagramData)
        .select()
    }

    if (!result.error && result.data?.[0]) {
      set({ currentDiagramId: result.data[0].id })
      get().fetchUserDiagrams(userId)
    }
    set({ isSaving: false })
    return result
  },

  fetchUserDiagrams: async (userId) => {
    if (!userId) return
    const { data, error } = await supabase
      .from('diagrams')
      .select('id, name, updated_at')
      .order('updated_at', { ascending: false })
    
    if (!error) set({ userDiagrams: data })
  },

  loadFromCloud: async (diagramId) => {
    const { data, error } = await supabase
      .from('diagrams')
      .select('*')
      .eq('id', diagramId)
      .single()
    
    if (!error && data) {
      set({
        nodes: data.nodes,
        edges: data.edges,
        currentDiagramId: data.id,
        selectedNodeId: null
      })
      saveState(data.nodes, data.edges)
    }
  },

  deleteFromCloud: async (diagramId, userId) => {
    const { error } = await supabase
      .from('diagrams')
      .delete()
      .eq('id', diagramId)
    
    if (!error) {
      if (get().currentDiagramId === diagramId) {
        set({ currentDiagramId: null })
      }
      get().fetchUserDiagrams(userId)
    }
  }
}))

export { TEMPLATES }
