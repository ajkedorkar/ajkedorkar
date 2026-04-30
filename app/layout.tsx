import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AjkeDorkar - আজকের প্রয়োজন, আজই!",
  description: "কুষ্টিয়ার সেরা ই-কমার্স প্ল্যাটফর্ম",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f5f5f5' }}>
        {children}
      </body>
    </html>
  );
}