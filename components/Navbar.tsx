"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  // ✅ Check if user is logged in on mount
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    getUser();

    // ✅ Listen for auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ✅ Google login
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}`, // redirect back to home
      },
    });
    if (error) console.error("Google login error:", error.message);
  };

  // ✅ Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="flex items-center justify-between p-4 shadow-md bg-white">
      <h1 className="text-xl font-bold">🚀 My App</h1>

      <div>
        {!user ? (
          <button
            onClick={handleGoogleLogin}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Continue with Google
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Hi, {user.user_metadata?.first_name || user.email}
            </span>
            {/* Your existing menu icon */}
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
              ☰
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}