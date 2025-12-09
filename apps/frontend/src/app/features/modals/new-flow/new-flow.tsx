import { useState, useEffect, useRef } from 'react';
import { Button, Input } from '@synergycodes/axiom';
import styles from './new-flow.module.css';

type NewFlowProps = {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
};

export function NewFlow({
  message,
  confirmLabel = 'Create',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: NewFlowProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input when modal opens
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 100);
  }, []);

  const handleConfirm = () => {
    if (!name.trim()) {
      setError('Workflow name is required');
      return;
    }
    
    if (name.trim().length > 100) {
      setError('Workflow name must be less than 100 characters');
      return;
    }

    onConfirm(name.trim());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error) {
      setError(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className={styles['container']}>
      <p className={styles['message']}>{message}</p>
      <div className={styles['input-section']}>
        <label className={styles['label']}>Workflow Name</label>
        <Input
          ref={inputRef}
          type="text"
          value={name}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="My Workflow"
          error={!!error}
          className={styles['input']}
        />
        {error && <p className={styles['error']}>{error}</p>}
      </div>
      <div className={styles['buttons']}>
        <Button variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button onClick={handleConfirm} variant="primary">
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}

