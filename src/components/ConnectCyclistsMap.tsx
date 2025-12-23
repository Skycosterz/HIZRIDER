import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Users,
  MapPin,
  Clock,
  Star,
  MessageCircle,
  Phone,
  Navigation,
  Activity,
  Zap,
  CheckCircle,
  Bike,
  Send,
  X,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar } from "./ui/avatar";
import { useNavigate } from "react-router-dom";
import Map from "./Map";
import { useToast } from "./ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import {
  fetchNearbyDrivers,
  requestRide,
  subscribeToDriverLocation,
  calculateDistance,
  Driver,
  MatchResult,
} from "@/lib/rideMatchingService";

interface Cyclist {
  id: string;
  name: string;
  rating: number;
  distance: string;
  activity: string;
  photoUrl: string;
  isOnline: boolean;
  phone: string;
}

interface CyclistGroup {
  id: string;
  leader: string;
  members: number;
  activity: string;
  meetingPoint: string;
  startTime: string;
  route: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedDuration: string;
}

const chip =
  "inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] text-foreground backdrop-blur";

const iconBtn =
  "h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-primary/15 hover:text-primary transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/60";

const hudCard =
  "border-border/60 bg-background/70 backdrop-blur-xl shadow-sm";

const neonLine =
  "bg-gradient-to-r from-primary/0 via-primary/70 to-primary/0";

const statusBadgeBase =
  "rounded-full font-mono text-[11px] sm:text-xs border px-2.5 py-1";

const getDifficultyBadge = (difficulty: CyclistGroup["difficulty"]) => {
  if (difficulty === "easy")
    return "border-[hsl(var(--accent))]/50 text-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10";
  if (difficulty === "medium")
    return "border-yellow-500/50 text-yellow-400 bg-yellow-500/10";
  return "border-fuchsia-500/50 text-fuchsia-300 bg-fuchsia-500/10";
};

const getActivityIcon = (activity: string) => {
  const a = activity.toLowerCase();
  if (a.includes("casual")) return <Bike size={16} />;
  if (a.includes("deportiva")) return <Activity size={16} />;
  if (a.includes("aventura")) return <Zap size={16} />;
  return <Bike size={16} />;
};

const ConnectCyclistsMap = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [connectionStatus, setConnectionStatus] = useState<
    "searching" | "connected" | "groupFormed"
  >("searching");

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const [selectedCyclist, setSelectedCyclist] = useState<Cyclist | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [matchedDriver, setMatchedDriver] = useState<Driver | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [driverLocationUnsubscribe, setDriverLocationUnsubscribe] = useState<
    (() => void) | null
  >(null);

  const [nearbyCyclists, setNearbyCyclists] = useState<Cyclist[]>([
    {
      id: "1",
      name: "Ana Rodriguez",
      rating: 4.9,
      distance: "0.2 km",
      activity: "Paseo casual",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
      isOnline: true,
      phone: "+52 55 1234 5678",
    },
    {
      id: "2",
      name: "Carlos Martinez",
      rating: 4.7,
      distance: "0.5 km",
      activity: "Ruta deportiva",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
      isOnline: true,
      phone: "+52 55 2345 6789",
    },
    {
      id: "3",
      name: "Sofia Lopez",
      rating: 4.8,
      distance: "0.8 km",
      activity: "Aventura urbana",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia",
      isOnline: true,
      phone: "+52 55 3456 7890",
    },
    {
      id: "4",
      name: "Miguel Torres",
      rating: 4.6,
      distance: "1.2 km",
      activity: "Paseo casual",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel",
      isOnline: false,
      phone: "+52 55 4567 8901",
    },
  ]);

  const [cyclistsWithLocations, setCyclistsWithLocations] = useState<
    Array<{
      id: string;
      name: string;
      location: { lat: number; lng: number };
      rating: number;
      activity: string;
    }>
  >([]);

  const cyclistGroup: CyclistGroup = {
    id: "group-123",
    leader: "Ana Rodriguez",
    members: 4,
    activity: "Paseo casual por Chapultepec",
    meetingPoint: "Entrada principal del bosque",
    startTime: "15:30",
    route: "Circuito Gandhi - Lago Mayor",
    difficulty: "easy",
    estimatedDuration: "45 min",
  };

  const handleContactCyclist = (cyclist: Cyclist, method: "chat" | "phone") => {
    if (method === "chat") {
      setSelectedCyclist(cyclist);
      setShowContactDialog(true);
      toast({
        title: "Chat iniciado",
        description: `Conectando con ${cyclist.name}...`,
      });
      return;
    }

    toast({
      title: "Llamando...",
      description: `Marcando a ${cyclist.name}: ${cyclist.phone}`,
    });
    window.open(`tel:${cyclist.phone}`);
  };

  const fetchDrivers = useCallback(async () => {
    if (!userLocation) return;

    setIsLoading(true);
    try {
      const drivers = await fetchNearbyDrivers(userLocation, 5);

      const cyclists: Cyclist[] = drivers.map((driver) => ({
        id: driver.id,
        name: driver.name,
        rating: driver.rating,
        distance: `${calculateDistance(
          userLocation.lat,
          userLocation.lng,
          driver.location.lat,
          driver.location.lng
        ).toFixed(1)} km`,
        activity: driver.activity,
        photoUrl: driver.photoUrl,
        isOnline: driver.isOnline,
        phone: driver.phone,
      }));

      setNearbyCyclists(cyclists);

      const cyclistsWithLoc = drivers.map((driver) => ({
        id: driver.id,
        name: driver.name,
        location: driver.location,
        rating: driver.rating,
        activity: driver.activity,
      }));
      setCyclistsWithLocations(cyclistsWithLoc);

      if (cyclists.length > 0 && connectionStatus === "searching") {
        setConnectionStatus("connected");
        toast({
          title: "¡CICLISTAS ENCONTRADOS!",
          description: `Se encontraron ${cyclists.length} ciclistas cercanos disponibles`,
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar los ciclistas cercanos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userLocation, connectionStatus, toast]);

  const handleRequestMatch = useCallback(async () => {
    if (!userLocation) return;

    setIsLoading(true);
    try {
      const result = await requestRide(
        {
          userId: "current-user",
          pickupLocation: userLocation,
          maxDistance: 5,
        },
        (status, data) => {
          switch (status) {
            case "searching":
              toast({ title: "Buscando...", description: data.message });
              break;
            case "found":
              toast({
                title: "¡Conductor encontrado!",
                description: `${data.driver.name} está disponible`,
              });
              break;
            case "accepted":
              toast({
                title: "¡Confirmado!",
                description: `${data.driver.name} llegará en ${data.eta} minutos`,
              });
              break;
            case "error":
              toast({
                title: "Error",
                description: data.message,
                variant: "destructive",
              });
              break;
          }
        }
      );

      if (result.success && result.driver) {
        setMatchedDriver(result.driver);
        setMatchResult(result);
        setConnectionStatus("groupFormed");

        const unsubscribe = subscribeToDriverLocation(
          result.driver.id,
          userLocation,
          (newLocation) => {
            setCyclistsWithLocations((prev) =>
              prev.map((c) =>
                c.id === result.driver!.id ? { ...c, location: newLocation } : c
              )
            );
          }
        );

        setDriverLocationUnsubscribe(() => unsubscribe);
      }
    } catch {
      toast({
        title: "Error",
        description: "No se pudo solicitar el viaje",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userLocation, toast]);

  useEffect(() => {
    return () => {
      if (driverLocationUnsubscribe) driverLocationUnsubscribe();
    };
  }, [driverLocationUnsubscribe]);

  useEffect(() => {
    if (userLocation && connectionStatus === "searching") fetchDrivers();
  }, [userLocation, connectionStatus, fetchDrivers]);

  const handleLocationUpdate = (location: { lat: number; lng: number }) => {
    setUserLocation(location);
  };

  useEffect(() => {
    if (!userLocation) return;

    const interval = setInterval(async () => {
      if (connectionStatus !== "groupFormed") {
        try {
          const drivers = await fetchNearbyDrivers(userLocation, 5);

          setCyclistsWithLocations(
            drivers.map((driver) => ({
              id: driver.id,
              name: driver.name,
              location: driver.location,
              rating: driver.rating,
              activity: driver.activity,
            }))
          );

          setNearbyCyclists((prev) =>
            prev.map((cyclist) => {
              const driver = drivers.find((d) => d.id === cyclist.id);
              if (!driver) return cyclist;

              const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                driver.location.lat,
                driver.location.lng
              );

              return { ...cyclist, distance: `${distance.toFixed(1)} km` };
            })
          );
        } catch (error) {
          console.error("Error updating driver locations:", error);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [userLocation, connectionStatus]);

  const statusBadge = (() => {
    if (connectionStatus === "searching")
      return `${statusBadgeBase} border-primary/50 text-primary bg-primary/10 animate-pulse`;
    if (connectionStatus === "connected")
      return `${statusBadgeBase} border-yellow-500/50 text-yellow-400 bg-yellow-500/10`;
    return `${statusBadgeBase} border-[hsl(var(--accent))]/50 text-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10`;
  })();

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header (HUD / Riders vibe) */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/60 backdrop-blur-xl">
        <div className={`h-[2px] w-full ${neonLine}`} />
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className={iconBtn}
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="relative">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="pointer-events-none absolute -inset-2 rounded-full bg-primary/15 blur-md" />
                </span>
                <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tight">
                  Conectar ciclistas
                </h1>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-mono">
                RED NEURAL ACTIVA
              </p>
            </div>
          </div>

          <Badge variant="outline" className={statusBadge}>
            {connectionStatus === "searching" && "BUSCANDO..."}
            {connectionStatus === "connected" && "CONECTADO"}
            {connectionStatus === "groupFormed" && "GRUPO FORMADO"}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* background neon wash */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
          <div className="absolute -top-28 -left-28 h-80 w-80 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-[hsl(var(--accent))]/10 blur-3xl" />
          <div className="absolute left-1/3 top-8 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
        </div>

        {/* Map */}
        <div className="flex-1 md:h-1/2 relative min-h-[250px]">
          <Map
            userLocation={userLocation}
            onLocationUpdate={handleLocationUpdate}
            drivers={cyclistsWithLocations.map((cyclist) => ({
              id: cyclist.id,
              location: cyclist.location,
              name: cyclist.name,
              rating: cyclist.rating,
              carModel: cyclist.activity,
            }))}
          />

          {/* Real-time status */}
          {userLocation && cyclistsWithLocations.length > 0 && (
            <div className={`absolute top-2 right-2 sm:top-4 sm:right-4 rounded-xl p-2.5 sm:p-3 z-10 ${hudCard}`}>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--accent))] animate-pulse" />
                <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">
                  ACTUALIZANDO EN TIEMPO REAL
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                {cyclistsWithLocations.length} ciclistas rastreados
              </p>
            </div>
          )}
        </div>

        {/* Panel */}
        <div className="flex-1 md:h-1/2 border-t border-border/60 bg-background/70 backdrop-blur-xl overflow-y-auto">
          {/* SEARCHING */}
          {connectionStatus === "searching" && (
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center mx-auto">
                    <Users className="text-primary" size={28} />
                  </div>
                  <div className="absolute inset-0 animate-ping rounded-full h-14 w-14 sm:h-16 sm:w-16 border-2 border-primary/20 mx-auto" />
                </div>

                <h3 className="text-lg sm:text-xl font-black tracking-tight mb-2">
                  ESCANEANDO ÁREA
                </h3>
                <p className="text-muted-foreground font-mono text-sm">
                  Buscando ciclistas compatibles...
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                  Detectados
                </h4>

                {nearbyCyclists.slice(0, 2).map((cyclist) => (
                  <Card key={cyclist.id} className={`${hudCard} opacity-70`}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border/60 overflow-hidden">
                          <img src={cyclist.photoUrl} alt={cyclist.name} />
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{cyclist.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {cyclist.distance} • {cyclist.activity}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* CONNECTED */}
          {connectionStatus === "connected" && (
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/20 flex items-center justify-center">
                  <CheckCircle className="text-[hsl(var(--accent))]" size={30} />
                </div>

                <h3 className="text-lg sm:text-xl font-black tracking-tight mb-2">
                  ¡CICLISTAS ENCONTRADOS!
                </h3>
                <p className="text-sm text-muted-foreground font-mono">
                  {nearbyCyclists.filter((c) => c.isOnline).length} disponibles
                </p>
              </div>

              <Button
                className="w-full rounded-full"
                onClick={handleRequestMatch}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando mejor coincidencia...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Solicitar compañero de viaje
                  </>
                )}
              </Button>

              <div className="space-y-3">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                  Disponibles
                </h4>

                {nearbyCyclists
                  .filter((c) => c.isOnline)
                  .map((cyclist) => (
                    <Card key={cyclist.id} className={hudCard}>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-11 w-11 border border-primary/25 overflow-hidden">
                            <img src={cyclist.photoUrl} alt={cyclist.name} />
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold truncate">{cyclist.name}</p>
                              <span className={chip}>
                                <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                                {cyclist.rating}
                              </span>
                            </div>

                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                              <span className={chip}>
                                {getActivityIcon(cyclist.activity)}
                                <span className="truncate">{cyclist.activity}</span>
                              </span>
                              <span className={chip}>
                                <MapPin className="h-3.5 w-3.5" />
                                {cyclist.distance}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-full border-primary/30 hover:bg-primary/10"
                              onClick={() => handleContactCyclist(cyclist, "chat")}
                            >
                              <MessageCircle size={16} />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-full border-primary/30 hover:bg-primary/10"
                              onClick={() => handleContactCyclist(cyclist, "phone")}
                            >
                              <Phone size={16} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* GROUP FORMED */}
          {connectionStatus === "groupFormed" && (
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/20 flex items-center justify-center">
                  <CheckCircle className="text-[hsl(var(--accent))]" size={30} />
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight mb-2">
                  ¡COMPAÑERO ASIGNADO!
                </h3>
                {matchResult && (
                  <p className="text-muted-foreground font-mono text-sm">
                    Llegará en {matchResult.estimatedArrival} min • ${matchResult.estimatedPrice} MXN
                  </p>
                )}
              </div>

              {matchedDriver ? (
                <Card className={`${hudCard} border-[hsl(var(--accent))]/25`}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border border-[hsl(var(--accent))]/30 overflow-hidden">
                          <img src={matchedDriver.photoUrl} alt={matchedDriver.name} />
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-base sm:text-lg truncate">
                            {matchedDriver.name}
                          </h4>
                          <div className="mt-1 flex items-center gap-2">
                            <span className={chip}>
                              <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                              {matchedDriver.rating}
                            </span>
                            <span className={chip}>
                              <Bike className="h-3.5 w-3.5" />
                              {matchedDriver.vehicleType}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {matchedDriver.activity}
                          </p>
                        </div>

                        <Badge className="rounded-full bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] border border-[hsl(var(--accent))]/30">
                          EN CAMINO
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="rounded-xl border border-border bg-background/60 p-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-4 w-4 text-primary" />
                            Tiempo
                          </div>
                          <p className="mt-1 font-semibold">
                            {matchResult?.estimatedArrival} min
                          </p>
                        </div>

                        <div className="rounded-xl border border-border bg-background/60 p-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-4 w-4 text-primary" />
                            Distancia
                          </div>
                          <p className="mt-1 font-semibold">{matchResult?.distance} km</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          className="flex-1 rounded-full border-primary/30 hover:bg-primary/10"
                          onClick={() => {
                            const cyclist =
                              nearbyCyclists.find((c) => c.id === matchedDriver.id) ||
                              nearbyCyclists[0];
                            if (cyclist) handleContactCyclist(cyclist, "chat");
                          }}
                        >
                          <MessageCircle size={16} className="mr-2" />
                          Chat
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 rounded-full border-primary/30 hover:bg-primary/10"
                          onClick={() => {
                            const cyclist =
                              nearbyCyclists.find((c) => c.id === matchedDriver.id) ||
                              nearbyCyclists[0];
                            if (cyclist) handleContactCyclist(cyclist, "phone");
                          }}
                        >
                          <Phone size={16} className="mr-2" />
                          Llamar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className={`${hudCard} border-[hsl(var(--accent))]/25`}>
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-black text-base sm:text-lg">
                        {cyclistGroup.activity}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`rounded-full ${getDifficultyBadge(cyclistGroup.difficulty)}`}
                      >
                        {cyclistGroup.difficulty.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="rounded-xl border border-border bg-background/60 p-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          Encuentro
                        </div>
                        <p className="mt-1 font-semibold text-sm">
                          {cyclistGroup.meetingPoint}
                        </p>
                      </div>

                      <div className="rounded-xl border border-border bg-background/60 p-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-4 w-4 text-primary" />
                          Inicio
                        </div>
                        <p className="mt-1 font-semibold text-sm">
                          {cyclistGroup.startTime}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-background/60 p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Navigation className="h-4 w-4 text-primary" />
                        Ruta
                      </div>
                      <p className="mt-1 font-semibold text-sm">
                        {cyclistGroup.route} • {cyclistGroup.estimatedDuration}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                      <Avatar className="h-11 w-11 border border-primary/25 overflow-hidden">
                        <img
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana"
                          alt={cyclistGroup.leader}
                        />
                      </Avatar>

                      <div className="flex-1">
                        <p className="font-semibold">{cyclistGroup.leader}</p>
                        <p className="text-xs text-muted-foreground">Líder del grupo</p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-primary/30 hover:bg-primary/10"
                        onClick={() => handleContactCyclist(nearbyCyclists[0], "chat")}
                      >
                        <MessageCircle size={16} className="mr-2" />
                        Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  className="flex-1 rounded-full h-10 sm:h-12 text-sm sm:text-base"
                  onClick={() => navigate("/ride-details")}
                >
                  INICIAR ACTIVIDAD
                </Button>

                <Button
                  variant="outline"
                  className="flex-1 rounded-full border-fuchsia-500/30 text-fuchsia-200 hover:bg-fuchsia-500/10 h-10 sm:h-12 text-sm sm:text-base"
                  onClick={() => {
                    if (driverLocationUnsubscribe) driverLocationUnsubscribe();
                    setMatchedDriver(null);
                    setMatchResult(null);
                    setConnectionStatus("connected");
                    toast({
                      title: "Viaje cancelado",
                      description: "Has cancelado la solicitud de viaje",
                    });
                  }}
                >
                  CANCELAR
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Chat Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="w-[95vw] max-w-md border-border/60 bg-background/80 backdrop-blur-xl">
          <div className={`h-[2px] w-full ${neonLine} rounded-full`} />

          <DialogHeader>
            <div className="flex items-center justify-between gap-3">
              <DialogTitle className="flex items-center gap-3 min-w-0">
                {selectedCyclist && (
                  <>
                    <Avatar className="h-10 w-10 border border-primary/25 overflow-hidden">
                      <img src={selectedCyclist.photoUrl} alt={selectedCyclist.name} />
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-black truncate">{selectedCyclist.name}</p>
                      <p className="text-xs text-muted-foreground font-normal truncate">
                        {selectedCyclist.activity}
                      </p>
                    </div>
                  </>
                )}
              </DialogTitle>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowContactDialog(false)}
                className="rounded-full hover:bg-primary/15"
              >
                <X size={18} />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4">
            <ScrollArea className="h-[260px] sm:h-[300px] rounded-xl border border-border/60 bg-background/50 p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-border bg-muted/40 p-3 max-w-[82%]">
                    <p className="text-sm">
                      ¡Hola! Vi que también vas a hacer un paseo casual. ¿Te gustaría unirte?
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">15:23</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="rounded-2xl bg-primary text-primary-foreground p-3 max-w-[82%]">
                    <p className="text-sm">
                      ¡Claro! Me encantaría. ¿A qué hora quedamos?
                    </p>
                    <p className="text-[11px] opacity-80 mt-1">15:24</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="rounded-2xl border border-border bg-muted/40 p-3 max-w-[82%]">
                    <p className="text-sm">
                      ¿Qué te parece en 30 minutos en la entrada del bosque?
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">15:25</p>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input placeholder="Escribe un mensaje..." className="h-10 rounded-full" />
              <Button className="h-10 w-10 rounded-full p-0">
                <Send size={18} />
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-full border-primary/30 hover:bg-primary/10"
                onClick={() => {
                  setShowContactDialog(false);
                  if (selectedCyclist) handleContactCyclist(selectedCyclist, "phone");
                }}
              >
                <Phone size={14} className="mr-2" />
                Llamar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-full border-primary/30 hover:bg-primary/10"
              >
                <MapPin size={14} className="mr-2" />
                Compartir ubicación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConnectCyclistsMap;
