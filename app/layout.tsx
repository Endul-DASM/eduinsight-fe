import type { Metadata } from "next";
import "./globals.css";

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
    // The whole app is shown at 90%, like browser zoom at 90%: at 100% the designs feel too large on laptop
    // screens. Set inline because the CSS build drops `zoom` from globals.css.
    <html lang="en" className="h-full antialiased" style={{ zoom: 0.9 }}>
      <body className="min-h-full bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
