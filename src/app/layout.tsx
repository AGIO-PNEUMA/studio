import type { Metadata } from 'next';
import { Geist } from 'next/font/google'; // Changed to Geist from Geist/Geist_Sans
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Added Toaster

const geist = Geist({ // Changed variable name for consistency
  variable: '--font-geist-sans', // Kept variable name as --font-geist-sans for compatibility
  subsets: ['latin'],
});

// Removed Geist_Mono as it's not explicitly requested for body text, Geist sans-serif is preferred.
// If mono is needed for specific components, it can be imported locally there.

export const metadata: Metadata = {
  title: 'SocialEye', // Updated app title
  description: 'Search for names across multiple social media platforms.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
