import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const analyzeTranscript = async (transcript: string): Promise<{ summary: string; sentiment: string; suggestedDate?: string }> => {
  const ai = getClient();
  
  if (!ai) {
    // Fallback if no API key is provided
    return {
      summary: "Simulated Summary: The patient requested a follow-up appointment regarding persistent headaches.",
      sentiment: "Neutral",
      suggestedDate: new Date().toISOString()
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analyze the following medical call transcript. 
        Provide a JSON response with:
        1. "summary": A brief 1-sentence summary of the medical issue.
        2. "sentiment": "Positive", "Neutral", or "Negative".
        3. "suggestedDate": An ISO date string if a date was mentioned, otherwise null.
        
        Transcript: "${transcript}"
      `,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Failed", error);
    return {
      summary: "Analysis failed. Please review transcript manually.",
      sentiment: "Neutral"
    };
  }
};
