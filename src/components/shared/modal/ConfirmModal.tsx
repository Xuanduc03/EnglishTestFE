import React from 'react';
import { Modal } from 'antd';
import './ConfirmModal.scss';

interface ConfirmModalProps {
    open: boolean;
    title: string;
    content: React.ReactNode;
    okText?: string;
    cancelText?: string;
    onOk: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    title,
    content,
    okText = 'Xác nhận',
    cancelText = 'Hủy',
    onOk,
    onCancel,
}) => {
    return (
        <Modal
            className="confirm-modal"
            title={title}
            open={open}
            onOk={onOk}
            onCancel={onCancel}
            okText={okText}
            cancelText={cancelText}
            centered
        >
            <div className="modal-content">
                {content}
            </div>
        </Modal>
    );
};

export default ConfirmModal;