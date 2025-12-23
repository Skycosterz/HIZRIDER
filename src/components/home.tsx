import React, { useState } from "react";
import { Menu, User, Bell, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetTrigger } from "./ui/sheet";
import Map from "./Map";
import BikeConnectPanel from "./RideRequestPanel";
import UserProfileSheet from "./UserProfileSheet";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isActivityRequested, setIsActivityRequested] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState("casual");
  const [currentLocation, setCurrentLocation] = useState("Mi ubicación actual");
  const [destination, setDestination] = useState("");
  const [userLocation, setUserLocation] = useState<
    { lat: number; lng: number } | undefined
  >();

  const handleActivityRequest = (destinationText: string, activityType: string) => {
    // Navigate to the connect cyclists page
    navigate("/connect-cyclists");
    setIsActivityRequested(true);
    setDestination(destinationText);
    setSelectedActivityType(activityType);
  };

  const handleActivityCancel = () => {
    setIsActivityRequested(false);
    setDestination("");
  };

  const handleActivityTypeSelect = (type: string) => {
    setSelectedActivityType(type);
  };

  const handleLocationUpdate = (location: { lat: number; lng: number }) => {
    setUserLocation(location);
    // Update current location text with coordinates
    setCurrentLocation(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-border/30 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-primary/20 h-8 w-8 sm:h-10 sm:w-10"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight cyber-text">
              HIZ.
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6 text-sm font-medium">
            <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              VIAJES
            </span>
            <span
              className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              onClick={() => (window.location.href = "/bicycles")}
            >
              BICICLETAS
            </span>
            <span
              className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              onClick={() => (window.location.href = "/community")}
            >
              COMUNIDAD
            </span>
            <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              CONTACTO
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-primary/20 h-8 w-8 sm:h-10 sm:w-10"
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-primary/20 h-8 w-8 sm:h-10 sm:w-10"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </SheetTrigger>

            <UserProfileSheet
              open={isProfileOpen}
              onOpenChange={setIsProfileOpen}
            />
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden bg-gradient-to-br from-background to-background/80">
        {/* MAP: ocupa SOLO el main */}
        <div className="absolute inset-0 z-0">
          <Map userLocation={userLocation} onLocationUpdate={handleLocationUpdate} />
        </div>

        {/* PANEL: encima del mapa */}
        <div
          className="
            absolute z-20
            bottom-0 left-0 right-0
            lg:bottom-6 lg:left-6 lg:right-auto lg:w-[420px]
            xl:w-[460px]
          "
        >
          <BikeConnectPanel
            onJoinActivity={handleActivityRequest}
            onCancel={handleActivityCancel}
          />
        </div>
      </main>
    </div>
  );
};

export default Home;
