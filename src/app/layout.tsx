import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from 'next/dynamic';
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";

// Dynamically import AuthProviders, with SSR disabled
const AuthProviders = dynamic(() => import('../lib/AuthProvider'), { ssr: false });

// Load Inter font with Latin subset
const inter = Inter({ subsets: ["latin"] });

// Metadata for the application
export const metadata: Metadata = {
  title: {
    template: "%s | Openpolitica",
    default: "Openpolitica",
  },
  description: "The social media app for democratic people",
};

// RootLayout component
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProviders>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>

        </AuthProviders>
        <Toaster />
    
      </body>
    </html>
  );
}
