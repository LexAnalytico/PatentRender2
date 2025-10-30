"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // ✅ make sure this path is valid

export default function ResetPassword() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [userAvailable, setUserAvailable] = useState(false);

  // ✅ Check if user is logged in (Supabase sets session after email link click)
  useEffect(() => {
    const checkUser = async () => {
      // Prefer getSession to avoid transient nulls during hydration
      const { data: s } = await supabase.auth.getSession();
      const u = s?.session?.user;
      if (u) {
        setUserAvailable(true);
      } else {
        const { data, error } = await supabase.auth.getUser();
        if (data?.user) setUserAvailable(true);
        else {
          console.warn("User session not found", error);
          setUserAvailable(false);
        }
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  // ✅ Accessibility: move focus to page heading on mount
  useEffect(() => {
    const h = document.getElementById('page-heading') as HTMLElement | null;
    if (h) {
      try { h.focus(); } catch {}
    }
  }, []);

  // ✅ Handle form submission
  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      alert("Reset failed: " + error.message);
    } else {
      alert("Password updated successfully!");
      router.push("/");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!userAvailable) return <p>Session expired or invalid. Please retry the reset process.</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2 id="page-heading" tabIndex={-1}>Reset Your Password</h2>
      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", width: "300px" }}
      />
      <input
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", width: "300px" }}
      />
      <button onClick={handleResetPassword}>Update Password</button>
    </div>
  );
}
