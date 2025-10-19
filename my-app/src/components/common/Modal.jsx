import React from 'react';

/**
 * A reusable modal component.
 * It shows its children in an overlay when isOpen is true.
 * @param {boolean} isOpen - Controls if the modal is visible.
 * @param {function} onClose - Function to call when the modal should be closed.
 * @param {React.ReactNode} children - The content to display inside the modal.
 */
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    // The overlay covers the whole screen. Clicking it closes the modal.
    <div className="modal-overlay" onClick={onClose}>
      {/* The content area. Clicking inside it does NOT close the modal. */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

// --- THIS LINE WAS MISSING ---
export default Modal;

