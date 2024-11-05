// src/types/index.js
/**
 * @typedef {Object} FormData
 * @property {string} name - User's name
 * @property {string} email - User's email
 * @property {string} favoriteColor - User's favorite color
 */

/**
 * @typedef {Object} Translation
 * @property {string} title - Form title
 * @property {string} description - Form description
 * @property {Object} placeholders - Input placeholders
 * @property {string} placeholders.name - Name input placeholder
 * @property {string} placeholders.email - Email input placeholder
 * @property {string} placeholders.favoriteColor - Favorite color input placeholder
 * @property {string} button - Submit button text
 * @property {string} success - Success message
 * @property {string} error - Error message
 */

/**
 * @typedef {Object} Translations
 * @property {Translation} en - English translations
 * @property {Translation} pt - Portuguese translations
 * @property {Translation} es - Spanish translations
 */

/**
 * @typedef {Object} CameraConfig
 * @property {number} aspectRatio - Camera aspect ratio
 * @property {number} maxWidth - Maximum camera width
 * @property {number} quality - Camera quality
 */

/**
 * @typedef {Object} ApiConfig
 * @property {string} baseUrl - API base URL
 * @property {Object} endpoints - API endpoints
 * @property {string} endpoints.saveToSheets - Save to sheets endpoint
 */

/**
 * @typedef {Object} FormConfig
 * @property {number} debounceTime - Form debounce time
 * @property {number} maxRetries - Maximum API retries
 * @property {number} retryDelay - Delay between retries
 */

/**
 * @typedef {Object} AppConfig
 * @property {ApiConfig} api - API configuration
 * @property {FormConfig} form - Form configuration
 * @property {CameraConfig} camera - Camera configuration
 */

/**
 * @typedef {Object} AppContextState
 * @property {boolean} isFormSubmitted - Form submission status
 * @property {boolean} isCameraActive - Camera activation status
 * @property {string} currentLanguage - Current language code
 * @property {boolean} isLoading - Loading status
 * @property {string} loadingMessage - Loading message
 * @property {boolean} hasError - Error status
 * @property {string} errorMessage - Error message
 */

/**
 * @typedef {Object} AppContextMethods
 * @property {Function} setIsFormSubmitted - Set form submission status
 * @property {Function} setIsCameraActive - Set camera activation status
 * @property {Function} setCurrentLanguage - Set current language
 * @property {Function} setLoading - Set loading state
 * @property {Function} setError - Set error state
 * @property {Function} clearError - Clear error state
 * @property {Function} switchToCamera - Switch to camera view
 * @property {Function} resetApp - Reset application state
 */

/**
 * @typedef {AppContextState & AppContextMethods} AppContextValue
 */

/**
 * @typedef {Object} FeedbackMessageProps
 * @property {string} type - Message type (success, error, warning)
 * @property {string} message - Message content
 * @property {Function} [onClose] - Close handler
 */

/**
 * @typedef {Object} LoadingModalProps
 * @property {boolean} isVisible - Visibility state
 * @property {string} [message] - Loading message
 */

/**
 * @typedef {Object} LeadCaptureFormProps
 * @property {Function} onFormSubmit - Form submission handler
 */

/**
 * @typedef {Object} GoogleSheetsResponse
 * @property {string} message - Response message
 * @property {Object} [error] - Error details
 */

// Export empty object to make this a module
export default {};
