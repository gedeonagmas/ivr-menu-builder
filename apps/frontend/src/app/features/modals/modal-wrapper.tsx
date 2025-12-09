import { useEffect, useRef, ReactNode, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from '@synergycodes/axiom';

type ModalWrapperProps = {
  children: ReactNode;
  zIndex: number;
  modalId: string;
  onClose?: () => void;
  [key: string]: any;
};

export function ModalWrapper({ children, zIndex, modalId, onClose, ...modalProps }: ModalWrapperProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Find the modal overlay/backdrop elements and set their z-index
    const setModalZIndex = () => {
      // The axiom Modal creates elements in the DOM, we need to find and update them
      const modalElements = document.querySelectorAll('[class*="Modal"], [class*="modal-overlay"], [class*="backdrop"]');
      modalElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.style.zIndex === '' || parseInt(htmlEl.style.zIndex) < zIndex) {
          htmlEl.style.zIndex = zIndex.toString();
        }
      });
    };

    // Set z-index after a short delay to ensure modal is rendered
    const timeoutId = setTimeout(setModalZIndex, 10);
    
    // Also set on next frame
    requestAnimationFrame(setModalZIndex);

    return () => clearTimeout(timeoutId);
  }, [zIndex]);

  return (
    <div ref={containerRef} data-modal-id={modalId} style={{ zIndex, position: 'relative' }}>
      {createPortal(
        <Modal {...modalProps} onClose={onClose}>
          {children}
        </Modal>,
        document.body,
      )}
    </div>
  );
}

