import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

dotenv.config();

const app = express();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Multer config: files saved to uploads/ folder temporarily
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());
app.use(express.static("public1"));

// Helper: format AI reply line-by-line
function formatLineByLine(text) {
    return text
        .replace(/\. /g, ".\n")    // new line after periods
        .replace(/;/g, ";\n")      // new line after semicolons
        .replace(/,/g, ",\n")      // new line after commas
        .replace(/–/g, "\n–")      // bullet points (en dash)
        .replace(/- /g, "\n- ")    // bullet points (hyphen)
        .replace(/\n\n+/g, "\n")   // remove multiple blank lines
        .trim();
}

// Main chat route: text prompt
app.post("/api/chat", async (req, res) => {
    try {
        const prompt = req.body.prompt;
        if (!prompt) {
            return res.status(400).json({ error: "Prompt missing!" });
        }

        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "You are StudyBuddy, a friendly AI tutor. ALWAYS answer line-by-line. " +
                        "No paragraphs allowed. " +
                        "Each idea must be on a separate line. " +
                        "Use bullet points or steps like:\n- Point 1\n- Point 2\n- Point 3\n" +
                        "Never combine ideas into long paragraphs.",
                },
                { role: "user", content: prompt },
            ],
        });

        let reply = completion.choices[0].message.content;
        reply = formatLineByLine(reply);

        res.json({ reply });
    } catch (error) {
        console.error("Error from OpenAI:", error);
        res.status(500).json({ error: "Server error occurred" });
    }
});

// File upload route: accepts one file, supports images and PDFs
app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded!" });
        }

        // Read uploaded file from disk
        const filePath = path.resolve(req.file.path);
        const fileBuffer = fs.readFileSync(filePath);

        // Here you could add code to:
        // - OCR the image/PDF if needed (not included here)
        // - Extract text from file or send file content directly (if supported)

        // For now, let's send a message to OpenAI to "explain the content of the file"
        // (Since OpenAI's chat completions don't support raw file upload natively,
        // you would need to extract text from file yourself or use other services.)

        // Simplified: just notify user the file was received
        // You can extend this to extract text or parse content to send as prompt.

        // Delete uploaded file after reading
        fs.unlinkSync(filePath);

        // Reply example:
        const reply = "File uploaded successfully! Currently, file content analysis is not implemented.";

        res.json({ reply });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Error analyzing file." });
    }
});

// Use Render port or default 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
