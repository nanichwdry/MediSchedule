export const analyzeTranscript = async (transcript: string): Promise<{ summary: string; sentiment: string; suggestedDate?: string }> => {
  return {
    summary: "Simulated Summary: The patient requested a follow-up appointment regarding persistent headaches.",
    sentiment: "Neutral",
    suggestedDate: new Date().toISOString()
  };
};
