import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Star,
  MapPin,
  Clock,
  Car,
  Shield,
  Navigation,
  User,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { useNavigate } from "react-router-dom";

interface CyclistLeader {
  id: string;
  name: string;
  rating: number;
  totalRides: number;
  bikeType: string;
  experience: string;
  photoUrl: string;
  eta: string;
  phone: string;
}

interface ActivityInfo {
  id: string;
  origin: string;
  destination: string;
  activityType: string;
  participants: number;
  estimatedTime: string;
  status: "searching" | "confirmed" | "gathering" | "inProgress" | "completed";
}

const ActivityDetails = () => {
  const navigate = useNavigate();
  const [activityStatus, setActivityStatus] = useState<
    "confirmed" | "gathering" | "inProgress"
  >("confirmed");
  const [progress, setProgress] = useState(0);

  // Mock data - in a real app this would come from props or API
  const cyclistLeader: CyclistLeader = {
    id: "cyclist-123",
    name: "Ana Rodriguez",
    rating: 4.8,
    totalRides: 247,
    bikeType: "Bicicleta de montaña",
    experience: "Experta",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    eta: "5 min",
    phone: "+1 234 567 8900",
  };

  const activityInfo: ActivityInfo = {
    id: "activity-456",
    origin: "Entrada principal del bosque",
    destination: "Bosque de Chapultepec",
    activityType: "PASEO CASUAL",
    participants: 4,
    estimatedTime: "45 min",
    status: "confirmed",
  };

  useEffect(() => {
    // Simulate ride progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 1000);

    // Simulate status changes
    setTimeout(() => setActivityStatus("gathering"), 5000);
    setTimeout(() => setActivityStatus("inProgress"), 15000);

    return () => clearInterval(timer);
  }, []);

  const getStatusText = () => {
    switch (activityStatus) {
      case "confirmed":
        return "GRUPO CONFIRMADO";
      case "gathering":
        return "REUNIÉNDOSE EN PUNTO";
      case "inProgress":
        return "ACTIVIDAD EN PROGRESO";
      default:
        return "ACTIVIDAD CONFIRMADA";
    }
  };

  const getStatusColor = () => {
    switch (activityStatus) {
      case "confirmed":
        return "bg-blue-500";
      case "gathering":
        return "bg-yellow-500";
      case "inProgress":
        return "bg-green-500";
      default:
        return "bg-primary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-border/30 bg-card/50 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="hover:bg-primary/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <h1 className="text-lg font-bold cyber-text">
            DETALLES DE LA ACTIVIDAD
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            ID: {activityInfo.id.toUpperCase()}
          </p>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="p-6 space-y-6">
        {/* Status Badge */}
        <div className="text-center">
          <Badge
            variant="outline"
            className={`${getStatusColor()} text-white border-0 px-4 py-2 text-sm font-bold`}
          >
            {getStatusText()}
          </Badge>
        </div>

        {/* Group Leader Info Card */}
        <Card className="cyber-card border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-16 w-16 border-2 border-primary/50">
                <img src={cyclistLeader.photoUrl} alt={cyclistLeader.name} />
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold">{cyclistLeader.name}</h3>
                    <div className="flex items-center space-x-1 mb-1">
                      <Star className="fill-primary text-primary" size={16} />
                      <span className="font-bold">{cyclistLeader.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({cyclistLeader.totalRides} actividades)
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-primary/50 hover:bg-primary/10"
                    >
                      <Phone size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-primary/50 hover:bg-primary/10"
                    >
                      <MessageCircle size={16} />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <User size={14} />
                    <span>
                      {cyclistLeader.bikeType} • {cyclistLeader.experience}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield size={14} />
                    <span className="font-mono">LÍDER DEL GRUPO</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Meeting Point */}
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <MapPin className="text-primary" size={20} />
                <span className="text-lg font-bold">
                  {activityStatus === "confirmed"
                    ? `Encuentro en ${cyclistLeader.eta}`
                    : activityStatus === "gathering"
                      ? "Reuniéndose ahora"
                      : `Duración: ${activityInfo.estimatedTime}`}
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-mono">
                {activityInfo.origin}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Activity Progress */}
        <Card className="cyber-card">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-lg">PROGRESO DE LA ACTIVIDAD</h4>
                <span className="text-sm text-muted-foreground font-mono">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <div>
                    <p className="font-medium">{activityInfo.origin}</p>
                    <p className="text-xs text-muted-foreground">
                      PUNTO DE ENCUENTRO
                    </p>
                  </div>
                </div>
                <div className="ml-1.5 w-0.5 h-8 bg-border"></div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 border-2 border-primary rounded-full bg-background"></div>
                  <div>
                    <p className="font-medium">{activityInfo.destination}</p>
                    <p className="text-xs text-muted-foreground">DESTINO</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Details */}
        <Card className="cyber-card">
          <CardContent className="p-6">
            <h4 className="font-bold text-lg mb-4">DETALLES DE LA ACTIVIDAD</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium">
                    {activityInfo.activityType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Participantes:</span>
                  <span className="font-bold text-primary">
                    {activityInfo.participants} personas
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duración est.:</span>
                  <span className="font-medium">
                    {activityInfo.estimatedTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modalidad:</span>
                  <div className="flex items-center space-x-1">
                    <User size={14} />
                    <span className="font-medium">Grupal</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full border-primary/50 hover:bg-primary/10"
          >
            <Navigation className="mr-2" size={16} />
            VER EN MAPA
          </Button>

          {activityStatus === "confirmed" && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => navigate("/")}
            >
              SALIR DEL GRUPO
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityDetails;
