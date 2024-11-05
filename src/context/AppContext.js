// src/context/AppContext.js
import React, { createContext, useContext, useState, useCallback } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState("en");
    const [loadingState, setLoadingState] = useState({
        isLoading: false,
        message: "",
    });
    const [errorState, setErrorState] = useState({
        hasError: false,
        message: "",
    });

    const setLoading = useCallback((isLoading, message = "") => {
        setLoadingState({
            isLoading,
            message,
        });
    }, []);

    const setError = useCallback((hasError, message = "") => {
        setErrorState({
            hasError,
            message,
        });
    }, []);

    const clearError = useCallback(() => {
        setErrorState({
            hasError: false,
            message: "",
        });
    }, []);

    const switchToCamera = useCallback(() => {
        setIsFormSubmitted(true);
        setIsCameraActive(true);
    }, []);

    const resetApp = useCallback(() => {
        setIsFormSubmitted(false);
        setIsCameraActive(false);
        setLoadingState({
            isLoading: false,
            message: "",
        });
        setErrorState({
            hasError: false,
            message: "",
        });
    }, []);

    const value = {
        // Form state
        isFormSubmitted,
        setIsFormSubmitted,

        // Camera state
        isCameraActive,
        setIsCameraActive,

        // Language state
        currentLanguage,
        setCurrentLanguage,

        // Loading state
        isLoading: loadingState.isLoading,
        loadingMessage: loadingState.message,
        setLoading,

        // Error state
        hasError: errorState.hasError,
        errorMessage: errorState.message,
        setError,
        clearError,

        // Navigation functions
        switchToCamera,
        resetApp,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook for using the AppContext
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
};

// Language configuration
export const LANGUAGES = {
    en: {
        name: "English",
        code: "en",
    },
    pt: {
        name: "Português",
        code: "pt",
    },
    es: {
        name: "Español",
        code: "es",
    },
};

// Application configuration
export const APP_CONFIG = {
    api: {
        baseUrl: process.env.SERVER_URL || "http://localhost:8016",
        endpoints: {
            saveToSheets: "/api/saveToSheets",
        },
    },
    form: {
        debounceTime: 300,
        maxRetries: 3,
        retryDelay: 1000,
    },
    camera: {
        aspectRatio: 9 / 16,
        maxWidth: 720,
        quality: 0.72,
    },
};

export default AppContext;
