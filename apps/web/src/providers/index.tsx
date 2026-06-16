"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";

import { ThemeProviderWithLogic } from "./theme-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={false}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ThemeProviderWithLogic>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: "!bg-card !text-card-foreground !border !border-border !shadow-soft",
              duration: 4000,
            }}
          />
        </ThemeProviderWithLogic>
      </ThemeProvider>
    </SessionProvider>
  );
}
