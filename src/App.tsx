import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import IndiaMap from './components/IndiaMap';
import AddPattaPage from './pages/AddPattaPage';

const states = [
  { id: 'madhya-pradesh', name: 'Madhya Pradesh' },
  { id: 'tripura', name: 'Tripura' },
  { id: 'odisha', name: 'Odisha' },
  { id: 'telangana', name: 'Telangana' }
];

function HomePage() {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState<string | null>(null);

  if (selectedState) {
    return <IndiaMap state={selectedState} onBack={() => setSelectedState(null)} />;
  }

  return (
    <div className="app">
      <h1>VanNiti</h1>
      <div className="header-actions">
        <button 
          className="add-patta-button"
          onClick={() => navigate('/form')}
        >
          + Add Patta
        </button>
      </div>
      <div className="state-grid">
        {states.map((state) => (
          <button 
            key={state.id}
            className="state-button"
            onClick={() => setSelectedState(state.id)}
          >
            {state.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/form" element={<AddPattaPage />} />
    </Routes>
  );
}

export default App;
