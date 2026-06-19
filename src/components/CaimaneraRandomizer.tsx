"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
  LayoutGrid
} from 'lucide-react';
import { generateTeamNames } from '@/ai/flows/generate-team-names-flow';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const [playersPerTeam, setPlayersPerTeam] = useState<string>("5");
  const [rosterText, setRosterText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
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
      // Simulate roulette delay for suspense
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Shuffle players
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      
      // Get AI generated names
      const aiResponse = await generateTeamNames({
        numberOfTeams: numTeams,
        context: "fútbol callejero, competitivo, divertido, equipos de barrio latino"
      });

      const teams: Team[] = [];
      for (let i = 0; i < numTeams; i++) {
        const start = i * perTeam;
        const end = start + perTeam;
        const teamPlayers = shuffled.slice(start, end);
        
        if (teamPlayers.length > 0) {
          teams.push({
            id: i + 1,
            name: aiResponse.teamNames[i] || `Equipo ${i + 1}`,
            players: teamPlayers
          });
        }
      }

      setGeneratedTeams(teams);

      // Calculate first match logic
      if (teams.length >= 2) {
        // Randomly pick team A and team B from the first teams
        const indices = Array.from({ length: teams.length }, (_, i) => i);
        const shuffledIndices = indices.sort(() => Math.random() - 0.5);
        
        const indexA = shuffledIndices[0];
        const indexB = shuffledIndices[1];
        const teamA = teams[indexA].name;
        const teamB = teams[indexB].name;
        
        // Waiting team is anyone else (usually the 3rd one if exists)
        const waitingTeam = teams.length > 2 ? teams[shuffledIndices[2]].name : null;
        
        // Random kickoff between A and B
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
        description: `Se han creado ${teams.length} equipos. ¡A jugar!`,
      });
    } catch (error) {
      console.error("Error generating teams:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron generar los nombres con IA, pero aquí están tus equipos.",
      });
      // Fallback teams without AI names if AI fails
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

  const playerCount = rosterText.split('\n').filter(p => p.trim() !== "").length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-primary font-headline flex items-center justify-center gap-2 md:gap-4">
          <Dices className="h-8 w-8 md:h-12 md:w-12" />
          CAIMANERA <span className="text-accent">AI</span>
        </h1>
        <p className="text-muted-foreground text-base md:text-xl max-w-2xl mx-auto px-4">
          La forma más rápida y justa de armar tu pichanga. ¡IA integrada para nombres épicos!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-4 md:space-y-6">
          <Card className="shadow-xl border-primary/10 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-primary" />
                Panel de Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label htmlFor="game-mode" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Formato</Label>
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
                <Label htmlFor="roster" className="flex justify-between text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Jugadores
                  <Badge variant="secondary" className="font-mono px-2 py-0">
                    {playerCount} {playerCount === 1 ? 'LISTO' : 'LISTOS'}
                  </Badge>
                </Label>
                <Textarea 
                  id="roster" 
                  placeholder="Pega la lista aquí..." 
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
                    ¡ARMAR PARTIDO!
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {playerCount > 0 && (
            <Alert className="bg-secondary/5 border-secondary/20 shadow-sm animate-in fade-in duration-500">
              <Info className="h-5 w-5 text-secondary" />
              <AlertTitle className="text-secondary font-bold">Resumen de Juego</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                Saldrán {Math.ceil(playerCount / parseInt(playersPerTeam))} equipos de {playersPerTeam} jugadores.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7 space-y-6">
          {isGenerating ? (
            <Card className="h-full min-h-[400px] md:min-h-[600px] flex flex-col items-center justify-center p-8 text-center border-dashed border-4 border-primary/20 bg-primary/5 rounded-2xl">
              <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 border-8 border-primary/10 rounded-full"></div>
                <div className="absolute inset-0 border-8 border-t-primary rounded-full animate-spin"></div>
                <Dices className="absolute inset-0 m-auto h-12 w-12 text-primary animate-bounce" />
              </div>
              <h3 className="text-3xl font-black text-primary animate-pulse">REPARTIENDO...</h3>
              <p className="text-muted-foreground mt-4 text-lg">La IA está bautizando a los equipos con nombres legendarios.</p>
            </Card>
          ) : generatedTeams.length > 0 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              
              {/* Tournament Logic Card */}
              {matchDetails && (
                <Card className="bg-accent/10 border-accent/20 shadow-lg overflow-hidden border-l-8 border-l-accent">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-accent text-xl flex items-center gap-2">
                      <Swords className="h-6 w-6" />
                      PRIME ENCUENTRO
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-background/50 rounded-xl border border-accent/10">
                      <div className="text-center md:text-left">
                        <span className="text-xs font-bold text-muted-foreground uppercase block mb-1">Local</span>
                        <span className="text-xl font-black text-primary">{matchDetails.teamA}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Badge variant="outline" className="text-accent border-accent/30 font-black px-4 py-1">VS</Badge>
                      </div>
                      <div className="text-center md:text-right">
                        <span className="text-xs font-bold text-muted-foreground uppercase block mb-1">Visitante</span>
                        <span className="text-xl font-black text-primary">{matchDetails.teamB}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 bg-white/50 p-3 rounded-lg border">
                        <Timer className="h-5 w-5 text-accent" />
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase">Saque Inicial</p>
                          <p className="font-bold text-sm">{matchDetails.kickoffTeam}</p>
                        </div>
                      </div>
                      {matchDetails.waitingTeam && (
                        <div className="flex items-center gap-3 bg-white/50 p-3 rounded-lg border">
                          <RotateCw className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase">En Espera</p>
                            <p className="font-bold text-sm">{matchDetails.waitingTeam}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-black text-primary flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  EQUIPOS
                </h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopy} 
                  className="gap-2 border-primary/20 text-primary h-10 hover:bg-primary/5"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "COPIADO" : "COPIAR LISTA"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedTeams.map((team, idx) => (
                  <Card key={team.id} className="overflow-hidden border-none shadow-xl hover:scale-[1.02] transition-all duration-300">
                    <div className="h-2 w-full bg-primary" />
                    <CardHeader className="bg-primary/5 pb-3">
                      <CardTitle className="text-lg font-black text-primary">
                        {team.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 px-3 space-y-1">
                      {team.players.map((player, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/10">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                            {pIdx + 1}
                          </div>
                          <span className="font-bold text-sm md:text-base">{player}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="h-full min-h-[400px] md:min-h-[600px] flex flex-col items-center justify-center p-12 text-center border-dashed border-4 border-muted rounded-2xl opacity-60">
              <Users className="h-24 w-24 mb-6 text-muted" />
              <h3 className="text-2xl font-bold">Sin equipos generados</h3>
              <p className="max-w-xs mt-3 text-muted-foreground">Configura los jugadores y pulsa el botón para ver la magia aquí.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
