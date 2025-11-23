import { useCallback, useContext } from 'react';
import { ModalContext } from '../modal-provider';
import { Simulation } from './simulation';
import { Icon } from '@workflow-builder/icons';
import { useTranslation } from 'react-i18next';
import useStore from '@/store/store';
import { WorkflowBuilderNode, WorkflowBuilderEdge } from '@workflow-builder/types/node-data';

export function useSimulationModal() {
  const { openModal, closeModal } = useContext(ModalContext);
  const { t } = useTranslation();

  const openSimulationModal = useCallback(() => {
    const reactFlowInstance = useStore.getState().reactFlowInstance;
    if (!reactFlowInstance) {
      return;
    }

    const data = reactFlowInstance.toObject();
    const nodes = (data.nodes || []) as WorkflowBuilderNode[];
    const edges = (data.edges || []) as WorkflowBuilderEdge[];

    if (nodes.length === 0) {
      const { showSnackbar } = require('@/utils/show-snackbar');
      const { SnackbarType } = require('@synergycodes/axiom');
      showSnackbar({
        title: 'Simulation requires at least one node',
        variant: SnackbarType.WARNING,
      });
      return;
    }

    openModal({
      content: <Simulation nodes={nodes} edges={edges} onClose={closeModal} />,
      icon: <Icon name="PlayCircle" />,
      title: 'IVR Flow Simulation',
      isCloseButtonVisible: true,
    });
  }, [openModal, closeModal, t]);

  return { openSimulationModal };
}

