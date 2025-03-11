const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/webhook', (req, res) => {
    const { transcript } = req.body;
    
    if (!transcript) {
        return res.status(400).json({ summary: "Please provide the data you would like me to summarize. I need the data to create a summary." });
    }

    // Example logic to create a summary
    const summary = generateSummary(transcript); // Replace with actual summary logic

    res.json({ summary });
});

function generateSummary(transcript) {
    // Implement your summary generation logic here
    return "This is a generated summary based on the transcript.";
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
