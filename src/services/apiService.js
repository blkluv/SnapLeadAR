// src/services/apiService.js
import { ERROR_TYPES, errorHandlers } from "../utils/errorHandling";

class ApiService {
    constructor() {
        this.baseUrl = process.env.SERVER_URL || "http://localhost:8016";
        this.endpoints = {
            saveToSheets: "/api/saveToSheets",
        };
        this.maxRetries = 3;
        this.retryDelay = 1000;
    }

    async fetchWithRetry(url, options, retries = 0) {
        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "API request failed");
            }

            return await response.json();
        } catch (error) {
            if (retries < this.maxRetries) {
                await new Promise((resolve) =>
                    setTimeout(resolve, this.retryDelay * (retries + 1)),
                );
                return this.fetchWithRetry(url, options, retries + 1);
            }

            throw error;
        }
    }

    getHeaders() {
        return {
            "Content-Type": "application/json",
            Accept: "application/json",
        };
    }

    async saveFormData(formData) {
        try {
            // Format data for sheets
            const sheetData = {
                timestamp: new Date().toISOString(),
                ...formData,
            };

            const response = await this.fetchWithRetry(
                `${this.baseUrl}${this.endpoints.saveToSheets}`,
                {
                    method: "POST",
                    headers: this.getHeaders(),
                    body: JSON.stringify(sheetData),
                },
            );

            return response;
        } catch (error) {
            throw errorHandlers.createError(
                ERROR_TYPES.SHEETS,
                "Failed to save form data",
                error,
            );
        }
    }

    async checkEmailExists(email) {
        try {
            const response = await this.fetchWithRetry(
                `${this.baseUrl}${this.endpoints.saveToSheets}?email=${encodeURIComponent(email)}`,
                {
                    method: "GET",
                    headers: this.getHeaders(),
                },
            );

            return response.exists;
        } catch (error) {
            console.error("Error checking email existence:", error);
            return false;
        }
    }

    async updateExistingData(email, formData) {
        try {
            const sheetData = {
                email,
                ...formData,
                timestamp: new Date().toISOString(),
                isUpdate: true,
            };

            const response = await this.fetchWithRetry(
                `${this.baseUrl}${this.endpoints.saveToSheets}`,
                {
                    method: "PUT",
                    headers: this.getHeaders(),
                    body: JSON.stringify(sheetData),
                },
            );

            return response;
        } catch (error) {
            throw errorHandlers.createError(
                ERROR_TYPES.SHEETS,
                "Failed to update existing data",
                error,
            );
        }
    }

    buildRequestUrl(endpoint, params = {}) {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        Object.keys(params).forEach((key) => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });
        return url.toString();
    }

    handleNetworkError(error) {
        if (!navigator.onLine) {
            throw errorHandlers.createError(
                ERROR_TYPES.NETWORK,
                "No internet connection",
            );
        }
        throw error;
    }

    isValidResponse(response) {
        return (
            response &&
            response.ok &&
            response.status >= 200 &&
            response.status < 300
        );
    }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
