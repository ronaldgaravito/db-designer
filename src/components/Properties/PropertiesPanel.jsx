import { useState } from 'react'
import { useStore } from '../../store/useStore'

const TYPE_OPTIONS = [
  'BIGINT', 'INT', 'FLOAT', 'DECIMAL',
  'VARCHAR', 'TEXT', 'UUID',
  'BOOLEAN', 'DATE', 'TIMESTAMP', 'JSON',
]

const TrashIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const MousePointerIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
  </svg>
)

export default function PropertiesPanel() {
  const selectedNodeId = useStore(s => s.selectedNodeId)
  const nodes          = useStore(s => s.nodes)
  const updateTableName = useStore(s => s.updateTableName)
  const addColumn      = useStore(s => s.addColumn)
  const updateColumn   = useStore(s => s.updateColumn)
  const deleteColumn   = useStore(s => s.deleteColumn)
  const deleteTable    = useStore(s => s.deleteTable)

  const selectedNode = nodes.find(n => n.id === selectedNodeId)

  if (!selectedNode) {
    return (
      <aside className="properties-panel" aria-label="Properties">
        <div className="panel-header">
          <h3>Properties</h3>
        </div>
        <div className="panel-empty">
          <MousePointerIcon />
          <p>Select a table on the<br />canvas to edit its properties.</p>
        </div>
      </aside>
    )
  }

  const { tableName, columns } = selectedNode.data

  return (
    <aside className="properties-panel" aria-label="Table properties">
      <div className="panel-header">
        <h3>Table: <span style={{ color: 'var(--text-accent)', fontFamily: "'JetBrains Mono', monospace" }}>{tableName}</span></h3>
        <button
          className="btn btn-danger btn-icon"
          onClick={() => deleteTable(selectedNodeId)}
          title="Delete table"
          id={`delete-table-${selectedNodeId}`}
        >
          <TrashIcon size={14} />
        </button>
      </div>

      <div className="panel-body">
        {/* Table Name */}
        <div className="form-group">
          <label className="form-label">Table Name</label>
          <input
            className="form-input"
            value={tableName}
            onChange={e => updateTableName(selectedNodeId, e.target.value)}
            spellCheck={false}
            id={`table-name-input-${selectedNodeId}`}
          />
        </div>

        {/* Columns */}
        <div className="form-group">
          <label className="form-label">Columns ({columns.length})</label>
          <div className="column-list">
            {columns.map((col, idx) => (
              <ColumnEditor
                key={col.id}
                col={col}
                nodeId={selectedNodeId}
                updateColumn={updateColumn}
                deleteColumn={deleteColumn}
                canDelete={columns.length > 1}
              />
            ))}
          </div>
          <button
            className="btn btn-ghost"
            style={{ marginTop: 6, fontSize: 12 }}
            onClick={() => addColumn(selectedNodeId)}
            id={`add-col-panel-${selectedNodeId}`}
          >
            <PlusIcon /> Add Column
          </button>
        </div>
      </div>

      {/* ── Footer: confirm section ── */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        <div style={{
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.25)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 10px',
          fontSize: 11,
          color: '#4ade80',
          lineHeight: 1.6,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 6,
        }}>
          <CheckIcon />
          <span>Tabla <strong style={{ color: '#86efac', fontFamily: "'JetBrains Mono', monospace" }}>{tableName}</strong> activa en el canvas. Conecta tablas arrastrando desde los puntos en los bordes del nodo.</span>
        </div>
        <button
          className="btn btn-danger"
          onClick={() => deleteTable(selectedNodeId)}
          id={`delete-table-footer-${selectedNodeId}`}
          style={{ justifyContent: 'center' }}
        >
          <TrashIcon size={14} /> Eliminar Tabla
        </button>
      </div>
    </aside>
  )
}

function ColumnEditor({ col, nodeId, updateColumn, deleteColumn, canDelete }) {
  return (
    <div className="column-item" id={`col-${col.id}`}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 4 }}>
        {/* Name */}
        <input
          className="column-item-name"
          value={col.name}
          onChange={e => updateColumn(nodeId, col.id, { name: e.target.value })}
          spellCheck={false}
          placeholder="column_name"
          id={`col-name-${col.id}`}
        />
        {/* Type + flags */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            value={col.type}
            onChange={e => updateColumn(nodeId, col.id, { type: e.target.value })}
            id={`col-type-${col.id}`}
          >
            {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <FlagToggle
            label="PK"
            checked={col.isPrimaryKey}
            onChange={v => updateColumn(nodeId, col.id, { isPrimaryKey: v })}
            title="Primary Key"
            color="var(--type-float)"
            id={`col-pk-${col.id}`}
          />
          <FlagToggle
            label="NN"
            checked={col.isNotNull}
            onChange={v => updateColumn(nodeId, col.id, { isNotNull: v })}
            title="Not Null"
            color="var(--type-int)"
            id={`col-nn-${col.id}`}
          />
          <FlagToggle
            label="UQ"
            checked={col.isUnique}
            onChange={v => updateColumn(nodeId, col.id, { isUnique: v })}
            title="Unique"
            color="var(--success)"
            id={`col-uq-${col.id}`}
          />
        </div>
      </div>

      {canDelete && (
        <button
          className="col-delete-btn"
          onClick={() => deleteColumn(nodeId, col.id)}
          title="Delete column"
          id={`del-col-${col.id}`}
        >
          <TrashIcon />
        </button>
      )}
    </div>
  )
}

function FlagToggle({ label, checked, onChange, title, color, id }) {
  return (
    <button
      id={id}
      title={title}
      onClick={() => onChange(!checked)}
      style={{
        padding: '2px 6px',
        borderRadius: 4,
        border: `1px solid ${checked ? color : 'var(--border)'}`,
        background: checked ? `${color}22` : 'transparent',
        color: checked ? color : 'var(--text-muted)',
        fontSize: 10,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: "'JetBrains Mono', monospace",
        transition: 'all 0.15s ease',
      }}
    >
      {label}
    </button>
  )
}
