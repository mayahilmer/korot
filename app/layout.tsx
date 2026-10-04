import type { Metadata } from "next";
import "./fonts.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "קורות — מסמך קורות חיים",
  description: "מכינים מסמך קורות חיים נקי בעברית או באנגלית, ומייצאים אותו ל־PDF או ל־Word.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
