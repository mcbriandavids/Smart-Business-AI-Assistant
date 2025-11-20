import React, { ReactNode, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

type ModalSize = "sm" | "md" | "lg";

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  description?: ReactNode;
  size?: ModalSize;
  children: ReactNode;
  footer?: ReactNode;
}

const getSizeClass = (size: ModalSize) => {
  switch (size) {
    case "sm":
      return "modal-panel--sm";
    case "lg":
      return "modal-panel--lg";
    default:
      return "modal-panel--md";
  }
};

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
}) => {
  const target = useMemo(
    () => (typeof document !== "undefined" ? document.body : null),
    []
  );

  useEffect(() => {
    const el = target;
    if (!open || !el) {
      return;
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKey);
    const previousOverflow = el.style.overflow;
    el.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      el.style.overflow = previousOverflow;
    };
  }, [open, onClose, target]);

  if (!open || !target) {
    return null;
  }

  const sizeClass = getSizeClass(size);

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return createPortal(
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
    >
      <div className={`modal-panel glass-panel ${sizeClass}`}>
        <div className="modal-header">
          <div className="modal-header__content">
            {title ? <h2 className="modal-title">{title}</h2> : null}
            {description ? (
              <p className="modal-description">{description}</p>
            ) : null}
          </div>
          {onClose ? (
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <span aria-hidden="true">×</span>
            </button>
          ) : null}
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>,
    target
  );
};

export default Modal;
