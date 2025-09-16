// import { useEffect, useState, useRef } from 'react';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// // Fix for default marker icons in Leaflet
// // @ts-ignore
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
//   iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
// });

// // Custom patta marker icon
// const createPattaIcon = () => {
//   return L.divIcon({
//     className: 'patta-marker',
//     html: '🏠',
//     iconSize: [30, 30],
//     iconAnchor: [15, 30],
//     popupAnchor: [0, -30]
//   });
// };

// // Map tile providers
// const tileProviders = {
//   streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
//     attribution: '© OpenStreetMap contributors'
//   }),
//   satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
//     maxZoom: 19,
//     attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
//   })
// };

// // State coordinates and zoom levels (approximate centers)
// const STATE_CONFIG = {
//   'madhya-pradesh': { center: [22.9734, 78.6569], zoom: 7 },
//   'tripura': { center: [23.9408, 91.9882], zoom: 9 },
//   'odisha': { center: [20.9517, 85.0985], zoom: 7 },
//   'telangana': { center: [18.1124, 79.0193], zoom: 7 }
// };

// interface Patta {
//   _id: string;
//   pattaNumber: string;
//   holder: {
//     name: string;
//     fatherName: string;
//     tribe: string;
//   };
//   location: {
//     village: string;
//     district: string;
//     state: string;
//     coordinates: {
//       type: string;
//       coordinates: [number, number];
//     };
//     area: {
//       value: number;
//       unit: string;
//     };
//   };
//   status: string;
// }

// interface IndiaMapProps {
//   state: string;
//   onBack: () => void;
// }

// const IndiaMap = ({ state, onBack }: IndiaMapProps) => {
//   const [pattas, setPattas] = useState<Patta[]>([]);
//   const [selectedPatta, setSelectedPatta] = useState<Patta | null>(null);
//   const mapRef = useRef<L.Map | null>(null);
//   // Fetch pattas when component mounts or state changes
//   useEffect(() => {
//     let isMounted = true;
    
//     const fetchPattas = async () => {
//       try {
//         // Convert state name to match database format (e.g., 'madhya-pradesh' -> 'Madhya Pradesh')
//         const formattedState = state
//           .split('-')
//           .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//           .join(' ');
          
//         const url = `http://localhost:5000/api/pattas/state/${encodeURIComponent(formattedState)}`;
//         console.log('Fetching pattas from:', url);
        
//         const response = await fetch(url);
//         const data = await response.json();
        
//         console.log('API Response:', JSON.stringify(data, null, 2));
        
//         if (isMounted) {
//           if (data.success) {
//             console.log(`Received ${data.data.length} pattas for ${formattedState}:`, data.data);
//             setPattas(data.data);
//           } else {
//             console.error('Error in API response:', data.error || 'Unknown error');
//           }
//         }
//       } catch (error) {
//         console.error('Error fetching pattas:', error);
//       }
//     };

//     fetchPattas();
    
//     return () => {
//       isMounted = false;
//     };
//   }, [state]);

//   // Initialize the map (runs only once on component mount)
//   useEffect(() => {
//     // Only initialize the map if it hasn't been initialized yet
//     if (!mapRef.current) {
//       const map = L.map('map', {
//         center: STATE_CONFIG[state as keyof typeof STATE_CONFIG]?.center as [number, number] || [20.5937, 78.9629],
//         zoom: STATE_CONFIG[state as keyof typeof STATE_CONFIG]?.zoom || 6,
//         zoomControl: false
//       });

//       // Store the map instance in the ref
//       mapRef.current = map;

//       // Add default layer (streets)
//       tileProviders.streets.addTo(map);

//       // Add layer control
//       const baseLayers = {
//         'Streets': tileProviders.streets,
//         'Satellite': tileProviders.satellite
//       };
      
//       L.control.layers(baseLayers).addTo(map);

//       // Add a back button control
//       const backButton = new (L.Control.extend({
//         onAdd: function() {
//           const div = L.DomUtil.create('div', 'back-button');
//           div.innerHTML = '← Back to States';
//           div.onclick = onBack;
//           return div;
//         }
//       }))({ position: 'topleft' as L.ControlPosition });
//       backButton.addTo(map);
//     }

//     // Cleanup function
//     return () => {
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//     };
//   }, [onBack]);

//   // Update patta markers when pattas or state changes
//   useEffect(() => {
//     if (!mapRef.current) return;
    
//     const pattaMarkers: L.Layer[] = [];
    
//     // Clear existing markers
//     mapRef.current.eachLayer((layer: L.Layer) => {
//       if (layer instanceof L.Marker) {
//         mapRef.current?.removeLayer(layer);
//       }
//     });
    
//     // Add new markers
//     console.log('Creating markers for', pattas.length, 'pattas');
//     pattas.forEach((patta, index) => {
//       if (patta.location?.coordinates?.coordinates) {
//         const [lng, lat] = patta.location.coordinates.coordinates;
//         console.log(`Creating marker ${index + 1} at coordinates:`, { lat, lng }, 'for patta:', patta.pattaNumber);
//         const marker = L.marker([lat, lng], { 
//           icon: createPattaIcon(),
//           title: patta.pattaNumber
//         })
//         .bindPopup(`
//           <div class="patta-popup">
//             <h4>Patta #${patta.pattaNumber}</h4>
//             <p><strong>Holder:</strong> ${patta.holder.name}</p>
//             <p><strong>Father's Name:</strong> ${patta.holder.fatherName}</p>
//             <p><strong>Tribe:</strong> ${patta.holder.tribe}</p>
//             <p><strong>Village:</strong> ${patta.location.village}</p>
//             <p><strong>District:</strong> ${patta.location.district}</p>
//             <p><strong>Area:</strong> ${patta.location.area.value} ${patta.location.area.unit}</p>
//             <p><strong>Status:</strong> ${patta.status}</p>
//           </div>
//         `);
        
//         marker.on('mouseover', () => {
//           setSelectedPatta(patta);
//           marker.openPopup();
//         });
        
//         marker.on('mouseout', () => {
//           setSelectedPatta(null);
//           marker.closePopup();
//         });
        
//         try {
//           marker.addTo(mapRef.current!);
//           pattaMarkers.push(marker);
//           console.log(`Successfully added marker for patta ${patta.pattaNumber}`);
//         } catch (error) {
//           console.error(`Error adding marker for patta ${patta.pattaNumber}:`, error);
//         }
//       }
//     });
    
//     // Fit bounds to show all pattas if there are any
//     if (pattaMarkers.length > 0) {
//       const group = new L.FeatureGroup(pattaMarkers);
//       mapRef.current.fitBounds(group.getBounds().pad(0.1));
//     }

//   }, [pattas, state]);

//   const containerStyle: React.CSSProperties = {
//     position: 'relative' as const,
//     width: '100vw',
//     height: '100vh'
//   };

//   const mapStyle: React.CSSProperties = {
//     width: '100%',
//     height: '100%'
//   };

//   const pattaDetailsStyle: React.CSSProperties = {
//     position: 'absolute' as const,
//     bottom: '20px',
//     left: '20px',
//     backgroundColor: 'white',
//     padding: '15px',
//     borderRadius: '8px',
//     boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
//     maxWidth: '300px',
//     zIndex: 1000
//   };

//   return (
//     <div style={containerStyle}>
//       <div id="map" style={mapStyle} />
//       {selectedPatta && (
//         <div className="patta-details" style={pattaDetailsStyle}>
//           <h3>Patta #{selectedPatta.pattaNumber}</h3>
//           <p><strong>Holder:</strong> {selectedPatta.holder.name}</p>
//           <p><strong>Village:</strong> {selectedPatta.location.village}</p>
//           <p><strong>Area:</strong> {selectedPatta.location.area.value} {selectedPatta.location.area.unit}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default IndiaMap;

import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './IndiaMap.css'; // 👈 new CSS file for styling

// Fix Leaflet marker icon issue
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom Patta Icon
const createPattaIcon = () =>
  L.divIcon({
    className: 'patta-marker',
    html: '🏠',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });

const tileProviders = {
  streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }),
  satellite: L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      maxZoom: 19,
      attribution:
        'Tiles © Esri — Source: Esri, USGS, IGN, GIS User Community'
    }
  )
};

const STATE_CONFIG = {
  'madhya-pradesh': { center: [22.9734, 78.6569], zoom: 7 },
  'tripura': { center: [23.9408, 91.9882], zoom: 9 },
  'odisha': { center: [20.9517, 85.0985], zoom: 7 },
  'telangana': { center: [18.1124, 79.0193], zoom: 7 }
};

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

interface IndiaMapProps {
  state: string;
  onBack: () => void;
}

const IndiaMap = ({ state, onBack }: IndiaMapProps) => {
  const [pattas, setPattas] = useState<Patta[]>([]);
  const [selectedPatta, setSelectedPatta] = useState<Patta | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Fetch pattas
  useEffect(() => {
    let isMounted = true;
    const fetchPattas = async () => {
      try {
        const formattedState = state
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

        const url = `http://localhost:5000/api/pattas/state/${encodeURIComponent(
          formattedState
        )}`;
        const response = await fetch(url);
        const data = await response.json();

        if (isMounted && data.success) setPattas(data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPattas();
    return () => {
      isMounted = false;
    };
  }, [state]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('map', {
        center: (STATE_CONFIG[state as keyof typeof STATE_CONFIG]?.center ?? [20.5937, 78.9629]) as [number, number],

        zoom: STATE_CONFIG[state as keyof typeof STATE_CONFIG]?.zoom || 6,
        zoomControl: false
      });
      mapRef.current = map;

      tileProviders.streets.addTo(map);
      L.control.layers({ Streets: tileProviders.streets, Satellite: tileProviders.satellite }).addTo(map);

      // Back button
      const backButton = new (L.Control.extend({
        onAdd: function () {
          const div = L.DomUtil.create('div', 'custom-back-btn');
          div.innerHTML = '← Back';
          div.onclick = onBack;
          return div;
        }
      }))({ position: 'topleft' });
      backButton.addTo(map);
    }
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [onBack, state]);

  // Markers
  useEffect(() => {
    if (!mapRef.current) return;
    const pattaMarkers: L.Layer[] = [];

    mapRef.current.eachLayer(layer => {
      if (layer instanceof L.Marker) mapRef.current?.removeLayer(layer);
    });

    pattas.forEach(patta => {
      if (patta.location?.coordinates?.coordinates) {
        const [lng, lat] = patta.location.coordinates.coordinates;
        const marker = L.marker([lat, lng], {
          icon: createPattaIcon(),
          title: patta.pattaNumber
        }).bindPopup(
          `<div class="popup-card">
            <h4>Patta #${patta.pattaNumber}</h4>
            <p><b>Holder:</b> ${patta.holder.name}</p>
            <p><b>Village:</b> ${patta.location.village}</p>
            <p><b>Area:</b> ${patta.location.area.value} ${patta.location.area.unit}</p>
            <p><b>Status:</b> ${patta.status}</p>
          </div>`
        );
        marker.on('mouseover', () => setSelectedPatta(patta));
        marker.on('mouseout', () => setSelectedPatta(null));
        marker.addTo(mapRef.current!);
        pattaMarkers.push(marker);
      }
    });

    if (pattaMarkers.length > 0) {
      const group = new L.FeatureGroup(pattaMarkers);
      mapRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [pattas]);

  return (
    <div className="map-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">VanNiti</div>
        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">About</a>
        </div>
      </nav>

      {/* Map */}
      <div id="map" className="map" />

      {/* Buttons */}
      <div className="action-buttons">
        <button className="btn-primary">➕ Add Patta</button>
        <button className="btn-secondary">📑 View Pattas</button>
      </div>

      {/* Patta details card */}
      {selectedPatta && (
        <div className="patta-card">
          <h3>Patta #{selectedPatta.pattaNumber}</h3>
          <p><strong>Holder:</strong> {selectedPatta.holder.name}</p>
          <p><strong>Village:</strong> {selectedPatta.location.village}</p>
          <p><strong>Area:</strong> {selectedPatta.location.area.value} {selectedPatta.location.area.unit}</p>
        </div>
      )}
    </div>
  );
};

export default IndiaMap;
