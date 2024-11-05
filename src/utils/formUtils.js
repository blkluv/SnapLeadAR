// src/utils/formUtils.js
const formUtils = {
    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    validateName: (name) => {
        return name.length >= 2 && name.length <= 100;
    },

    validateColor: (color) => {
        return color.length >= 2 && color.length <= 50;
    },

    sanitizeFormData: (formData) => {
        return {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            // favoriteColor: formData.favoriteColor.trim(),
        };
    },

    validateForm: (formData) => {
        const errors = {};

        if (!formUtils.validateName(formData.name)) {
            errors.name = {
                en: "Name must be between 2 and 100 characters",
                pt: "O nome deve ter entre 2 e 100 caracteres",
                es: "El nombre debe tener entre 2 y 100 caracteres",
            };
        }

        if (!formUtils.validateEmail(formData.email)) {
            errors.email = {
                en: "Please enter a valid email address",
                pt: "Por favor, insira um endereço de email válido",
                es: "Por favor, introduce un correo electrónico válido",
            };
        }

        // if (!formUtils.validateColor(formData.favoriteColor)) {
        //     errors.favoriteColor = {
        //         en: "Color must be between 2 and 50 characters",
        //         pt: "A cor deve ter entre 2 e 50 caracteres",
        //         es: "El color debe tener entre 2 y 50 caracteres",
        //     };
        // }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    },

    formatDataForSheets: (formData) => {
        const timestamp = new Date().toISOString();
        return [
            timestamp,
            formData.name,
            formData.email,
            // formData.favoriteColor,
        ];
    },

    getLanguageFromBrowser: () => {
        const userLanguage = navigator.language.split("-")[0];
        const supportedLanguages = ["en", "pt", "es"];
        return supportedLanguages.includes(userLanguage) ? userLanguage : "en";
    },

    debounce: (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    },

    logFormSubmission: (formData) => {
        if (process.env.NODE_ENV === "development") {
            console.group("Form Submission");
            console.log("Timestamp:", new Date().toISOString());
            console.log("Form Data:", formData);
            console.groupEnd();
        }
    },

    handleApiError: (error) => {
        if (process.env.NODE_ENV === "development") {
            console.error("API Error:", error);
        }
        return {
            en: "An error occurred. Please try again later.",
            pt: "Ocorreu um erro. Por favor, tente novamente mais tarde.",
            es: "Ocurrió un error. Por favor, inténtalo de nuevo más tarde.",
        };
    },
};

export default formUtils;
