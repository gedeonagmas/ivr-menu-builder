import { useCallback, useContext } from 'react';
import { ModalContext } from '../modal-provider';
import { NewFlow } from './new-flow';
import { Plus } from '@phosphor-icons/react';

type NewFlowOptions = {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (name: string) => void;
  onCancel?: () => void;
  title?: string;
};

export function useNewFlowModal() {
  const { openModal, closeModal } = useContext(ModalContext);

  const openNewFlow = useCallback(
    ({ message, confirmLabel, cancelLabel, onConfirm, onCancel, title = 'New Workflow' }: NewFlowOptions) => {
      const handleConfirm = (name: string) => {
        onConfirm(name);
        closeModal();
      };

      const handleCancel = () => {
        onCancel?.();
        closeModal();
      };

      openModal({
        content: (
          <NewFlow
            message={message}
            confirmLabel={confirmLabel}
            cancelLabel={cancelLabel}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        ),
        icon: <Plus size={24} />,
        title,
        isCloseButtonVisible: true,
        footerVariant: 'separated',
        zIndex: 2000,
      });
    },
    [openModal, closeModal],
  );

  return { openNewFlow };
}

