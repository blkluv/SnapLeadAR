// src/components/LeadCaptureForm/LeadCaptureForm.jsx
import React, { useState } from "react";
import "./LeadCaptureForm.css";

const LeadCaptureForm = ({ onFormSubmit }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        // favoriteColor: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage("");

        try {
            const response = await fetch("/api/saveToSheets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setMessageType("success");
                setMessage("Information saved successfully!");
                if (onFormSubmit) onFormSubmit();
            } else {
                throw new Error(data.message || "Error saving information.");
            }
        } catch (error) {
            setMessageType("error");
            setMessage("Error saving information. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-content">
                <div className="form-header">
                    <h1 className="form-title">SnapLead AR</h1>
                    <p className="form-description">
                        Capture your experience with our AR filters
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <span className="material-symbols-rounded input-icon">
                            person
                        </span>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleInputChange}
                            // required
                        />
                    </div>

                    <div className="form-group">
                        <span className="material-symbols-rounded input-icon">
                            mail
                        </span>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleInputChange}
                            // required
                        />
                    </div>

                    {/* <div className="form-group">
                        <span className="material-symbols-rounded input-icon">
                            palette
                        </span>
                        <input
                            type="text"
                            name="favoriteColor"
                            className="form-input"
                            placeholder="Your favorite color"
                            value={formData.favoriteColor}
                            onChange={handleInputChange}
                            required
                        />
                    </div> */}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isSubmitting}
                    >
                        <span className="material-symbols-rounded">
                            {isSubmitting ? "hourglass_empty" : "camera"}
                        </span>
                        {isSubmitting ? "Processing..." : "Start"}
                    </button>
                </form>

                {message && (
                    <div className={`message ${messageType}-message`}>
                        <span className="material-symbols-rounded">
                            {messageType === "success"
                                ? "check_circle"
                                : "error"}
                        </span>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeadCaptureForm;
