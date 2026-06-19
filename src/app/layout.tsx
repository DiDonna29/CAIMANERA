import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Caimanera Randomizer | Equilibrando tus partidos',
  description: 'La herramienta definitiva para organizar tus caimaneras y dividir equipos aleatoriamente.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background min-h-screen">
        {children}
      </body>
    </html>
  );
}