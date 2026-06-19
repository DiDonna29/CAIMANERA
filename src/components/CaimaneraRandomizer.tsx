"use client"

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
  Download,
  Image as ImageIcon
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
            name: `Equipo ${i + 1}`,
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
        description: `Se han creado ${teams.length} equipos.`,
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
        backgroundColor: '#f8fafc',
        style: {
          padding: '20px',
        }
      });
      const link = document.createElement('a');
      link.download = `caimanera-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "Imagen guardada",
        description: "Se ha descargado la captura de tus equipos.",
      });
    } catch (err) {
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
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-primary font-headline flex items-center justify-center gap-2 md:gap-4">
          <Dices className="h-8 w-8 md:h-12 md:w-12" />
          CAIMANERA <span className="text-accent">RANDOM</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-xl max-w-2xl mx-auto px-4">
          Arma tus equipos de forma justa y rápida. ¡Descarga y comparte!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <div className="lg:col-span-5 space-y-4 md:space-y-6">
          <Card className="shadow-xl border-primary/10 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b pb-4">
              <div className="text-xl font-bold flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-primary" />
                Configuración
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label htmlFor="game-mode" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Formato</Label>
                <Select value={playersPerTeam} onValueChange={setPlayersPerTeam}>
                  <SelectTrigger id="game-mode" className="h-12 text-base">
                    <SelectValue placeholder="Elige formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2v2 (Dúos)</SelectItem>
                    <SelectItem value="3">3v3 (Tríos)</SelectItem>
                    <SelectItem value="5">5v5 (Fútbol Sala)</SelectItem>
                    <SelectItem value="7">7v7 (Fútbol 7)</SelectItem>
                    <SelectItem value="11">11v11 (Fútbol 11)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="roster" className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Lista de Jugadores
                  <Badge variant="secondary" className="font-mono px-2 py-0">
                    {playerCount} {playerCount === 1 ? 'LISTO' : 'LISTOS'}
                  </Badge>
                </Label>
                <Textarea 
                  id="roster" 
                  placeholder="Escribe o pega los nombres aquí (uno por línea)..." 
                  className="min-h-[200px] md:min-h-[300px] resize-none text-base focus:ring-primary/40 border-primary/20"
                  value={rosterText}
                  onChange={(e) => setRosterText(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 p-4">
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || playerCount < 2} 
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white text-lg font-black transition-all shadow-xl active:scale-[0.98]"
              >
                {isGenerating ? (
                  <>
                    <RotateCw className="mr-2 h-6 w-6 animate-spin" />
                    SORTEANDO...
                  </>
                ) : (
                  <>
                    <RotateCw className="mr-2 h-6 w-6" />
                    ¡ARMAR EQUIPOS!
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {playerCount > 0 && (
            <Alert className="bg-secondary/5 border-secondary/20 shadow-sm">
              <Info className="h-4 w-4 text-secondary" />
              <AlertTitle className="text-secondary font-bold text-xs uppercase">Info</AlertTitle>
              <AlertDescription className="text-muted-foreground text-sm">
                Saldrán {Math.ceil(playerCount / parseInt(playersPerTeam))} equipos.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="lg:col-span-7 space-y-6">
          {isGenerating ? (
            <Card className="h-full min-h-[400px] md:min-h-[600px] flex flex-col items-center justify-center p-8 text-center border-dashed border-4 border-primary/20 bg-primary/5 rounded-2xl">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
                <Dices className="absolute inset-0 m-auto h-10 w-10 text-primary animate-bounce" />
              </div>
              <h3 className="text-2xl font-black text-primary animate-pulse uppercase">Repartiendo...</h3>
            </Card>
          ) : generatedTeams.length > 0 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              
              <div className="flex flex-wrap items-center justify-between gap-3 px-2">
                <h2 className="text-xl md:text-2xl font-black text-primary flex items-center gap-2 uppercase">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Resultados
                </h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopy} 
                    className="gap-2 border-primary/20 text-primary h-10 hover:bg-primary/5"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span className="hidden sm:inline">{copied ? "COPIADO" : "COPIAR"}</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={isDownloading}
                    onClick={handleDownloadImage} 
                    className="gap-2 border-accent/20 text-accent h-10 hover:bg-accent/5"
                  >
                    {isDownloading ? <RotateCw className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                    <span className="hidden sm:inline">DESCARGAR</span>
                  </Button>
                </div>
              </div>

              <div ref={resultsRef} className="space-y-6 bg-slate-50 p-1 rounded-xl">
                {matchDetails && (
                  <Card className="bg-accent/10 border-accent/20 shadow-lg overflow-hidden border-l-8 border-l-accent">
                    <CardHeader className="pb-2">
                      <div className="text-accent text-lg font-bold flex items-center gap-2 uppercase">
                        <Swords className="h-5 w-5" />
                        Primer Partido
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between gap-4 p-4 bg-background/50 rounded-xl border border-accent/10">
                        <div className="text-center flex-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Equipo A</span>
                          <span className="text-lg font-black text-primary leading-tight">{matchDetails.teamA}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Badge variant="outline" className="text-accent border-accent/30 font-black px-3 py-0.5 text-xs">VS</Badge>
                        </div>
                        <div className="text-center flex-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Equipo B</span>
                          <span className="text-lg font-black text-primary leading-tight">{matchDetails.teamB}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 bg-white/50 p-2 rounded-lg border">
                          <Timer className="h-4 w-4 text-accent" />
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Saque</p>
                            <p className="font-bold text-xs">{matchDetails.kickoffTeam}</p>
                          </div>
                        </div>
                        {matchDetails.waitingTeam && (
                          <div className="flex items-center gap-2 bg-white/50 p-2 rounded-lg border">
                            <RotateCw className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">Espera</p>
                              <p className="font-bold text-xs">{matchDetails.waitingTeam}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedTeams.map((team) => (
                    <Card key={team.id} className="overflow-hidden border-none shadow-xl">
                      <div className="h-1.5 w-full bg-primary" />
                      <CardHeader className="bg-primary/5 pb-2 pt-3">
                        <div className="text-base font-black text-primary uppercase">
                          {team.name}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-3 px-3 pb-4 space-y-1">
                        {team.players.map((player, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-2.5 p-1.5 rounded-lg border border-transparent bg-background/40">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-black text-primary">
                              {pIdx + 1}
                            </div>
                            <span className="font-bold text-sm">{player}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="text-center py-4 sm:hidden">
                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Generado con Caimanera Randomizer</p>
                </div>
              </div>
            </div>
          ) : (
            <Card className="h-full min-h-[300px] md:min-h-[500px] flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-muted rounded-2xl opacity-50">
              <Users className="h-16 w-16 mb-4 text-muted" />
              <h3 className="text-xl font-bold uppercase">Sin equipos</h3>
              <p className="max-w-xs mt-2 text-sm text-muted-foreground">Ingresa los nombres y dale al botón para repartir.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}