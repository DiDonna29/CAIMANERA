import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Caimanera Elite | Tournament Randomizer',
  description: 'Organiza tus partidos con el motor de sorteos más avanzado. Estética Champions League para tus encuentros amateur.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" crossOrigin="anonymous" />
      </head>
      <body className="font-body antialiased bg-background min-h-screen" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
