"use client";

import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/lib/i18n/context";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <LanguageProvider>
        {children}
        <Toaster position="top-center" richColors />
      </LanguageProvider>
    </ThemeProvider>
  );
}
