import { GoogleGenerativeAI } from "@google/generative-ai";

export type AIModel = "gemini" | "sarvam";

// Gemini handler
async function callGemini(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text) throw new Error("Empty response from Gemini");
    return text;
}

// Sarvam AI handler
async function callSarvam(prompt: string): Promise<string> {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) throw new Error("SARVAM_API_KEY is not defined");

    const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "sarvam-m",
            messages: [
                { role: "system", content: "You are a helpful AI assistant." },
                { role: "user", content: prompt },
            ],
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error("Sarvam API Error:", errorData);
        throw new Error(`Sarvam API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) throw new Error("Empty response from Sarvam");
    return text;
}

// Main function — routes to the selected model
export async function generateAIResponse(prompt: string, model: AIModel = "gemini"): Promise<string> {
    console.log(`Using model: ${model}`);

    switch (model) {
        case "gemini":
            return callGemini(prompt);
        case "sarvam":
            return callSarvam(prompt);
        default:
            throw new Error(`Unknown model: ${model}`);
    }
}

// Backward compatible alias
export const generateAIConsent = generateAIResponse;
