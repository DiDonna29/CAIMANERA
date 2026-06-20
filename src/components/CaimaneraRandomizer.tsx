"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  Zap,
  UserPlus,
  Trash2,
  Edit2,
  Check,
  X
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

type Step = 'format' | 'players' | 'verify' | 'results';

const FORMATS = [
  { id: '2', label: 'Dúos', sub: '2v2', icon: <Users className="h-5 w-5" /> },
  { id: '3', label: 'Tríos', sub: '3v3', icon: <Users className="h-5 w-5" /> },
  { id: '5', label: 'Fútbol 5', sub: '5v5', icon: <Users className="h-6 w-6" /> },
  { id: '7', label: 'Fútbol 7', sub: '7v7', icon: <Users className="h-6 w-6" /> },
  { id: '11', label: 'Fútbol 11', sub: '11v11', icon: <Users className="h-7 w-7" /> },
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export default function CaimaneraRandomizer() {
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState<Step>('format');
  const [playersPerTeam, setPlayersPerTeam] = useState<string>("5");
  const [rosterText, setRosterText] = useState<string>("");
  const [players, setPlayers] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
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

  const handleProcessList = () => {
    const list = rosterText
      .split('\n')
      .map(p => p.trim())
      .filter(p => p !== "");
    
    if (list.length < 2) {
      toast({
        variant: "destructive",
        title: "Pocos jugadores",
        description: "Ingresa al menos 2 nombres para continuar.",
      });
      return;
    }
    setPlayers(list);
    setCurrentStep('verify');
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    setPlayers([...players, newPlayerName.trim()]);
    setNewPlayerName("");
  };

  const handleRemovePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(players[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;
    const updated = [...players];
    updated[editingIndex] = editValue.trim();
    setPlayers(updated);
    setEditingIndex(null);
  };

  const handleGenerate = async () => {
    if (players.length < 2) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Necesitas al menos 2 jugadores.",
      });
      return;
    }

    setIsGenerating(true);
    setCurrentStep('results');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const shuffled = shuffleArray(players);
      const perTeam = parseInt(playersPerTeam);
      const numTeams = Math.ceil(shuffled.length / perTeam);
      
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
        const shuffledTeams = shuffleArray(teams);
        const teamA = shuffledTeams[0].name;
        const teamB = shuffledTeams[1].name;
        const waitingTeam = shuffledTeams.length > 2 ? shuffledTeams[2].name : null;
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
        style: { padding: '0', borderRadius: '0' }
      });
      const link = document.createElement('a');
      link.download = `Caimanera_Elite_${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "Póster descargado", description: "Imagen guardada exitosamente." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo generar la imagen." });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-8 space-y-6 min-h-screen">
      {/* Navbar Superior */}
      <nav className="flex justify-between items-center bg-card/60 backdrop-blur-xl p-2 rounded-full border border-border/50 sticky top-4 z-50 shadow-lg">
        <div className="flex items-center gap-3 pl-4">
          <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-primary italic">Caimanera Elite</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full h-9 w-9 transition-all hover:bg-primary/10 active:scale-75">
            {theme === 'dark' ? <Sun className="h-5 w-5 text-accent" /> : <Moon className="h-5 w-5 text-primary" />}
          </Button>
          {currentStep !== 'format' && (
            <Button variant="ghost" size="icon" onClick={() => {
              setPlayers([]);
              setRosterText("");
              setCurrentStep('format');
            }} className="rounded-full h-9 w-9 hover:bg-destructive/10">
              <RotateCw className="h-5 w-5" />
            </Button>
          )}
        </div>
      </nav>

      <div className="relative min-h-[75vh]">
        {/* PASO 1: FORMATO */}
        {currentStep === 'format' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="text-center space-y-3 pt-6">
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none drop-shadow-sm">
                ¿QUÉ SE JUEGA<br/><span className="text-primary text-glow">HOY?</span>
              </h1>
              <p className="text-muted-foreground text-xs uppercase font-bold tracking-[0.3em]">PASO 1 • CONFIGURACIÓN</p>
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
                    "flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 transition-all duration-500 active:scale-95 group relative overflow-hidden",
                    playersPerTeam === f.id 
                      ? "bg-primary/10 border-primary shadow-[0_20px_40px_rgba(59,130,246,0.15)]" 
                      : "bg-card border-border/50 hover:border-primary/40"
                  )}
                >
                  <div className={cn(
                    "mb-4 p-4 rounded-2xl transition-all duration-500 group-hover:scale-110",
                    playersPerTeam === f.id ? "bg-primary text-white scale-110" : "bg-muted text-muted-foreground"
                  )}>
                    {f.icon}
                  </div>
                  <span className="font-black italic uppercase tracking-tighter text-xl">{f.label}</span>
                  <span className="text-[10px] font-bold opacity-50 tracking-widest">{f.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2: ENTRADA DE TEXTO */}
        {currentStep === 'players' && (
          <div className="space-y-6 animate-in slide-in-from-right-10 fade-in duration-500">
            <div className="flex items-center justify-between pt-6">
              <Button variant="ghost" onClick={() => setCurrentStep('format')} className="gap-2 font-bold uppercase text-[10px] italic active:scale-90">
                <ChevronLeft className="h-4 w-4" /> VOLVER
              </Button>
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                LOS <span className="text-accent text-glow">CRACKS</span>
              </h2>
              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.3em]">Pega tu lista de WhatsApp aquí</p>
            </div>

            <Card className="glass-card border-primary/20 overflow-hidden shadow-2xl rounded-[2rem]">
              <CardContent className="p-0">
                <Textarea 
                  placeholder="Ej: Messi&#10;Cristiano&#10;Neymar..." 
                  className="min-h-[350px] border-0 bg-transparent text-xl font-bold italic placeholder:opacity-20 p-8 focus-visible:ring-0 resize-none leading-relaxed"
                  value={rosterText}
                  onChange={(e) => setRosterText(e.target.value)}
                />
              </CardContent>
            </Card>

            <Button 
              onClick={handleProcessList}
              disabled={rosterText.trim().length < 2}
              className="w-full h-20 bg-primary hover:bg-primary/90 text-white text-xl font-black italic tracking-tighter rounded-[1.5rem] shadow-xl shadow-primary/20 animate-shine active:scale-[0.98] transition-all"
            >
              PROCESAR LISTA <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        )}

        {/* PASO 3: VALIDACIÓN DE CÁPSULAS */}
        {currentStep === 'verify' && (
          <div className="space-y-6 animate-in zoom-in-95 fade-in duration-500">
            <div className="flex items-center justify-between pt-6">
              <Button variant="ghost" onClick={() => setCurrentStep('players')} className="gap-2 font-bold uppercase text-[10px] italic">
                <ChevronLeft className="h-4 w-4" /> RE-EDITAR LISTA
              </Button>
              <Badge variant="outline" className="font-mono text-[10px] bg-primary/5 border-primary/20 text-primary px-4 py-1">
                {players.length} JUGADORES
              </Badge>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                REVISIÓN <span className="text-primary text-glow">ELITE</span>
              </h2>
              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.3em]">Valida o edita antes del sorteo</p>
            </div>

            <Card className="bg-card/40 backdrop-blur-md border-border/50 rounded-[2rem] p-6 shadow-xl">
              <div className="flex flex-wrap gap-3 mb-8 min-h-[150px] content-start">
                {players.map((player, index) => (
                  <div key={index} className="group relative">
                    {editingIndex === index ? (
                      <div className="flex items-center bg-primary/10 rounded-full border border-primary/50 px-2 py-1 animate-in zoom-in-95">
                        <Input 
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                          className="h-7 w-32 bg-transparent border-0 focus-visible:ring-0 font-bold italic text-sm"
                        />
                        <button onClick={handleSaveEdit} className="p-1 text-green-500 hover:scale-110 transition-transform">
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <Badge 
                        variant="secondary" 
                        className="px-4 py-2 rounded-full border-border bg-card/80 hover:bg-primary hover:text-white transition-all duration-300 gap-2 cursor-pointer group"
                      >
                        <span onClick={() => handleStartEdit(index)} className="font-bold italic uppercase text-xs">{player}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleStartEdit(index)} className="p-1 hover:text-accent">
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button onClick={() => handleRemovePlayer(index)} className="p-1 hover:text-red-400">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </Badge>
                    )}
                  </div>
                ))}
                
                {/* Añadir Jugador Rápido */}
                <div className="flex items-center gap-2 bg-muted/30 rounded-full border border-dashed border-border p-1 pl-4">
                  <Input 
                    placeholder="Nuevo Crack..." 
                    className="h-7 w-32 bg-transparent border-0 focus-visible:ring-0 text-xs italic font-bold"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                  />
                  <Button size="icon" variant="ghost" onClick={handleAddPlayer} className="h-7 w-7 rounded-full bg-primary text-white hover:scale-110 transition-transform">
                    <UserPlus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>

            <Button 
              onClick={handleGenerate}
              className="w-full h-20 bg-primary hover:bg-primary/90 text-white text-2xl font-black italic tracking-tighter rounded-[1.5rem] shadow-xl shadow-primary/30 animate-pulse active:scale-95 transition-all"
            >
              CANTAR EL SORTEO <Zap className="ml-2 h-6 w-6 fill-yellow-400 text-yellow-400" />
            </Button>
          </div>
        )}

        {/* PASO 4: RESULTADOS */}
        {currentStep === 'results' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-700">
            {isGenerating ? (
              <div className="h-[65vh] flex flex-col items-center justify-center space-y-8">
                <div className="relative">
                  <div className="absolute -inset-16 bg-primary/20 blur-[80px] rounded-full animate-pulse"></div>
                  <Trophy className="h-32 w-32 text-primary animate-float drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]" />
                </div>
                <div className="text-center space-y-4">
                  <h3 className="text-5xl font-black italic tracking-tighter uppercase text-glow animate-pulse">SORTEANDO...</h3>
                  <div className="flex gap-3 justify-center">
                    <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-4 h-4 bg-accent rounded-full animate-bounce delay-100"></div>
                    <div className="w-4 h-4 bg-primary rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-20">
                <div className="flex items-center justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep('verify')} className="rounded-full h-12 w-12 p-0 border-border bg-card hover:bg-primary/10 transition-all active:scale-75">
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button onClick={handleDownloadImage} disabled={isDownloading} className="rounded-full bg-primary hover:bg-primary/90 text-white font-black italic text-sm h-12 px-8 gap-2 shadow-xl shadow-primary/30 animate-shine">
                    {isDownloading ? <RotateCw className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
                    DESCARGAR PÓSTER
                  </Button>
                </div>

                <div 
                  ref={resultsRef} 
                  className="champions-gradient p-[1px] rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-1000"
                >
                  <div className="relative bg-[#0a192f] p-8 md:p-12">
                    {/* Decoraciones del Póster */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 blur-[120px] pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 blur-[100px] pointer-events-none"></div>
                    
                    <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-8">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-accent/20 rounded-xl">
                          <Star className="h-8 w-8 text-accent fill-accent" />
                        </div>
                        <div>
                          <h4 className="font-black text-white text-3xl italic tracking-tighter leading-none uppercase">CAIMANERA ELITE</h4>
                          <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Official Tournament Draw</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-white italic opacity-40 uppercase block">
                          {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {matchDetails && (
                      <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 mb-10 text-center relative overflow-hidden match-glow">
                        <Badge className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary text-[10px] font-black px-6 py-1 italic rounded-b-xl tracking-widest">MATCH OF THE DAY</Badge>
                        <div className="flex items-center justify-between gap-6 mt-6">
                          <div className="flex-1 space-y-4">
                            <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto border border-primary/30">
                              <ShieldCheck className="h-10 w-10 text-primary drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            </div>
                            <span className="text-3xl font-black text-white uppercase italic tracking-tighter block leading-none">{matchDetails.teamA}</span>
                          </div>
                          <div className="text-5xl font-black text-white/20 italic tracking-tighter">VS</div>
                          <div className="flex-1 space-y-4">
                            <div className="h-16 w-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto border border-accent/30">
                              <ShieldCheck className="h-10 w-10 text-accent drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                            </div>
                            <span className="text-3xl font-black text-white uppercase italic tracking-tighter block leading-none">{matchDetails.teamB}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-10 border-t border-white/5 pt-8 text-xs font-black uppercase italic tracking-widest">
                          <div className="flex items-center gap-3 justify-center text-accent bg-accent/10 py-3 rounded-xl">
                            <Timer className="h-4 w-4" /> SAQUE: {matchDetails.kickoffTeam}
                          </div>
                          {matchDetails.waitingTeam && (
                            <div className="flex items-center gap-3 justify-center text-primary bg-primary/10 py-3 rounded-xl">
                              <RotateCw className="h-4 w-4" /> ESPERA: {matchDetails.waitingTeam}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {generatedTeams.map((team) => (
                        <div key={team.id} className="bg-white/5 rounded-[1.5rem] overflow-hidden border border-white/10 group transition-all hover:bg-white/10">
                          <div className="bg-white/5 px-6 py-4 flex justify-between items-center border-b border-white/5">
                            <div className="flex items-center gap-3">
                              <Zap className="h-4 w-4 text-primary fill-primary" />
                              <span className="font-black text-lg text-white italic uppercase tracking-tighter">{team.name}</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-black text-white/60 border-white/10">{team.players.length} CRACKS</Badge>
                          </div>
                          <div className="p-4 space-y-2">
                            {team.players.map((player, pIdx) => (
                              <div key={pIdx} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 text-sm font-black uppercase italic text-white/90 transition-all hover:translate-x-1 hover:bg-white/10">
                                <span className="text-primary w-5 opacity-40 font-mono text-xs">{String(pIdx + 1).padStart(2, '0')}</span>
                                {player}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-[9px] font-black text-white uppercase tracking-[0.5em] italic">Elite Matchmaker System v2.0</span>
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest italic bg-white/5 px-4 py-1 rounded-full">
                        Desarrollado por John Di Donna
                      </span>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentStep('format')} 
                  className="w-full text-muted-foreground font-black italic uppercase text-[10px] hover:text-primary transition-all tracking-[0.4em] mt-10"
                >
                  <RotateCw className="mr-2 h-4 w-4" /> REINICIAR TODO EL SORTEO
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
