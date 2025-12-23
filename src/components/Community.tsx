import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Trophy,
  MapPin,
  Clock,
  Users,
  Plus,
  UserPlus,
  Bike,
  Footprints,
  Zap,
  ChevronRight,
  Verified,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface Activity {
  id: string;
  user: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  type: "ride" | "run" | "cycle";
  title: string;
  distance: string;
  duration: string;
  location: string;
  timestamp: string;
  likes: number;
  comments: number;
  image?: string;
  stats: {
    speed: string;
    elevation: string;
  };
}

interface User {
  id: string;
  name: string;
  avatar: string;
  location: string;
  followers: number;
  following: number;
  activities: number;
  isFollowing: boolean;
}

const chip =
  "inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground";

const StravaTab = ({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) => (
  <TabsTrigger
    value={value}
    className={[
      "rounded-full px-4 py-2 text-sm",
      "data-[state=active]:bg-foreground data-[state=active]:text-background",
      "data-[state=inactive]:bg-muted/60 data-[state=inactive]:text-foreground",
      "transition-colors",
    ].join(" ")}
  >
    {children}
  </TabsTrigger>
);

/**
 * Mini “map preview” (lightweight SVG) — no libs, deterministic by seed.
 * Looks Strava-ish without needing maps APIs.
 */
const MiniMap = ({ seed }: { seed: string }) => {
  const hash = Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0);

  const pts = Array.from({ length: 9 }).map((_, i) => {
    const x = 8 + i * 14.5;
    const y = 10 + ((hash + i * 19) % 22);
    return { x, y };
  });

  const pointsStr = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const start = pts[0];
  const end = pts[pts.length - 1];

  return (
    <div className="relative h-24 w-full overflow-hidden rounded-xl border border-border bg-muted/40">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-primary/5" />

      <svg
        viewBox="0 0 140 44"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        {/* faint “roads” */}
        <path
          d="M0 30 C 25 20, 40 35, 70 22 S 120 18, 140 26"
          fill="none"
          stroke="currentColor"
          className="text-muted-foreground/20"
          strokeWidth="1.2"
        />
        <path
          d="M0 14 C 30 26, 55 8, 80 18 S 120 34, 140 12"
          fill="none"
          stroke="currentColor"
          className="text-muted-foreground/15"
          strokeWidth="1.2"
        />

        {/* route */}
        <polyline
          points={pointsStr}
          fill="none"
          stroke="currentColor"
          className="text-primary"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* start/end dots */}
        <circle
          cx={start.x}
          cy={start.y}
          r="3.2"
          fill="currentColor"
          className="text-primary"
        />
        <circle
          cx={end.x}
          cy={end.y}
          r="3.2"
          fill="currentColor"
          className="text-primary"
        />
      </svg>

      <div className="absolute bottom-2 left-2 flex gap-2">
        <span className="rounded-full bg-background/80 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur">
          Ruta
        </span>
        <span className="rounded-full bg-background/80 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur">
          GPS
        </span>
      </div>
    </div>
  );
};

const Community = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

  const mockActivities: Activity[] = [
    {
      id: "1",
      user: {
        name: "Carlos Mendoza",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos",
        verified: true,
      },
      type: "ride",
      title: "Viaje matutino por el centro",
      distance: "12.5 km",
      duration: "35 min",
      location: "Ciudad de México",
      timestamp: "Hace 2 horas",
      likes: 24,
      comments: 8,
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
      stats: {
        speed: "21.4 km/h",
        elevation: "156 m",
      },
    },
    {
      id: "2",
      user: {
        name: "Ana García",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana",
        verified: false,
      },
      type: "cycle",
      title: "Ruta en bicicleta por Chapultepec",
      distance: "8.2 km",
      duration: "28 min",
      location: "Bosque de Chapultepec",
      timestamp: "Hace 4 horas",
      likes: 18,
      comments: 5,
      stats: {
        speed: "17.6 km/h",
        elevation: "89 m",
      },
    },
    {
      id: "3",
      user: {
        name: "Miguel Torres",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=miguel",
        verified: true,
      },
      type: "run",
      title: "Carrera nocturna en Polanco",
      distance: "5.8 km",
      duration: "32 min",
      location: "Polanco, CDMX",
      timestamp: "Hace 1 día",
      likes: 31,
      comments: 12,
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80",
      stats: {
        speed: "10.9 km/h",
        elevation: "45 m",
      },
    },
  ];

  const suggestedUsers: User[] = [
    {
      id: "1",
      name: "Laura Jiménez",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=laura",
      location: "Roma Norte, CDMX",
      followers: 1240,
      following: 890,
      activities: 156,
      isFollowing: false,
    },
    {
      id: "2",
      name: "Roberto Silva",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=roberto",
      location: "Condesa, CDMX",
      followers: 2100,
      following: 1200,
      activities: 234,
      isFollowing: false,
    },
    {
      id: "3",
      name: "Sofia Ramírez",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sofia",
      location: "Coyoacán, CDMX",
      followers: 856,
      following: 654,
      activities: 98,
      isFollowing: false,
    },
  ];

  const handleFollow = (userId: string) => {
    setFollowingUsers((prev) => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  };

  const getTypeMeta = (type: Activity["type"]) => {
    switch (type) {
      case "ride":
      case "cycle":
        return { label: "Ride", icon: Bike };
      case "run":
        return { label: "Run", icon: Footprints };
      default:
        return { label: "Activity", icon: Zap };
    }
  };

  const weekly = useMemo(
    () => ({
      week: "45.2 km",
      month: "186.8 km",
      activities: "23",
    }),
    []
  );

  const ActivityCard = ({ activity }: { activity: Activity }) => {
    const meta = getTypeMeta(activity.type);
    const TypeIcon = meta.icon;

    return (
      <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-shadow">
        {/* top row */}
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-11 w-11">
              <AvatarImage src={activity.user.avatar} />
              <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold leading-none truncate">
                  {activity.user.name}
                </p>
                {activity.user.verified && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Verified className="h-4 w-4" />
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  · {activity.timestamp}
                </span>
              </div>

              <div className="mt-1 flex items-center gap-2 text-sm">
                <span className={chip}>
                  <TypeIcon className="h-3.5 w-3.5" />
                  {meta.label}
                </span>
                <span className="font-medium truncate">{activity.title}</span>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className={chip}>
                  <MapPin className="h-3.5 w-3.5" />
                  {activity.location}
                </span>
                <span className={chip}>
                  <Trophy className="h-3.5 w-3.5" />
                  {activity.distance}
                </span>
                <span className={chip}>
                  <Clock className="h-3.5 w-3.5" />
                  {activity.duration}
                </span>
                <span className={chip}>
                  <Zap className="h-3.5 w-3.5" />
                  {activity.stats.speed}
                </span>
                <span className={chip}>
                  <MapPin className="h-3.5 w-3.5" />
                  {activity.stats.elevation}
                </span>
              </div>
            </div>

            <Button variant="ghost" size="icon" className="shrink-0 rounded-full">
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </CardContent>

        {/* mini map preview (Strava-ish) */}
        <div className="px-4 pb-3">
          <MiniMap seed={`${activity.id}-${activity.user.name}`} />
        </div>

        {/* optional photo (if present) */}
        {activity.image && (
          <div className="relative">
            <img
              src={activity.image}
              alt={activity.title}
              className="h-56 w-full object-cover"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/35 to-transparent" />
          </div>
        )}

        {/* actions */}
        <CardContent className="px-4 py-3 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="rounded-full">
                <Heart className="h-4 w-4 mr-2" />
                {activity.likes}
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                {activity.comments}
              </Button>
            </div>

            <Button variant="ghost" size="icon" className="rounded-full">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const UserRow = ({ user }: { user: User }) => (
    <div className="flex items-center gap-3 py-3">
      <Avatar className="h-11 w-11">
        <AvatarImage src={user.avatar} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="font-semibold truncate">{user.name}</p>
        <p className="text-sm text-muted-foreground truncate">{user.location}</p>
        <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
          <span>{user.activities} act</span>
          <span>·</span>
          <span>{user.followers.toLocaleString()} seg</span>
        </div>
      </div>

      <Button
        size="sm"
        variant={followingUsers.has(user.id) ? "secondary" : "default"}
        onClick={() => handleFollow(user.id)}
        className="rounded-full"
      >
        {followingUsers.has(user.id) ? (
          "Siguiendo"
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-2" />
            Seguir
          </>
        )}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header - Strava-ish */}
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.back()}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="leading-tight">
                <h1 className="text-lg font-bold">Comunidad</h1>
                <p className="text-xs text-muted-foreground">
                  Feed · Descubrir · Ranking
                </p>
              </div>
            </div>

            <Button className="rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Crear
            </Button>
          </div>

          <div className="mt-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start gap-2 bg-transparent p-0">
                <StravaTab value="feed">Feed</StravaTab>
                <StravaTab value="discover">Descubrir</StravaTab>
                <StravaTab value="leaderboard">Ranking</StravaTab>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="feed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Feed */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">Actividades recientes</h2>
                  <Badge variant="secondary" className="rounded-full">
                    Hoy
                  </Badge>
                </div>

                <div className="space-y-4">
                  {mockActivities.map((a) => (
                    <ActivityCard key={a.id} activity={a} />
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Weekly summary */}
                <Card className="border-border bg-card shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      <p className="font-semibold">Tu resumen</p>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-border bg-background p-3">
                        <p className="text-xs text-muted-foreground">Semana</p>
                        <p className="font-semibold">{weekly.week}</p>
                      </div>
                      <div className="rounded-xl border border-border bg-background p-3">
                        <p className="text-xs text-muted-foreground">Mes</p>
                        <p className="font-semibold">{weekly.month}</p>
                      </div>
                      <div className="rounded-xl border border-border bg-background p-3">
                        <p className="text-xs text-muted-foreground">Act</p>
                        <p className="font-semibold">{weekly.activities}</p>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      className="mt-4 w-full rounded-full"
                    >
                      Ver estadísticas
                    </Button>
                  </CardContent>
                </Card>

                {/* Suggested */}
                <Card className="border-border bg-card shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <p className="font-semibold">Sugeridos</p>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-full">
                        Ver más
                      </Button>
                    </div>

                    <div className="mt-2 divide-y divide-border">
                      {suggestedUsers.slice(0, 3).map((u) => (
                        <UserRow key={u.id} user={u} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Descubrir atletas</h2>
              <Badge variant="outline" className="rounded-full">
                Cerca de ti
              </Badge>
            </div>

            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-2">
                <div className="divide-y divide-border">
                  {suggestedUsers.map((u) => (
                    <div key={u.id} className="px-2">
                      <UserRow user={u} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Ranking semanal</h2>
              <Badge variant="secondary" className="rounded-full">
                Distancia
              </Badge>
            </div>

            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-2">
                <div className="divide-y divide-border">
                  {mockActivities.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 px-3 py-3"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background text-sm font-bold">
                        {index + 1}
                      </div>

                      <Avatar className="h-10 w-10">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback>
                          {activity.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{activity.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.distance} · {activity.stats.speed}
                        </p>
                      </div>

                      <Badge variant="outline" className="rounded-full">
                        {activity.stats.elevation}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Community;
