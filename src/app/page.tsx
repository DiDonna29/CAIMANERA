import CaimaneraRandomizer from '@/components/CaimaneraRandomizer';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-sports');

  return (
    <main className="min-h-screen">
      {/* Hero Header Section */}
      <div className="relative w-full h-[300px] overflow-hidden">
        {heroImage && (
          <>
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover brightness-[0.3]"
              priority
              data-ai-hint={heroImage.imageHint}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-background flex flex-col items-center justify-center text-white p-6">
              <div className="w-20 h-2 bg-accent mb-6 rounded-full shadow-lg shadow-accent/50"></div>
              <h1 className="text-5xl font-black font-headline tracking-tighter mb-2 drop-shadow-md">
                CAIMANERA <span className="text-accent">RANDOMIZER</span>
              </h1>
              <p className="text-xl font-medium opacity-90 max-w-lg text-center drop-shadow-md">
                Organiza tus partidas en segundos con IA y aleatoriedad pura.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 -mt-10">
        <CaimaneraRandomizer />
      </div>

      {/* Footer Info */}
      <footer className="py-12 px-6 border-t mt-12 bg-muted/30">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-bold text-primary">Caimanera Randomizer</h3>
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} - Hecho para los amantes del fútbol.</p>
          </div>
          <div className="flex gap-4">
            <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-semibold">#CaimaneraAI</span>
            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">#FútbolCallejero</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
