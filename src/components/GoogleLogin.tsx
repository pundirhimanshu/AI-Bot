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
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    if (loading) return <div className="animate-pulse h-10 w-32 bg-gray-200 rounded-lg"></div>;

    return (
        <div className="flex items-center gap-4">
            {user ? (
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-gray-700">{user.displayName}</span>
                        <button
                            onClick={handleLogout}
                            className="text-xs text-red-500 hover:underline flex items-center gap-1"
                        >
                            <LogOut size={12} /> Sign Out
                        </button>
                    </div>
                    {user.photoURL && (
                        <img
                            src={user.photoURL}
                            alt={user.displayName || "User"}
                            className="w-10 h-10 rounded-full border border-gray-200 shadow-sm"
                        />
                    )}
                </div>
            ) : (
                <button
                    onClick={handleLogin}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <LogIn size={18} className="text-blue-500" />
                    Sign in with Google
                </button>
            )}
        </div>
    );
}
