
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// Using process.env.API_KEY as required by guidelines
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Configuration for Thinking Mode (Gemini 3 Pro Preview)
 * As requested: max thinking budget, no maxOutputTokens.
 */
export const thinkingConfig = {
    thinkingConfig: { thinkingBudget: 32768 }, // Max for gemini-3-pro-preview
    // Do not set maxOutputTokens
};

export const getAIThinkingModel = () => {
    return 'gemini-3-pro-preview';
};

// Example function to use the thinking mode
export const generateComplexResponse = async (prompt: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });
        return response.text;
    } catch (error) {
        console.error("AI Error:", error);
        return null;
    }
};
