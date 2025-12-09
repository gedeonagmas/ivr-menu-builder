import styles from './app-bar.module.css';
import Logo from '../../../assets/workflow-builder-logo.svg?react';
import { NavButton } from '@synergycodes/axiom';
import { Icon } from '@workflow-builder/icons';
import { useTranslation } from 'react-i18next';
import { Pause, CloudArrowUp, Plus, ListBullets, Eraser } from '@phosphor-icons/react';
import { useState } from 'react';
import { apiService } from '@/services/api.service';
import useStore from '@/store/store';
import { showSnackbar } from '@/utils/show-snackbar';
import { SnackbarType } from '@synergycodes/axiom';
interface ToolbarProps {
  onSave: () => void;
  onOpen: () => void;
  onSimulate: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isReadOnlyMode: boolean;
  isSimulating: boolean;
  isPaused: boolean;
  onNewFlow: () => void;
  onOpenWorkflowList: () => void;
  onClearCanvas: () => void;
}

export function Toolbar({ onSave, onOpen, onSimulate, onUndo, onRedo, canUndo, canRedo, isReadOnlyMode, isSimulating, isPaused, onNewFlow, onOpenWorkflowList, onClearCanvas }: ToolbarProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'tooltips' });
  const [isDeploying, setIsDeploying] = useState(false);
  const documentName = useStore((state) => state.documentName);
  const reactFlowInstance = useStore((state) => state.reactFlowInstance);
  const currentWorkflowId = useStore((state) => (state as any).currentWorkflowId);

  const handleDeploy = async () => {
    const isGuest = localStorage.getItem('guest_mode') === 'true';
    
    if (isGuest) {
      showSnackbar({
        title: 'Please sign in to deploy workflows to Twilio',
        variant: SnackbarType.WARNING,
      });
      return;
    }

    if (!reactFlowInstance) {
      showSnackbar({
        title: 'No workflow to deploy',
        variant: SnackbarType.WARNING,
      });
      return;
    }

    setIsDeploying(true);
    try {
      const data = reactFlowInstance.toObject();
      
      if (currentWorkflowId) {
        // Update and deploy existing workflow
        await apiService.updateWorkflow(currentWorkflowId, {
          name: documentName || 'Untitled',
          diagram: data as any,
        });
        await apiService.deployWorkflow(currentWorkflowId);
      } else {
        // Create new workflow and deploy
        const { workflow } = await apiService.createWorkflow(
          documentName || 'Untitled',
          '',
          data as any,
        );
        await apiService.deployWorkflow(workflow.id);
      }

      showSnackbar({
        title: 'Workflow deployed successfully to Twilio!',
        variant: SnackbarType.SUCCESS,
      });
    } catch (error: any) {
      showSnackbar({
        title: error.message || 'Failed to deploy workflow',
        variant: SnackbarType.ERROR,
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className={styles['toolbar']}>
      <Logo className={styles['logo']} />
      <div className={styles['nav-segment']}>
        <NavButton onClick={onNewFlow} tooltip="New Flow">
          <Plus size={20} />
        </NavButton>
        <NavButton onClick={onOpenWorkflowList} tooltip="My Workflows">
          <ListBullets size={20} />
        </NavButton>
        <NavButton onClick={onClearCanvas} disabled={isReadOnlyMode} tooltip="Clear Canvas">
          <Eraser size={20} />
        </NavButton>
        <NavButton onClick={onSave} tooltip={t('save')}>
          <Icon name="FloppyDisk" />
        </NavButton>
        <NavButton onClick={onOpen} tooltip={t('open')}>
          <Icon name="FolderOpen" />
        </NavButton>
        <NavButton onClick={onSimulate} disabled={isReadOnlyMode} tooltip={isSimulating ? (isPaused ? t('resume') : t('pause')) : t('simulate')}>
          {isSimulating && !isPaused ? <Pause size={20} /> : <Icon name="PlayCircle" />}
        </NavButton>
        <NavButton onClick={handleDeploy} disabled={isReadOnlyMode || isDeploying} tooltip={t('deploy')}>
          <CloudArrowUp size={20} />
        </NavButton>
        <NavButton onClick={onUndo} disabled={!canUndo || isReadOnlyMode} tooltip={t('undo')}>
          <Icon name="ArrowUUpLeft" />
        </NavButton>
        <NavButton onClick={onRedo} disabled={!canRedo || isReadOnlyMode} tooltip={t('redo')}>
          <Icon name="ArrowUUpRight" />
        </NavButton>
      </div>
    </div>
  );
}
