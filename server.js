import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";

dotenv.config();

const app = express();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());
app.use(express.static("public1"));

// Helper: format AI reply line-by-line
function formatLineByLine(text) {
    return text
        .replace(/\. /g, ".\n")
        .replace(/;/g, ";\n")
        .replace(/,/g, ",\n")
        .replace(/–/g, "\n–")
        .replace(/- /g, "\n- ")
        .replace(/\n\n+/g, "\n")
        .trim();
}

// Main chat route: ONLY text prompt
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

// No upload route anymore

// Use Render port or default 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
