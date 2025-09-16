import { Routes, Route } from 'react-router-dom';
import './App.css';
import AddPattaPage from './pages/AddPattaPage';
import LandingPage from './pages/LandingPage';
import MapPage from './pages/MapPage';
import ViewPattaPage from './pages/ViewPattaPage';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/form" element={<AddPattaPage />} />
        <Route path="/pattas" element={<ViewPattaPage />} />
      </Route>

      {/* Route without Navbar */}
      <Route path="/map/:state" element={<MapPage />} />
    </Routes>
  );
}

export default App;
