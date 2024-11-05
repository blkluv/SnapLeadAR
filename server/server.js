// server/server.js
const express = require("express");
const { google } = require("googleapis");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../build")));

// Google Sheets API Configuration
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// API endpoint to save/update data in Google Sheets
app.post("/api/saveToSheets", async (req, res) => {
    try {
        const { name, email, favoriteColor } = req.body;
        const timestamp = new Date().toISOString();
        const spreadsheetId = process.env.SPREADSHEET_ID;

        // Check if the email already exists
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Sheet1!A:D",
        });

        const rows = response.data.values || [];
        const rowIndex = rows.findIndex((row) => row[2] === email);
        const rowData = [[timestamp, name, email, favoriteColor]];

        if (rowIndex > -1) {
            // Update existing row
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `Sheet1!A${rowIndex + 1}:D${rowIndex + 1}`,
                valueInputOption: "RAW",
                resource: { values: rowData },
            });
        } else {
            // Append new row
            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: "Sheet1!A:D",
                valueInputOption: "RAW",
                insertDataOption: "INSERT_ROWS",
                resource: { values: rowData },
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Error saving to sheets:", error);
        res.status(500).json({
            success: false,
            message: error.message,
            stack:
                process.env.NODE_ENV === "development"
                    ? error.stack
                    : undefined,
        });
    }
});

// Serve React app
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build", "index.html"));
});

// For local development
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 8016;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// For Vercel
module.exports = app;
