import React, { useState } from "react";
import {
  ArrowLeft,
  Bike,
  Mountain,
  Zap,
  Wind,
  Compass,
  Activity,
  Star,
  Clock,
  DollarSign,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useNavigate } from "react-router-dom";

interface BikeType {
  id: string;
  name: string;
  icon: React.ReactNode;
  price: string;
  description: string;
  features: string[];
  category: "urban" | "mountain" | "road" | "electric";
  rating: number;
  availability: string;
  speed: string;
  image: string;
}

const BicycleCatalog = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBike, setSelectedBike] = useState<string | null>(null);

  const bikeTypes: BikeType[] = [
    {
      id: "hiz-urban",
      name: "HIZ.URBANA",
      icon: <Bike size={24} />,
      price: "$8-12",
      description: "Perfecta para desplazamientos urbanos y viajes cortos",
      features: [
        "Marco ligero",
        "Llantas urbanas",
        "Asiento cómodo",
        "Luces LED",
      ],
      category: "urban",
      rating: 4.5,
      availability: "Disponible ahora",
      speed: "25 km/h",
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    },
    {
      id: "hiz-ebike",
      name: "HIZ.E-BIKE",
      icon: <Zap size={24} />,
      price: "$15-20",
      description: "Asistencia eléctrica para viajes sin esfuerzo",
      features: [
        "Motor eléctrico",
        "50km autonomía",
        "Carga rápida",
        "Pantalla inteligente",
      ],
      category: "electric",
      rating: 4.8,
      availability: "Disponible ahora",
      speed: "45 km/h",
      image:
        "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&q=80",
    },
    {
      id: "hiz-mountain",
      name: "HIZ.MONTAÑA",
      icon: <Mountain size={24} />,
      price: "$12-18",
      description: "Diseñada para aventuras todoterreno y senderos",
      features: [
        "Suspensión completa",
        "Llantas todoterreno",
        "Frenos de disco",
        "Marco resistente",
      ],
      category: "mountain",
      rating: 4.7,
      availability: "Disponible ahora",
      speed: "35 km/h",
      image:
        "https://images.unsplash.com/photo-1544191696-15693072e0b5?w=400&q=80",
    },
    {
      id: "hiz-gravel",
      name: "HIZ.GRAVA",
      icon: <Compass size={24} />,
      price: "$14-22",
      description: "Bicicleta versátil para aventuras en terreno mixto",
      features: [
        "Llantas de grava",
        "Manillar de descenso",
        "Rango de velocidades",
        "Peso ligero",
      ],
      category: "road",
      rating: 4.6,
      availability: "Disponible ahora",
      speed: "40 km/h",
      image:
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=80",
    },
    {
      id: "hiz-enduro",
      name: "HIZ.ENDURO",
      icon: <Activity size={24} />,
      price: "$18-25",
      description: "Alto rendimiento para ciclismo de montaña extremo",
      features: [
        "Suspensión de largo recorrido",
        "Geometría agresiva",
        "Listo para tubeless",
        "Marco de carbono",
      ],
      category: "mountain",
      rating: 4.9,
      availability: "Limitado",
      speed: "50 km/h",
      image:
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=80",
    },
    {
      id: "hiz-road",
      name: "HIZ.CARRETERA",
      icon: <Wind size={24} />,
      price: "$10-16",
      description:
        "Diseño aerodinámico para velocidad en carreteras pavimentadas",
      features: [
        "Marco aerodinámico",
        "Llantas de carretera",
        "Manillar de descenso",
        "Peso ligero",
      ],
      category: "road",
      rating: 4.4,
      availability: "Disponible ahora",
      speed: "55 km/h",
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    },
    {
      id: "hiz-cargo",
      name: "HIZ.CARGA",
      icon: <Bike size={24} />,
      price: "$12-20",
      description: "Bicicleta resistente para transportar mercancías",
      features: [
        "Área de carga amplia",
        "Diseño estable",
        "Asistencia eléctrica",
        "Protección climática",
      ],
      category: "electric",
      rating: 4.3,
      availability: "Disponible ahora",
      speed: "30 km/h",
      image:
        "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&q=80",
    },
    {
      id: "hiz-bmx",
      name: "HIZ.BMX",
      icon: <Activity size={24} />,
      price: "$6-10",
      description: "Bicicleta compacta para trucos y movilidad urbana",
      features: [
        "Marco compacto",
        "Ruedas resistentes",
        "Lista para trucos",
        "Construcción durable",
      ],
      category: "urban",
      rating: 4.2,
      availability: "Disponible ahora",
      speed: "20 km/h",
      image:
        "https://images.unsplash.com/photo-1544191696-15693072e0b5?w=400&q=80",
    },
  ];

  const filteredBikes = bikeTypes.filter((bike) => {
    const matchesSearch =
      bike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bike.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || bike.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "urban":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "mountain":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "road":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "electric":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-primary/20 text-primary border-primary/30";
    }
  };

  const handleBikeSelect = (bikeId: string) => {
    setSelectedBike(bikeId);
    // Here you could navigate back to the main page with the selected bike
    // or handle the selection in another way
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border/30">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-primary/20 shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold cyber-text truncate">
                CATÁLOGO DE BICICLETAS
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-mono hidden sm:block">
                SISTEMA NEURAL DE SELECCIÓN DE BICICLETAS
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-primary text-primary font-mono text-xs sm:text-sm shrink-0"
          >
            {filteredBikes.length} DISPONIBLES
          </Badge>
        </div>
      </header>

      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
        {/* Search and Filter */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:gap-6">
          <div className="relative flex-1 max-w-md lg:max-w-lg">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <Input
              placeholder="Buscar bicicletas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary/50 border-border/50 focus-visible:ring-primary h-10"
            />
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto">
            <Filter size={16} className="text-muted-foreground shrink-0" />
            <Tabs
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              className="w-auto"
            >
              <TabsList className="bg-secondary/50 h-10">
                <TabsTrigger
                  value="all"
                  className="font-mono text-xs px-2 sm:px-3"
                >
                  TODAS
                </TabsTrigger>
                <TabsTrigger
                  value="urban"
                  className="font-mono text-xs px-2 sm:px-3"
                >
                  URBANA
                </TabsTrigger>
                <TabsTrigger
                  value="mountain"
                  className="font-mono text-xs px-2 sm:px-3"
                >
                  MONTAÑA
                </TabsTrigger>
                <TabsTrigger
                  value="road"
                  className="font-mono text-xs px-2 sm:px-3"
                >
                  CARRETERA
                </TabsTrigger>
                <TabsTrigger
                  value="electric"
                  className="font-mono text-xs px-2 sm:px-3"
                >
                  ELÉCTRICA
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Bike Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
          {filteredBikes.map((bike) => (
            <Card
              key={bike.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                selectedBike === bike.id
                  ? "border-primary glow-effect"
                  : "border-border/50 hover:border-primary/50"
              } bg-gradient-to-br from-card to-card/80 h-fit`}
              onClick={() => handleBikeSelect(bike.id)}
            >
              <CardHeader className="pb-3 p-4 sm:p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="bg-primary/20 p-2 sm:p-3 rounded-full">
                    {React.cloneElement(bike.icon as React.ReactElement, {
                      size: 20,
                    })}
                  </div>
                  <Badge
                    className={`${getCategoryColor(bike.category)} text-xs`}
                  >
                    {bike.category.toUpperCase()}
                  </Badge>
                </div>
                <CardTitle className="cyber-text text-base sm:text-lg leading-tight">
                  {bike.name}
                </CardTitle>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="fill-primary text-primary" size={12} />
                    <span className="text-xs sm:text-sm font-bold">
                      {bike.rating}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {bike.availability}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                <div className="aspect-video bg-secondary/30 rounded-lg overflow-hidden">
                  <img
                    src={bike.image}
                    alt={bike.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {bike.description}
                </p>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <DollarSign size={12} className="text-primary" />
                    <span className="font-bold text-primary text-sm">
                      {bike.price}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Activity size={12} className="text-muted-foreground" />
                    <span className="text-xs font-mono">{bike.speed}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-mono text-muted-foreground">
                    CARACTERÍSTICAS:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {bike.features.slice(0, 2).map((feature, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs border-border/50 px-2 py-0.5"
                      >
                        {feature}
                      </Badge>
                    ))}
                    {bike.features.length > 2 && (
                      <Badge
                        variant="outline"
                        className="text-xs border-border/50 px-2 py-0.5"
                      >
                        +{bike.features.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full cyber-button text-xs sm:text-sm h-8 sm:h-9"
                  variant={selectedBike === bike.id ? "default" : "outline"}
                >
                  {selectedBike === bike.id
                    ? "SELECCIONADA"
                    : "SELECCIONAR BICICLETA"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBikes.length === 0 && (
          <div className="text-center py-12">
            <Bike className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No se encontraron bicicletas
            </h3>
            <p className="text-muted-foreground text-sm">
              Intenta ajustar tu búsqueda o criterios de filtro
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BicycleCatalog;
