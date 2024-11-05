// src/tests/services/apiService.test.js
import apiService from "../../services/apiService";
import { ERROR_TYPES } from "../../utils/errorHandling";

// Mock fetch global
global.fetch = jest.fn();

describe("API Service", () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    describe("saveFormData", () => {
        const mockFormData = {
            name: "John Doe",
            email: "john@example.com",
            // favoriteColor: "Blue",
        };

        it("should successfully save form data", async () => {
            const mockResponse = {
                success: true,
                message: "Data saved successfully",
            };
            fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockResponse),
                }),
            );

            const result = await apiService.saveFormData(mockFormData);

            expect(result).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/saveToSheets"),
                expect.objectContaining({
                    method: "POST",
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                    }),
                    body: expect.stringContaining(mockFormData.email),
                }),
            );
        });

        it("should retry on failure up to maximum attempts", async () => {
            fetch.mockImplementation(() =>
                Promise.reject(new Error("Network error")),
            );

            await expect(
                apiService.saveFormData(mockFormData),
            ).rejects.toThrow();

            // Verifies 3 attempts were made (1 initial + 2 retries)
            expect(fetch).toHaveBeenCalledTimes(3);
        });

        it("should handle API errors correctly", async () => {
            fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    ok: false,
                    json: () => Promise.resolve({ message: "API Error" }),
                }),
            );

            await expect(
                apiService.saveFormData(mockFormData),
            ).rejects.toMatchObject({
                type: ERROR_TYPES.SHEETS,
            });
        });
    });

    describe("checkEmailExists", () => {
        const testEmail = "test@example.com";

        it("should return true for existing email", async () => {
            fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ exists: true }),
                }),
            );

            const result = await apiService.checkEmailExists(testEmail);
            expect(result).toBe(true);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining(encodeURIComponent(testEmail)),
                expect.any(Object),
            );
        });

        it("should return false for non-existing email", async () => {
            fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ exists: false }),
                }),
            );

            const result = await apiService.checkEmailExists(testEmail);
            expect(result).toBe(false);
        });

        it("should handle network errors gracefully", async () => {
            fetch.mockImplementationOnce(() =>
                Promise.reject(new Error("Network error")),
            );

            const result = await apiService.checkEmailExists(testEmail);
            expect(result).toBe(false);
        });
    });

    describe("updateExistingData", () => {
        const testEmail = "test@example.com";
        const updateData = {
            name: "Updated Name",
            // favoriteColor: "Green",
        };

        it("should successfully update existing data", async () => {
            const mockResponse = {
                success: true,
                message: "Data updated successfully",
            };
            fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockResponse),
                }),
            );

            const result = await apiService.updateExistingData(
                testEmail,
                updateData,
            );

            expect(result).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/saveToSheets"),
                expect.objectContaining({
                    method: "PUT",
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                    }),
                    body: expect.stringContaining(testEmail),
                }),
            );
        });

        it("should handle update errors correctly", async () => {
            fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    ok: false,
                    json: () => Promise.resolve({ message: "Update failed" }),
                }),
            );

            await expect(
                apiService.updateExistingData(testEmail, updateData),
            ).rejects.toMatchObject({
                type: ERROR_TYPES.SHEETS,
            });
        });
    });

    describe("Request URL building", () => {
        it("should build correct URL with parameters", () => {
            const params = {
                email: "test@example.com",
                page: 1,
                limit: 10,
            };

            const url = apiService.buildRequestUrl("/api/test", params);

            expect(url).toContain("email=test%40example.com");
            expect(url).toContain("page=1");
            expect(url).toContain("limit=10");
        });

        it("should handle empty parameters", () => {
            const url = apiService.buildRequestUrl("/api/test");
            expect(url).toEqual(expect.stringContaining("/api/test"));
        });

        it("should ignore null and undefined parameters", () => {
            const params = {
                email: "test@example.com",
                page: null,
                limit: undefined,
            };

            const url = apiService.buildRequestUrl("/api/test", params);

            expect(url).toContain("email=test%40example.com");
            expect(url).not.toContain("page=");
            expect(url).not.toContain("limit=");
        });
    });
});
