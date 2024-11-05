// src/tests/LeadCaptureForm.test.js
import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LeadCaptureForm from "../components/LeadCaptureForm/LeadCaptureForm";
import apiService from "../services/apiService";
import analyticsService from "../services/analyticsService";

// Mock services
jest.mock("../services/apiService");
jest.mock("../services/analyticsService");
jest.mock("../utils/formUtils");

describe("LeadCaptureForm Component", () => {
    beforeEach(() => {
        // Clear mocks before each test
        jest.clearAllMocks();

        // Mock browser language API
        Object.defineProperty(window.navigator, "language", {
            value: "en",
            configurable: true,
        });
    });

    test("renders form fields correctly", () => {
        render(<LeadCaptureForm onFormSubmit={() => {}} />);

        expect(
            screen.getByPlaceholderText(/enter your name/i),
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(/enter your email/i),
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(/your favorite color/i),
        ).toBeInTheDocument();
        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    test("handles form submission successfully", async () => {
        const mockOnFormSubmit = jest.fn();
        apiService.saveFormData.mockResolvedValueOnce({ success: true });

        render(<LeadCaptureForm onFormSubmit={mockOnFormSubmit} />);

        // Fill in the form
        fireEvent.change(screen.getByPlaceholderText(/enter your name/i), {
            target: { value: "John Doe" },
        });
        fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
            target: { value: "john@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText(/your favorite color/i), {
            target: { value: "Blue" },
        });

        // Submit the form
        fireEvent.click(screen.getByRole("button"));

        // Verify the form submission was handled correctly
        await waitFor(() => {
            expect(apiService.saveFormData).toHaveBeenCalledWith({
                name: "John Doe",
                email: "john@example.com",
                // favoriteColor: "Blue",
            });
            expect(mockOnFormSubmit).toHaveBeenCalled();
            expect(analyticsService.trackFormSubmit).toHaveBeenCalled();
        });
    });

    test("handles form validation errors", async () => {
        render(<LeadCaptureForm onFormSubmit={() => {}} />);

        // Attempt to submit an empty form
        fireEvent.click(screen.getByRole("button"));

        await waitFor(() => {
            expect(
                screen.getByText(/please check the form fields/i),
            ).toBeInTheDocument();
            expect(apiService.saveFormData).not.toHaveBeenCalled();
        });
    });

    test("handles API errors", async () => {
        apiService.saveFormData.mockRejectedValueOnce(new Error("API Error"));

        render(<LeadCaptureForm onFormSubmit={() => {}} />);

        // Fill in and submit the form
        fireEvent.change(screen.getByPlaceholderText(/enter your name/i), {
            target: { value: "John Doe" },
        });
        fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
            target: { value: "john@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText(/your favorite color/i), {
            target: { value: "Blue" },
        });

        fireEvent.click(screen.getByRole("button"));

        await waitFor(() => {
            expect(
                screen.getByText(/error saving information/i),
            ).toBeInTheDocument();
            expect(analyticsService.trackFormError).toHaveBeenCalled();
        });
    });

    test("updates form language based on browser settings (Portuguese)", () => {
        // Simulate browser in Portuguese
        Object.defineProperty(window.navigator, "language", {
            value: "pt",
        });

        render(<LeadCaptureForm onFormSubmit={() => {}} />);

        expect(screen.getByText(/projeto snaplead ar/i)).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(/digite seu nome/i),
        ).toBeInTheDocument();
    });

    test("updates form language based on browser settings (Spanish)", () => {
        // Simulate browser in Spanish
        Object.defineProperty(window.navigator, "language", {
            value: "es",
        });

        render(<LeadCaptureForm onFormSubmit={() => {}} />);

        expect(screen.getByText(/proyecto snaplead ar/i)).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(/ingrese su nombre/i),
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(/ingrese su correo electrónico/i),
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(/tu color favorito/i),
        ).toBeInTheDocument();
    });

    test("handles existing email updates", async () => {
        apiService.checkEmailExists.mockResolvedValueOnce(true);
        apiService.updateExistingData.mockResolvedValueOnce({ success: true });

        render(<LeadCaptureForm onFormSubmit={() => {}} />);

        // Fill in the form with an existing email
        fireEvent.change(screen.getByPlaceholderText(/enter your name/i), {
            target: { value: "John Doe Updated" },
        });
        fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
            target: { value: "existing@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText(/your favorite color/i), {
            target: { value: "Red" },
        });

        fireEvent.click(screen.getByRole("button"));

        await waitFor(() => {
            expect(apiService.updateExistingData).toHaveBeenCalled();
            expect(
                screen.getByText(/information saved successfully/i),
            ).toBeInTheDocument();
        });
    });
});
