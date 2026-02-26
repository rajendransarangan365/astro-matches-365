import { GoogleGenAI } from '@google/genai';

export const askAstrologer = async (req, res) => {
    try {
        const { question, matchData } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in the server' });
        }

        const ai = new GoogleGenAI({ apiKey: apiKey });

        const systemInstruction = `You are a wise, traditional Vedic Astrologer analyzing a "Thirumana Porutham" (Marriage Compatibility) report.
Your goal is to answer the user's question about the provided match data accurately, respectfully, and concisely.
If the user asks in Tamil, reply in Tamil. If they ask in English, reply in English.
Keep your answer relatively short (1-3 sentences) as it will be read aloud via Text-to-Speech.
Do not use Markdown formatting (like **, *, #) in your response, as it will be spoken out loud.

Here is the match context:
Porutham Percentage: ${matchData.summaryReport?.percentage}%
General Recommendation: ${matchData.recommendation}
Can Marry: ${matchData.canMarry ? 'Yes' : 'No'}
Pros: ${matchData.summaryReport?.pros.join(', ')}
Cons: ${matchData.summaryReport?.cons.join(', ')}
Verdict: ${matchData.summaryReport?.verdict}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: question,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        const reply = response.text || 'ஓம் நமச்சிவாய. உங்கள் கேள்விக்கு தற்போது பதிலளிக்க இயலவில்லை.';

        res.json({ reply });

    } catch (error) {
        console.error('Error in chat controller:', error);
        res.status(500).json({ error: 'Failed to process your request' });
    }
};
