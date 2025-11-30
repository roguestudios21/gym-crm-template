import React from 'react';
import { FileQuestion } from 'lucide-react';

const EmptyState = ({ icon: Icon = FileQuestion, title, message, action }) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center mb-4">
                <Icon size={40} className="text-base-content/50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-base-content/60 mb-6 max-w-md">{message}</p>
            {action}
        </div>
    );
};

export default EmptyState;
