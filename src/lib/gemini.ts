import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateAIConsent(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("GEMINI_API_KEY is not defined");
        throw new Error("API Key configuration error");
    }

    console.log("Using model: gemini-2.5-flash");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
        throw new Error("Empty response from Gemini");
    }

    console.log("Gemini response received successfully");
    return text;
}
