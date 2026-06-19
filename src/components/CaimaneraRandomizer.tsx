"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  RotateCw, 
  Trophy, 
  Check, 
  Dices,
  Info,
  Swords,
  Timer,
  LayoutGrid,
  Image as ImageIcon,
  Share2,
  Zap,
  Star,
  ShieldCheck,
  Moon,
  Sun,
  Crown
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

export default function CaimaneraRandomizer() {
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [playersPerTeam, setPlayersPerTeam] = useState<string>("5");
  const [rosterText, setRosterText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generatedTeams, setGeneratedTeams] = useState<Team[]>([]);
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Theme synchronization
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
    setGeneratedTeams([]);
    setMatchDetails(null);

    try {
      // Simular un proceso de "sorteo" visual con un pequeño retraso
      await new Promise(resolve => setTimeout(resolve, 1500));

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

      toast({
        title: "¡Equipos generados!",
        description: `Torneo configurado con ${teams.length} equipos.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Fallo al procesar el sorteo.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedTeams.length === 0) return;

    let text = "⚽ CAIMANERA ELITE SERIES ⚽\n\n";
    
    if (matchDetails) {
      text += `⚔️ ESTELAR: ${matchDetails.teamA} vs ${matchDetails.teamB}\n`;
      text += `🪙 SAQUE: ${matchDetails.kickoffTeam}\n`;
      if (matchDetails.waitingTeam) text += `⏳ ESPERA: ${matchDetails.waitingTeam}\n`;
      text += "\n-------------------\n\n";
    }

    text += generatedTeams
      .map(t => `🏆 ${t.name} (${t.players.length}):\n${t.players.map(p => `• ${p}`).join('\n')}`)
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copiado",
      description: "Listado listo para compartir.",
    });
  };

  const handleDownloadImage = async () => {
    if (!resultsRef.current) return;
    
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(resultsRef.current, {
        cacheBust: true,
        backgroundColor: '#0a192f', // El poster siempre es elegante oscuro
        style: {
          padding: '0',
          borderRadius: '0'
        }
      });
      const link = document.createElement('a');
      link.download = `Caimanera_Elite_${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "Póster descargado",
        description: "Imagen de alta resolución guardada.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error de captura",
        description: "No se pudo generar la imagen.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const playerCount = rosterText.split('\n').filter(p => p.trim() !== "").length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8 md:space-y-12">
      {/* Header & Theme Toggle */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-primary text-[10px] font-black uppercase tracking-widest">
          <Crown className="h-3 w-3" />
          Tournament Edition
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full h-10 w-10 transition-transform active:scale-90">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-4 md:space-y-6 animate-in fade-in zoom-in duration-1000">
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">
          CAIMANERA<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary italic animate-shine">ELITE</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-xl max-w-xl mx-auto font-medium">
          La plataforma oficial para tus sorteos de fútbol amateur de alto nivel.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start">
        {/* Input Panel */}
        <div className="lg:col-span-4 space-y-6 animate-in slide-in-from-left-10 duration-700">
          <Card className="glass-card overflow-hidden transition-all hover:shadow-2xl hover:border-primary/30">
            <CardHeader className="bg-primary/5 border-b border-border py-4">
              <div className="text-xs font-black flex items-center gap-2 uppercase tracking-tighter text-primary">
                <Zap className="h-4 w-4 fill-primary animate-pulse" />
                Panel de Control
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Formato de Juego</Label>
                <Select value={playersPerTeam} onValueChange={setPlayersPerTeam}>
                  <SelectTrigger className="h-12 bg-background border-border text-base font-bold transition-all hover:border-primary">
                    <SelectValue placeholder="Formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Dúos (2v2)</SelectItem>
                    <SelectItem value="3">Tríos (3v3)</SelectItem>
                    <SelectItem value="5">Fútbol 5 (5v5)</SelectItem>
                    <SelectItem value="7">Fútbol 7 (7v7)</SelectItem>
                    <SelectItem value="11">Fútbol 11 (11v11)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Lista de Cracks</Label>
                  <Badge variant="secondary" className="text-[9px] font-mono animate-in fade-in">
                    {playerCount} JUGADORES
                  </Badge>
                </div>
                <Textarea 
                  placeholder="Escribe los nombres aquí..." 
                  className="min-h-[250px] bg-background border-border text-base font-medium focus:ring-primary resize-none transition-all hover:border-primary/50"
                  value={rosterText}
                  onChange={(e) => setRosterText(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || playerCount < 2} 
                className={cn(
                  "w-full h-14 bg-primary hover:bg-primary/90 text-white text-lg font-black italic tracking-tighter transition-all hover:scale-[1.02] shadow-lg animate-shine",
                  isGenerating && "animate-pulse"
                )}
              >
                {isGenerating ? (
                  <RotateCw className="mr-3 h-5 w-5 animate-spin" />
                ) : (
                  "REALIZAR SORTEO"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-8 space-y-6">
          {isGenerating ? (
            <div className="h-[500px] flex flex-col items-center justify-center space-y-6 border-2 border-dashed border-primary/20 rounded-3xl bg-primary/5 animate-in fade-in duration-500">
              <div className="relative">
                <div className="absolute -inset-8 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
                <Trophy className="h-20 w-20 text-primary animate-bounce animate-float" />
              </div>
              <p className="text-2xl font-black uppercase italic tracking-tighter animate-pulse text-primary">Sorteando Grupos...</p>
            </div>
          ) : generatedTeams.length > 0 ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-700">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-3 animate-in fade-in slide-in-from-left-5">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                  Cuadro de Honor
                </h2>
                <div className="flex gap-2 w-full sm:w-auto animate-in fade-in slide-in-from-right-5">
                  <Button 
                    variant="outline" 
                    onClick={handleCopy} 
                    className="flex-1 sm:flex-none gap-2 h-10 px-4 font-bold border-border bg-card transition-all hover:scale-105 active:scale-95"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                    TEXTO
                  </Button>
                  <Button 
                    onClick={handleDownloadImage} 
                    disabled={isDownloading}
                    className="flex-1 sm:flex-none gap-2 bg-primary hover:bg-primary/90 text-white font-black h-10 px-6 transition-all hover:scale-105 active:scale-95 shadow-lg"
                  >
                    {isDownloading ? <RotateCw className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                    PÓSTER
                  </Button>
                </div>
              </div>

              {/* Poster Export Area (Always Dark for maximum elegance) */}
              <div 
                ref={resultsRef} 
                className="champions-gradient p-[2px] rounded-3xl relative overflow-hidden match-glow animate-in zoom-in-95 duration-1000"
                style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}
              >
                <div className="relative bg-[#0a192f] p-6 md:p-10 rounded-[22px]">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] pointer-events-none animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

                  {/* Header Branding */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-white/10 pb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shadow-inner animate-float">
                        <Star className="h-7 w-7 text-accent fill-accent" />
                      </div>
                      <div>
                        <h4 className="font-black text-white text-2xl leading-none italic tracking-tighter uppercase">ELITE SERIES</h4>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1">Official Selection</p>
                      </div>
                    </div>
                    <div className="md:text-right">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Match Date</span>
                      <span className="text-lg font-black text-white italic">
                        {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Main Event Spotlight */}
                  {matchDetails && (
                    <div className="mb-10">
                      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-10 overflow-hidden group hover:border-primary/40 transition-all duration-500">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary px-6 py-1 rounded-b-xl shadow-lg z-20">
                          <span className="text-[10px] font-black text-white uppercase tracking-tighter italic">Featured Match</span>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-around gap-8 md:gap-4 relative z-10">
                          {/* Team A */}
                          <div className="flex-1 text-center space-y-4 group/team">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-white/10 to-transparent border border-white/20 rounded-full mx-auto flex items-center justify-center shadow-2xl transition-transform group-hover/team:scale-110 duration-500">
                              <ShieldCheck className="h-10 w-10 md:h-12 md:w-12 text-primary" />
                            </div>
                            <span className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter block leading-tight text-glow">
                              {matchDetails.teamA}
                            </span>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="text-5xl md:text-7xl font-black text-white/10 italic select-none group-hover:text-primary/20 transition-colors duration-700">VS</div>
                            <Badge className="bg-accent text-accent-foreground font-black text-xs px-4 rounded-sm skew-x-[-15deg] animate-pulse">LIVE</Badge>
                          </div>

                          {/* Team B */}
                          <div className="flex-1 text-center space-y-4 group/team">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-white/10 to-transparent border border-white/20 rounded-full mx-auto flex items-center justify-center shadow-2xl transition-transform group-hover/team:scale-110 duration-500">
                              <ShieldCheck className="h-10 w-10 md:h-12 md:w-12 text-accent" />
                            </div>
                            <span className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter block leading-tight text-glow">
                              {matchDetails.teamB}
                            </span>
                          </div>
                        </div>

                        {/* Sub-info match */}
                        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-8">
                          <div className="flex items-center justify-center md:justify-start gap-3 bg-white/5 px-5 py-3 rounded-xl border border-white/5 transition-all hover:bg-white/10">
                            <Timer className="h-5 w-5 text-accent animate-pulse" />
                            <div className="text-left">
                              <p className="text-[9px] font-bold text-white/40 uppercase">Kickoff Team</p>
                              <p className="text-xs font-black text-white uppercase italic">{matchDetails.kickoffTeam}</p>
                            </div>
                          </div>
                          {matchDetails.waitingTeam && (
                            <div className="flex items-center justify-center md:justify-start gap-3 bg-white/5 px-5 py-3 rounded-xl border border-white/5 transition-all hover:bg-white/10">
                              <RotateCw className="h-5 w-5 text-primary animate-spin-slow" style={{ animationDuration: '4s' }} />
                              <div className="text-left">
                                <p className="text-[9px] font-bold text-white/40 uppercase">On Bench</p>
                                <p className="text-xs font-black text-white uppercase italic">{matchDetails.waitingTeam}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Squads Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {generatedTeams.map((team) => (
                      <div key={team.id} className="bg-white/5 rounded-2xl overflow-hidden border border-white/5 hover:border-primary/40 transition-all duration-300 group">
                        <div className="bg-white/5 px-6 py-4 flex justify-between items-center border-b border-white/5 transition-colors group-hover:bg-primary/5">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            <span className="font-black text-base text-white italic uppercase tracking-tighter">{team.name}</span>
                          </div>
                          <span className="text-[10px] font-black text-white/40 tracking-widest">{team.players.length} SQUAD</span>
                        </div>
                        <div className="p-4 space-y-2">
                          {team.players.map((player, pIdx) => (
                            <div key={pIdx} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-200 hover:translate-x-1 group/item">
                              <span className="text-[10px] font-black text-primary italic w-5">{pIdx + 1}</span>
                              <span className="font-black text-sm text-white/90 uppercase italic truncate">{player}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Branding for Image */}
                  <div className="mt-12 text-center pt-8 border-t border-dashed border-white/10">
                    <div className="flex items-center justify-center gap-3 opacity-20">
                      <Trophy className="h-5 w-5" />
                      <p className="text-[10px] font-black text-white uppercase tracking-[0.8em]">CAIMANERA ELITE GENERATOR</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Card className="h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-border bg-card/40 opacity-50 transition-all hover:opacity-100 group">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500">
                <Users className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">Esperando Registro</h3>
              <p className="max-w-xs mt-3 text-sm font-medium text-muted-foreground">Ingresa los nombres de los jugadores y configura el formato para comenzar el sorteo de élite.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
