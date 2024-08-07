import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from 'next/dynamic';

const AuthProviders = dynamic(() => import('./lib/AuthProvider'), { ssr: false });
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenPolitica",
  description: "Auth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProviders>
          {children}
        </AuthProviders>
      </body>
    </html>
  );
}
