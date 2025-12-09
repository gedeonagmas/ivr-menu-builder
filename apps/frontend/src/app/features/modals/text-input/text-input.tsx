import { useState, useEffect, useRef } from 'react';
import { Button, Input } from '@synergycodes/axiom';
import styles from './text-input.module.css';

type TextInputProps = {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  validator?: (value: string) => string | null; // Returns error message or null
};

export function TextInput({
  label,
  placeholder = '',
  defaultValue = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  validator,
}: TextInputProps) {
  const [value, setValue] = useState(defaultValue);
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
    if (validator) {
      const validationError = validator(value);
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    
    if (!value.trim()) {
      setError('Name is required');
      return;
    }

    onConfirm(value.trim());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
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
      <label className={styles['label']}>{label}</label>
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        error={!!error}
        className={styles['input']}
      />
      {error && <p className={styles['error']}>{error}</p>}
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

