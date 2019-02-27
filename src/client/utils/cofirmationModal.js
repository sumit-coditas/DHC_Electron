import { Modal } from 'antd';

export const showConfirmationModal = (title, content, onOk) => {
    return (
        Modal.confirm({
            title,
            content,
            onOk: () => onOk(),
            onCancel() { }
        })
    );
};

export const showConfirmationModalWithCancel = (title, content, onOk, onCancel) => {
    return (
        Modal.confirm({
            title,
            content,
            onOk: () => onOk(),
            onCancel: () => onCancel()
        })
    );
};