import { NextResponse } from "next/server";
import { generateAIResponse, AIModel } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const { prompt, model } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // Default to gemini if no model specified
        const selectedModel: AIModel = model || "gemini";
        const text = await generateAIResponse(prompt, selectedModel);

        return NextResponse.json({ result: text, model: selectedModel });
    } catch (error: any) {
        console.error("AI API Error:", {
            message: error.message,
            status: error.status,
        });
        return NextResponse.json(
            {
                error: "Failed to generate AI response",
                details: error.message,
            },
            { status: 500 }
        );
    }
}
