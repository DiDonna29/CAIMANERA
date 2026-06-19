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
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toPng } from 'html-to-image';

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
        backgroundColor: '#ffffff',
        skipFonts: true,
        style: {
          padding: '24px',
          borderRadius: '16px'
        }
      });
      const link = document.createElement('a');
      link.download = `Caimanera_Equipos_${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "¡Imagen lista!",
        description: "Se ha descargado la tarjeta de tus equipos.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error de descarga",
        description: "No se pudo generar la imagen. Prueba copiando el texto.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const playerCount = rosterText.split('\n').filter(p => p.trim() !== "").length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-primary font-headline flex items-center justify-center gap-3">
          <Dices className="h-10 w-10 md:h-14 md:w-14 text-accent" />
          CAIMANERA <span className="text-accent italic">RANDOM</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-lg max-w-xl mx-auto opacity-80">
          La forma más justa de organizar tu pichanga. Sin dramas, solo fútbol.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Panel de Configuración */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-2xl border-primary/10 border-t-4 border-t-primary">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="text-lg font-bold flex items-center gap-2 uppercase tracking-tight">
                <LayoutGrid className="h-5 w-5 text-primary" />
                Configurar Partido
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label htmlFor="game-mode" className="text-xs font-bold uppercase text-muted-foreground">Formato de Juego</Label>
                <Select value={playersPerTeam} onValueChange={setPlayersPerTeam}>
                  <SelectTrigger id="game-mode" className="h-12 border-primary/20">
                    <SelectValue placeholder="Formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 vs 2</SelectItem>
                    <SelectItem value="3">3 vs 3</SelectItem>
                    <SelectItem value="5">5 vs 5 (Sala)</SelectItem>
                    <SelectItem value="7">7 vs 7 (Sintética)</SelectItem>
                    <SelectItem value="11">11 vs 11 (Cancha)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="roster" className="flex justify-between text-xs font-bold uppercase text-muted-foreground">
                  Lista de Jugadores
                  <Badge variant="secondary" className="font-mono">
                    {playerCount} {playerCount === 1 ? 'Nombre' : 'Nombres'}
                  </Badge>
                </Label>
                <Textarea 
                  id="roster" 
                  placeholder="Ejemplo:&#10;Lionel Messi&#10;Cristiano Ronaldo&#10;Neymar Jr..." 
                  className="min-h-[250px] resize-none text-base border-primary/20 focus:ring-accent"
                  value={rosterText}
                  onChange={(e) => setRosterText(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || playerCount < 2} 
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white text-xl font-black shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
              >
                {isGenerating ? (
                  <>
                    <RotateCw className="mr-3 h-6 w-6 animate-spin" />
                    SORTEANDO...
                  </>
                ) : (
                  <>
                    <RotateCw className="mr-3 h-6 w-6" />
                    ¡REPARTIR EQUIPOS!
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {playerCount > 0 && (
            <Alert className="bg-primary/5 border-primary/20">
              <Info className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary font-bold text-xs">RESUMEN</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                Se formarán {Math.ceil(playerCount / parseInt(playersPerTeam))} equipos de {playersPerTeam} jugadores.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Panel de Resultados */}
        <div className="lg:col-span-7 space-y-6">
          {isGenerating ? (
            <Card className="min-h-[500px] flex flex-col items-center justify-center p-8 bg-muted/20 border-dashed border-2">
              <div className="relative mb-8">
                <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                <Dices className="h-20 w-20 text-primary animate-bounce" />
              </div>
              <h3 className="text-3xl font-black text-primary tracking-tighter uppercase italic">Barajando nombres...</h3>
            </Card>
          ) : generatedTeams.length > 0 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-500">
              
              <div className="flex flex-wrap items-center justify-between gap-4 px-2">
                <h2 className="text-2xl font-black text-primary flex items-center gap-2 uppercase italic">
                  <Trophy className="h-7 w-7 text-yellow-500" />
                  Sorteo Final
                </h2>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleCopy} 
                    className="gap-2 border-primary text-primary hover:bg-primary/5"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                    {copied ? "COPIADO" : "COMPARTIR TEXTO"}
                  </Button>
                  <Button 
                    onClick={handleDownloadImage} 
                    disabled={isDownloading}
                    className="gap-2 bg-accent hover:bg-accent/90 text-white font-bold"
                  >
                    {isDownloading ? <RotateCw className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                    DESCARGAR TARJETA
                  </Button>
                </div>
              </div>

              {/* Área que se captura como imagen */}
              <div 
                ref={resultsRef} 
                className="bg-white p-6 rounded-2xl shadow-xl border border-muted relative overflow-hidden"
                style={{ minWidth: '320px' }}
              >
                {/* Branding en la imagen */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-lg">
                      <Dices className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-black text-primary text-xl leading-none">CAIMANERA</h4>
                      <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Randomizer</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-primary text-primary font-bold">
                    {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Badge>
                </div>

                {matchDetails && (
                  <div className="mb-8">
                    <div className="relative bg-gradient-to-br from-primary to-primary/80 text-white p-6 rounded-2xl shadow-lg border-b-4 border-primary-foreground/20">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Swords className="h-20 w-20" />
                      </div>
                      
                      <div className="flex items-center justify-center gap-6 md:gap-12 relative z-10">
                        <div className="text-center flex-1">
                          <span className="text-[10px] font-black opacity-60 uppercase mb-2 block tracking-widest">Local</span>
                          <span className="text-xl md:text-2xl font-black leading-tight block">{matchDetails.teamA}</span>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <div className="bg-accent text-white font-black text-sm px-4 py-1 rounded-full border-2 border-white/20 shadow-lg">VS</div>
                        </div>
                        
                        <div className="text-center flex-1">
                          <span className="text-[10px] font-black opacity-60 uppercase mb-2 block tracking-widest">Visitante</span>
                          <span className="text-xl md:text-2xl font-black leading-tight block">{matchDetails.teamB}</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-center gap-4 border-t border-white/10 pt-4">
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                          <Timer className="h-4 w-4 text-accent" />
                          <span className="text-[11px] font-bold">Saque: <span className="text-accent">{matchDetails.kickoffTeam}</span></span>
                        </div>
                        {matchDetails.waitingTeam && (
                          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            <RotateCw className="h-4 w-4 text-white/60" />
                            <span className="text-[11px] font-bold">Espera: <span className="opacity-80">{matchDetails.waitingTeam}</span></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedTeams.map((team) => (
                    <div key={team.id} className="bg-muted/30 rounded-xl border border-muted-foreground/10 overflow-hidden">
                      <div className="bg-muted-foreground/10 px-4 py-2.5 flex justify-between items-center">
                        <span className="font-black text-sm text-primary uppercase">{team.name}</span>
                        <Badge variant="outline" className="text-[10px] bg-white/50">{team.players.length} JUGS</Badge>
                      </div>
                      <div className="p-3 space-y-1.5">
                        {team.players.map((player, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-3 p-2 rounded-lg bg-white shadow-sm border border-black/5">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                              {pIdx + 1}
                            </div>
                            <span className="font-semibold text-sm truncate">{player}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pie de imagen branding */}
                <div className="mt-8 text-center pt-6 border-t border-dashed border-muted-foreground/20">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50">
                    Sorteado con Caimanera Randomizer
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Card className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center border-dashed border-2 opacity-40">
              <Users className="h-20 w-20 mb-6 text-muted-foreground" />
              <h3 className="text-2xl font-bold uppercase tracking-tighter">Sin equipos</h3>
              <p className="max-w-xs mt-3 text-sm">Agrega los nombres en el panel de la izquierda y presiona el botón para comenzar el sorteo.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
