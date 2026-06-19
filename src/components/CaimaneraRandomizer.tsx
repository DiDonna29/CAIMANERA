"use client"

import React, { useState, useRef } from 'react';
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
  Copy, 
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
  ShieldCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
        description: `Se han creado ${teams.length} equipos listos para la acción.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un problema al generar los equipos.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedTeams.length === 0) return;

    let text = "⚽ CAIMANERA RANDOMIZER ⚽\n\n";
    
    if (matchDetails) {
      text += `⚔️ PRIMER PARTIDO: ${matchDetails.teamA} vs ${matchDetails.teamB}\n`;
      text += `🪙 SAQUE INICIAL: ${matchDetails.kickoffTeam}\n`;
      if (matchDetails.waitingTeam) {
        text += `⏳ ESPERA: ${matchDetails.waitingTeam}\n`;
      }
      text += "\n-------------------\n\n";
    }

    text += generatedTeams
      .map(t => `🏆 ${t.name}:\n${t.players.map(p => `• ${p}`).join('\n')}`)
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copiado",
      description: "Resultados copiados al portapapeles.",
    });
  };

  const handleDownloadImage = async () => {
    if (!resultsRef.current) return;
    
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(resultsRef.current, {
        cacheBust: true,
        backgroundColor: '#0a192f',
        skipFonts: true, // Evita errores de seguridad con fuentes externas
        style: {
          padding: '0',
          borderRadius: '0'
        }
      });
      const link = document.createElement('a');
      link.download = `Sorteo_Caimanera_${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "¡Tarjeta lista!",
        description: "Imagen descargada exitosamente.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo generar la imagen.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const playerCount = rosterText.split('\n').filter(p => p.trim() !== "").length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 animate-in fade-in zoom-in duration-700">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1 rounded-full text-primary text-xs font-black tracking-widest uppercase">
          <Star className="h-3 w-3 fill-primary" />
          Elite Matchmaking Engine
          <Star className="h-3 w-3 fill-primary" />
        </div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white font-headline leading-none">
          CAIMANERA<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-pulse italic">RANDOMIZER</span>
        </h1>
        <p className="text-muted-foreground text-base md:text-xl max-w-2xl mx-auto font-medium opacity-70">
          Transforma tu pichanga en un evento de clase mundial.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        {/* Configuration Panel */}
        <div className="xl:col-span-4 space-y-6">
          <Card className="shadow-2xl border-white/5 bg-white/5 backdrop-blur-xl">
            <CardHeader className="border-b border-white/5">
              <div className="text-sm font-black flex items-center gap-2 uppercase tracking-tighter text-primary">
                <Zap className="h-4 w-4 fill-primary" />
                Configuración del Torneo
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Modalidad</Label>
                <Select value={playersPerTeam} onValueChange={setPlayersPerTeam}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 text-lg font-bold">
                    <SelectValue placeholder="Formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 vs 2</SelectItem>
                    <SelectItem value="3">3 vs 3</SelectItem>
                    <SelectItem value="5">5 vs 5</SelectItem>
                    <SelectItem value="7">7 vs 7</SelectItem>
                    <SelectItem value="11">11 vs 11</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Plantilla de Jugadores</Label>
                  <Badge variant="outline" className="text-[10px] font-mono border-primary text-primary">
                    {playerCount} REGISTRADOS
                  </Badge>
                </div>
                <Textarea 
                  placeholder="Lionel Messi&#10;Kylian Mbappé&#10;Vini Jr..." 
                  className="min-h-[300px] bg-white/5 border-white/10 text-base font-medium focus:ring-accent resize-none placeholder:opacity-20"
                  value={rosterText}
                  onChange={(e) => setRosterText(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || playerCount < 2} 
                className={cn(
                  "w-full h-16 bg-primary hover:bg-primary/90 text-white text-xl font-black italic tracking-tighter transition-all hover:scale-[1.01] active:scale-95 shadow-[0_0_30px_rgba(59,130,246,0.3)]",
                  isGenerating && "animate-pulse"
                )}
              >
                {isGenerating ? (
                  <RotateCw className="mr-3 h-6 w-6 animate-spin" />
                ) : (
                  "INICIAR SORTEO ELITE"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="xl:col-span-8 space-y-6">
          {isGenerating ? (
            <Card className="min-h-[600px] flex flex-col items-center justify-center p-8 bg-black/40 border-dashed border-2 border-white/10">
              <div className="relative mb-8">
                <div className="absolute -inset-10 bg-primary/30 blur-[60px] rounded-full animate-pulse"></div>
                <Trophy className="h-24 w-24 text-primary animate-bounce" />
              </div>
              <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic animate-pulse">Procesando Formaciones...</h3>
            </Card>
          ) : generatedTeams.length > 0 ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-700">
              
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-accent p-2 rounded-lg">
                    <ShieldCheck className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                    Cuadro Final
                  </h2>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleCopy} 
                    className="gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10 h-12 px-6"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                    TEXTO
                  </Button>
                  <Button 
                    onClick={handleDownloadImage} 
                    disabled={isDownloading}
                    className="gap-2 bg-primary hover:bg-primary/90 text-white font-black italic h-12 px-8 shadow-lg"
                  >
                    {isDownloading ? <RotateCw className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                    DESCARGAR POSTER
                  </Button>
                </div>
              </div>

              {/* Tournament Broadcast Card (Capture Area) */}
              <div 
                ref={resultsRef} 
                className="champions-gradient p-1 rounded-3xl relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}
              >
                {/* Background Patterns for Capture */}
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary blur-[120px]"></div>
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent blur-[120px]"></div>
                </div>

                <div className="relative bg-[#0a192f] p-8 md:p-12 rounded-[22px] border border-white/10">
                  {/* Header Branding */}
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 border border-white/20 rounded-full flex items-center justify-center">
                        <Star className="h-6 w-6 text-accent fill-accent" />
                      </div>
                      <div>
                        <h4 className="font-black text-white text-2xl leading-none italic tracking-tighter">CAIMANERA ELITE</h4>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">International Series</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Matchday</p>
                      <p className="text-sm font-black text-white italic">
                        {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Feature Match Display */}
                  {matchDetails && (
                    <div className="mb-12 relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                      <div className="relative bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl p-8 overflow-hidden">
                        
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary px-4 py-1 rounded-b-lg">
                          <span className="text-[10px] font-black text-white uppercase tracking-tighter italic">Main Event</span>
                        </div>

                        <div className="flex items-center justify-between gap-4 md:gap-8 relative z-10 pt-4">
                          <div className="flex-1 text-center space-y-2">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 border border-white/10 rounded-full mx-auto flex items-center justify-center shadow-2xl">
                              <ShieldCheck className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                            </div>
                            <span className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tighter block truncate">
                              {matchDetails.teamA}
                            </span>
                          </div>

                          <div className="flex flex-col items-center gap-2">
                            <div className="text-4xl md:text-6xl font-black text-white italic opacity-20 select-none">VS</div>
                            <div className="bg-accent text-accent-foreground font-black text-xs px-4 py-1 rounded-sm skew-x-[-12deg] shadow-lg">
                              OFFICIAL
                            </div>
                          </div>

                          <div className="flex-1 text-center space-y-2">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 border border-white/10 rounded-full mx-auto flex items-center justify-center shadow-2xl">
                              <ShieldCheck className="h-8 w-8 md:h-10 md:w-10 text-accent" />
                            </div>
                            <span className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tighter block truncate">
                              {matchDetails.teamB}
                            </span>
                          </div>
                        </div>

                        <div className="mt-8 flex flex-wrap justify-center gap-4 border-t border-white/5 pt-6">
                          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                            <Timer className="h-4 w-4 text-accent" />
                            <span className="text-[11px] font-black text-white uppercase tracking-tighter">
                              Saque: <span className="text-accent">{matchDetails.kickoffTeam}</span>
                            </span>
                          </div>
                          {matchDetails.waitingTeam && (
                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                              <Zap className="h-4 w-4 text-primary" />
                              <span className="text-[11px] font-black text-white/60 uppercase tracking-tighter">
                                En Espera: <span className="text-white">{matchDetails.waitingTeam}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Squads List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {generatedTeams.map((team) => (
                      <div key={team.id} className="champions-card rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors">
                        <div className="bg-white/5 px-6 py-3 flex justify-between items-center border-b border-white/5">
                          <span className="font-black text-sm text-white italic uppercase tracking-tighter">{team.name}</span>
                          <span className="text-[10px] font-bold text-primary">{team.players.length} PLAYERS</span>
                        </div>
                        <div className="p-4 space-y-2">
                          {team.players.map((player, pIdx) => (
                            <div key={pIdx} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 group/player hover:bg-primary/10 transition-colors">
                              <span className="text-xs font-black text-primary/50 italic w-4">{pIdx + 1}</span>
                              <span className="font-black text-sm text-white/90 uppercase italic tracking-tighter truncate">{player}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Branding */}
                  <div className="mt-12 text-center pt-8 border-t border-dashed border-white/10">
                    <div className="flex items-center justify-center gap-2 opacity-30">
                      <Trophy className="h-4 w-4" />
                      <p className="text-[9px] font-black text-white uppercase tracking-[0.6em]">
                        CAIMANERA RANDOMIZER ELITE
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Card className="h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-white/10 opacity-30">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Users className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter italic text-white">No hay sorteos activos</h3>
              <p className="max-w-xs mt-3 text-sm font-medium">Prepara tu alineación a la izquierda y pulsa el botón para generar el bracket del torneo.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}