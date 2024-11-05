// src/tests/services/googleSheets.test.js
import { google } from "googleapis";
import dotenv from "dotenv";
import { mockClient } from "jest-mock-google-sheets";

dotenv.config();

// Mock the Google Sheets client
jest.mock("googleapis");

describe("Google Sheets Integration", () => {
    let mockSheets;
    const spreadsheetId = process.env.SPREADSHEET_ID;

    beforeEach(() => {
        // Reset mocks before each test
        mockSheets = mockClient();
        google.sheets.mockReturnValue(mockSheets);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Sheet Operations", () => {
        const testData = {
            timestamp: "2024-03-20T10:00:00Z",
            name: "John Doe",
            email: "john@example.com",
            // favoriteColor: "Blue",
        };

        test("should append new row successfully", async () => {
            mockSheets.spreadsheets.values.append.mockResolvedValueOnce({
                data: {
                    updates: {
                        updatedRows: 1,
                    },
                },
            });

            const response = await appendToSheet(spreadsheetId, testData);

            expect(mockSheets.spreadsheets.values.append).toHaveBeenCalledWith({
                spreadsheetId,
                range: "Sheet1!A:D",
                valueInputOption: "RAW",
                insertDataOption: "INSERT_ROWS",
                resource: {
                    values: [Object.values(testData)],
                },
            });

            expect(response.success).toBe(true);
        });

        test("should update existing row when email exists", async () => {
            // Mock to find existing email
            mockSheets.spreadsheets.values.get.mockResolvedValueOnce({
                data: {
                    values: [
                        [
                            "2024-03-19T10:00:00Z",
                            "Old Name",
                            "john@example.com",
                            "Red",
                        ],
                    ],
                },
            });

            mockSheets.spreadsheets.values.update.mockResolvedValueOnce({
                data: {
                    updatedRows: 1,
                },
            });

            const response = await updateExistingRow(spreadsheetId, testData);

            expect(mockSheets.spreadsheets.values.update).toHaveBeenCalledWith({
                spreadsheetId,
                range: expect.any(String),
                valueInputOption: "RAW",
                resource: {
                    values: [Object.values(testData)],
                },
            });

            expect(response.success).toBe(true);
        });

        test("should handle row not found error", async () => {
            mockSheets.spreadsheets.values.get.mockResolvedValueOnce({
                data: {
                    values: [],
                },
            });

            await expect(
                updateExistingRow(spreadsheetId, testData),
            ).rejects.toThrow("Row not found");
        });

        test("should handle API errors gracefully", async () => {
            mockSheets.spreadsheets.values.append.mockRejectedValueOnce(
                new Error("API Error"),
            );

            await expect(
                appendToSheet(spreadsheetId, testData),
            ).rejects.toThrow("Failed to save data");
        });
    });

    describe("Authentication", () => {
        test("should authenticate successfully with valid credentials", async () => {
            const auth = {
                credentials: {
                    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(
                        /\\n/g,
                        "\n",
                    ),
                },
            };

            google.auth.GoogleAuth.mockImplementationOnce(() => auth);

            const client = await getAuthenticatedClient();

            expect(client).toBeDefined();
            expect(google.auth.GoogleAuth).toHaveBeenCalledWith({
                credentials: expect.any(Object),
                scopes: ["https://www.googleapis.com/auth/spreadsheets"],
            });
        });

        test("should handle authentication errors", async () => {
            google.auth.GoogleAuth.mockImplementationOnce(() => {
                throw new Error("Authentication failed");
            });

            await expect(getAuthenticatedClient()).rejects.toThrow(
                "Authentication failed",
            );
        });
    });

    describe("Data Validation", () => {
        test("should validate required fields", () => {
            const invalidData = {
                timestamp: "2024-03-20T10:00:00Z",
                // Invalid: empty name
                name: "",
                // Invalid: wrong email format
                email: "invalid-email",
                // favoriteColor: "Blue",
            };

            const validation = validateSheetData(invalidData);

            expect(validation.isValid).toBe(false);
            expect(validation.errors).toHaveProperty("name");
            expect(validation.errors).toHaveProperty("email");
        });

        test("should handle special characters in data", async () => {
            const dataWithSpecialChars = {
                timestamp: "2024-03-20T10:00:00Z",
                name: 'John "Quote" O\'Neill',
                email: "john+test@example.com",
                // favoriteColor: "Blue-Green",
            };

            mockSheets.spreadsheets.values.append.mockResolvedValueOnce({
                data: {
                    updates: {
                        updatedRows: 1,
                    },
                },
            });

            const response = await appendToSheet(
                spreadsheetId,
                dataWithSpecialChars,
            );

            expect(response.success).toBe(true);
            expect(mockSheets.spreadsheets.values.append).toHaveBeenCalledWith(
                expect.objectContaining({
                    resource: {
                        values: [
                            expect.arrayContaining([dataWithSpecialChars.name]),
                        ],
                    },
                }),
            );
        });
    });

    describe("Error Handling", () => {
        test("should handle quota exceeded error", async () => {
            const quotaError = new Error("Quota exceeded");
            quotaError.code = 429;

            mockSheets.spreadsheets.values.append.mockRejectedValueOnce(
                quotaError,
            );

            await expect(
                appendToSheet(spreadsheetId, testData),
            ).rejects.toThrow("API quota exceeded");
        });

        test("should handle permission errors", async () => {
            const permissionError = new Error("Permission denied");
            permissionError.code = 403;

            mockSheets.spreadsheets.values.append.mockRejectedValueOnce(
                permissionError,
            );

            await expect(
                appendToSheet(spreadsheetId, testData),
            ).rejects.toThrow("Permission denied");
        });

        test("should handle network errors", async () => {
            mockSheets.spreadsheets.values.append.mockRejectedValueOnce(
                new Error("Network error"),
            );

            await expect(
                appendToSheet(spreadsheetId, testData),
            ).rejects.toThrow("Network error");
        });
    });
});

// Helper functions used in tests
async function appendToSheet(spreadsheetId, data) {
    // Need implementation
}

async function updateExistingRow(spreadsheetId, data) {
    // Need implementation
}

async function getAuthenticatedClient() {
    // Need implementation
}

function validateSheetData(data) {
    // Need implementation
}
