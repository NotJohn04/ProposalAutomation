const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const axios = require('axios');

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

app.post('/webhook', (req, res) => {
    console.log('Received request:', req.body);

    const { transcript } = req.body;
    
    if (!transcript) {
        console.log('No transcript provided');
        return res.status(400).json({ summary: "Please provide the data you would like me to summarize. I need the data to create a summary." });
    }

    // Example logic to create a summary
    generateExecutiveSummary(transcript)
        .then(summary => {
            console.log('Generated summary:', summary);
            res.json({ summary });
        })
        .catch(error => {
            console.error("Error generating executive summary:", error);
            res.status(500).json({ error: "Failed to generate executive summary" });
        });
});

async function generateExecutiveSummary(transcript) {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(transcript);
    return result.response.text();
  } catch (error) {
    console.error("Error during API call:", error);
    throw error;
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

