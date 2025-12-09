import { Button } from '@synergycodes/axiom';
import styles from './confirmation.module.css';

type ConfirmationProps = {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
};

export function Confirmation({
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning',
}: ConfirmationProps) {
  return (
    <div className={styles['container']}>
      <p className={styles['message']}>{message}</p>
      <div className={styles['buttons']}>
        <Button variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant={variant === 'danger' ? 'error' : 'primary'}
          autoFocus
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}

