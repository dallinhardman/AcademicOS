import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "AcademicOS",
  description: "AI-driven learning management system for optimized study efficiency",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
