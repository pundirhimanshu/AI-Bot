"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Mic, Camera, Send, Sparkles, Square } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const stopFlagRef = useRef(false);

    const handleStop = useCallback(() => {
        // Set stop flag FIRST — the typing loop checks this on every character
        stopFlagRef.current = true;

        // Abort the fetch if it's still in progress
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        setIsLoading(false);
        setIsTyping(false);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        // Reset stop flag for new request
        stopFlagRef.current = false;

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        setIsTyping(false);
        setResponse("");

        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
                signal: controller.signal,
            });

            // Check if stopped while waiting for fetch
            if (stopFlagRef.current) return;

            if (!res.ok) throw new Error("Failed to fetch response");

            const data = await res.json();
            const geminiResponse = data.result;

            if (!geminiResponse || stopFlagRef.current) return;

            // Start typing effect
            setIsTyping(true);
            let currentText = "";

            for (let i = 0; i < geminiResponse.length; i++) {
                // Check stop flag on EVERY character
                if (stopFlagRef.current) {
                    console.log("Stop detected — halting typing at char", i);
                    break;
                }

                currentText += geminiResponse[i];
                setResponse(currentText);
                await new Promise(r => setTimeout(r, 15));
            }
        } catch (error: any) {
            if (error.name === "AbortError" || stopFlagRef.current) {
                // User stopped — keep partial text, no error
                console.log("Generation stopped by user");
                return;
            }
            console.error(error);
            setResponse("Sorry, I encountered an error. Please try again.");
        } finally {
            setIsLoading(false);
            setIsTyping(false);
            abortControllerRef.current = null;
        }
    };

    const showStopButton = isLoading || isTyping;

    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-4 md:p-24 overflow-hidden bg-black">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-2xl z-10 space-y-8 flex flex-col items-center">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h1 className="text-6xl font-bold tracking-tight google-text-gradient mb-2">
                        AI Bot
                    </h1>
                    <p className="text-gray-400 text-sm">Simple. Minimal. Intelligent.</p>
                </motion.div>

                {/* Search Bar Container */}
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-full relative group"
                >
                    <div className={cn(
                        "w-full glass-morphism rounded-full px-6 py-4 flex items-center gap-4 transition-all duration-300",
                        "group-hover:bg-white/10 group-focus-within:bg-white/10 group-focus-within:ring-2 ring-blue-500/50 shadow-2xl"
                    )}>
                        <Search className="text-gray-400 w-5 h-5 flex-shrink-0" />
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Type your prompt here..."
                            className="bg-transparent border-none outline-none flex-grow text-white placeholder-gray-500 text-lg"
                        />
                        <div className="flex items-center gap-3">
                            <Mic className="text-blue-500 w-5 h-5 cursor-pointer hover:scale-110 transition-transform hidden sm:block" />
                            <Camera className="text-gray-400 w-5 h-5 cursor-pointer hover:scale-110 transition-transform hidden sm:block" />
                            {showStopButton ? (
                                <button
                                    type="button"
                                    onClick={handleStop}
                                    className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 transition-all duration-200 active:scale-90"
                                    title="Stop generating"
                                >
                                    <Square className="w-4 h-4 text-red-400 fill-red-400" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <Send className="w-5 h-5 text-blue-500" />
                                </button>
                            )}
                        </div>
                    </div>
                </motion.form>

                {/* Action Buttons (Google Style) */}
                {!response && !isLoading && !isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex gap-4"
                    >
                        <button className="px-4 py-2 rounded glass-morphism text-sm text-gray-300 hover:text-white transition-colors">
                            AI Search
                        </button>
                        <button className="px-4 py-2 rounded glass-morphism text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                            I'm Feeling Lucky <Sparkles className="w-4 h-4 text-yellow-500" />
                        </button>
                    </motion.div>
                )}

                {/* Response Area */}
                <AnimatePresence>
                    {(response || isLoading || isTyping) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full glass-morphism rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[400px] scrollbar-hide"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div className="space-y-4 flex-grow">
                                    <p className="text-gray-200 leading-relaxed text-lg whitespace-pre-wrap">
                                        {response}
                                        {(isLoading || isTyping) && (
                                            <span className="inline-block w-1.5 h-6 bg-blue-500 animate-pulse ml-1 align-middle" />
                                        )}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
