'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from "@/components/sidebar";
import { SessionProvider } from "@/context/SessionContext";
import { Toaster } from "@/components/ui/toaster";
import { Loader } from "lucide-react";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bracketMounted = useState(false);
  const mounted = bracketMounted[0];
  const setMounted = bracketMounted[1];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen">
        <div className="w-64 h-screen bg-white shadow-md flex items-center justify-center">
          <Loader className="h-6 w-6 animate-spin text-gray-400" />
        </div>
        <main className="flex-1 h-screen overflow-y-auto flex items-center justify-center">
          <Loader className="h-6 w-6 animate-spin text-gray-400" />
        </main>
      </div>
    );
  }

  return (
    <SessionProvider>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 h-screen overflow-y-auto">
          {children}
        </main>
      </div>
      <Toaster />
    </SessionProvider>
  );
}
