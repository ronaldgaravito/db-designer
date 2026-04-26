import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { useStore } from '../../store/useStore'

const TableIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
)

const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

function TableNode({ id, data, selected }) {
  const { tableName, columns } = data
  const addColumn = useStore(s => s.addColumn)
  const selectNode = useStore(s => s.selectNode)

  const handleAddCol = (e) => {
    e.stopPropagation()
    addColumn(id)
  }

  return (
    <div
      className={`table-node ${selected ? 'selected' : ''}`}
      onClick={() => selectNode(id)}
      id={`node-${id}`}
    >
      {/*
        Single handle per side.
        Canvas uses connectionMode="loose" so any handle → any handle works.
      */}
      <Handle type="source" position={Position.Left}   id="left"   />
      <Handle type="source" position={Position.Right}  id="right"  />
      <Handle type="source" position={Position.Top}    id="top"    />
      <Handle type="source" position={Position.Bottom} id="bottom" />

      {/* Header */}
      <div className="table-node-header">
        <div className="table-icon"><TableIcon /></div>
        <span className="table-node-name">{tableName}</span>
      </div>

      {/* Columns */}
      <div className="table-node-body">
        {columns && columns.length > 0 ? (
          columns.map(col => (
            <div key={col.id} className="table-row">
              {col.isPrimaryKey && (
                <span className="pk-indicator" title="Primary Key">🔑</span>
              )}
              <span className="table-row-name">{col.name || 'unnamed'}</span>
              <span className={`table-row-type type-${col.type}`}>{col.type}</span>
            </div>
          ))
        ) : (
          <div className="table-row" style={{ color: 'var(--text-muted)', fontSize: 11 }}>
            No columns yet
          </div>
        )}
      </div>

      {/* Footer: add column */}
      <div className="table-node-footer">
        <button className="add-col-btn" onClick={handleAddCol} id={`add-col-${id}`}>
          <PlusIcon /> Add column
        </button>
      </div>
    </div>
  )
}

export default memo(TableNode)
