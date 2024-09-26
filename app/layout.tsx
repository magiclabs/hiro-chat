import MagicProvider from "@/components/MagicProvider";
import ChatProvider from "@/components/ChatProvider";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";
import { Assistant } from "next/font/google";

const assistant = Assistant({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Magic AI Chat Demo</title>
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <meta name="description" content="Magic AI Chat Demo" />
        <meta property="og:title" content="Magic AI Chat Demo" />
        <meta property="og:description" content="Magic AI Chat Demo" />
        <meta name="twitter:title" content="Magic AI Chat Demo" />
        <meta name="twitter:description" content="Magic AI Chat Demo" />
      </head>
      <body className={assistant.className}>
        <MagicProvider>
          <ChatProvider>
            <div className="flex h-screen w-full flex-col bg-background">
              {children}
            </div>
            <Toaster position="top-right" />
          </ChatProvider>
        </MagicProvider>
      </body>
    </html>
  );
}
