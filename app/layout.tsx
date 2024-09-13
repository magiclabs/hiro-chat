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
        <title>Magic Chat Prototype</title>
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <meta name="description" content="Magic Chat Prototype" />
        <meta property="og:title" content="Magic Chat Prototype" />
        <meta property="og:description" content="Magic Chat Prototype" />
        <meta name="twitter:title" content="Magic Chat Prototype" />
        <meta name="twitter:description" content="Magic Chat Prototype" />
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
