import styles from './app-bar.module.css';
import './variables.css';

import useStore from '@/store/store';

import { useContext } from 'react';
import { Toolbar } from './toolbar';
import { ProjectSelection } from './project-selection';
import { Controls } from './controls';
import { UndoRedoContext } from '@/providers/undo-redo-provider';
import { useElkLayout } from '@/hooks/use-elk-layout/use-elk-layout';
import { useNoAccessModal } from '@/features/modals/no-access/use-no-access-modal';
import { useTheme } from '../../hooks/use-theme';
import { useAuth } from '@/features/auth/auth-provider';

export function AppBarContainer() {
  const documentName = useStore((state) => state.documentName || '');
  const isReadOnlyMode = useStore((store) => store.isReadOnlyMode);
  const saveDiagram = useStore((store) => store.saveDiagram);
  const setToggleReadOnlyMode = useStore((store) => store.setToggleReadOnlyMode);
  const layoutDirection = useStore((store) => store.layoutDirection);
  const setLayoutDirection = useStore((store) => store.setLayoutDirection);
  const showGrid = useStore((store) => store.showGrid);
  const setShowGrid = useStore((store) => store.setShowGrid);

  const { undo, redo, canUndo, canRedo } = useContext(UndoRedoContext);
  const { openNoAccessModal } = useNoAccessModal();
  const { theme, toggleTheme } = useTheme();
  const { isGuest, logout } = useAuth();
  
  const startSimulation = useStore((store) => store.startSimulation);
  const stopSimulation = useStore((store) => store.stopSimulation);
  const isSimulating = useStore((store) => store.isSimulating);
  const isPaused = useStore((store) => store.isPaused);
  const pauseSimulation = useStore((store) => store.pauseSimulation);
  const resumeSimulation = useStore((store) => store.resumeSimulation);

  const layout = useElkLayout();

  function handleSave() {
    saveDiagram(true);
  }

  function handleSimulate() {
    if (isSimulating) {
      if (isPaused) {
        resumeSimulation();
      } else {
        pauseSimulation();
      }
    } else {
      startSimulation();
    }
  }

  function handleChangeReadonlyMode(value: boolean) {
    setToggleReadOnlyMode(value);
  }

  async function handleLayoutChange(isVertical: boolean) {
    const direction = isVertical ? 'DOWN' : 'RIGHT';
    setLayoutDirection(direction);

    await layout(direction);
  }

  return (
    <div className={styles['container']}>
      <Toolbar
        onSave={handleSave}
        onOpen={openNoAccessModal}
        onSimulate={handleSimulate}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        isReadOnlyMode={isReadOnlyMode}
        isSimulating={isSimulating}
        isPaused={isPaused}
      />
      <ProjectSelection
        documentName={documentName}
        onDuplicateClick={openNoAccessModal}
        isReadOnlyMode={isReadOnlyMode}
      />
          <Controls
            layoutVertical={layoutDirection === 'DOWN'}
            onLayoutChange={handleLayoutChange}
            onToggleReadOnly={handleChangeReadonlyMode}
            onExport={openNoAccessModal}
            onImport={openNoAccessModal}
            onSaveAsImage={openNoAccessModal}
            onArchive={openNoAccessModal}
            isReadOnlyMode={isReadOnlyMode}
            isDarkMode={theme === 'dark'}
            onThemeChange={toggleTheme}
            showGrid={showGrid}
            onToggleGrid={setShowGrid}
            isGuest={isGuest}
            onLogout={logout}
          />
    </div>
  );
}
