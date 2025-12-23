import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Navigation, Activity, Gauge, MapPin, Users, Clock } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

type LatLng = { lat: number; lng: number };

export type MapEventType = "race" | "trick" | "groupRide" | "checkpoint" | "live";

export interface MapEvent {
  id: string;
  title: string;
  type: MapEventType;
  location: LatLng;
  startsAt?: string; // "18:30"
  participants?: number;
  difficulty?: "easy" | "medium" | "hard";
  isLive?: boolean;
}

interface MapProps {
  userLocation?: LatLng;
  drivers?: Array<{
    id: string;
    location: LatLng;
    name: string;
    rating: number;
    carModel: string;
  }>;
  events?: MapEvent[];
  onEventClick?: (event: MapEvent) => void;

  selectedRoute?: {
    origin: LatLng;
    destination: LatLng;
    waypoints: LatLng[];
  };
  onMapClick?: (location: LatLng) => void;
  onLocationUpdate?: (location: LatLng) => void;
}

const RR = {
  orange: "#FF5A00",
  bg: "#0B0B0F",
  card: "#111118",
  white: "rgba(255,255,255,0.92)",
};

const createPillIcon = (opts: {
  label: string;
  emoji: string;
  color?: string;
  ring?: boolean;
  live?: boolean;
}) => {
  const color = opts.color ?? RR.orange;
  const ring = opts.ring ? `box-shadow: 0 0 0 2px rgba(255,90,0,0.35), 0 12px 28px rgba(0,0,0,0.45);` : "";
  const live = opts.live
    ? `animation: rrPulse 1.35s ease-in-out infinite;`
    : "";

  // NOTE: Leaflet divIcon HTML can include a <style>. We scope it by class name.
  const html = `
    <style>
      @keyframes rrPulse {
        0% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 0 rgba(255,90,0,0)); }
        50% { transform: translateY(-1px) scale(1.03); filter: drop-shadow(0 0 10px rgba(255,90,0,0.35)); }
        100% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 0 rgba(255,90,0,0)); }
      }
    </style>

    <div
      class="rr-marker"
      style="
        display:flex;
        align-items:center;
        gap:8px;
        padding:8px 10px;
        border-radius:999px;
        background:${RR.card};
        border:1px solid rgba(255,255,255,0.14);
        ${ring}
        ${live}
        color:${RR.white};
        backdrop-filter: blur(8px);
      "
    >
      <div style="
        width:28px;height:28px;border-radius:12px;
        display:grid;place-items:center;
        background: rgba(255,90,0,0.12);
        border:1px solid rgba(255,90,0,0.28);
        color:${color};
        font-size:16px;
      ">
        ${opts.emoji}
      </div>

      <div style="display:flex;flex-direction:column;line-height:1;">
        <span style="font-weight:900; font-size:12px; letter-spacing:0.04em;">
          ${opts.label}
        </span>
        <span style="font-size:10px; opacity:0.7; margin-top:2px;">
          EVENT
        </span>
      </div>
    </div>
  `;

  return L.divIcon({
    className: "rr-div-icon",
    html,
    iconSize: [140, 44],
    iconAnchor: [70, 22],
  });
};

const createDotIcon = (emoji: string) =>
  L.divIcon({
    className: "rr-dot-icon",
    html: `
      <div style="
        width:34px;height:34px;border-radius:999px;
        background:${RR.orange};
        border:2px solid #000;
        display:grid;place-items:center;
        box-shadow: 0 0 10px rgba(255,90,0,0.4);
        color:black;
        font-size:16px;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

const userIcon = createDotIcon("📍");
const driverIcon = createDotIcon("🚴");

const eventStyle = (type: MapEventType) => {
  switch (type) {
    case "race":
      return { emoji: "🏁", label: "RACE", color: RR.orange };
    case "trick":
      return { emoji: "🌀", label: "TRICK", color: "#A855F7" };
    case "groupRide":
      return { emoji: "🚴", label: "GROUP", color: "#22C55E" };
    case "checkpoint":
      return { emoji: "📌", label: "POINT", color: "#60A5FA" };
    case "live":
      return { emoji: "⚡", label: "LIVE", color: RR.orange };
    default:
      return { emoji: "📍", label: "EVENT", color: RR.orange };
  }
};

// Component to handle map events and zoom
const MapController = ({
  onMapClick,
  zoom,
  setZoom,
}: {
  onMapClick: (location: LatLng) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    map.setZoom(zoom);
  }, [map, zoom]);

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    };

    const handleZoomEnd = () => {
      setZoom(map.getZoom());
    };

    map.on("click", handleClick);
    map.on("zoomend", handleZoomEnd);

    return () => {
      map.off("click", handleClick);
      map.off("zoomend", handleZoomEnd);
    };
  }, [map, onMapClick, setZoom]);

  return null;
};

const Map: React.FC<MapProps> = ({
  userLocation,
  drivers = [],
  events = [
    {
      id: "ev-1",
      title: "Sprint urbano",
      type: "race",
      location: { lat: 19.4336, lng: -99.1312 },
      startsAt: "18:30",
      participants: 24,
      difficulty: "medium",
    },
    {
      id: "ev-2",
      title: "Trick spot (barandas)",
      type: "trick",
      location: { lat: 19.4372, lng: -99.1391 },
      startsAt: "19:10",
      participants: 12,
      difficulty: "hard",
      isLive: true,
    },
    {
      id: "ev-3",
      title: "Group ride chill",
      type: "groupRide",
      location: { lat: 19.4294, lng: -99.1280 },
      startsAt: "17:45",
      participants: 8,
      difficulty: "easy",
    },
  ],
  onEventClick,
  selectedRoute,
  onMapClick = () => {},
  onLocationUpdate = () => {},
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(15);
  const [currentUserLocation, setCurrentUserLocation] = useState<LatLng | null>(
    userLocation || null
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (userLocation) {
      setCurrentUserLocation(userLocation);
      setIsLoading(false);
    } else if (!currentUserLocation) {
      getCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  useEffect(() => {
    if (currentUserLocation) {
      const timer = setTimeout(() => setIsLoading(false), 700);
      return () => clearTimeout(timer);
    }
  }, [currentUserLocation]);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocalización no soportada");
      const fallback = { lat: 19.4326, lng: -99.1332 };
      setCurrentUserLocation(fallback);
      onLocationUpdate(fallback);
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentUserLocation(newLoc);
        onLocationUpdate(newLoc);
        setIsGettingLocation(false);
        setLocationError(null);
      },
      (err) => {
        console.warn("Geolocation error:", err);
        let msg = "Error obteniendo ubicación";
        if (err.code === err.PERMISSION_DENIED) msg = "Permiso de ubicación denegado";
        if (err.code === err.POSITION_UNAVAILABLE) msg = "Ubicación no disponible";
        if (err.code === err.TIMEOUT) msg = "Tiempo de espera agotado";

        setLocationError(msg);
        const fallback = { lat: 19.4326, lng: -99.1332 };
        setCurrentUserLocation(fallback);
        onLocationUpdate(fallback);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
    );
  };

  const handleZoomIn = () => setZoom((p) => Math.min(p + 1, 20));
  const handleZoomOut = () => setZoom((p) => Math.max(p - 1, 10));

  // Optional: quick filter logic later
  const liveCount = useMemo(() => events.filter((e) => e.isLive || e.type === "live").length, [events]);

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden">
      {currentUserLocation ? (
        <MapContainer
          center={[currentUserLocation.lat, currentUserLocation.lng]}
          zoom={zoom}
          className="w-full h-full"
          zoomControl={false}
          style={{
            filter: "hue-rotate(18deg) saturate(1.15) brightness(0.82)",
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <MapController onMapClick={onMapClick} zoom={zoom} setZoom={setZoom} />

          {/* User */}
          <Marker position={[currentUserLocation.lat, currentUserLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <strong>Tu ubicación</strong>
                <br />
                {currentUserLocation.lat.toFixed(4)}, {currentUserLocation.lng.toFixed(4)}
              </div>
            </Popup>
          </Marker>

          {/* Drivers */}
          {drivers.map((d) => (
            <Marker key={d.id} position={[d.location.lat, d.location.lng]} icon={driverIcon}>
              <Popup>
                <div className="text-center">
                  <strong>{d.name}</strong>
                  <br />
                  {d.carModel}
                  <br />
                  <span style={{ color: "#f59e0b" }}>★ {d.rating}</span>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Events (Riders Republic style) */}
          {events.map((ev) => {
            const s = eventStyle(ev.type);
            const icon = createPillIcon({
              label: s.label,
              emoji: s.emoji,
              color: s.color,
              ring: true,
              live: ev.isLive || ev.type === "live",
            });

            return (
              <Marker
                key={ev.id}
                position={[ev.location.lat, ev.location.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => onEventClick?.(ev),
                }}
              >
                <Popup>
                  <div style={{ minWidth: 220 }}>
                    <div style={{ fontWeight: 900, marginBottom: 6 }}>{ev.title}</div>

                    <div style={{ display: "flex", gap: 10, fontSize: 12, opacity: 0.85, marginBottom: 8 }}>
                      {ev.startsAt && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <Clock size={14} /> {ev.startsAt}
                        </span>
                      )}
                      {typeof ev.participants === "number" && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <Users size={14} /> {ev.participants}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 10 }}>
                      Tipo: <strong>{s.label}</strong>
                      {ev.difficulty ? (
                        <>
                          {" "}
                          • Dificultad: <strong>{ev.difficulty.toUpperCase()}</strong>
                        </>
                      ) : null}
                      {(ev.isLive || ev.type === "live") ? " • 🔥 LIVE" : ""}
                    </div>

                    <button
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 12,
                        background: RR.orange,
                        color: "black",
                        fontWeight: 900,
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => onEventClick?.(ev)}
                    >
                      UNIRSE AL EVENTO
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      ) : (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-lg font-semibold mb-2">Cargando mapa...</div>
            <div className="text-sm text-gray-300">Obteniendo ubicación</div>
          </div>
        </div>
      )}

      {/* overlays + UI */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent"></div>
      </div>

      {(isLoading || isGettingLocation) && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border border-orange-300"></div>
            </div>
            <div className="text-orange-500 font-mono text-sm tracking-wider">
              {isGettingLocation ? "OBTENIENDO UBICACIÓN..." : "INICIALIZANDO MAPA..."}
            </div>
          </div>
        </div>
      )}

      {locationError && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
          <div className="cyber-card bg-destructive/20 border-destructive/50 px-4 py-3 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="text-sm text-destructive font-medium">{locationError}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-20 right-6 flex flex-col gap-3 z-[1000]">
        <button
          onClick={handleZoomIn}
          className="cyber-card w-12 h-12 flex items-center justify-center hover:bg-primary/20 transition-all duration-300 group"
        >
          <span className="text-xl font-bold text-primary group-hover:scale-110 transition-transform">+</span>
        </button>
        <button
          onClick={handleZoomOut}
          className="cyber-card w-12 h-12 flex items-center justify-center hover:bg-primary/20 transition-all duration-300 group"
        >
          <span className="text-xl font-bold text-primary group-hover:scale-110 transition-transform">-</span>
        </button>
      </div>

      <button
        className="absolute top-32 left-6 cyber-card p-4 hover:bg-primary/20 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed z-[1000]"
        onClick={getCurrentLocation}
        disabled={isGettingLocation}
      >
        <Navigation
          className={`h-6 w-6 text-primary group-hover:scale-110 transition-transform ${
            isGettingLocation ? "animate-spin" : ""
          }`}
        />
      </button>

      <div className="absolute top-4 left-4 z-[1000]">
  <div className="cyber-card bg-black/55 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
    <div className="px-3 py-2 flex items-center gap-2 border-b border-white/10">
      <Activity className="h-4 w-4 text-primary animate-pulse" />
      <span className="text-xs font-mono text-white/80">EN VIVO</span>
      <span className="ml-auto text-[10px] font-mono text-white/40">
        GPS READY
      </span>
    </div>

    <div className="px-3 py-2 flex items-center justify-between gap-6">
      <div className="flex items-center gap-2">
        <Gauge className="h-4 w-4 text-primary" />
        <span className="text-xs font-mono text-white/80">
          {drivers.length} CONDUCTORES
        </span>
      </div>

      {/* Si luego metes events, aquí pones events.length */}
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        <span className="text-xs font-mono text-white/80">1 EVENTO</span>
      </div>
    </div>
  </div>
</div>

      <div className="absolute top-6 right-6 cyber-card px-4 py-2 z-[1000]">
        <span className="text-sm font-mono text-primary">ZOOM: {zoom}X</span>
      </div>
    </div>
  );
};

export default Map;
