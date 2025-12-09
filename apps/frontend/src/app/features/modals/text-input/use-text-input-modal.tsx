import { useCallback, useContext } from 'react';
import { ModalContext } from '../modal-provider';
import { TextInput } from './text-input';
import { FileText } from '@phosphor-icons/react';

type TextInputOptions = {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
  onCancel?: () => void;
  validator?: (value: string) => string | null;
  title?: string;
};

export function useTextInputModal() {
  const { openModal, closeModal } = useContext(ModalContext);

  const openTextInput = useCallback(
    ({
      label,
      placeholder,
      defaultValue = '',
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel',
      onConfirm,
      onCancel,
      validator,
      title = 'Input',
    }: TextInputOptions) => {
      const handleConfirm = (value: string) => {
        onConfirm(value);
        closeModal();
      };

      const handleCancel = () => {
        onCancel?.();
        closeModal();
      };

      openModal({
        content: (
          <TextInput
            label={label}
            placeholder={placeholder}
            defaultValue={defaultValue}
            confirmLabel={confirmLabel}
            cancelLabel={cancelLabel}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            validator={validator}
          />
        ),
        icon: <FileText size={24} />,
        title,
        isCloseButtonVisible: true,
        footerVariant: 'separated',
        zIndex: 2000,
      });
    },
    [openModal, closeModal],
  );

  return { openTextInput };
}

