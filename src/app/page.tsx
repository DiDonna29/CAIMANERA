import CaimaneraRandomizer from '@/components/CaimaneraRandomizer';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Crown, Star } from 'lucide-react';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-sports');

  return (
    <main className="min-h-screen relative bg-background">
      {/* Background Decorativo */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent blur-[150px] rounded-full"></div>
      </div>

      {/* Hero Visual para Móvil */}
      <div className="relative w-full h-[200px] md:h-[350px] overflow-hidden">
        {heroImage && (
          <>
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover brightness-[0.2]"
              priority
              data-ai-hint="soccer stadium lights"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background flex flex-col items-center justify-center p-6 text-center">
              <div className="flex items-center gap-2 bg-primary/20 backdrop-blur-md px-4 py-1 rounded-full border border-primary/30 mb-4 animate-in fade-in slide-in-from-top-4 duration-1000">
                <Crown className="h-3 w-3 text-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white italic">Elite Series Edition</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter leading-none text-white drop-shadow-2xl">
                CAIMANERA<br/><span className="text-primary text-glow">RANDOMIZER</span>
              </h1>
            </div>
          </>
        )}
      </div>

      {/* App Core */}
      <div className="relative z-10 -mt-8 md:-mt-20">
        <CaimaneraRandomizer />
      </div>

      {/* Footer minimalista con créditos */}
      <footer className="py-12 px-6 text-center relative z-10">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-8 bg-border"></div>
          <Star className="h-4 w-4 text-accent fill-accent animate-pulse" />
          <div className="h-px w-8 bg-border"></div>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 italic">
            Powering amateur matches since {new Date().getFullYear()}
          </p>
          <div className="flex flex-col items-center gap-1">
            <p className="text-[11px] font-black text-primary/80 uppercase tracking-tighter italic">
              Desarrollado por <span className="text-foreground">John Di Donna</span>
            </p>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40">
              © All Rights Reserved
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
