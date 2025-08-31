import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Canadian Literature Visualizations",
  description: "A collection of visualizations exploring various aspects of Canadian literature from 1769 to 1964.",
};

export default function DashboardLayout({
  children,
  modal
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        <div
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            {children}
            {modal}
          </div>
      </body>
    </html>
  );
}
