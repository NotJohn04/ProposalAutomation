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
    const summary = generateExecutiveSummary(transcript); // Replace with actual summary logic

    res.json({ summary });
});

function generateExecutiveSummary(transcript) {
    const url = "https://proposal-automation.vercel.app/webhook"; // Your Gemini endpoint
    const payload = {
        prompt: transcript // Use the transcript as the prompt
    };

    const options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload)
    };

    try {
        const response = UrlFetchApp.fetch(url, options);
        const summary = JSON.parse(response.getContentText()).summary;
        Logger.log('Executive Summary: ' + summary);
        return summary;
    } catch (error) {
        Logger.log('Error generating summary: ' + error.message);
        throw new Error("Failed to generate executive summary");
    }
}

function processTranscript() {
    const transcript = testfindTranscript(); // Assuming this function returns the transcript
    const summary = generateExecutiveSummary(transcript);
    // Further processing of the summary if needed
}

function generateSummary(transcript) {
    // Split the transcript into sentences
    const sentences = transcript.split('. ');

    // Extract key sections
    const introduction = extractIntroduction(sentences);
    const keyPoints = extractKeyPoints(sentences);
    const conclusion = extractConclusion(sentences);

    // Construct the summary
    const summary = `
        Executive Summary:
        ${introduction}

        Key Points:
        ${keyPoints.join('\n')}

        Conclusion:
        ${conclusion}
    `;

    return summary;
}

function extractIntroduction(sentences) {
    // Extract the first few sentences as the introduction
    return sentences.slice(0, 2).join('. ');
}

function extractKeyPoints(sentences) {
    // Implement logic to identify and extract key points
    return sentences.filter(sentence => sentence.includes('key') || sentence.includes('important'));
}

function extractConclusion(sentences) {
    // Extract the last few sentences as the conclusion
    return sentences.slice(-2).join('. ');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
