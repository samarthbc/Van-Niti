import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Do not render Navbar on MapPage (path starts with "/map/")
  if (location.pathname.startsWith('/map/')) {
    return null;
  }

  return (
    <header className="bg-white/30 backdrop-blur-md border-b border-white/30 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
            {/* Left: Logo */}
            <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold font-heading text-gray-900">Van-Niti</h1>
            </div>

            {/* Center: Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
                <button onClick={() => navigate('/')} className="text-gray-700 hover:text-primary font-medium">
                Home
                </button>
                <button onClick={() => navigate('/form')} className="text-gray-700 hover:text-primary font-medium">
                Add Patta
                </button>
                <button onClick={() => navigate('/pattas')} className="text-gray-700 hover:text-primary font-medium">
                View Patta
                </button>
                <button onClick={() => navigate('#')} className="text-gray-700 hover:text-primary font-medium">
                About
                </button>
            </nav>

            {/* Right: Empty for now */}
            <div></div>
            </div>
        </div>
    </header>
  );
};

export default Navbar;
