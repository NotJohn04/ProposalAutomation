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

    // Predefined prompt to guide the AI
    const predefinedPrompt = `
        Please ensure the executive summary does not exceed 3 paragraphs and 897 words.
        Focus more on the pain points and discuss the customer's situation rather than what we do.
        use concise language dont halucinate and use language with more depth, no fillers.
        
    `;

    // Combine the predefined prompt with the transcript
    const fullPrompt = `${predefinedPrompt}\n\n${transcript}`;

    // Example logic to create a summary
    generateExecutiveSummary(fullPrompt)
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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

