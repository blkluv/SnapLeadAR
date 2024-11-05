// src/utils/googleSheets.js
import axios from "axios";

export async function appendToSheet(data) {
    try {
        const response = await axios.post(
            `${process.env.REACT_APP_SERVER_URL}/snapleadar/collect-lead`,
            data,
        );
        return response.data;
    } catch (error) {
        if (error.response) {
            // The server responded with a status other than 2xx
            console.error(
                "Error sending data to the server:",
                error.response.data.message,
            );
            throw new Error(error.response.data.message);
        } else if (error.request) {
            // The request was made but no response was received
            console.error("No response from the server:", error.request);
            throw new Error(
                "No response from the server. Please try again later.",
            );
        } else {
            // Something happened in setting up the request that triggered an error
            console.error("Request configuration error:", error.message);
            throw new Error("Error sending data. Please try again.");
        }
    }
}
