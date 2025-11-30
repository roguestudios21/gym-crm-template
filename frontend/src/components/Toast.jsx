import React from 'react';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
    const styles = {
        success: 'alert-success',
        error: 'alert-error',
        warning: 'alert-warning',
        info: 'alert-info'
    };

    const icons = {
        success: <CheckCircle size={20} />,
        error: <XCircle size={20} />,
        warning: <AlertCircle size={20} />,
        info: <Info size={20} />
    };

    return (
        <div className={`alert ${styles[type]} shadow-lg fixed top-4 right-4 w-96 z-50`}>
            <div>
                {icons[type]}
                <span>{message}</span>
            </div>
            {onClose && (
                <button className="btn btn-sm btn-ghost" onClick={onClose}>✕</button>
            )}
        </div>
    );
};

export default Toast;
