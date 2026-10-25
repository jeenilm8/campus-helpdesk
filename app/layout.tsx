import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Helpdesk · A better campus, together",
  description: "Report campus issues, follow their progress and help make your campus better. An Agile development course project.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
