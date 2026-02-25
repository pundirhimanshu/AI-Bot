"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Mic, Camera, Send, Sparkles, Square, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const MODELS = [
    { id: "gemini", name: "Gemini 2.5 Flash", icon: "✨", color: "from-blue-500 to-purple-500" },
    { id: "sarvam", name: "Sarvam M", icon: "🇮🇳", color: "from-orange-500 to-pink-500" },
];

export default function Home() {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedModel, setSelectedModel] = useState("gemini");
    const [showModelPicker, setShowModelPicker] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const stopFlagRef = useRef(false);

    const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0];

    const handleStop = useCallback(() => {
        stopFlagRef.current = true;
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

        stopFlagRef.current = false;
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        setIsTyping(false);
        setResponse("");
        setShowModelPicker(false);

        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, model: selectedModel }),
                signal: controller.signal,
            });

            if (stopFlagRef.current) return;
            if (!res.ok) throw new Error("Failed to fetch response");

            const data = await res.json();
            const aiResponse = data.result;

            if (!aiResponse || stopFlagRef.current) return;

            setIsTyping(true);
            let currentText = "";

            for (let i = 0; i < aiResponse.length; i++) {
                if (stopFlagRef.current) break;
                currentText += aiResponse[i];
                setResponse(currentText);
                await new Promise(r => setTimeout(r, 15));
            }
        } catch (error: any) {
            if (error.name === "AbortError" || stopFlagRef.current) return;
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

                {/* Model Selector */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.05 }}
                    className="relative"
                >
                    <button
                        type="button"
                        onClick={() => setShowModelPicker(!showModelPicker)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full glass-morphism text-sm transition-all duration-300",
                            "hover:bg-white/10 active:scale-95"
                        )}
                    >
                        <span className="text-lg">{currentModel.icon}</span>
                        <span className="text-gray-200">{currentModel.name}</span>
                        <ChevronDown className={cn(
                            "w-4 h-4 text-gray-400 transition-transform duration-200",
                            showModelPicker && "rotate-180"
                        )} />
                    </button>

                    <AnimatePresence>
                        {showModelPicker && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-56 glass-morphism rounded-2xl p-2 shadow-2xl border border-white/10 z-50"
                            >
                                {MODELS.map((model) => (
                                    <button
                                        key={model.id}
                                        onClick={() => {
                                            setSelectedModel(model.id);
                                            setShowModelPicker(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200",
                                            selectedModel === model.id
                                                ? "bg-white/15 text-white"
                                                : "text-gray-300 hover:bg-white/10 hover:text-white"
                                        )}
                                    >
                                        <span className="text-lg">{model.icon}</span>
                                        <div>
                                            <p className="text-sm font-medium">{model.name}</p>
                                        </div>
                                        {selectedModel === model.id && (
                                            <div className={cn("ml-auto w-2 h-2 rounded-full bg-gradient-to-r", model.color)} />
                                        )}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-tr",
                                    currentModel.color
                                )}>
                                    <span className="text-sm">{currentModel.icon}</span>
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
