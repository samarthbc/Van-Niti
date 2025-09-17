import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, MapPin, Users, Shield } from 'lucide-react';

const states = [
  {
    name: 'Madhya Pradesh',
    code: 'mp',
    description: 'Central India state with rich forest resources',
    color: 'from-blue-500 to-blue-600',
    stats: { villages: '1,245', pattas: '8,950' }
  },
  {
    name: 'Tripura',
    code: 'tripura',
    description: 'Northeastern state with diverse tribal communities',
    color: 'from-green-500 to-green-600',
    stats: { villages: '892', pattas: '5,670' }
  },
  {
    name: 'Odisha',
    code: 'odisha',
    description: 'Eastern coastal state with significant forest cover',
    color: 'from-purple-500 to-purple-600',
    stats: { villages: '2,156', pattas: '12,340' }
  },
  {
    name: 'Telangana',
    code: 'telangana',
    description: 'Southern state with modern forest management',
    color: 'from-orange-500 to-orange-600',
    stats: { villages: '1,678', pattas: '9,880' }
  }
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStateClick = (stateCode: string) => {
    navigate(`/map/${stateCode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">      
      {/* Background Image */}
      <div 
        className="absolute inset-0 -z-10 h-6/7 bg-cover bg-center rounded-b-[50%] shadow-lg"
        style={{ 
          backgroundImage: "url('https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg')", 
          backgroundAttachment: "fixed"
        }}
      />
      <div className="absolute inset-0 -z-10 bg-white/50 rounded-b-[50%]" />
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 font-heading" >
            Van-Niti
            <span className="text-primary block">FRA Patta Management</span>
          </h2>
          <p className="text-xl text-black mb-8 max-w-2xl mx-auto font-serif">
            Digital platform for managing Forest Rights Act pattas across Indian states. 
            Select a state below to explore detailed mapping and patta information.
          </p>
        </div>
      </section>

      {/* State Cards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold font-sans text-gray-900 mb-4">Select a State</h3>
            <p className="text-gray-600 font-sans">Click on any state card to view detailed mapping and patta data</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {states.map((state) => (
              <div
                key={state.code}
                onClick={() => handleStateClick(state.code)}
                className="card bg-white shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 rounded-xl border border-black"
              >
                <div className={`h-32 bg-gradient-to-r ${state.color} rounded-t-xl flex items-center justify-center`}>
                  <MapPin className="h-12 w-12 text-white" />
                </div>
                <div className="card-body p-6">
                  <h4 className="card-title text-lg font-bold text-gray-900 mb-2">
                    {state.name}
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">
                    {state.description}
                  </p>
                  <div className="card-actions justify-end mt-4">
                    <button className="btn btn-primary btn-sm">
                      View Map
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-base-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold text-gray-900">Key Features</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-4 bg-primary rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Map className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold mb-2">Interactive Maps</h4>
              <p className="text-gray-600">Detailed state-wise mapping with boundary visualization</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-secondary rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold mb-2">Patta Management</h4>
              <p className="text-gray-600">Comprehensive database of Forest Rights Act pattas</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-accent rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold mb-2">Secure Access</h4>
              <p className="text-gray-600">Protected admin dashboard with authentication</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2025 Van-Niti. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;