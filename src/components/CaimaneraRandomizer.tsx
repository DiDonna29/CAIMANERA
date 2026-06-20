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
  Zap,
  UserPlus,
  Trash2,
  Edit2,
  Check,
  Sun,
  Moon,
  AlertTriangle,
  Copy,
  Medal,
  TrendingUp,
  Share2,
  Search,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toPng } from 'html-to-image';
import { cn } from '@/lib/utils';

type TeamColor = 'primary' | 'accent' | 'success';

type Team = {
  id: number;
  name: string;
  players: string[];
  color: TeamColor;
  wins: number;
};

type MatchDetails = {
  teamA: Team;
  teamB: Team;
  waitingTeams: Team[];
  kickoffTeam: string;
};

type TournamentState = {
  teams: Team[];
  match: MatchDetails | null;
  players: string[];
  format: string;
  timestamp: number;
};

type Step = 'formato' | 'jugadores' | 'verificar' | 'resultados' | 'estadisticas';

const FORMATOS = [
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
  const statsRef = useRef<HTMLDivElement>(null);
  
  const [currentStep, setCurrentStep] = useState<Step>('formato');
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
  const [dateInfo, setDateInfo] = useState<{ day: string, month: string } | null>(null);
  const [importCode, setImportCode] = useState("");

  const perTeam = parseInt(playersPerTeam);
  const isValidCount = players.length > 0 && players.length % perTeam === 0;
  const maxTeamsAllowed = 4;
  const maxPlayersAllowed = perTeam * maxTeamsAllowed;

  useEffect(() => {
    const savedStats = localStorage.getItem('caimanera_tournament_full_state');
    if (savedStats) {
      try {
        const parsed: TournamentState = JSON.parse(savedStats);
        setGeneratedTeams(parsed.teams);
        setMatchDetails(parsed.match);
        setPlayers(parsed.players);
        setPlayersPerTeam(parsed.format);
      } catch (e) {
        console.error("Error al cargar localStorage", e);
      }
    }

    const now = new Date();
    setDateInfo({
      day: now.getDate().toString(),
      month: now.toLocaleString('es-ES', { month: 'short' }).toUpperCase()
    });

    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (generatedTeams.length > 0) {
      const state: TournamentState = {
        teams: generatedTeams,
        match: matchDetails,
        players: players,
        format: playersPerTeam,
        timestamp: Date.now()
      };
      localStorage.setItem('caimanera_tournament_full_state', JSON.stringify(state));
    }
  }, [generatedTeams, matchDetails, players, playersPerTeam]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleProcessList = () => {
    const list = rosterText
      .split('\n')
      .map(p => p.trim())
      .filter(p => p !== "");
    
    if (list.length < perTeam) {
      toast({
        variant: "destructive",
        title: "Pocos jugadores",
        description: `Necesitas al menos ${perTeam} jugadores para el formato ${perTeam}v${perTeam}.`,
      });
      return;
    }
    setPlayers(list);
    setCurrentStep('verificar');
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    if (players.length >= maxPlayersAllowed) {
      toast({
        variant: "destructive",
        title: "Límite alcanzado",
        description: `Máximo ${maxPlayersAllowed} jugadores para este formato.`,
      });
      return;
    }
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
    if (!isValidCount) {
      toast({
        variant: "destructive",
        title: "Convocatoria incompleta",
        description: `Faltan o sobran jugadores para completar equipos de ${perTeam}.`,
      });
      return;
    }

    setIsGenerating(true);
    setCurrentStep('resultados');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const shuffled = shuffleArray(players);
      const numTeams = players.length / perTeam;
      
      const colors: TeamColor[] = ['primary', 'accent', 'success', 'primary'];
      const teams: Team[] = [];
      
      for (let i = 0; i < numTeams; i++) {
        const start = i * perTeam;
        const end = start + perTeam;
        const teamPlayers = shuffled.slice(start, end);
        teams.push({
          id: i + 1,
          name: `EQUIPO ${i + 1}`,
          players: teamPlayers,
          color: colors[i % colors.length],
          wins: 0
        });
      }

      setGeneratedTeams(teams);

      if (teams.length >= 2) {
        const shuffledTeams = shuffleArray(teams);
        const teamA = shuffledTeams[0];
        const teamB = shuffledTeams[1];
        const waiting = shuffledTeams.slice(2);
        const kickoffTeam = Math.random() > 0.5 ? teamA.name : teamB.name;

        setMatchDetails({
          teamA,
          teamB,
          waitingTeams: waiting,
          kickoffTeam
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const registerWin = (teamId: number) => {
    setGeneratedTeams(prev => prev.map(t => 
      t.id === teamId ? { ...t, wins: t.wins + 1 } : t
    ));
    toast({
      title: "Victoria Registrada",
      description: "Las estadísticas del torneo han sido actualizadas localmente.",
    });
  };

  const resetTournament = () => {
    localStorage.removeItem('caimanera_tournament_full_state');
    setGeneratedTeams([]);
    setMatchDetails(null);
    setPlayers([]);
    setRosterText("");
    setCurrentStep('formato');
    toast({
      title: "Torneo Reiniciado",
      description: "Se han borrado todas las victorias y equipos.",
    });
  };

  const handleDownloadImage = async (ref: React.RefObject<HTMLDivElement>, fileName: string) => {
    if (!ref.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(ref.current, {
        cacheBust: true,
        backgroundColor: '#0a192f',
        pixelRatio: 2,
        skipFonts: true
      });
      const link = document.createElement('a');
      link.download = `${fileName}_${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "Póster descargado", description: "Imagen guardada exitosamente." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: "No se pudo generar la imagen." });
    } finally {
      setIsDownloading(false);
    }
  };

  const generateAndCopyCode = async () => {
    try {
      const state: TournamentState = {
        teams: generatedTeams,
        match: matchDetails,
        players: players,
        format: playersPerTeam,
        timestamp: Date.now()
      };
      
      const jsonString = JSON.stringify(state);
      const code = btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (match, p1) => 
        String.fromCharCode(parseInt(p1, 16))
      ));

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
        toast({
          title: "Código Generado",
          description: "Código de sincronización copiado al portapapeles. ¡Pásalo a tus amigos!",
        });
      } else {
        throw new Error("Clipboard API no disponible");
      }
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Error de Sincronización",
        description: "El navegador bloqueó el acceso al portapapeles o el código es muy largo.",
      });
    }
  };

  const handleImportCode = () => {
    if (!importCode.trim()) return;
    try {
      const decoded = decodeURIComponent(atob(importCode.trim()).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const state: TournamentState = JSON.parse(decoded);
      
      setGeneratedTeams(state.teams);
      setMatchDetails(state.match);
      setPlayers(state.players);
      setPlayersPerTeam(state.format);
      
      setCurrentStep('resultados');
      setImportCode("");
      
      toast({
        title: "Torneo Importado",
        description: "Los equipos y victorias se han cargado correctamente.",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Código Inválido",
        description: "El código pegado no es correcto o está dañado.",
      });
    }
  };

  const copyResultsToClipboard = async () => {
    let text = `🏆 CAIMANERA ELITE 🏆\n\n`;
    if (matchDetails) {
      text += `🔥 PARTIDO ESTELAR:\n${matchDetails.teamA.name} VS ${matchDetails.teamB.name}\n`;
      text += `⚽ SAQUE: ${matchDetails.kickoffTeam}\n\n`;
    }
    generatedTeams.forEach(team => {
      text += `📍 ${team.name} (${team.wins} victorias):\n`;
      team.players.forEach((p, i) => text += `${i + 1}. ${p}\n`);
      text += `\n`;
    });

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast({ title: "Copiado", description: "Resultados copiados al portapapeles." });
      } else {
        throw new Error("Clipboard API no disponible");
      }
    } catch (err) {
      toast({ 
        variant: "destructive", 
        title: "Error de permisos", 
        description: "El navegador bloqueó el acceso al portapapeles." 
      });
    }
  };

  const sortedTeams = [...generatedTeams].sort((a, b) => b.wins - a.wins);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-8 space-y-6 min-h-screen pb-24">
      {/* Navbar Minimalista */}
      <nav className="flex justify-between items-center bg-card/60 backdrop-blur-xl p-2 rounded-full border border-border/50 sticky top-4 z-50 shadow-lg">
        <div className="flex items-center gap-3 pl-4">
          <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-primary italic">Caimanera Elite</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full h-9 w-9 transition-all hover:bg-primary/10">
            {theme === 'dark' ? <Sun className="h-5 w-5 text-accent" /> : <Moon className="h-5 w-5 text-primary" />}
          </Button>
          {generatedTeams.length > 0 && (
            <Button variant="ghost" size="icon" onClick={() => setCurrentStep('estadisticas')} className="rounded-full h-9 w-9 hover:bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </Button>
          )}
          {currentStep !== 'formato' && (
            <Button variant="ghost" size="icon" onClick={resetTournament} className="rounded-full h-9 w-9 hover:bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
          )}
        </div>
      </nav>

      <div className="relative">
        {/* PASO 1: FORMATO + IMPORTAR */}
        {currentStep === 'formato' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="text-center space-y-3 pt-6">
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
                MODO DE<br/><span className="text-primary text-glow">JUEGO</span>
              </h1>
              <p className="text-muted-foreground text-xs uppercase font-bold tracking-[0.3em]">PASO 1 • CONFIGURACIÓN</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {FORMATOS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setPlayersPerTeam(f.id);
                    setCurrentStep('jugadores');
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 transition-all duration-500 active:scale-95 group relative overflow-hidden",
                    playersPerTeam === f.id 
                      ? "bg-primary/10 border-primary shadow-xl" 
                      : "bg-card border-border/50 hover:border-primary/40"
                  )}
                >
                  <div className={cn(
                    "mb-4 p-4 rounded-2xl transition-all duration-500",
                    playersPerTeam === f.id ? "bg-primary text-white scale-110" : "bg-muted text-muted-foreground"
                  )}>
                    {f.icon}
                  </div>
                  <span className="font-black italic uppercase tracking-tighter text-xl">{f.label}</span>
                  <span className="text-[10px] font-bold opacity-50 tracking-widest">{f.sub}</span>
                </button>
              ))}
            </div>

            <Card className="bg-card/40 backdrop-blur-md border-border/50 rounded-[2rem] p-8 shadow-xl space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Search className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-black italic uppercase tracking-widest">CONTINUAR TORNEO</h3>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">
                Pega el código generado por un amigo para ver el mismo sorteo y compartir victorias.
              </p>
              <div className="flex flex-col md:flex-row gap-3">
                <Input 
                  placeholder="PEGA EL CÓDIGO AQUÍ..." 
                  className="bg-background/50 border-border/50 h-12 rounded-xl font-mono text-[10px] tracking-wider"
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                />
                <Button 
                  onClick={handleImportCode}
                  disabled={!importCode.trim()}
                  className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-black italic uppercase text-xs tracking-widest rounded-xl transition-all"
                >
                  SINCRONIZAR
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* PASO 2: JUGADORES */}
        {currentStep === 'jugadores' && (
          <div className="space-y-6 animate-in slide-in-from-right-10 fade-in duration-500">
            <div className="flex items-center justify-between pt-6">
              <Button variant="ghost" onClick={() => setCurrentStep('formato')} className="gap-2 font-bold uppercase text-[10px] italic">
                <ChevronLeft className="h-4 w-4" /> VOLVER
              </Button>
              <Badge variant="outline" className="font-bold text-[10px] text-primary italic border-primary/30">
                MODO {perTeam}V{perTeam}
              </Badge>
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                LISTA DE <span className="text-accent text-glow">CRACKS</span>
              </h2>
              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.3em]">Pega tu lista de WhatsApp o escríbela</p>
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
              className="w-full h-20 bg-primary hover:bg-primary/90 text-white text-xl font-black italic tracking-tighter rounded-[1.5rem] shadow-xl animate-shine transition-all"
            >
              PROCESAR LISTA <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        )}

        {/* PASO 3: VERIFICAR */}
        {currentStep === 'verificar' && (
          <div className="space-y-6 animate-in zoom-in-95 fade-in duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6">
              <Button variant="ghost" onClick={() => setCurrentStep('jugadores')} className="gap-2 font-bold uppercase text-[10px] italic">
                <ChevronLeft className="h-4 w-4" /> EDITAR TEXTO
              </Button>
              <div className="flex items-center gap-2">
                <Badge variant={isValidCount ? "default" : "destructive"} className="font-mono text-[10px] px-4 py-1">
                  {players.length} JUGADORES
                </Badge>
                {isValidCount ? (
                  <Badge variant="outline" className="text-green-500 border-green-500/30 text-[10px] font-black italic px-4 py-1">
                    {players.length / perTeam} EQUIPOS LISTOS
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-destructive border-destructive/30 text-[10px] font-black italic px-4 py-1 flex gap-1">
                    <AlertTriangle className="h-3 w-3" /> FALTAN {perTeam - (players.length % perTeam)} PARA OTRO EQUIPO
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                CONVOCATORIA <span className="text-primary text-glow">ELITE</span>
              </h2>
              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.3em]">Valida tus jugadores antes del sorteo</p>
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
                
                {players.length < maxPlayersAllowed && (
                  <div className="flex items-center gap-2 bg-muted/30 rounded-full border border-dashed border-border p-1 pl-4">
                    <Input 
                      placeholder="Añadir crack..." 
                      className="h-7 w-32 bg-transparent border-0 focus-visible:ring-0 text-xs italic font-bold"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                    />
                    <Button size="icon" variant="ghost" onClick={handleAddPlayer} className="h-7 w-7 rounded-full bg-primary text-white">
                      <UserPlus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            <Button 
              onClick={handleGenerate}
              disabled={!isValidCount}
              className="w-full h-20 bg-primary hover:bg-primary/90 text-white text-2xl font-black italic tracking-tighter rounded-[1.5rem] shadow-xl shadow-primary/30 animate-pulse active:scale-95 transition-all"
            >
              REALIZAR SORTEO <Zap className="ml-2 h-6 w-6 fill-yellow-400 text-yellow-400" />
            </Button>
          </div>
        )}

        {/* PASO 4: RESULTADOS */}
        {currentStep === 'resultados' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-700">
            {isGenerating ? (
              <div className="h-[65vh] flex flex-col items-center justify-center space-y-8">
                <div className="relative">
                  <div className="absolute -inset-16 bg-primary/20 blur-[80px] rounded-full animate-pulse"></div>
                  <Trophy className="h-32 w-32 text-primary animate-float" />
                </div>
                <div className="text-center space-y-4">
                  <h3 className="text-5xl font-black italic tracking-tighter uppercase text-glow animate-pulse">SORTEANDO...</h3>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep('formato')} className="rounded-full h-12 px-6 border-border font-bold italic uppercase text-xs w-full md:w-auto">
                    <ChevronLeft className="mr-2 h-4 w-4" /> INICIO
                  </Button>
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Button onClick={generateAndCopyCode} variant="outline" className="flex-1 md:flex-none rounded-full font-black italic text-xs h-12 px-6 gap-2 border-primary/30 text-primary">
                      <Share2 className="h-4 w-4" /> COMPARTIR CÓDIGO
                    </Button>
                    <Button onClick={copyResultsToClipboard} variant="secondary" className="flex-1 md:flex-none rounded-full font-black italic text-xs h-12 px-6 gap-2">
                      <Copy className="h-4 w-4" /> COPIAR TEXTO
                    </Button>
                    <Button onClick={() => handleDownloadImage(resultsRef, 'Caimanera_Elite')} disabled={isDownloading} className="w-full md:w-auto rounded-full bg-primary hover:bg-primary/90 text-white font-black italic text-xs h-12 px-6 gap-2 shadow-lg animate-shine">
                      {isDownloading ? <RotateCw className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                      DESCARGAR PÓSTER
                    </Button>
                  </div>
                </div>

                <div className="champions-gradient p-[1px] rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <div ref={resultsRef} className="relative bg-[#0a192f] p-8 md:p-12">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] pointer-events-none"></div>
                    
                    {/* Header Póster */}
                    <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-10">
                      <div className="flex items-center gap-4">
                        <Star className="h-10 w-10 text-accent fill-accent" />
                        <div>
                          <h4 className="font-black text-white text-3xl italic tracking-tighter leading-none uppercase">CAIMANERA ELITE</h4>
                          <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mt-1 block">TORNEO OFICIAL</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-white italic opacity-50 uppercase block leading-none">{dateInfo?.day}</span>
                        <span className="text-xs font-black text-white italic opacity-30 uppercase block">
                          {dateInfo?.month}
                        </span>
                      </div>
                    </div>

                    {/* Partido Estelar */}
                    {matchDetails && (
                      <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-6 md:p-10 mb-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary text-[10px] font-black px-8 py-1.5 italic rounded-b-xl tracking-[0.2em] z-20">PARTIDO ESTELAR</div>
                        
                        <div className="flex items-center justify-between gap-4 md:gap-8 mt-8">
                          <div className="flex-1 space-y-4">
                            <div className="h-16 w-16 md:h-20 md:w-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center border border-primary/40">
                              <ShieldCheck className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                            </div>
                            <span className="text-xl md:text-4xl font-black text-white uppercase italic tracking-tighter block leading-none">{matchDetails.teamA.name}</span>
                            <Button 
                              size="sm" 
                              onClick={() => registerWin(matchDetails.teamA.id)} 
                              className="rounded-full font-black italic uppercase text-[8px] md:text-[9px] bg-primary/20 hover:bg-primary text-primary-foreground border-primary/30 h-8 md:h-10 px-4 md:px-6 w-full max-w-[140px] mx-auto"
                            >
                              REGISTRAR VICTORIA
                            </Button>
                          </div>

                          <div className="relative w-12 md:w-24 h-12 md:h-24 flex items-center justify-center shrink-0">
                            <div className="absolute inset-0 bg-white/5 rounded-full blur-md"></div>
                            <span className="text-lg md:text-3xl font-black text-white/40 italic tracking-tighter relative z-10 leading-none">VS</span>
                          </div>

                          <div className="flex-1 space-y-4">
                            <div className="h-16 w-16 md:h-20 md:w-20 mx-auto bg-accent/20 rounded-full flex items-center justify-center border border-accent/40">
                              <ShieldCheck className="h-8 w-8 md:h-10 md:w-10 text-accent" />
                            </div>
                            <span className="text-xl md:text-4xl font-black text-white uppercase italic tracking-tighter block leading-none">{matchDetails.teamB.name}</span>
                            <Button 
                              size="sm" 
                              onClick={() => registerWin(matchDetails.teamB.id)} 
                              className="rounded-full font-black italic uppercase text-[8px] md:text-[9px] bg-accent/20 hover:bg-accent text-accent-foreground border-accent/30 h-8 md:h-10 px-4 md:px-6 w-full max-w-[140px] mx-auto"
                            >
                              REGISTRAR VICTORIA
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 pt-10 border-t border-white/5">
                          <div className="flex items-center gap-3 justify-center text-accent">
                            <Timer className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase italic tracking-widest">SAQUE: {matchDetails.kickoffTeam}</span>
                          </div>
                          {matchDetails.waitingTeams.length > 0 && (
                            <div className="flex items-center gap-3 justify-center text-primary/60">
                              <RotateCw className="h-4 w-4" />
                              <span className="text-[10px] font-black uppercase italic tracking-widest">ESPERA: {matchDetails.waitingTeams.map(t => t.name).join(", ")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Lista de Equipos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {generatedTeams.map((team) => (
                        <div key={team.id} className="bg-white/5 rounded-[2rem] overflow-hidden border border-white/10">
                          <div className="bg-white/5 px-8 py-5 flex justify-between items-center border-b border-white/5">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-1.5 h-5 rounded-full",
                                team.color === 'primary' ? "bg-primary" : 
                                team.color === 'accent' ? "bg-accent" : "bg-success-elite"
                              )}></div>
                              <span className="font-black text-xl text-white italic uppercase tracking-tighter">{team.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[9px] font-black text-white/30 border-white/10">{team.wins} WINS</Badge>
                            </div>
                          </div>
                          <div className="p-6 space-y-3">
                            {team.players.map((player, pIdx) => (
                              <div key={pIdx} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 text-xs font-black uppercase italic text-white/80">
                                <span className="text-primary w-4 opacity-30">{pIdx + 1}</span>
                                {player}
                              </div>
                            ))}
                          </div>
                          <div className="px-6 pb-6 text-center">
                             <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => registerWin(team.id)} 
                              className="w-full rounded-full font-black italic uppercase text-[9px] tracking-[0.2em] bg-card/40 backdrop-blur-md border border-white/10 text-primary hover:bg-primary hover:text-white transition-all shadow-md mt-2"
                            >
                              REGISTRAR VICTORIA
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer Póster */}
                    <div className="mt-16 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 opacity-50">
                      <span className="text-[9px] font-black text-white uppercase tracking-[0.4em] italic leading-8">SISTEMA DE SORTEO ELITE V1.0</span>
                      <div className="flex flex-col items-center md:items-end gap-1 text-center md:text-right">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest block leading-8">
                          DESARROLLADO POR <span className="text-primary text-glow">JOHN DI DONNA</span>
                        </span>
                        <span className="text-[7px] font-bold text-white/60 uppercase tracking-[0.2em] block leading-none mt-1">
                          © TODOS LOS DERECHOS RESERVADOS
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASO 5: ESTADÍSTICAS */}
        {currentStep === 'estadisticas' && (
          <div className="space-y-6 animate-in slide-in-from-right-10 fade-in duration-500">
             <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep('resultados')} className="rounded-full h-12 px-6 border-border font-bold italic uppercase text-xs">
                <ChevronLeft className="mr-2 h-4 w-4" /> VOLVER
              </Button>
              <Button onClick={() => handleDownloadImage(statsRef, 'Reporte_Torneo_Elite')} disabled={isDownloading} className="w-full md:w-auto rounded-full bg-primary hover:bg-primary/90 text-white font-black italic text-xs h-12 px-6 gap-2 shadow-lg animate-shine">
                {isDownloading ? <RotateCw className="h-4 w-4 animate-spin" /> : <Medal className="h-4 w-4" />}
                DESCARGAR REPORTE TOP 3
              </Button>
            </div>

            <div className="champions-gradient p-[1px] rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div ref={statsRef} className="relative bg-[#0a192f] p-8 md:p-12">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] pointer-events-none"></div>
                
                <div className="text-center space-y-4 mb-12 border-b border-white/10 pb-10">
                  <Trophy className="h-16 w-16 text-accent mx-auto animate-float" />
                  <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">REPORTE DEL TORNEO</h3>
                  <p className="text-primary text-[10px] font-black uppercase tracking-[0.5em]">HALL OF FAME ELITE</p>
                </div>

                <div className="space-y-6">
                  {sortedTeams.slice(0, 3).map((team, index) => (
                    <div 
                      key={team.id} 
                      className={cn(
                        "relative flex items-center justify-between p-8 rounded-[2rem] border overflow-hidden",
                        index === 0 ? "bg-accent/10 border-accent/30 scale-105 z-10" : "bg-white/5 border-white/10"
                      )}
                    >
                      {index === 0 && (
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                          <CrownIcon className="h-24 w-24 text-accent" />
                        </div>
                      )}
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black italic",
                          index === 0 ? "bg-accent text-accent-foreground" : 
                          index === 1 ? "bg-slate-300 text-slate-800" : "bg-amber-600 text-white"
                        )}>
                          #{index + 1}
                        </div>
                        <div>
                          <span className="text-2xl font-black text-white uppercase italic tracking-tighter block">{team.name}</span>
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{team.players.join(", ")}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-4xl font-black text-white italic block leading-none">{team.wins}</span>
                        <span className="text-[9px] font-black text-accent uppercase tracking-widest">VICTORIAS</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Reporte */}
                <div className="mt-16 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 opacity-50">
                  <span className="text-[9px] font-black text-white uppercase tracking-[0.4em] italic leading-8">REPORTE OFICIAL ELITE V1.0</span>
                  <div className="flex flex-col items-center md:items-end gap-1 text-center md:text-right">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest block leading-8">
                      DESARROLLADO POR <span className="text-primary text-glow">JOHN DI DONNA</span>
                    </span>
                    <span className="text-[7px] font-bold text-white/60 uppercase tracking-[0.2em] block leading-none mt-1">
                      © TODOS LOS DERECHOS RESERVADOS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}
