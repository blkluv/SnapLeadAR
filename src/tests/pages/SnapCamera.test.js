// src/tests/pages/SnapCamera.test.js
import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import SnapCamera from "../../pages/SnapCamera/SnapCamera";
import { bootstrapCameraKit, createMediaStreamSource } from "@snap/camera-kit";
import { AppProvider } from "../../context/AppContext";

// Mocks
jest.mock("@snap/camera-kit");

// Mock navigator.mediaDevices
const mockMediaDevices = {
    getUserMedia: jest.fn(),
    enumerateDevices: jest.fn(),
};

// Mock navigator.language
Object.defineProperty(window, "navigator", {
    value: {
        ...window.navigator,
        mediaDevices: mockMediaDevices,
        language: "en-US",
    },
    writable: true,
});

describe("SnapCamera Component", () => {
    const mockLensId = "8d868db2-aef4-40af-a1a7-01cf3dde6e52";
    const mockMediaStream = { getTracks: () => [{ stop: jest.fn() }] };
    const mockSession = {
        setSource: jest.fn(),
        output: { live: document.createElement("video") },
        applyLens: jest.fn(),
        play: jest.fn(),
        pause: jest.fn(),
    };

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mocks
        bootstrapCameraKit.mockResolvedValue({
            createSession: jest.fn().mockResolvedValue(mockSession),
            lenses: {
                repository: {
                    loadLensGroups: jest.fn().mockResolvedValue({
                        lenses: [{ id: mockLensId, name: "Test Lens" }],
                    }),
                },
            },
        });

        mockMediaDevices.getUserMedia.mockResolvedValue(mockMediaStream);
        mockMediaDevices.enumerateDevices.mockResolvedValue([
            { kind: "videoinput", deviceId: "front", label: "Front Camera" },
            { kind: "videoinput", deviceId: "back", label: "Back Camera" },
        ]);

        // Mock URL with lens_id
        delete window.location;
        window.location = new URL(
            `http://localhost:8016/snapleadar/?id=${mockLensId}`,
        );
    });

    afterEach(() => {
        jest.resetModules();
    });

    test("renders lead capture form initially", () => {
        render(
            <AppProvider>
                <SnapCamera />
            </AppProvider>,
        );

        expect(screen.getByTestId("snap-camera")).toBeInTheDocument();
        expect(screen.getByText(/SnapLead AR/i)).toBeInTheDocument();
    });

    test("initializes camera after form submission", async () => {
        render(
            <AppProvider>
                <SnapCamera />
            </AppProvider>,
        );

        // Fill and submit form
        const form = screen.getByRole("form");
        const nameInput = screen.getByPlaceholderText(/enter your name/i);
        const emailInput = screen.getByPlaceholderText(/enter your email/i);
        const colorInput = screen.getByPlaceholderText(/your favorite color/i);

        fireEvent.change(nameInput, { target: { value: "John Doe" } });
        fireEvent.change(emailInput, { target: { value: "john@example.com" } });
        fireEvent.change(colorInput, { target: { value: "Blue" } });
        fireEvent.submit(form);

        await waitFor(() => {
            expect(bootstrapCameraKit).toHaveBeenCalled();
            expect(mockMediaDevices.getUserMedia).toHaveBeenCalled();
            expect(mockSession.setSource).toHaveBeenCalled();
            expect(mockSession.applyLens).toHaveBeenCalled();
            expect(mockSession.play).toHaveBeenCalled();
        });
    });

    test("handles camera initialization errors", async () => {
        mockMediaDevices.getUserMedia.mockRejectedValueOnce(
            new Error("Camera access denied"),
        );

        render(
            <AppProvider>
                <SnapCamera />
            </AppProvider>,
        );

        // Submit form to trigger camera initialization
        const form = screen.getByRole("form");
        fireEvent.submit(form);

        await waitFor(() => {
            expect(
                screen.getByText(/camera access denied/i),
            ).toBeInTheDocument();
        });
    });

    test("switches cameras when selection changes", async () => {
        render(
            <AppProvider>
                <SnapCamera />
            </AppProvider>,
        );

        // Submit form to initialize camera
        const form = screen.getByRole("form");
        fireEvent.submit(form);

        await waitFor(() => {
            const cameraSelect = screen.getByLabelText(/select camera/i);
            fireEvent.change(cameraSelect, { target: { value: "back" } });
        });

        expect(mockMediaDevices.getUserMedia).toHaveBeenCalledTimes(2);
        expect(mockSession.setSource).toHaveBeenCalledTimes(2);
    });

    test("handles lens application errors", async () => {
        mockSession.applyLens.mockRejectedValueOnce(
            new Error("Lens application failed"),
        );

        render(
            <AppProvider>
                <SnapCamera />
            </AppProvider>,
        );

        const form = screen.getByRole("form");
        fireEvent.submit(form);

        await waitFor(() => {
            expect(
                screen.getByText(/lens application failed/i),
            ).toBeInTheDocument();
        });
    });

    test("cleans up resources when unmounting", async () => {
        const { unmount } = render(
            <AppProvider>
                <SnapCamera />
            </AppProvider>,
        );

        // Submit form to initialize camera
        const form = screen.getByRole("form");
        fireEvent.submit(form);

        await waitFor(() => {
            expect(mockSession.play).toHaveBeenCalled();
        });

        act(() => {
            unmount();
        });

        expect(mockSession.pause).toHaveBeenCalled();
        expect(mockMediaStream.getTracks()[0].stop).toHaveBeenCalled();
    });

    test("validates lens ID from URL", async () => {
        // Test with invalid lens ID
        window.location = new URL(
            "http://localhost:8016/snapleadar/?id=invalid-id",
        );

        render(
            <AppProvider>
                <SnapCamera />
            </AppProvider>,
        );

        await waitFor(() => {
            expect(mockSession.applyLens).not.toHaveBeenCalled();
        });
    });

    test("handles device change events", async () => {
        render(
            <AppProvider>
                <SnapCamera />
            </AppProvider>,
        );

        // Simulate device change event
        await act(async () => {
            const deviceChangeEvent = new Event("devicechange");
            navigator.mediaDevices.dispatchEvent(deviceChangeEvent);
        });

        expect(mockMediaDevices.enumerateDevices).toHaveBeenCalledTimes(2);
    });
});
