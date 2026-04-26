/**
 * Transforms the current graph state (nodes + edges) into a SQL CREATE TABLE script.
 */
export function generateSQL(nodes, edges) {
  if (!nodes || nodes.length === 0) {
    return '-- No tables defined yet.\n-- Add tables in the canvas to generate SQL.'
  }

  const lines = []
  const foreignKeys = []

  // Build a map of nodeId → tableName for FK references
  const tableMap = {}
  nodes.forEach(n => {
    tableMap[n.id] = n.data.tableName
  })

  // Build foreign key pairs from edges
  // edge.source → references edge.target's PK
  edges.forEach(edge => {
    const sourceTable = tableMap[edge.source]
    const targetTable = tableMap[edge.target]
    if (!sourceTable || !targetTable) return

    // Find the FK column in source table (column that references targetTable)
    const sourceNode = nodes.find(n => n.id === edge.source)
    if (!sourceNode) return

    // Heuristic: find a column ending in _id that might reference targetTable
    const fkCol = sourceNode.data.columns.find(c =>
      c.name === `${targetTable}_id` || c.name.endsWith('_id')
    )

    if (fkCol) {
      foreignKeys.push({
        sourceTable,
        fkColumn: fkCol.name,
        targetTable,
        relation: edge.label || '1:N',
      })
    }
  })

  // Header comment
  lines.push(`-- ============================================`)
  lines.push(`-- DB Designer — Generated SQL`)
  lines.push(`-- Tables: ${nodes.length} | Relations: ${edges.length}`)
  lines.push(`-- Generated: ${new Date().toISOString()}`)
  lines.push(`-- ============================================`)
  lines.push('')

  // Generate CREATE TABLE for each node
  nodes.forEach(node => {
    const { tableName, columns } = node.data
    if (!columns || columns.length === 0) return

    lines.push(`CREATE TABLE ${tableName} (`)

    const colLines = columns.map((col, idx) => {
      const parts = [`  ${col.name} ${col.type}`]

      if (col.type === 'VARCHAR') parts[0] += '(255)'

      if (col.isPrimaryKey) parts.push('PRIMARY KEY')
      if (col.isNotNull && !col.isPrimaryKey) parts.push('NOT NULL')
      if (col.isUnique && !col.isPrimaryKey) parts.push('UNIQUE')
      if (col.defaultValue) parts.push(`DEFAULT ${col.defaultValue}`)

      return parts.join(' ')
    })

    // Attach FK constraints inline
    const fks = foreignKeys.filter(fk => fk.sourceTable === tableName)
    fks.forEach(fk => {
      colLines.push(`  FOREIGN KEY (${fk.fkColumn}) REFERENCES ${fk.targetTable}(id)`)
    })

    lines.push(colLines.join(',\n'))
    lines.push(');')
    lines.push('')
  })

  // N:M junction hint
  const nmEdges = edges.filter(e => e.label === 'N:M')
  if (nmEdges.length > 0) {
    lines.push('-- ── N:M Junction Tables (create manually) ──')
    nmEdges.forEach(edge => {
      const src = tableMap[edge.source]
      const tgt = tableMap[edge.target]
      if (!src || !tgt) return
      lines.push(`-- CREATE TABLE ${src}_${tgt} (`)
      lines.push(`--   ${src}_id BIGINT REFERENCES ${src}(id),`)
      lines.push(`--   ${tgt}_id BIGINT REFERENCES ${tgt}(id),`)
      lines.push(`--   PRIMARY KEY (${src}_id, ${tgt}_id)`)
      lines.push('-- );')
      lines.push('')
    })
  }

  return lines.join('\n')
}

/**
 * Returns highlighted HTML for the SQL block
 * (simple keyword coloring without a heavy library)
 */
export function highlightSQL(sql) {
  const keywords = ['CREATE', 'TABLE', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
    'NOT', 'NULL', 'UNIQUE', 'DEFAULT', 'INSERT', 'INTO', 'VALUES', 'SELECT',
    'FROM', 'WHERE', 'AND', 'OR', 'IF', 'EXISTS', 'DROP', 'ALTER', 'ADD',
    'CONSTRAINT', 'INDEX', 'ON', 'CASCADE']
  const types = ['BIGINT', 'INT', 'VARCHAR', 'TEXT', 'BOOLEAN', 'TIMESTAMP',
    'DATE', 'FLOAT', 'DECIMAL', 'UUID', 'JSON', 'JSONB', 'SERIAL']

  return sql
    .split('\n')
    .map(line => {
      if (line.trimStart().startsWith('--')) {
        return `<span class="sql-comment">${escapeHtml(line)}</span>`
      }
      let result = escapeHtml(line)
      keywords.forEach(kw => {
        result = result.replace(new RegExp(`\\b${kw}\\b`, 'g'),
          `<span class="sql-keyword">${kw}</span>`)
      })
      types.forEach(t => {
        result = result.replace(new RegExp(`\\b${t}\\b`, 'g'),
          `<span class="sql-type">${t}</span>`)
      })
      return result
    })
    .join('\n')
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
