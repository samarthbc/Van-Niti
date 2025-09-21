import { useEffect, useState } from "react";
import { MapContainer, Rectangle, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Patta {
  _id: string;
  pattaNumber: string;
  status: string;
  holder: {
    name: string;
  };
  location: {
    village: string;
    area: {
      value: number;
      unit: string;
    };
    coordinates: {
      type: "Point";
      coordinates: [number, number]; // [lng, lat]
    };
  };
  recommendedSchemes?: {
    name: string;
    description: string;
  }[];
}

const stateBounds = {
  mp: {
    bounds: [[21.0, 74.0], [26.5, 82.5]],
    center: [23.25, 78.25],
    name: "Madhya Pradesh",
  },
  tripura: {
    bounds: [[23.0, 91.0], [24.5, 92.5]],
    center: [23.75, 91.75],
    name: "Tripura",
  },
  odisha: {
    bounds: [[17.5, 81.5], [22.5, 87.5]],
    center: [20.0, 84.5],
    name: "Odisha",
  },
  telangana: {
    bounds: [[15.8, 77.0], [19.9, 81.3]],
    center: [17.85, 79.15],
    name: "Telangana",
  },
};

// custom 🏠 icon
const pattaIcon = L.divIcon({
  className: "patta-marker",
  html: "🏠",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// Satellite / OSM layers
const MapLayers = ({ isSatelliteView }: { isSatelliteView: boolean }) => {
  const map = useMap();

  useEffect(() => {
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) map.removeLayer(layer);
    });

    if (isSatelliteView) {
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye",
          maxZoom: 19,
        }
      ).addTo(map);
    } else {
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
    }
  }, [isSatelliteView, map]);

  return null;
};

type StateKey = keyof typeof stateBounds;

interface IndividualMapProps {
  stateName: StateKey;
  isSatelliteView: boolean;
}

const IndividualMap = ({ stateName, isSatelliteView }: IndividualMapProps) => {
  const [pattas, setPattas] = useState<Patta[]>([]);

  const stateData = stateBounds[stateName];

  useEffect(() => {
    if (!stateName) return;
    const fetchPattas = async () => {
      try {
        let formattedState = stateData?.name || stateName;
        if (formattedState === "Madhya Pradesh")
          formattedState = "Madhya%20Pradesh";

        const res = await fetch(
          `http://localhost:5000/api/pattas/state/${formattedState}/recommendations`
        );
        const data = await res.json();
        if (data.success) setPattas(data.data);
      } catch (err) {
        console.error("Error fetching pattas:", err);
      }
    };
    fetchPattas();
  }, [stateName, stateData]);

  if (!stateData) return <div className="p-4">State not found.</div>;

  return (
    <div className="h-screen w-full relative">
      <MapContainer
        center={stateData.center}
        zoom={7}
        className="w-full h-full"
        zoomControl={true}
      >
        <MapLayers isSatelliteView={isSatelliteView} />
        <Rectangle
          bounds={stateData.bounds}
          pathOptions={{
            color: "#3B82F6",
            weight: 3,
            opacity: 0.8,
            fillColor: "#3B82F6",
            fillOpacity: 0.1,
          }}
        />

        {/* Pattas */}
        {pattas.map((patta) => {
          const [lng, lat] = patta.location.coordinates.coordinates;
          return (
            <Marker key={patta._id} position={[lat, lng]} icon={pattaIcon}>
                <Popup>
                    <div>
                    <h4 className="font-bold">Patta #{patta.pattaNumber}</h4>
                    <p>
                        <b>Holder:</b> {patta.holder.name}
                    </p>
                    <p>
                        <b>Village:</b> {patta.location.village}
                    </p>
                    <p>
                        <b>Area:</b> {patta.location.area.value} {patta.location.area.unit}
                    </p>
                    <p>
                        <b>Status:</b> {patta.status}
                    </p>

                    {/* Recommended Schemes */}
                    {patta.recommendedSchemes && patta.recommendedSchemes.length > 0 && (
                        <div className="mt-3">
                        <h5 className="font-semibold">Recommended Schemes:</h5>
                        <ul className="list-disc pl-5 text-sm">
                            {patta.recommendedSchemes.map((scheme, idx) => (
                            <li key={idx}>
                                <b>{scheme.name}</b>: {scheme.description}
                            </li>
                            ))}
                        </ul>
                        </div>
                    )}
                    </div>
                </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Info Panel */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-400">
        <h3 className="font-bold text-lg mb-2">{stateData.name}</h3>
        <p className="text-sm text-gray-600">Showing {pattas.length} pattas</p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-30 left-4 bg-white rounded-lg shadow-lg p-4 z-400">
        <h4 className="font-semibold mb-2">Legend</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-2 bg-primary bg-opacity-20 border-2 border-primary rounded"></div>
            <span>State Boundary</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🏠</span>
            <span>Patta Location</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualMap;
