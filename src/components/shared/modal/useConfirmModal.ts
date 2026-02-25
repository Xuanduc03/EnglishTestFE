import { useState } from 'react';

interface ModalConfig {
    open: boolean;
    title: string;
    content: React.ReactNode;
    okText: string;
    cancelText: string;
    onOk: () => void;
}

const useConfirmModal = () => {
    const [modalConfig, setModalConfig] = useState<ModalConfig>({
        open: false,
        title: '',
        content: '',
        okText: 'OK',
        cancelText: 'Cancel',
        onOk: () => { },
    });

    const openConfirmModal = (
        title: string,
        content: React.ReactNode,
        onOk: () => void,
        okText: string = 'Xác nhận',
        cancelText: string = 'Hủy'
    ) => {
        setModalConfig({
            open: true,
            title,
            content,
            okText,
            cancelText,
            onOk: () => {
                setModalConfig((prev) => ({ ...prev, open: false }));
                onOk();
            },
        });
    };

    const closeModal = () => {
        setModalConfig((prev) => ({ ...prev, open: false }));
    };

    return { modalConfig, openConfirmModal, closeModal };
};

export default useConfirmModal;