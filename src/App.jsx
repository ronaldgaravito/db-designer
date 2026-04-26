import { useStore } from './store/useStore'
import Sidebar from './components/Sidebar/Sidebar'
import Canvas from './components/Canvas/Canvas'
import PropertiesPanel from './components/Properties/PropertiesPanel'
import ExportModal from './components/Modals/ExportModal'

export default function App() {
  const showExportModal = useStore(s => s.showExportModal)

  return (
    <div className="app-layout">
      <Sidebar />
      <Canvas />
      <PropertiesPanel />
      {showExportModal && <ExportModal />}
    </div>
  )
}
