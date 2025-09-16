import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, Rectangle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ArrowLeft, Maximize2, Satellite, Map as MapIcon } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const stateBounds = {
  mp: { 
    bounds: [[21.0, 74.0], [26.5, 82.5]], 
    center: [23.25, 78.25],
    name: 'Madhya Pradesh'
  },
  tripura: { 
    bounds: [[23.0, 91.0], [24.5, 92.5]], 
    center: [23.75, 91.75],
    name: 'Tripura'
  },
  odisha: { 
    bounds: [[17.5, 81.5], [22.5, 87.5]], 
    center: [20.0, 84.5],
    name: 'Odisha'
  },
  telangana: { 
    bounds: [[15.8, 77.0], [19.9, 81.3]], 
    center: [17.85, 79.15],
    name: 'Telangana'
  }
};

// custom 🏠 icon
const pattaIcon = L.divIcon({
  className: 'patta-marker',
  html: '🏠',
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

interface Patta {
  _id: string;
  pattaNumber: string;
  holder: { name: string; fatherName: string; tribe: string };
  location: {
    village: string;
    district: string;
    state: string;
    coordinates: { type: string; coordinates: [number, number] };
    area: { value: number; unit: string };
  };
  status: string;
}

// Component to handle layer changes
const MapLayers = ({ isSatelliteView }: { isSatelliteView: boolean }) => {
  const map = useMap();
  
  useEffect(() => {
    if (isSatelliteView) {
      map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          map.removeLayer(layer);
        }
      });
      
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19,
      }).addTo(map);
    } else {
      map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          map.removeLayer(layer);
        }
      });
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);
    }
  }, [isSatelliteView, map]);

  return null;
};

const MapPage: React.FC = () => {
  const { state } = useParams<{ state: string }>();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [pattas, setPattas] = useState<Patta[]>([]);

  const stateData = state ? stateBounds[state as keyof typeof stateBounds] : null;

  useEffect(() => {
    if (!stateData) {
      navigate('/');
    }
  }, [stateData, navigate]);

  // Fetch pattas for selected state
  useEffect(() => {
    const fetchPattas = async () => {
      try {
        if (!state) return;
        let formattedState = state
        if(state === 'mp')
          formattedState = 'Madhya%20Pradesh'
        if(state === 'tripura')
          formattedState = 'Tripura'
        if(state === 'odisha')
          formattedState = 'Odisha'
        if(state === 'telangana')
          formattedState = 'Telangana'

        const res = await fetch(`http://localhost:5000/api/pattas/state/${formattedState}`);
        const data = await res.json();
        if (data.success) setPattas(data.data);
        console.log(data);
      } catch (err) {
        console.error('Error fetching pattas:', err);
      }
    };
    fetchPattas();
  }, [state]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!stateData) return null;

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-base-300 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="btn btn-ghost btn-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {stateData.name} - Forest Rights Mapping
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsSatelliteView(!isSatelliteView)}
                className="btn btn-outline btn-sm flex items-center gap-1"
                title={isSatelliteView ? 'Switch to Map View' : 'Switch to Satellite View'}
              >
                {isSatelliteView ? (
                  <>
                    <MapIcon className="h-4 w-4" />
                    <span>Map View</span>
                  </>
                ) : (
                  <>
                    <Satellite className="h-4 w-4" />
                    <span>Satellite</span>
                  </>
                )}
              </button>
              <button
                onClick={toggleFullscreen}
                className="btn btn-outline btn-sm flex items-center gap-1"
              >
                <Maximize2 className="h-4 w-4" />
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <div className="relative h-[calc(100vh-4rem)]">
        <MapContainer
          center={stateData.center as [number, number]}
          zoom={7}
          className="w-full h-full"
          zoomControl={true}
        >
          <MapLayers isSatelliteView={isSatelliteView} />
          <Rectangle
            bounds={stateData.bounds as [[number, number], [number, number]]}
            pathOptions={{
              color: '#3B82F6',
              weight: 3,
              opacity: 0.8,
              fillColor: '#3B82F6',
              fillOpacity: 0.1
            }}
          />

          {/* Pattas Markers */}
          {pattas.map((patta) => {
            const [lng, lat] = patta.location.coordinates.coordinates;
            return (
              <Marker
                key={patta._id}
                position={[lat, lng]}
                icon={pattaIcon}
              >
                <Popup>
                  <div>
                    <h4>Patta #{patta.pattaNumber}</h4>
                    <p><b>Holder:</b> {patta.holder.name}</p>
                    <p><b>Village:</b> {patta.location.village}</p>
                    <p><b>Area:</b> {patta.location.area.value} {patta.location.area.unit}</p>
                    <p><b>Status:</b> {patta.status}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Info Panel */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-40">
          <h3 className="font-bold text-lg mb-2">{stateData.name}</h3>
          <p className="text-sm text-gray-600">Showing {pattas.length} pattas</p>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-40">
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
    </div>
  );
};

export default MapPage;
