import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loja Titãs | Vista as cores de Garanhuns",
  description:
    "Camisas oficiais e produtos do Titãs Vôlei Garanhuns. Vista as cores do nosso time.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
