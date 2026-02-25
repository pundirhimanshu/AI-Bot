"use client";

import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { LogIn, LogOut } from "lucide-react";

export default function GoogleLogin() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) return;
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        if (!auth) return;
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    };

    const handleLogout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    if (loading) return <div className="animate-pulse h-10 w-32 bg-white/5 rounded-lg"></div>;

    return (
        <div className="flex items-center gap-4">
            {user ? (
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-gray-200">{user.displayName}</span>
                        <button
                            onClick={handleLogout}
                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                        >
                            <LogOut size={12} /> Sign Out
                        </button>
                    </div>
                    {user.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt={user.displayName || "User"}
                            className="w-10 h-10 rounded-full border border-white/10 shadow-sm"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                            {(user.displayName || "U").charAt(0)}
                        </div>
                    )}
                </div>
            ) : (
                <button
                    onClick={handleLogin}
                    className="flex items-center gap-2 px-4 py-2 glass-morphism rounded-lg text-sm font-medium text-gray-200 hover:bg-white/10 transition-colors"
                >
                    <LogIn size={18} className="text-blue-400" />
                    Sign in with Google
                </button>
            )}
        </div>
    );
}
