const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const axios = require('axios');

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/webhook', (req, res) => {
    console.log('Received request:', req.body);

    const { transcript } = req.body;
    
    if (!transcript) {
        console.log('No transcript provided');
        return res.status(400).json({ summary: "Please provide the data you would like me to summarize. I need the data to create a summary." });
    }

    // Example logic to create a summary
    const summary = generateExecutiveSummary(transcript); // Replace with actual summary logic

    console.log('Generated summary:', summary);
    res.json({ summary });
});

function generateExecutiveSummary(transcript) {
    const url = "https://proposal-automation.vercel.app/webhook"; // Your Gemini endpoint
    const payload = {
        prompt: transcript // Use the transcript as the prompt
    };

    const options = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    axios.post(url, payload, options)
        .then(response => {
            console.log('Response Code:', response.status);
            console.log('Response Text:', response.data);

            if (response.status !== 200) {
                throw new Error('Failed to generate executive summary: ' + response.data);
            }

            const summary = response.data;
            console.log('Executive Summary:', JSON.stringify(summary)); // Log the summary
            return summary;
        })
        .catch(error => {
            console.log('Error sending transcript:', error.message);
            throw new Error("Failed to send transcript to Gemini");
        });
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
