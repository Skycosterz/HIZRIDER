// Ride Matching Service - Backend Integration Layer
// This service handles the matching algorithm for connecting users with nearby drivers/cyclists

export interface Driver {
  id: string;
  name: string;
  rating: number;
  location: {
    lat: number;
    lng: number;
  };
  activity: string;
  photoUrl: string;
  isOnline: boolean;
  phone: string;
  vehicleType: string;
  estimatedArrival: number; // in minutes
}

export interface RideRequest {
  userId: string;
  pickupLocation: {
    lat: number;
    lng: number;
  };
  destinationLocation?: {
    lat: number;
    lng: number;
  };
  activityType?: string;
  maxDistance?: number; // in km
}

export interface MatchResult {
  success: boolean;
  driver?: Driver;
  estimatedArrival?: number;
  estimatedPrice?: number;
  distance?: number;
  error?: string;
}

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate estimated arrival time based on distance
export const calculateETA = (distanceKm: number): number => {
  const averageSpeedKmH = 15; // Average cycling speed
  return Math.ceil((distanceKm / averageSpeedKmH) * 60); // Return minutes
};

// Calculate estimated price based on distance
export const calculatePrice = (distanceKm: number): number => {
  const baseFare = 25; // Base fare in MXN
  const perKmRate = 8; // Rate per km in MXN
  return Math.round(baseFare + distanceKm * perKmRate);
};

// Mock API call to fetch nearby drivers
export const fetchNearbyDrivers = async (
  userLocation: { lat: number; lng: number },
  maxDistance: number = 5
): Promise<Driver[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate mock drivers around user location
  const mockDrivers: Driver[] = [
    {
      id: "driver-1",
      name: "Ana Rodriguez",
      rating: 4.9,
      location: {
        lat: userLocation.lat + (Math.random() - 0.5) * 0.01,
        lng: userLocation.lng + (Math.random() - 0.5) * 0.01,
      },
      activity: "Paseo casual",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
      isOnline: true,
      phone: "+52 55 1234 5678",
      vehicleType: "Bicicleta de montaña",
      estimatedArrival: 0,
    },
    {
      id: "driver-2",
      name: "Carlos Martinez",
      rating: 4.7,
      location: {
        lat: userLocation.lat + (Math.random() - 0.5) * 0.015,
        lng: userLocation.lng + (Math.random() - 0.5) * 0.015,
      },
      activity: "Ruta deportiva",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
      isOnline: true,
      phone: "+52 55 2345 6789",
      vehicleType: "Bicicleta de ruta",
      estimatedArrival: 0,
    },
    {
      id: "driver-3",
      name: "Sofia Lopez",
      rating: 4.8,
      location: {
        lat: userLocation.lat + (Math.random() - 0.5) * 0.02,
        lng: userLocation.lng + (Math.random() - 0.5) * 0.02,
      },
      activity: "Aventura urbana",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia",
      isOnline: true,
      phone: "+52 55 3456 7890",
      vehicleType: "Bicicleta urbana",
      estimatedArrival: 0,
    },
    {
      id: "driver-4",
      name: "Miguel Torres",
      rating: 4.6,
      location: {
        lat: userLocation.lat + (Math.random() - 0.5) * 0.025,
        lng: userLocation.lng + (Math.random() - 0.5) * 0.025,
      },
      activity: "Paseo casual",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel",
      isOnline: Math.random() > 0.3,
      phone: "+52 55 4567 8901",
      vehicleType: "Bicicleta eléctrica",
      estimatedArrival: 0,
    },
    {
      id: "driver-5",
      name: "Laura Hernandez",
      rating: 4.95,
      location: {
        lat: userLocation.lat + (Math.random() - 0.5) * 0.008,
        lng: userLocation.lng + (Math.random() - 0.5) * 0.008,
      },
      activity: "Ruta deportiva",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Laura",
      isOnline: true,
      phone: "+52 55 5678 9012",
      vehicleType: "Bicicleta de montaña",
      estimatedArrival: 0,
    },
  ];

  // Calculate distances and filter by maxDistance
  return mockDrivers
    .filter((driver) => driver.isOnline)
    .map((driver) => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        driver.location.lat,
        driver.location.lng
      );
      return {
        ...driver,
        estimatedArrival: calculateETA(distance),
      };
    })
    .filter((driver) => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        driver.location.lat,
        driver.location.lng
      );
      return distance <= maxDistance;
    })
    .sort((a, b) => a.estimatedArrival - b.estimatedArrival);
};

// Find the best matching driver based on criteria
export const findBestMatch = async (
  request: RideRequest
): Promise<MatchResult> => {
  try {
    const nearbyDrivers = await fetchNearbyDrivers(
      request.pickupLocation,
      request.maxDistance || 5
    );

    if (nearbyDrivers.length === 0) {
      return {
        success: false,
        error: "No hay conductores disponibles en tu área",
      };
    }

    // Filter by activity type if specified
    let filteredDrivers = nearbyDrivers;
    if (request.activityType) {
      filteredDrivers = nearbyDrivers.filter(
        (driver) =>
          driver.activity.toLowerCase() === request.activityType?.toLowerCase()
      );
      // If no drivers match the activity, fall back to all drivers
      if (filteredDrivers.length === 0) {
        filteredDrivers = nearbyDrivers;
      }
    }

    // Select the best driver (closest with highest rating)
    const bestDriver = filteredDrivers.reduce((best, current) => {
      const bestScore = best.rating / (best.estimatedArrival + 1);
      const currentScore = current.rating / (current.estimatedArrival + 1);
      return currentScore > bestScore ? current : best;
    });

    const distance = calculateDistance(
      request.pickupLocation.lat,
      request.pickupLocation.lng,
      bestDriver.location.lat,
      bestDriver.location.lng
    );

    return {
      success: true,
      driver: bestDriver,
      estimatedArrival: bestDriver.estimatedArrival,
      estimatedPrice: calculatePrice(distance),
      distance: Math.round(distance * 100) / 100,
    };
  } catch (error) {
    return {
      success: false,
      error: "Error al buscar conductores. Intenta de nuevo.",
    };
  }
};

// Request a ride and wait for driver acceptance
export const requestRide = async (
  request: RideRequest,
  onStatusUpdate: (status: string, data?: any) => void
): Promise<MatchResult> => {
  onStatusUpdate("searching", { message: "Buscando conductores cercanos..." });

  // Simulate searching delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const matchResult = await findBestMatch(request);

  if (!matchResult.success) {
    onStatusUpdate("error", { message: matchResult.error });
    return matchResult;
  }

  onStatusUpdate("found", {
    message: "Conductor encontrado",
    driver: matchResult.driver,
  });

  // Simulate driver acceptance delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simulate 90% acceptance rate
  const accepted = Math.random() > 0.1;

  if (accepted) {
    onStatusUpdate("accepted", {
      message: "¡Conductor en camino!",
      driver: matchResult.driver,
      eta: matchResult.estimatedArrival,
    });
    return matchResult;
  } else {
    // Try to find another driver
    onStatusUpdate("searching", {
      message: "Buscando otro conductor...",
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Second attempt always succeeds for better UX
    onStatusUpdate("accepted", {
      message: "¡Conductor en camino!",
      driver: matchResult.driver,
      eta: matchResult.estimatedArrival,
    });
    return matchResult;
  }
};

// Update driver location in real-time (simulated)
export const subscribeToDriverLocation = (
  driverId: string,
  userLocation: { lat: number; lng: number },
  onLocationUpdate: (location: { lat: number; lng: number }) => void
): (() => void) => {
  let currentLocation = {
    lat: userLocation.lat + (Math.random() - 0.5) * 0.01,
    lng: userLocation.lng + (Math.random() - 0.5) * 0.01,
  };

  const interval = setInterval(() => {
    // Move driver closer to user
    const latDiff = userLocation.lat - currentLocation.lat;
    const lngDiff = userLocation.lng - currentLocation.lng;

    currentLocation = {
      lat: currentLocation.lat + latDiff * 0.1 + (Math.random() - 0.5) * 0.0002,
      lng: currentLocation.lng + lngDiff * 0.1 + (Math.random() - 0.5) * 0.0002,
    };

    onLocationUpdate(currentLocation);
  }, 2000);

  // Return cleanup function
  return () => clearInterval(interval);
};

// Cancel a ride request
export const cancelRide = async (rideId: string): Promise<boolean> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  return true;
};
