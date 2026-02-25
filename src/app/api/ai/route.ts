import { NextResponse } from "next/server";
import { generateAIConsent } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        const text = await generateAIConsent(prompt);

        return NextResponse.json({ result: text });
    } catch (error: any) {
        console.error("Gemini API Error Detail:", {
            message: error.message,
            status: error.status,
            statusText: error.statusText,
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
