import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/app-context";

export const metadata: Metadata = { title: "Titãs Intelligence", description: "Performance & Scouting" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><AppProvider>{children}</AppProvider></body></html>;
}
