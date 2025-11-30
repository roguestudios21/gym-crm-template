import React from 'react';

const LoadingSpinner = ({ size = 'md', message }) => {
    const sizeClasses = {
        sm: 'loading-sm',
        md: 'loading-md',
        lg: 'loading-lg'
    };

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <span className={`loading loading-spinner ${sizeClasses[size]}`}></span>
            {message && <p className="mt-4 text-gray-500">{message}</p>}
        </div>
    );
};

export default LoadingSpinner;
