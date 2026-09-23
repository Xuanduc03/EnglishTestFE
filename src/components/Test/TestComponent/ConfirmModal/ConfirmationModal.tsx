import React from 'react';
import './ConfirmationModal.scss';

interface ConfirmationModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  /** When true, disables the confirm button and shows a spinner */
  isSubmitting?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-overlay" onClick={!isSubmitting ? onCancel : undefined}>
      <div className="confirmation-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Submit Exam</h2>
        <p className="modal-text">
          Are you sure you want to submit? All changes will be finalized and you cannot make further edits.
        </p>
        <div className="modal-actions">
          <button
            className="modal-btn cancel-btn"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className={`modal-btn confirm-btn ${isSubmitting ? 'confirm-btn--loading' : ''}`}
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="modal-spinner" />
                Submitting…
              </>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;