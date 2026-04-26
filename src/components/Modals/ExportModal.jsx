import { useState, useEffect, useRef } from 'react'
import { useStore } from '../../store/useStore'
import { generateSQL, highlightSQL } from '../../utils/sqlGenerator'

const CopyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)
const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export default function ExportModal() {
  const nodes         = useStore(s => s.nodes)
  const edges         = useStore(s => s.edges)
  const closeModal    = useStore(s => s.closeExportModal)
  const [copied, setCopied] = useState(false)

  const sql = generateSQL(nodes, edges)
  const highlighted = highlightSQL(sql)

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeModal() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeModal])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = sql
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([sql], { type: 'text/sql' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'schema.sql'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="modal-overlay" onClick={closeModal} role="dialog" aria-modal="true" aria-label="Export SQL">
      <div className="modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>
            <span style={{ color: 'var(--text-accent)', marginRight: 8 }}>{'</>'}</span>
            Generated SQL
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={closeModal} id="close-modal-btn">
            <XIcon />
          </button>
        </div>

        {/* Summary badges */}
        <div style={{ padding: '10px 24px', display: 'flex', gap: 8, borderBottom: '1px solid var(--border)' }}>
          <Badge label={`${nodes.length} Tables`}  color="var(--accent)" />
          <Badge label={`${edges.length} Relations`} color="var(--info)" />
          <Badge
            label={`${nodes.reduce((a, n) => a + (n.data.columns?.length ?? 0), 0)} Columns`}
            color="var(--success)"
          />
        </div>

        {/* SQL block */}
        <div className="modal-body">
          <div
            className="sql-block"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={handleCopy} id="copy-sql-btn">
            {copied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy SQL</>}
          </button>
          <button className="btn btn-success" onClick={handleDownload} id="download-sql-btn">
            <DownloadIcon /> Download .sql
          </button>
        </div>
      </div>
    </div>
  )
}

function Badge({ label, color }) {
  return (
    <span style={{
      padding: '3px 10px',
      borderRadius: 99,
      border: `1px solid ${color}44`,
      background: `${color}18`,
      color,
      fontSize: 11,
      fontWeight: 600,
    }}>
      {label}
    </span>
  )
}
