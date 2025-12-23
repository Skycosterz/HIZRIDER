import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  CreditCard,
  History,
  LogOut,
  Settings,
  Star,
  User,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
} from "lucide-react";

interface UserProfileSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const UserProfileSheet = ({
  open = false,
  onOpenChange,
}: UserProfileSheetProps) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const { toast } = useToast();

  // Mock data
  const [userData, setUserData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    rating: 4.8,
    trips: [
      {
        id: 1,
        date: "2023-06-15",
        from: "Casa",
        to: "Oficina",
        price: "$12.50",
        status: "completado",
      },
      {
        id: 2,
        date: "2023-06-14",
        from: "Oficina",
        to: "Restaurante",
        price: "$8.75",
        status: "completado",
      },
      {
        id: 3,
        date: "2023-06-12",
        from: "Aeropuerto",
        to: "Hotel",
        price: "$35.20",
        status: "completado",
      },
      {
        id: 4,
        date: "2023-06-10",
        from: "Hotel",
        to: "Centro de Conferencias",
        price: "$15.30",
        status: "completado",
      },
      {
        id: 5,
        date: "2023-06-08",
        from: "Oficina",
        to: "Casa",
        price: "$13.25",
        status: "completado",
      },
    ],
    paymentMethods: [
      { id: 1, type: "Visa", last4: "4242", expiry: "04/25", default: true },
      {
        id: 2,
        type: "Mastercard",
        last4: "5555",
        expiry: "08/24",
        default: false,
      },
    ],
  });

  const handleEditProfile = () => {
    setEditedName(userData.name);
    setEditedEmail(userData.email);
    setEditedPhone(userData.phone);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    setUserData({
      ...userData,
      name: editedName,
      email: editedEmail,
      phone: editedPhone,
    });
    setIsEditingProfile(false);
    toast({
      title: "Perfil actualizado",
      description: "Tus cambios han sido guardados exitosamente",
    });
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
  };

  const handleLogout = () => {
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    });
    if (onOpenChange) onOpenChange(false);
  };

  const handleAddPaymentMethod = () => {
    toast({
      title: "Agregar método de pago",
      description: "Redirigiendo a la configuración de pagos...",
    });
  };

  const handleDeletePaymentMethod = (methodId: number) => {
    toast({
      title: "Método eliminado",
      description: "El método de pago ha sido eliminado",
    });
  };

  const handleViewTripDetails = (tripId: number) => {
    toast({
      title: "Detalles del viaje",
      description: `Mostrando detalles del viaje #${tripId}`,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-hidden p-0 bg-background">
        <div className="h-full flex flex-col">
          <SheetHeader className="p-6 border-b">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userData.avatar} alt={userData.name} />
                <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-xl">{userData.name}</SheetTitle>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm ml-1">{userData.rating}</span>
                </div>
              </div>
            </div>
          </SheetHeader>

          <Tabs
            defaultValue="profile"
            className="flex-1 flex flex-col"
            onValueChange={setActiveTab}
          >
            <div className="border-b">
              <TabsList className="w-full justify-start rounded-none bg-transparent p-0">
                <TabsTrigger
                  value="profile"
                  className={`rounded-none border-b-2 px-6 py-3 ${activeTab === "profile" ? "border-primary" : "border-transparent"}`}
                >
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger
                  value="trips"
                  className={`rounded-none border-b-2 px-6 py-3 ${activeTab === "trips" ? "border-primary" : "border-transparent"}`}
                >
                  <History className="h-4 w-4 mr-2" />
                  Viajes
                </TabsTrigger>
                <TabsTrigger
                  value="payment"
                  className={`rounded-none border-b-2 px-6 py-3 ${activeTab === "payment" ? "border-primary" : "border-transparent"}`}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pago
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <TabsContent value="profile" className="p-6 mt-0">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">
                      Información de Contacto
                    </h3>
                    {!isEditingProfile ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditProfile}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveProfile}
                          className="cyber-button"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Guardar
                        </Button>
                      </div>
                    )}
                  </div>

                  {isEditingProfile ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                          id="name"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editedEmail}
                          onChange={(e) => setEditedEmail(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={editedPhone}
                          onChange={(e) => setEditedPhone(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {userData.email}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Teléfono:</span> {userData.phone}
                      </p>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Configuración de Cuenta
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-destructive hover:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="trips" className="p-6 mt-0">
                <div className="space-y-4">
                  {userData.trips.map((trip) => (
                    <Card key={trip.id} className="overflow-hidden cyber-card">
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            {trip.from} → {trip.to}
                          </CardTitle>
                          <Badge variant="outline" className="font-bold">
                            {trip.price}
                          </Badge>
                        </div>
                        <CardDescription>{trip.date}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex justify-between items-center">
                        <Badge variant="secondary">{trip.status}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTripDetails(trip.id)}
                        >
                          Ver Detalles
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="payment" className="p-6 mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-4">
                      Métodos de Pago
                    </h3>
                    <div className="space-y-3">
                      {userData.paymentMethods.map((method) => (
                        <Card key={method.id} className="overflow-hidden cyber-card">
                          <CardContent className="p-4 flex justify-between items-center">
                            <div className="flex items-center flex-1">
                              <CreditCard className="h-5 w-5 mr-3" />
                              <div className="flex-1">
                                <p className="font-medium">
                                  {method.type} •••• {method.last4}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Expira {method.expiry}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {method.default && (
                                <Badge className="mr-2">Predeterminado</Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePaymentMethod(method.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full cyber-button"
                    onClick={handleAddPaymentMethod}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Método de Pago
                  </Button>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UserProfileSheet;
