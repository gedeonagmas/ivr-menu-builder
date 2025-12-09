import { useCallback, useContext } from 'react';
import { ModalContext } from '../modal-provider';
import { Confirmation } from './confirmation';
import { Warning, Trash, Info } from '@phosphor-icons/react';

type ConfirmationOptions = {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'danger' | 'warning' | 'info';
  title?: string;
};

export function useConfirmationModal() {
  const { openModal, closeModal } = useContext(ModalContext);

  const openConfirmation = useCallback(
    ({ message, confirmLabel, cancelLabel, onConfirm, variant = 'warning', title }: ConfirmationOptions) => {
      const handleConfirm = () => {
        onConfirm();
        closeModal();
      };

      const handleCancel = () => {
        closeModal();
      };

      const iconMap = {
        danger: <Trash size={24} />,
        warning: <Warning size={24} />,
        info: <Info size={24} />,
      };

      openModal({
        content: (
          <Confirmation
            message={message}
            confirmLabel={confirmLabel}
            cancelLabel={cancelLabel}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            variant={variant}
          />
        ),
        icon: iconMap[variant],
        title: title || 'Confirmation',
        isCloseButtonVisible: true,
        footerVariant: 'separated',
        zIndex: 2000, // Higher z-index to appear above other modals
      });
    },
    [openModal, closeModal],
  );

  return { openConfirmation };
}

