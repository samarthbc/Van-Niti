import { useState } from 'react';
import './App.css';
import IndiaMap from './components/IndiaMap';

const states = [
  { id: 'madhya-pradesh', name: 'Madhya Pradesh' },
  { id: 'tripura', name: 'Tripura' },
  { id: 'odisha', name: 'Odisha' },
  { id: 'telangana', name: 'Telangana' }
];

function App() {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  if (selectedState) {
    return <IndiaMap state={selectedState} onBack={() => setSelectedState(null)} />;
  }

  return (
    <div className="app">
      <h1>VanNiti</h1>
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

export default App;
