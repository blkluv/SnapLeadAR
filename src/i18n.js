// src/i18n.js
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

i18next.use(initReactI18next).init({
    lng: navigator.language || navigator.userLanguage,
    fallbackLng: "en",
    resources: {
        en: {
            translation: {
                joinSnapLeadAR: "Join SnapLead AR",
                createMagicalMoments:
                    "Create magical moments with amazing effects and share with your friends.",
                name: "Name",
                email: "Email",
                // favoriteColor: "Favorite Color",
                namePlaceholder: "Your name",
                emailPlaceholder: "Your email",
                colorPlaceholder: "Your favorite color",
                submitButton: "Submit",
                successMessage: "Successfully updated!",
                errorMessage: "Error. Please try again.",
                networkErrorMessage: "Network error. Please try again.",
                selectCamera: "Select a camera",
                frontCamera: "Front Camera",
                backCamera: "Back Camera",
                allFieldsRequired: "All fields are required.",
                leadCollectedSuccess: "Lead collected successfully.",
                leadCollectedError: "Error collecting the lead.",
            },
        },
        es: {
            translation: {
                joinSnapLeadAR: "Únete a SnapLead AR",
                createMagicalMoments:
                    "Crea momentos mágicos con efectos increíbles y compártelos con tus amigos.",
                name: "Nombre",
                email: "Correo electrónico",
                // favoriteColor: "Color Favorito",
                namePlaceholder: "Tu nombre",
                emailPlaceholder: "Tu correo electrónico",
                colorPlaceholder: "Tu color favorito",
                submitButton: "Enviar",
                successMessage: "¡Actualizado con éxito!",
                errorMessage: "Error. Inténtalo de nuevo.",
                networkErrorMessage: "Error de red. Inténtalo de nuevo.",
                selectCamera: "Selecciona una cámara",
                frontCamera: "Cámara Frontal",
                backCamera: "Cámara Trasera",
                allFieldsRequired: "Todos los campos son obligatorios.",
                leadCollectedSuccess: "Lead recopilado con éxito.",
                leadCollectedError: "Error al recopilar el lead.",
            },
        },
        pt: {
            translation: {
                joinSnapLeadAR: "Entre no SnapLead AR",
                createMagicalMoments:
                    "Crie momentos mágicos com efeitos incríveis e compartilhe com seus amigos.",
                name: "Nome",
                email: "Email",
                // favoriteColor: "Cor Favorita",
                namePlaceholder: "Seu nome",
                emailPlaceholder: "Seu e-mail",
                colorPlaceholder: "Sua cor favorita",
                submitButton: "Enviar",
                successMessage: "Atualizado com sucesso!",
                errorMessage: "Erro. Tente novamente.",
                networkErrorMessage: "Erro de rede. Tente novamente.",
                selectCamera: "Selecione uma câmera",
                frontCamera: "Câmera Frontal",
                backCamera: "Câmera Traseira",
                allFieldsRequired: "Todos os campos são obrigatórios.",
                leadCollectedSuccess: "Lead coletado com sucesso.",
                leadCollectedError: "Erro ao coletar o lead.",
            },
        },
    },
    interpolation: {
        // React already escapes by default
        escapeValue: false,
    },
});

export default i18next;
