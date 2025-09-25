"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const goSection = (id: string) => {
    try {
      window.dispatchEvent(new CustomEvent('nav:go-section', { detail: { id } }))
    } catch {}
  }

  return (
    <nav className="flex items-center justify-between p-4 shadow-md bg-white sticky top-0 z-[200]">
      {/* Left: Logo/Brand */}
      <a href="/" className="flex items-center gap-2">
        <span className="text-xl font-semibold text-gray-900">LegalIP Pro</span>
      </a>

      {/* Right: Top links aligned in a row */}
      <div className="hidden md:flex items-center space-x-4">
        {/* Patent Services with hover dropdown */}
        <div className="relative group z-[201]">
          <button type="button" onClick={() => goSection('patent-services')} className="text-gray-700 hover:text-blue-600 px-2 py-1 text-sm font-medium inline-flex items-center">
            Patent Services
          </button>
          <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[300]">
            <div className="py-2">
              <button type="button" onClick={() => goSection('patent-services')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Patentability Search</button>
              <button type="button" onClick={() => goSection('patent-services')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Drafting</button>
              <button type="button" onClick={() => goSection('patent-services')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Patent Application Filing</button>
              <button type="button" onClick={() => goSection('patent-services')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">First Examination Response</button>
            </div>
          </div>
        </div>
        <button type="button" onClick={() => goSection('trademark-services')} className="text-gray-700 hover:text-blue-600 px-2 py-1 text-sm font-medium">
          Trademark Services
        </button>
        <button type="button" onClick={() => goSection('copyright-services')} className="text-gray-700 hover:text-blue-600 px-2 py-1 text-sm font-medium">
          Copyright Services
        </button>
        <button type="button" onClick={() => goSection('design-services')} className="text-gray-700 hover:text-blue-600 px-2 py-1 text-sm font-medium">
          Design Services
        </button>
      </div>
    </nav>
  );
}
