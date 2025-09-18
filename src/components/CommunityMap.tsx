import { useEffect, useState } from "react";
import { MapContainer, Polygon, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ========== Types ==========
interface RecommendedScheme {
  id: string;
  name: string;
  ministry: string;
  focusArea: string;
  description: string;
  score: number;
}

interface Village {
  _id: string;
  village: string;
  district: string;
  state: string;
  population: number;
  povertyRatio: number;
  literacyRate: number;
  malnutritionRate: number;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  recommendedSchemes?: RecommendedScheme[];
}

// ========== Props ==========
interface MapLayersProps {
  isSatelliteView: boolean;
}

interface CommunityMapProps {
  stateName: keyof typeof stateBounds;
  isSatelliteView: boolean;
}

// ========== State bounds ==========
const stateBounds = {
  mp: {
    bounds: [[21.0, 74.0], [26.5, 82.5]] as [number, number][],
    center: [23.25, 78.25] as [number, number],
    name: "Madhya Pradesh",
  },
  tripura: {
    bounds: [[23.0, 91.0], [24.5, 92.5]] as [number, number][],
    center: [23.75, 91.75] as [number, number],
    name: "Tripura",
  },
  odisha: {
    bounds: [[17.5, 81.5], [22.5, 87.5]] as [number, number][],
    center: [20.0, 84.5] as [number, number],
    name: "Odisha",
  },
  telangana: {
    bounds: [[15.8, 77.0], [19.9, 81.3]] as [number, number][],
    center: [17.85, 79.15] as [number, number],
    name: "Telangana",
  },
};

// ========== Layers ==========
const MapLayers = ({ isSatelliteView }: MapLayersProps) => {
  const map = useMap();

  useEffect(() => {
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) map.removeLayer(layer);
    });

    if (isSatelliteView) {
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19 }
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

// ========== CommunityMap ==========
const CommunityMap = ({ stateName, isSatelliteView }: CommunityMapProps) => {
  const [villages, setVillages] = useState<Village[]>([]);
  const stateData = stateBounds[stateName];

  useEffect(() => {
    if (!stateName) return;

    const mappedState = stateData?.name || stateName;
    const encodedState = encodeURIComponent(mappedState);

    fetch(`http://localhost:5000/api/resources?state=${encodedState}`)
      .then((res) => res.json())
      .then((data) => setVillages(data.data || []))
      .catch((err) => console.error(err));
  }, [stateName, stateData]);

  const createPolygon = (
    lat: number,
    lng: number,
    radius = 0.2,
    sides = 12
  ): [number, number][] => {
    const coords: [number, number][] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides;
      coords.push([lat + radius * Math.cos(angle), lng + radius * Math.sin(angle)]);
    }
    return coords;
  };

  const getColor = (povertyRatio: number) => {
    if (povertyRatio > 60) return "#d73027";
    if (povertyRatio > 40) return "#fc8d59";
    if (povertyRatio > 20) return "#fee08b";
    return "#91cf60";
  };

  return (
    <>
      <MapContainer
        center={stateData.center}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
      >
        <MapLayers isSatelliteView={isSatelliteView} />
        {villages.map((v) => {
          const [lng, lat] = v.location.coordinates;
          const polygon = createPolygon(lat, lng);

          return (
            <Polygon
              key={v._id}
              positions={polygon}
              pathOptions={{
                color: getColor(v.povertyRatio),
                fillColor: getColor(v.povertyRatio),
                fillOpacity: 0.5,
              }}
            >
              <Popup maxWidth={300} minWidth={250}>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  <h3 className="font-bold text-lg">{v.village}</h3>
                  <p><b>Population:</b> {v.population}</p>
                  <p><b>Poverty:</b> {v.povertyRatio}%</p>
                  <p><b>District:</b> {v.district}</p>
                  <p><b>Literacy:</b> {v.literacyRate}%</p>
                  <p><b>Malnutrition:</b> {v.malnutritionRate}%</p>

                  <h4 className="text-md font-semibold mt-2">Recommended Schemes</h4>
                  {v.recommendedSchemes?.length ? (
                    <ul className="space-y-2">
                      {v.recommendedSchemes.map((scheme) => (
                        <li key={scheme.id} className="p-2 border rounded bg-gray-50">
                          <p className="font-semibold">{scheme.name}</p>
                          <p className="text-gray-600 text-sm">{scheme.focusArea}</p>
                          <p className="text-xs text-gray-500">{scheme.ministry}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No schemes available</p>
                  )}
                </div>
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-400">
        <h4 className="font-semibold mb-2">Legend</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#d73027" }}></div>
            <span>Poverty {'>'} 60%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#fc8d59" }}></div>
            <span>Poverty 41-60%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#fee08b" }}></div>
            <span>Poverty 21-40%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#91cf60" }}></div>
            <span>Poverty ≤ 20%</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommunityMap;
