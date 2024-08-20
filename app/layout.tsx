import "./globals.css";
import { Public_Sans } from "next/font/google";

const publicSans = Public_Sans({ subsets: ["latin"] });

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
      <body className={publicSans.className}>
        <div className="flex flex-col p-4 md:p-12 h-[100vh]">{children}</div>
      </body>
    </html>
  );
}
