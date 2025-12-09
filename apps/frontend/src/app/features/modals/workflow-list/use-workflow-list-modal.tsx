import { useCallback, useContext } from 'react';
import { ModalContext } from '../modal-provider';
import { WorkflowList } from './workflow-list';
import { ListBullets } from '@phosphor-icons/react';

export function useWorkflowListModal() {
  const { openModal } = useContext(ModalContext);

  const openWorkflowList = useCallback(() => {
    openModal({
      content: <WorkflowList />,
      icon: <ListBullets size={24} />,
      title: 'My Workflows',
      isCloseButtonVisible: true,
    });
  }, [openModal]);

  return {
    openWorkflowList,
  };
}

