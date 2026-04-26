import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  ConnectionMode,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useStore } from '../../store/useStore'
import TableNode from '../Nodes/TableNode'

const nodeTypes = { tableNode: TableNode }

const defaultEdgeOptions = {
  type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed, color: '#6C63FF' },
  style: { stroke: '#6C63FF', strokeWidth: 2 },
  animated: true,
}

const DatabaseIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--text-secondary)' }}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
)

export default function Canvas() {
  const nodes          = useStore(s => s.nodes)
  const edges          = useStore(s => s.edges)
  const onNodesChange  = useStore(s => s.onNodesChange)
  const onEdgesChange  = useStore(s => s.onEdgesChange)
  const onConnect      = useStore(s => s.onConnect)
  const deselectAll    = useStore(s => s.deselectAll)
  const selectNode     = useStore(s => s.selectNode)

  return (
    <div className="canvas-area">
      {nodes.length === 0 && (
        <div className="canvas-empty-state">
          <DatabaseIcon />
          <h2>Your canvas is empty</h2>
          <p>Click <strong>"Add Table"</strong> in the sidebar<br />or load a template to get started.</p>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onPaneClick={deselectAll}
        onNodeClick={(_, node) => selectNode(node.id)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        connectionMode={ConnectionMode.Loose}
        minZoom={0.3}
        maxZoom={2}
        deleteKeyCode="Delete"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(255,255,255,0.03)" gap={28} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor="#6C63FF"
          maskColor="rgba(8, 12, 21, 0.85)"
          style={{ right: 16, bottom: 80 }}
        />
      </ReactFlow>
    </div>
  )
}
