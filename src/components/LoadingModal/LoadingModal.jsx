// src/components/LoadingModal/LoadingModal.jsx
import React from "react";
import "./LoadingModal.css";

const LoadingModal = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6">
                <div className="spinner"></div>
            </div>
        </div>
    );
};

export default LoadingModal;
