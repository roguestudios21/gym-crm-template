import { useState, useEffect } from 'react';

let toastId = 0;

const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'info', duration = 3000) => {
        const id = toastId++;
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const success = (message, duration) => showToast(message, 'success', duration);
    const error = (message, duration) => showToast(message, 'error', duration);
    const warning = (message, duration) => showToast(message, 'warning', duration);
    const info = (message, duration) => showToast(message, 'info', duration);

    return { toasts, success, error, warning, info, removeToast };
};

export default useToast;
