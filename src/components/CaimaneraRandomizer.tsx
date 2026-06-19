"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  RotateCw, 
  Trophy, 
  Copy, 
  Check, 
  UserPlus, 
  AlertCircle,
  Dices,
  Info
} from 'lucide-react';
import { generateTeamNames } from '@/ai/flows/generate-team-names-flow';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Team = {
  id: number;
  name: string;
  players: string[];
};

export default function CaimaneraRandomizer() {
  const { toast } = useToast();
  const [playersPerTeam, setPlayersPerTeam] = useState<string>("5");
  const [totalPlayersInput, setTotalPlayersInput] = useState<string>("");
  const [rosterText, setRosterText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTeams, setGeneratedTeams] = useState<Team[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    const players = rosterText
      .split('\n')
      .map(p => p.trim())
      .filter(p => p !== "");

    if (players.length === 0) {
      toast({
        variant: "destructive",
        title: "Lista vacía",
        description: "Por favor, ingresa al menos un nombre en el listado de jugadores.",
      });
      return;
    }

    const perTeam = parseInt(playersPerTeam);
    const numTeams = Math.ceil(players.length / perTeam);

    setIsGenerating(true);
    setGeneratedTeams([]);

    try {
      // Simulate roulette delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Shuffle players
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      
      // Get AI generated names
      const aiResponse = await generateTeamNames({
        numberOfTeams: numTeams,
        context: "fútbol callejero, competitivo, divertido, equipos de barrio"
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
      toast({
        title: "¡Equipos generados!",
        description: `Se han creado ${teams.length} equipos exitosamente.`,
      });
    } catch (error) {
      console.error("Error generating teams:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un problema al generar los nombres de los equipos con IA.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedTeams.length === 0) return;

    const text = generatedTeams
      .map(t => `🏆 ${t.name}:\n${t.players.map(p => `• ${p}`).join('\n')}`)
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copiado",
      description: "La lista de equipos ha sido copiada al portapapeles.",
    });
  };

  const playerCount = rosterText.split('\n').filter(p => p.trim() !== "").length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-primary font-headline flex items-center justify-center gap-3">
          <Dices className="h-10 w-10" />
          Caimanera Randomizer
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Divide a tus amigos en equipos justos y con estilo. Elige la modalidad, pega tu lista y deja que la ruleta decida.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Input & Config */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-md border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCw className="h-5 w-5 text-primary" />
                Configuración
              </CardTitle>
              <CardDescription>Establece las reglas del juego</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="game-mode">Formato de Juego</Label>
                <Select value={playersPerTeam} onValueChange={setPlayersPerTeam}>
                  <SelectTrigger id="game-mode">
                    <SelectValue placeholder="Elige formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4v4 (Cuartetos)</SelectItem>
                    <SelectItem value="5">5v5 (Fútbol Sala / Quintetos)</SelectItem>
                    <SelectItem value="7">7v7 (Fútbol 7)</SelectItem>
                    <SelectItem value="11">11v11 (Fútbol 11)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="roster" className="flex justify-between">
                  Listado de Jugadores
                  <Badge variant="outline" className="text-xs font-normal">
                    {playerCount} {playerCount === 1 ? 'jugador' : 'jugadores'}
                  </Badge>
                </Label>
                <Textarea 
                  id="roster" 
                  placeholder="Escribe o pega los nombres aquí (uno por línea)..." 
                  className="min-h-[250px] resize-none focus:ring-primary/50"
                  value={rosterText}
                  onChange={(e) => setRosterText(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || playerCount === 0} 
                className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-semibold transition-all shadow-lg active:scale-95"
              >
                {isGenerating ? (
                  <>
                    <RotateCw className="mr-2 h-5 w-5 animate-spin" />
                    Girando la Ruleta...
                  </>
                ) : (
                  <>
                    <RotateCw className="mr-2 h-5 w-5" />
                    Generar Equipos
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {playerCount > 0 && parseInt(playersPerTeam) > 0 && (
            <Alert className="bg-secondary/10 border-secondary/20">
              <Info className="h-4 w-4 text-secondary" />
              <AlertTitle className="text-secondary font-semibold">Cálculo proyectado</AlertTitle>
              <AlertDescription className="text-muted-foreground text-sm">
                Con {playerCount} jugadores en formato {playersPerTeam}v{playersPerTeam}, 
                se crearán {Math.ceil(playerCount / parseInt(playersPerTeam))} equipos.
                {playerCount % parseInt(playersPerTeam) !== 0 && " El último equipo tendrá algunos jugadores menos."}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Right Side: Results */}
        <div className="lg:col-span-7">
          {isGenerating ? (
            <Card className="h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
                <RotateCw className="absolute inset-0 m-auto h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-primary animate-pulse">Asignando Jugadores...</h3>
              <p className="text-muted-foreground mt-2">La inteligencia artificial está pensando nombres épicos para tus equipos.</p>
            </Card>
          ) : generatedTeams.length > 0 ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Equipos Formados
                </h2>
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2 border-secondary text-secondary hover:bg-secondary/10">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "¡Copiado!" : "Copiar Lista"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedTeams.map((team, idx) => (
                  <Card key={team.id} className="overflow-hidden border-none shadow-lg group hover:-translate-y-1 transition-transform duration-300">
                    <div className="h-2 w-full bg-primary/80" />
                    <CardHeader className="bg-primary/5 pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-bold text-primary group-hover:text-primary transition-colors">
                          {team.name}
                        </CardTitle>
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-none">
                          Team {idx + 1}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2">
                      <div className="space-y-1">
                        {team.players.map((player, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {pIdx + 1}
                            </div>
                            <span className="font-medium">{player}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-center border-dashed border-2 text-muted-foreground">
              <Users className="h-16 w-16 mb-4 opacity-20" />
              <h3 className="text-xl font-medium">No hay equipos aún</h3>
              <p className="max-w-xs mt-2">Configura los parámetros y haz clic en "Generar Equipos" para ver los resultados aquí.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
