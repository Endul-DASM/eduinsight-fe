import type { Metadata } from "next";
import "./globals.css";
import { APP_ZOOM, zoomStyle } from "@/lib/zoom";

export const metadata: Metadata = {
  title: "EduInsight",
  description: "AI learning dashboard for classroom insight and intervention.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Shown at 90% like browser zoom; subject workspaces go down to 80% (lib/zoom.ts).
    <html lang="en" className="h-full antialiased" style={zoomStyle(APP_ZOOM)}>
      <body className="min-h-full bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
