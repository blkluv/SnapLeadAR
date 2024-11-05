// src/components/FeedbackMessages/FeedbackMessage.jsx
import React from "react";

const FeedbackMessage = ({ type, message, onClose }) => {
    const baseStyles =
        "fixed top-4 right-4 p-4 rounded-lg shadow-lg transition-opacity duration-300 z-50 max-w-md";
    const typeStyles = {
        success: "bg-green-900 text-green-100 border border-green-700",
        error: "bg-red-900 text-red-100 border border-red-700",
        warning: "bg-yellow-900 text-yellow-100 border border-yellow-700",
    };

    return (
        <div className={`${baseStyles} ${typeStyles[type]}`} role="alert">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    {type === "success" && (
                        <svg
                            className="w-6 h-6 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    )}
                    {type === "error" && (
                        <svg
                            className="w-6 h-6 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    )}
                    {type === "warning" && (
                        <svg
                            className="w-6 h-6 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    )}
                    <span className="text-sm font-medium">{message}</span>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="ml-4 text-current hover:text-white transition-colors duration-200"
                        aria-label="Close message"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

// Success Message Component
export const SuccessMessage = ({ message, onClose }) => (
    <FeedbackMessage type="success" message={message} onClose={onClose} />
);

// Error Message Component
export const ErrorMessage = ({ message, onClose }) => (
    <FeedbackMessage type="error" message={message} onClose={onClose} />
);

// Warning Message Component
export const WarningMessage = ({ message, onClose }) => (
    <FeedbackMessage type="warning" message={message} onClose={onClose} />
);

export default FeedbackMessage;
