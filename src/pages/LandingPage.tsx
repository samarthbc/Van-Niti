import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, MapPin, Users, Shield } from 'lucide-react';

const states = [
  {
    name: 'Madhya Pradesh',
    code: 'mp',
    description: 'Central India state with rich forest resources',
    color: 'from-blue-500 to-blue-600',
    stats: { villages: '1,245', pattas: '8,950' },
    img: "./mp.webp"
  },
  {
    name: 'Tripura',
    code: 'tripura',
    description: 'Northeastern state with diverse tribal communities',
    color: 'from-green-500 to-green-600',
    stats: { villages: '892', pattas: '5,670' },
    img: "./tripura.webp"
  },
  {
    name: 'Odisha',
    code: 'odisha',
    description: 'Eastern coastal state with significant forest cover',
    color: 'from-purple-500 to-purple-600',
    stats: { villages: '2,156', pattas: '12,340' },
    img: "./odissa.webp"
  },
  {
    name: 'Telangana',
    code: 'telangana',
    description: 'Southern state with modern forest management',
    color: 'from-orange-500 to-orange-600',
    stats: { villages: '1,678', pattas: '9,880' },
    img: "./telangana.webp"
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
          backgroundImage: "url('https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg?auto=compress&cs=tinysrgb&w=1600')", 
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
      <section className="py-20 px-6 bg-gradient-to-b from-base-200 to-base-100 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Key Features
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore how <span className="text-primary font-semibold">Van-Niti </span> 
              empowers communities and administrators with secure, data-driven tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="card bg-white shadow-md hover:shadow-xl transition rounded-2xl p-8 text-center border border-gray-200">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-primary/90 rounded-2xl shadow-inner">
                  <Map className="h-10 w-10 text-black" />
                </div>
              </div>
              <h4 className="text-xl font-bold mb-3">Interactive Maps</h4>
              <p className="text-gray-600 leading-relaxed">
                Explore <span className="font-semibold">community & individual maps </span> 
                with zoomable, interactive views of FRA villages and pattas.
              </p>
            </div>

            <div className="card bg-white shadow-md hover:shadow-xl transition rounded-2xl p-8 text-center border border-gray-200">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-secondary/90 rounded-2xl shadow-inner">
                  <Users className="h-10 w-10 text-black" />
                </div>
              </div>
              <h4 className="text-xl font-bold mb-3">Patta OCR</h4>
              <p className="text-gray-600 leading-relaxed">
                Upload and <span className="font-semibold">digitize pattas </span> 
                using OCR technology for faster and accurate record-keeping.
              </p>
            </div>

            <div className="card bg-white shadow-md hover:shadow-xl transition rounded-2xl p-8 text-center border border-gray-200">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-accent/90 rounded-2xl shadow-inner">
                  <Shield className="h-10 w-10 text-black" />
                </div>
              </div>
              <h4 className="text-xl font-bold mb-3">Decision Support</h4>
              <p className="text-gray-600 leading-relaxed">
                Intelligent <span className="font-semibold">DSS recommends schemes </span> 
                for communities based on FRA patta and village data.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-300 py-12 mt-12 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          <div>
            <h5 className="text-lg font-bold text-white mb-3">Van-Niti</h5>
            <p className="text-sm leading-relaxed">
              Empowering communities with <span className="font-semibold">digital access </span> 
              to Forest Rights Act data and mapping.
            </p>
          </div>

          <div>
            <h5 className="text-lg font-bold text-white mb-3">Quick Links</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary transition">Home</a></li>
              <li><a href="#" className="hover:text-primary transition">States</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-lg font-bold text-white mb-3">Contact</h5>
            <p className="text-sm">Email: support@vanniti.org</p>
            <p className="text-sm">Phone: +91 98765 43210</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Van-Niti. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;