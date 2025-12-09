import { createContext, useState, ReactNode, useMemo, useCallback, ComponentProps, CSSProperties, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FooterVariant, Modal } from '@synergycodes/axiom';

type OpenModalProps = {
  content: ComponentProps<typeof Modal>['children'];
  icon?: ComponentProps<typeof Modal>['icon'];
  title: string;
  footer?: ComponentProps<typeof Modal>['footer'];
  isCloseButtonVisible?: boolean;
  footerVariant?: FooterVariant;
  onModalClosed?: () => void;
  zIndex?: number;
};

type ModalItem = OpenModalProps & {
  id: string;
};

type ModalContextType = {
  openModal: (props: OpenModalProps) => void;
  closeModal: () => void;
};

export const ModalContext = createContext<ModalContextType>({
  openModal: () => {},
  closeModal: () => {},
});

function ModalWithZIndex({
  zIndex,
  modalId,
  children,
  ...modalProps
}: {
  zIndex: number;
  modalId: string;
  children: ReactNode;
  [key: string]: any;
}) {
  useEffect(() => {
    // Set z-index on modal overlay/backdrop elements after render
    const updateZIndex = () => {
      // Find all elements that are likely modal overlays/backdrops
      const allDivs = document.querySelectorAll('body > div');
      allDivs.forEach((div) => {
        const htmlDiv = div as HTMLElement;
        const computedStyle = window.getComputedStyle(htmlDiv);
        // Check if this looks like a modal overlay (fixed position, covers screen)
        if (
          computedStyle.position === 'fixed' &&
          (computedStyle.top === '0px' || computedStyle.inset === '0px') &&
          htmlDiv.style.zIndex !== zIndex.toString()
        ) {
          // Check if it contains modal content
          const hasModalContent = htmlDiv.querySelector('[class*="Modal"], [class*="modal"]');
          if (hasModalContent && parseInt(htmlDiv.style.zIndex || '0') < zIndex) {
            htmlDiv.style.zIndex = zIndex.toString();
          }
        }
      });
    };

    // Update after a short delay to ensure modal is rendered
    const timeoutId = setTimeout(updateZIndex, 50);
    requestAnimationFrame(updateZIndex);

    return () => clearTimeout(timeoutId);
  }, [zIndex]);

  return createPortal(
    <Modal size="large" open={true} {...modalProps}>
      {children}
    </Modal>,
    document.body,
  );
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<ModalItem[]>([]);

  const openModal = useCallback(
    ({ isCloseButtonVisible = true, footerVariant = 'integrated', zIndex, ...restProps }: OpenModalProps) => {
      const modalId = `modal-${Date.now()}-${Math.random()}`;
      const baseZIndex = 1000;
      const calculatedZIndex = zIndex ?? baseZIndex + modals.length * 10;
      
      const newModal: ModalItem = {
        ...restProps,
        isCloseButtonVisible,
        footerVariant,
        id: modalId,
        zIndex: calculatedZIndex,
      };

      setModals((prev) => [...prev, newModal]);
    },
    [modals.length],
  );

  const closeModal = useCallback(() => {
    setModals((prev) => {
      const updated = [...prev];
      const lastModal = updated.pop();
      lastModal?.onModalClosed?.();
      return updated;
    });
  }, []);

  const closeModalById = useCallback((id: string) => {
    setModals((prev) => {
      const modalIndex = prev.findIndex((m) => m.id === id);
      if (modalIndex === -1) return prev;
      
      const updated = [...prev];
      const removed = updated.splice(modalIndex, 1);
      removed[0]?.onModalClosed?.();
      return updated;
    });
  }, []);

  const value = useMemo(() => ({ openModal, closeModal }), [closeModal, openModal]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modals.map((modal, index) => {
        const calculatedZIndex = modal.zIndex ?? 1000 + index * 10;

        return (
          <ModalWithZIndex
            key={modal.id}
            zIndex={calculatedZIndex}
            modalId={modal.id}
            icon={modal.icon}
            title={modal.title || ''}
            footer={modal.footer}
            footerVariant={modal.footerVariant}
            isCloseButtonVisible={modal.isCloseButtonVisible}
            onClose={modal.isCloseButtonVisible ? () => closeModalById(modal.id) : undefined}
          >
            {modal.content}
          </ModalWithZIndex>
        );
      })}
    </ModalContext.Provider>
  );
}
