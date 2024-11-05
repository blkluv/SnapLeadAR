// src/utils/errorHandling.js
const ERROR_TYPES = {
    FORM_VALIDATION: "FORM_VALIDATION",
    API: "API",
    CAMERA: "CAMERA",
    SHEETS: "SHEETS",
    NETWORK: "NETWORK",
    UNKNOWN: "UNKNOWN",
};

const ERROR_MESSAGES = {
    [ERROR_TYPES.FORM_VALIDATION]: {
        en: "Please check the form fields and try again.",
        pt: "Por favor, verifique os campos do formulário e tente novamente.",
        es: "Por favor, verifique los campos del formulario e intente nuevamente.",
    },
    [ERROR_TYPES.API]: {
        en: "Unable to communicate with the server. Please try again.",
        pt: "Não foi possível comunicar com o servidor. Por favor, tente novamente.",
        es: "No se pudo comunicar con el servidor. Por favor, intente nuevamente.",
    },
    [ERROR_TYPES.CAMERA]: {
        en: "Camera access denied or not available.",
        pt: "Acesso à câmera negado ou não disponível.",
        es: "Acceso a la cámara denegado o no disponible.",
    },
    [ERROR_TYPES.SHEETS]: {
        en: "Unable to save data to Google Sheets.",
        pt: "Não foi possível salvar os dados no Google Sheets.",
        es: "No se pudieron guardar los datos en Google Sheets.",
    },
    [ERROR_TYPES.NETWORK]: {
        en: "Network connection error. Please check your internet connection.",
        pt: "Erro de conexão de rede. Por favor, verifique sua conexão com a internet.",
        es: "Error de conexión de red. Por favor, verifique su conexión a internet.",
    },
    [ERROR_TYPES.UNKNOWN]: {
        en: "An unexpected error occurred. Please try again.",
        pt: "Ocorreu um erro inesperado. Por favor, tente novamente.",
        es: "Ocurrió un error inesperado. Por favor, intente nuevamente.",
    },
};

class AppError extends Error {
    constructor(type, messageKey, originalError = null) {
        super(messageKey);
        this.type = type;
        this.messageKey = messageKey;
        this.originalError = originalError;
        this.timestamp = new Date().toISOString();
    }
}

const errorHandlers = {
    handleFormError: (error, language = "en") => {
        console.error("Form Error:", {
            type: error.type,
            message: error.message,
            timestamp: error.timestamp,
        });

        return (
            ERROR_MESSAGES[error.type]?.[language] ||
            ERROR_MESSAGES[ERROR_TYPES.UNKNOWN][language]
        );
    },

    handleApiError: (error, language = "en") => {
        const isNetworkError =
            !navigator.onLine || error.message.includes("NetworkError");
        const errorType = isNetworkError
            ? ERROR_TYPES.NETWORK
            : ERROR_TYPES.API;

        console.error("API Error:", {
            type: errorType,
            message: error.message,
            timestamp: new Date().toISOString(),
        });

        return ERROR_MESSAGES[errorType][language];
    },

    handleCameraError: (error, language = "en") => {
        console.error("Camera Error:", {
            type: ERROR_TYPES.CAMERA,
            message: error.message,
            timestamp: new Date().toISOString(),
        });

        return ERROR_MESSAGES[ERROR_TYPES.CAMERA][language];
    },

    handleSheetsError: (error, language = "en") => {
        console.error("Google Sheets Error:", {
            type: ERROR_TYPES.SHEETS,
            message: error.message,
            timestamp: new Date().toISOString(),
        });

        return ERROR_MESSAGES[ERROR_TYPES.SHEETS][language];
    },

    logError: (error, context = {}) => {
        const errorLog = {
            type: error.type || ERROR_TYPES.UNKNOWN,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            context: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                ...context,
            },
        };

        // In development, log to console
        if (process.env.NODE_ENV === "development") {
            console.error("Error Log:", errorLog);
        }

        // In production, you might want to send this to a logging service
        if (process.env.NODE_ENV === "production") {
            // Implement production logging here
            // Example: send to a logging service
        }
    },

    createError: (type, messageKey, originalError = null) => {
        return new AppError(type, messageKey, originalError);
    },
};

export { errorHandlers, ERROR_TYPES, ERROR_MESSAGES, AppError };
