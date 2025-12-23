import React, { useState } from "react";
import {
  Search,
  MapPin,
  Clock,
  X,
  User,
  Zap,
  Activity,
  Bike,
  MessageCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useToast } from "./ui/use-toast";

interface BikeActivity {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  participants: string;
  duration: string;
  type: "casual" | "sport" | "adventure";
}

interface BikeConnectPanelProps {
  onJoinActivity?: (destination: string, activityType: string) => void;
  onCancel?: () => void;
}

const BikeConnectPanel = ({
  onJoinActivity = () => {},
  onCancel = () => {},
}: BikeConnectPanelProps) => {
  const [destination, setDestination] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<string>("casual");
  const [panelState, setPanelState] = useState<
    "request" | "searching" | "connected" | "inProgress"
  >("request");

  const { toast } = useToast();

  const bikeActivities: BikeActivity[] = [
    {
      id: "casual",
      name: "PASEO CASUAL",
      icon: <Bike size={20} />,
      description: "Conecta con ciclistas para un paseo relajado",
      participants: "3-8 personas",
      duration: "30-60 min",
      type: "casual",
    },
    {
      id: "sport",
      name: "RUTA DEPORTIVA",
      icon: <Activity size={20} />,
      description: "Únete a ciclistas para entrenamientos intensos",
      participants: "2-6 personas",
      duration: "45-90 min",
      type: "sport",
    },
    {
      id: "adventure",
      name: "AVENTURA URBANA",
      icon: <Zap size={20} />,
      description: "Explora la ciudad con otros aventureros",
      participants: "4-12 personas",
      duration: "60-120 min",
      type: "adventure",
    },
  ];

  const cyclistGroup = {
    id: "group-123",
    leader: "Ana Rodriguez",
    members: 4,
    activity: "Paseo casual por Chapultepec",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    meetingPoint: "Entrada principal del bosque",
    eta: "5 min",
  };

  const handleCancel = () => {
    setPanelState("request");
    onCancel();
  };

  const rrAccent = "text-[#FF5A00]";
  const rrBorder = "border-[#FF5A00]/30";
  const rrBg = "bg-[#0B0B0F]";
  const rrCard = "bg-[#111118]/90";

  const getCardStyle = (type: BikeActivity["type"], isSelected: boolean) => {
    // Riders Republic vibe: negro + naranja, y un “sticker stripe” lateral
    const base =
      "relative overflow-hidden rounded-2xl border transition-all duration-300 hover:translate-y-[-1px] hover:shadow-xl";
    const selected = isSelected
      ? "border-[#FF5A00]/70 shadow-[0_0_0_1px_rgba(255,90,0,0.35),0_12px_30px_rgba(0,0,0,0.35)]"
      : "border-white/10 hover:border-white/20";

    const stripe =
      type === "casual"
        ? "before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:bg-emerald-500/80"
        : type === "sport"
          ? "before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:bg-rose-500/80"
          : "before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:bg-[#FF5A00]/90";

    const sheen =
      "after:absolute after:inset-0 after:bg-gradient-to-r after:from-white/0 after:via-white/5 after:to-white/0 after:opacity-0 hover:after:opacity-100 after:transition-opacity";

    return `${base} ${selected} ${stripe} ${sheen}`;
  };

  const joinNow = (activityId: string) => {
    if (!destination.trim()) {
      toast({
        title: "Destino requerido",
        description: "Pon a dónde vas a pedalear para armar el squad 🔥",
      });
      return;
    }

    // manda DESTINO + activityId (casual/sport/adventure) como espera Home
    onJoinActivity(destination.trim(), activityId);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 ${rrBg} border-t border-white/10 shadow-2xl`}
    >
      {/* Top lip / handle */}
      <div className="mx-auto mt-2 mb-1 h-1.5 w-14 rounded-full bg-white/10" />

      {panelState === "request" && (
        <div className="p-5 sm:p-6 space-y-5">
          {/* Destination Input (lo regresamos porque Home lo exige) */}
          <div className="space-y-2">
            

            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/60">
              <MapPin size={16} className={rrAccent} />
              <span className="font-mono tracking-wider">PUNTO DE ENCUENTRO</span>
              <span className="ml-auto text-white/40">GPS READY</span>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                ELIGE TU MOOD
              </h3>
          
            </div>

            <Badge
              variant="outline"
              className={`font-mono text-xs ${rrBorder} ${rrAccent} bg-[#FF5A00]/5`}
            >
              CICLISTAS EN VIVO
            </Badge>
          </div>

          {/* Activity Cards */}
          <div className="space-y-3">
            {bikeActivities.map((activity) => {
              const isSelected = selectedActivity === activity.id;

              return (
                <Card
                  key={activity.id}
                  className={`${getCardStyle(activity.type, isSelected)} ${rrCard}`}
                  onClick={() => setSelectedActivity(activity.id)}
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-4">
                      {/* Icon bubble */}
                      <div
                        className={`h-11 w-11 rounded-2xl grid place-items-center border ${rrBorder} bg-[#FF5A00]/10 text-white`}
                      >
                        {activity.icon}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-white tracking-tight truncate">
                            {activity.name}
                          </p>
                          {isSelected && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF5A00]/15 text-[#FF5A00] border border-[#FF5A00]/30">
                              SELECTED
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-white/60 mt-1 leading-relaxed">
                          {activity.description}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/50">
                          <div className="flex items-center gap-1.5">
                            <User size={12} className="text-white/50" />
                            <span>{activity.participants}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-white/50" />
                            <span>{activity.duration}</span>
                          </div>
                        </div>
                      </div>

                      {/* Small Join Button (se queda, pero ya NO hay botón gigante abajo) */}
                      <Button
                        size="sm"
                        className="h-9 rounded-xl bg-[#FF5A00] text-black hover:bg-[#FF5A00]/90 font-bold"
                        onClick={(e) => {
                          e.stopPropagation();
                          joinNow(activity.id);
                        }}
                      >
                        UNIRSE
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* ✅ Ya NO hay “Join Activity Button” gigante abajo */}
          {/* Lo quitamos porque estorbaba */}
        </div>
      )}

      {panelState === "searching" && (
        <div className="p-8 space-y-6 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="relative mb-6">
              <div className="h-16 w-16 bg-[#FF5A00]/15 rounded-full flex items-center justify-center animate-pulse">
                <User size={32} className="text-[#FF5A00]" />
              </div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-[#FF5A00]/30"></div>
            </div>
            <h3 className="text-xl font-black text-white mb-2 tracking-tight">
              BUSCANDO TU SQUAD
            </h3>
            <p className="text-white/50 font-mono">MATCHMAKING ACTIVO…</p>
          </div>

          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-white/15 hover:bg-white/5 text-white"
          >
            CANCELAR
          </Button>
        </div>
      )}

      {(panelState === "connected" || panelState === "inProgress") && (
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Badge
                variant="outline"
                className={`mb-3 ${rrBorder} ${rrAccent} bg-[#FF5A00]/5 font-mono`}
              >
                {panelState === "connected" ? "GRUPO ENCONTRADO" : "EN RUTA"}
              </Badge>
              <h3 className="text-xl font-black text-white truncate">
                {destination || "Destino"}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="hover:bg-white/5 text-white"
            >
              <X size={20} />
            </Button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-[#FF5A00]/40">
                <img src={cyclistGroup.photoUrl} alt={cyclistGroup.leader} />
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-extrabold text-white text-lg">
                      {cyclistGroup.leader}
                    </p>
                    <p className="text-sm text-white/60 font-mono">
                      {cyclistGroup.activity}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-white/80">
                    <User className="text-[#FF5A00]" size={16} />
                    <span className="font-bold">{cyclistGroup.members}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-[#FF5A00]" />
              <div>
                <p className="font-bold text-white">
                  {panelState === "connected"
                    ? `ENCUENTRO EN ${cyclistGroup.eta}`
                    : "Actividad iniciada"}
                </p>
                <p className="text-xs text-white/50 font-mono">
                  {cyclistGroup.meetingPoint}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="border-white/15 hover:bg-white/5 text-white rounded-xl"
            >
              <MessageCircle size={16} className="mr-2" />
              CHAT
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BikeConnectPanel;
