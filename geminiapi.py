const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.post('/generateSummary', async (req, res) => {
    const { name, email, transcript } = req.body;

    const geminiPrompt = `
    Generate a professional executive summary for the following meeting transcript.
    The summary should:
    - Highlight key pain points
    - Provide actionable solutions
    - Suggest next steps
    - Use concise and professional language
    
    Transcript: ${transcript}
    `;

    try {
        const response = await axios.post(
            'https://api.aistudio.google.com/v1/gemini/generateText',
            {
                model: "gemini-pro",
                prompt: geminiPrompt,
                max_tokens: 1000
            },
            {
                headers: {
                    Authorization: `Bearer YOUR_GEMINI_API_KEY`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const summary = response.data.choices[0].text.trim();
        res.json({ summary });
    } catch (error) {
        console.error("Error generating summary:", error);
        res.status(500).json({ error: "Error generating summary" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
