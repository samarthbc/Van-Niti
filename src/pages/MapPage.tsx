import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapIcon, Satellite, Maximize2 } from "lucide-react";
import IndividualMap from "../components/IndividualMap";
import CommunityMap from "../components/CommunityMap";

const MapPage = () => {
  const navigate = useNavigate();
  const { state } = useParams();
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("individual");

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed h-screen w-full flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-base-300 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="btn btn-ghost btn-sm"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {state?.toUpperCase()} – Forest Rights Mapping
              </h1>
            </div>
            <div className="flex gap-4">
              {/* Satellite toggle */}
              <button
                onClick={() => setIsSatelliteView(!isSatelliteView)}
                className="btn btn-outline btn-sm flex items-center gap-1"
                title={
                  isSatelliteView
                    ? "Switch to Map View"
                    : "Switch to Satellite View"
                }
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

              {/* Fullscreen toggle */}
              <button
                onClick={toggleFullscreen}
                className="btn btn-outline btn-sm flex items-center gap-1"
              >
                <Maximize2 className="h-4 w-4" />
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-gray-100 border-b border-base-300 px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("individual")}
            className={`px-4 py-2 text-sm font-medium rounded-t-md ${
              activeTab === "individual"
                ? "bg-white border border-b-0 border-base-300"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Individual
          </button>
          <button
            onClick={() => setActiveTab("community")}
            className={`px-4 py-2 text-sm font-medium rounded-t-md ${
              activeTab === "community"
                ? "bg-white border border-b-0 border-base-300"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Community
          </button>
        </div>
      </div>

      {/* Map Content */}
      <div className="flex-1 relative">
        {activeTab === "individual" ? (
          <IndividualMap stateName={(state ?? "").toLowerCase()} isSatelliteView={isSatelliteView} />
        ) : (
          <CommunityMap stateName={(state ?? "").toLowerCase()} isSatelliteView={isSatelliteView} />
        )}
      </div>
    </div>
  );
};

export default MapPage;
