"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  RotateCw, 
  Trophy, 
  ImageIcon,
  ArrowRight,
  ChevronLeft,
  Star,
  ShieldCheck,
  Timer,
  Sun,
  Moon,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toPng } from 'html-to-image';
import { cn } from '@/lib/utils';

type Team = {
  id: number;
  name: string;
  players: string[];
};

type MatchDetails = {
  teamA: string;
  teamB: string;
  waitingTeam: string | null;
  kickoffTeam: string;
};

type Step = 'format' | 'players' | 'results';

const FORMATS = [
  { id: '2', label: 'Dúos', sub: '2v2', icon: <Users className="h-5 w-5" /> },
  { id: '3', label: 'Tríos', sub: '3v3', icon: <Users className="h-5 w-5" /> },
  { id: '5', label: 'Fútbol 5', sub: '5v5', icon: <Users className="h-6 w-6" /> },
  { id: '7', label: 'Fútbol 7', sub: '7v7', icon: <Users className="h-6 w-6" /> },
  { id: '11', label: 'Fútbol 11', sub: '11v11', icon: <Users className="h-7 w-7" /> },
];

export default function CaimaneraRandomizer() {
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState<Step>('format');
  const [playersPerTeam, setPlayersPerTeam] = useState<string>("5");
  const [rosterText, setRosterText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generatedTeams, setGeneratedTeams] = useState<Team[]>([]);
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleGenerate = async () => {
    const players = rosterText
      .split('\n')
      .map(p => p.trim())
      .filter(p => p !== "");

    if (players.length < 2) {
      toast({
        variant: "destructive",
        title: "Pocos jugadores",
        description: "Ingresa al menos 2 jugadores para poder armar equipos.",
      });
      return;
    }

    const perTeam = parseInt(playersPerTeam);
    const numTeams = Math.ceil(players.length / perTeam);

    setIsGenerating(true);
    setCurrentStep('results');

    try {
      // Simular proceso de sorteo "pro"
      await new Promise(resolve => setTimeout(resolve, 2000));

      const shuffled = [...players].sort(() => Math.random() - 0.5);
      
      const teams: Team[] = [];
      for (let i = 0; i < numTeams; i++) {
        const start = i * perTeam;
        const end = start + perTeam;
        const teamPlayers = shuffled.slice(start, end);
        
        if (teamPlayers.length > 0) {
          teams.push({
            id: i + 1,
            name: `EQUIPO ${i + 1}`,
            players: teamPlayers
          });
        }
      }

      setGeneratedTeams(teams);

      if (teams.length >= 2) {
        const indices = Array.from({ length: teams.length }, (_, i) => i);
        const shuffledIndices = indices.sort(() => Math.random() - 0.5);
        
        const indexA = shuffledIndices[0];
        const indexB = shuffledIndices[1];
        const teamA = teams[indexA].name;
        const teamB = teams[indexB].name;
        
        const waitingTeam = teams.length > 2 ? teams[shuffledIndices[2]].name : null;
        const kickoffTeam = Math.random() > 0.5 ? teamA : teamB;

        setMatchDetails({
          teamA,
          teamB,
          waitingTeam,
          kickoffTeam
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!resultsRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(resultsRef.current, {
        cacheBust: true,
        backgroundColor: '#0a192f',
        style: { padding: '0', borderRadius: '0' },
        skipFonts: true
      });
      const link = document.createElement('a');
      link.download = `Caimanera_Elite_${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "Póster descargado", description: "Imagen guardada en tu dispositivo." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo generar la imagen." });
    } finally {
      setIsDownloading(false);
    }
  };

  const playerCount = rosterText.split('\n').filter(p => p.trim() !== "").length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-8 space-y-6 md:space-y-10 min-h-screen">
      {/* Navbar Superior */}
      <div className="flex justify-between items-center bg-card/40 backdrop-blur-md p-2 rounded-full border border-border/50 sticky top-4 z-50">
        <div className="flex items-center gap-2 pl-4">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Caimanera Elite</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full h-8 w-8 transition-transform active:scale-75">
            {theme === 'dark' ? <Sun className="h-4 w-4 text-accent" /> : <Moon className="h-4 w-4 text-primary" />}
          </Button>
          {currentStep !== 'format' && (
            <Button variant="ghost" size="icon" onClick={() => setCurrentStep('format')} className="rounded-full h-8 w-8">
              <RotateCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden min-h-[70vh]">
        {/* PASO 1: FORMATO */}
        {currentStep === 'format' && (
          <div className="space-y-6 animate-in slide-in-from-right-10 fade-in duration-500">
            <div className="text-center space-y-2 pt-8">
              <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                ¿QUÉ SE JUEGA<br/><span className="text-primary text-glow">HOY?</span>
              </h1>
              <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest">Paso 1: Elige el formato</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setPlayersPerTeam(f.id);
                    setCurrentStep('players');
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-300 active:scale-95 group",
                    playersPerTeam === f.id 
                      ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(59,130,246,0.2)]" 
                      : "bg-card border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn("mb-3 p-3 rounded-2xl transition-colors", playersPerTeam === f.id ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10")}>
                    {f.icon}
                  </div>
                  <span className="font-black italic uppercase tracking-tighter text-lg">{f.label}</span>
                  <span className="text-[10px] font-bold opacity-50">{f.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2: LISTA DE JUGADORES */}
        {currentStep === 'players' && (
          <div className="space-y-6 animate-in slide-in-from-right-10 fade-in duration-500">
            <div className="flex items-center justify-between pt-8">
              <Button variant="ghost" onClick={() => setCurrentStep('format')} className="gap-2 font-bold uppercase text-xs italic transition-transform active:scale-90">
                <ChevronLeft className="h-4 w-4" /> Volver
              </Button>
              <Badge variant="outline" className="font-mono text-[10px] bg-primary/5 border-primary/20 text-primary">
                {playerCount} REGISTRADOS
              </Badge>
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                LISTA DE <span className="text-accent text-glow">CRACKS</span>
              </h2>
              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.2em]">Ingresa los nombres uno por línea</p>
            </div>

            <Card className="glass-card border-primary/20 overflow-hidden shadow-2xl">
              <CardContent className="p-0">
                <Textarea 
                  placeholder="Ej: Messi&#10;Cristiano&#10;Ronaldinho..." 
                  className="min-h-[300px] border-0 bg-transparent text-xl font-bold italic placeholder:opacity-30 p-6 focus-visible:ring-0 resize-none leading-relaxed"
                  value={rosterText}
                  onChange={(e) => setRosterText(e.target.value)}
                />
              </CardContent>
            </Card>

            <Button 
              onClick={handleGenerate}
              disabled={playerCount < 2}
              className="w-full h-16 bg-primary hover:bg-primary/90 text-white text-xl font-black italic tracking-tighter rounded-3xl shadow-xl shadow-primary/20 animate-shine active:scale-[0.98] transition-all"
            >
              CANTAR EL SORTEO <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        )}

        {/* PASO 3: RESULTADOS */}
        {currentStep === 'results' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-700">
            {isGenerating ? (
              <div className="h-[60vh] flex flex-col items-center justify-center space-y-8">
                <div className="relative">
                  <div className="absolute -inset-10 bg-primary/30 blur-[60px] rounded-full animate-pulse"></div>
                  <Trophy className="h-24 w-24 text-primary animate-float" />
                </div>
                <div className="text-center space-y-4">
                  <h3 className="text-4xl font-black italic tracking-tighter uppercase text-glow animate-pulse">Sorteando...</h3>
                  <div className="flex gap-2 justify-center">
                    <div className="w-3 h-3 bg-primary rounded-full animate-ping"></div>
                    <div className="w-3 h-3 bg-accent rounded-full animate-ping delay-100"></div>
                    <div className="w-3 h-3 bg-primary rounded-full animate-ping delay-200"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep('players')} className="rounded-full h-10 w-10 p-0 border-border bg-card transition-transform active:scale-75">
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex gap-2">
                    <Button onClick={handleDownloadImage} disabled={isDownloading} className="rounded-full bg-primary hover:bg-primary/90 text-white font-black italic text-xs h-10 px-6 gap-2 shadow-lg shadow-primary/30 animate-pulse">
                      {isDownloading ? <RotateCw className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                      DESCARGAR PÓSTER
                    </Button>
                  </div>
                </div>

                <div 
                  ref={resultsRef} 
                  className="champions-gradient p-[1px] rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-1000"
                >
                  <div className="relative bg-[#0a192f] p-6 md:p-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 blur-[80px] pointer-events-none"></div>
                    
                    <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                      <div className="flex items-center gap-3">
                        <Star className="h-6 w-6 text-accent fill-accent" />
                        <div>
                          <h4 className="font-black text-white text-xl italic tracking-tighter leading-none uppercase">CAIMANERA ELITE</h4>
                          <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em]">Official Selection</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-white italic opacity-40 uppercase">
                        {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase()}
                      </span>
                    </div>

                    {matchDetails && (
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8 text-center relative overflow-hidden match-glow">
                        <Badge className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary text-[8px] font-black px-4 italic rounded-b-lg">FEATURED MATCH</Badge>
                        <div className="flex items-center justify-between gap-4 mt-4">
                          <div className="flex-1">
                            <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-2 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            <span className="text-2xl font-black text-white uppercase italic tracking-tighter block leading-none">{matchDetails.teamA}</span>
                          </div>
                          <div className="text-4xl font-black text-white/10 italic">VS</div>
                          <div className="flex-1">
                            <ShieldCheck className="h-10 w-10 text-accent mx-auto mb-2 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                            <span className="text-2xl font-black text-white uppercase italic tracking-tighter block leading-none">{matchDetails.teamB}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-8 border-t border-white/5 pt-6 text-[10px] font-bold uppercase italic">
                          <div className="flex items-center gap-2 justify-center text-accent">
                            <Timer className="h-3 w-3" /> SAQUE: {matchDetails.kickoffTeam}
                          </div>
                          {matchDetails.waitingTeam && (
                            <div className="flex items-center gap-2 justify-center text-primary">
                              <RotateCw className="h-3 w-3" /> ESPERA: {matchDetails.waitingTeam}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {generatedTeams.map((team) => (
                        <div key={team.id} className="bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                          <div className="bg-white/5 px-4 py-3 flex justify-between items-center border-b border-white/5">
                            <span className="font-black text-xs text-white italic uppercase tracking-tighter">{team.name}</span>
                            <span className="text-[8px] font-black text-white/40">{team.players.length} CRACKS</span>
                          </div>
                          <div className="p-3 space-y-1">
                            {team.players.map((player, pIdx) => (
                              <div key={pIdx} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5 text-[11px] font-black uppercase italic text-white/80 transition-colors hover:bg-white/10">
                                <span className="text-primary w-4 opacity-50">{pIdx + 1}</span>
                                {player}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-2 opacity-30">
                      <span className="text-[7px] font-black text-white uppercase tracking-[0.4em] italic">Elite Tournament System v1.0</span>
                      <span className="text-[8px] font-black text-white uppercase tracking-widest italic">
                        Desarrollado por John Di Donna
                      </span>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentStep('format')} 
                  className="w-full text-muted-foreground font-black italic uppercase text-[10px] hover:text-primary transition-colors tracking-widest"
                >
                  Reiniciar Sorteo
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}