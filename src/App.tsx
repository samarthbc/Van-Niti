import { Routes, Route } from 'react-router-dom';
import './App.css';
import AddPattaPage from './pages/AddPattaPage';
import LandingPage from './pages/LandingPage';
import MapPage from './pages/MapPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/form" element={<AddPattaPage />} />
      <Route path="/map/:state" element={<MapPage />} />
    </Routes>
  );
}

export default App;
