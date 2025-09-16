import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Patta = {
  _id: string;
  pattaNumber: string;
  holder: {
    name: string;
    fatherName: string;
    tribe: string;
    category: string;
  };
  location: {
    village: string;
    district: string;
    state: string;
    surveyNumber: string;
    area: {
      value: number;
      unit: string;
    };
    boundaries: {
      north: string;
      south: string;
      east: string;
      west: string;
    };
  };
  rights: string[];
  isHeritable: boolean;
  isTransferable: boolean;
  status: string;
  documents: {
    name: string;
    url: string;
    _id: string;
  }[];
};

const allowedStates = ['Odisha', 'Madhya Pradesh', 'Tripura', 'Telangana'];

const ViewPattaPage: React.FC = () => {
  const [pattas, setPattas] = useState<Patta[]>([]);
  const [filteredState, setFilteredState] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPattas = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/pattas');
        setPattas(res.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch pattas');
      } finally {
        setLoading(false);
      }
    };

    fetchPattas();
  }, []);

  const filteredPattas =
    filteredState === 'all'
      ? pattas.filter(p => allowedStates.includes(p.location.state))
      : pattas.filter(p => p.location.state === filteredState);

  return (
    <div className="min-h-screen bg-base-100">
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">View FRA Pattas</h2>

          <select
            value={filteredState}
            onChange={(e) => setFilteredState(e.target.value)}
            className="select select-bordered w-full max-w-xs"
          >
            <option value="all">All States</option>
            {allowedStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {loading && <p className="text-gray-600">Loading pattas...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPattas.map((patta) => (
              <div key={patta._id} className="border border-base-300 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Patta #{patta.pattaNumber}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        patta.status === 'Approved'
                          ? 'bg-green-100 text-green-600'
                          : patta.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {patta.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">
                    <strong>Holder:</strong> {patta.holder.name} (Father: {patta.holder.fatherName})
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Village:</strong> {patta.location.village}, {patta.location.district}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Survey No:</strong> {patta.location.surveyNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Area:</strong> {patta.location.area.value} {patta.location.area.unit}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Rights:</strong> {patta.rights.join(', ') || 'N/A'}
                  </p>

                  {/* Documents */}
                  {patta.documents.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-1">Documents:</h4>
                      <ul className="space-y-1">
                        {patta.documents.map((doc) => (
                          <li key={doc._id}>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4" />
                              {doc.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredPattas.length === 0 && (
              <p className="text-gray-500 col-span-full">No pattas found for selected state.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewPattaPage;
