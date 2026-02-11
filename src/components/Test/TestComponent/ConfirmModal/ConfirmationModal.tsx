import React from 'react';
import './ConfirmationModal.scss';

interface ConfirmationModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-overlay" onClick={onCancel}>
      <div className="confirmation-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Xác nhận nộp bài</h2>
        <p className="modal-text">
          Bạn có chắc chắn muốn nộp bài không? Mọi thay đổi sẽ không được lưu lại sau khi nộp.
        </p>
        <div className="modal-actions">
          <button className="modal-btn cancel-btn" onClick={onCancel}>
            Hủy
          </button>
          <button className="modal-btn confirm-btn" onClick={onConfirm}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;