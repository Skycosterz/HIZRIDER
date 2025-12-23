import { Suspense, useState, useEffect } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "@/components/home";
import BicycleCatalog from "@/components/BicycleCatalog";
import Community from "@/components/Community";
import ActivityDetails from "@/components/RideDetails";
import ConnectCyclistsMap from "@/components/ConnectCyclistsMap";

// Tempo routes component that handles dynamic import
function TempoRoutes() {
  const [routes, setRoutes] = useState<any[]>([]);

  useEffect(() => {
    // @ts-ignore - tempo-routes is provided by Tempo environment
    import("tempo-routes").then((module) => {
      setRoutes(module.default);
    }).catch(() => {
      // Silently fail if not in Tempo environment
    });
  }, []);

  return useRoutes(routes);
}

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bicycles" element={<BicycleCatalog />} />
          <Route path="/community" element={<Community />} />
          <Route path="/ride-details" element={<ActivityDetails />} />
          <Route path="/connect-cyclists" element={<ConnectCyclistsMap />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && <TempoRoutes />}
      </>
    </Suspense>
  );
}

export default App;
