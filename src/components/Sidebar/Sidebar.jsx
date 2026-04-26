import { useState, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { useAuth } from '../../hooks/useAuth'
import AuthModal from '../Modals/AuthModal'

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 5v14M5 12h14" />
  </svg>
)
const ExportIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)
const TemplateIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)
const CloudIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M17.5 19a5.5 5.5 0 0 0 0-11h-1.5a7 7 0 1 0-11 5.5" />
    <path d="M12 17v-5" />
    <path d="M9 14l3 3 3-3" />
  </svg>
)
const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const TEMPLATES_META = [
  { key: 'ecommerce', name: 'E-Commerce', desc: '5 tables · Users, Products, Orders' },
  { key: 'blog',      name: 'Blog',       desc: '4 tables · Users, Posts, Comments, Tags' },
]

export default function Sidebar() {
  const addTable      = useStore(s => s.addTable)
  const loadTemplate  = useStore(s => s.loadTemplate)
  const clearAll      = useStore(s => s.clearAll)
  const openExport    = useStore(s => s.openExportModal)
  const nodes         = useStore(s => s.nodes)
  const edges         = useStore(s => s.edges)
  
  // Supabase store actions
  const saveToCloud      = useStore(s => s.saveToCloud)
  const fetchUserDiagrams = useStore(s => s.fetchUserDiagrams)
  const userDiagrams     = useStore(s => s.userDiagrams)
  const loadFromCloud    = useStore(s => s.loadFromCloud)
  const isSaving         = useStore(s => s.isSaving)
  const currentDiagramId = useStore(s => s.currentDiagramId)
  const deleteFromCloud  = useStore(s => s.deleteFromCloud)

  const { user, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserDiagrams(user.id)
    }
  }, [user, fetchUserDiagrams])

  const handleClear = () => {
    if (nodes.length === 0 || window.confirm('Clear all tables and relations?')) {
      clearAll()
    }
  }

  const handleSave = async () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    const name = window.prompt('Enter diagram name:', nodes.length > 0 ? nodes[0].data.tableName + ' schema' : 'Untitled Diagram')
    if (name) {
      await saveToCloud(user.id, name)
    }
  }

  return (
    <aside className="sidebar" role="complementary" aria-label="Design tools">
      {/* Logo */}
      <div className="sidebar-logo">
        <h1>DB Designer</h1>
        <p>Visual Schema Builder</p>
      </div>

      {/* User Section */}
      <div className="sidebar-section">
        <p className="sidebar-section-title">Account</p>
        {user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <UserIcon />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</span>
            </div>
            <button className="btn btn-ghost" onClick={signOut} style={{ fontSize: '12px', padding: '6px' }}>
              Sign Out
            </button>
          </div>
        ) : (
          <button className="btn btn-outline" onClick={() => setShowAuthModal(true)}>
            <UserIcon /> Sign In to Sync
          </button>
        )}
      </div>

      {/* Add table */}
      <div className="sidebar-section">
        <p className="sidebar-section-title">Design</p>
        <button className="btn btn-primary" onClick={addTable} id="add-table-btn">
          <PlusIcon />
          Add Table
        </button>
      </div>

      {/* Cloud Diagrams */}
      {user && (
        <div className="sidebar-section">
          <p className="sidebar-section-title">My Diagrams</p>
          <button 
            className="btn btn-outline" 
            onClick={handleSave} 
            disabled={isSaving || nodes.length === 0}
            style={{ marginBottom: '10px' }}
          >
            <CloudIcon /> {isSaving ? 'Saving...' : (currentDiagramId ? 'Update in Cloud' : 'Save to Cloud')}
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '150px', overflowY: 'auto' }}>
            {userDiagrams.map(diag => (
              <div 
                key={diag.id} 
                className="template-card" 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderColor: currentDiagramId === diag.id ? 'var(--accent)' : 'var(--border)'
                }}
                onClick={() => loadFromCloud(diag.id)}
              >
                <div style={{ overflow: 'hidden' }}>
                  <div className="template-card-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{diag.name}</div>
                  <div className="template-card-desc">{new Date(diag.updated_at).toLocaleDateString()}</div>
                </div>
                <button 
                  className="btn-icon" 
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm('Delete this diagram from cloud?')) {
                      deleteFromCloud(diag.id, user.id)
                    }
                  }}
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
            {userDiagrams.length === 0 && (
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>No saved diagrams</p>
            )}
          </div>
        </div>
      )}

      {/* Templates */}
      <div className="sidebar-section">
        <p className="sidebar-section-title">Templates</p>
        {TEMPLATES_META.map(tpl => (
          <div
            key={tpl.key}
            className="template-card"
            onClick={() => loadTemplate(tpl.key)}
            id={`template-${tpl.key}`}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && loadTemplate(tpl.key)}
          >
            <div className="template-card-name">
              <TemplateIcon /> &nbsp;{tpl.name}
            </div>
            <div className="template-card-desc">{tpl.desc}</div>
          </div>
        ))}
      </div>

      {/* Footer actions */}
      <div className="sidebar-footer">
        <button
          className="btn btn-primary"
          onClick={openExport}
          id="export-sql-btn"
          disabled={nodes.length === 0}
          style={{ opacity: nodes.length === 0 ? 0.4 : 1 }}
        >
          <ExportIcon />
          Export SQL
        </button>
        <button className="btn btn-ghost" onClick={handleClear} id="clear-btn" style={{ color: 'var(--danger)' }}>
          <TrashIcon />
          Clear Canvas
        </button>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </aside>
  )
}
