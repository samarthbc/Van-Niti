import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const pageSize = 6; // backend limit

  // Fetch pattas with filters + pagination
  const fetchPattas = async (page: number, state: string) => {
    try {
      setLoading(true);
      setError(null);

      const params: { page: number; limit: number; state?: string } = { page, limit: pageSize };
      if (state !== 'all') params.state = state;

      const res = await axios.get('http://localhost:5000/api/pattas', { params });

      setPattas(res.data.data);
      setTotalPages(res.data.pages);
      setCurrentPage(res.data.page);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch pattas');
    } finally {
      setLoading(false);
    }
  };

  // Load pattas when page or filter changes
  useEffect(() => {
    fetchPattas(currentPage, filteredState);
  }, [currentPage, filteredState]);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredState]);

  return (
    <div className="min-h-screen bg-base-100 pt-12">
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pattas.map((patta) => (
                <div
                  key={patta._id}
                  className="border border-base-300 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-800">
                        Patta #{patta.pattaNumber}
                      </h3>
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
                      <strong>Holder:</strong> {patta.holder.name} (Father:{' '}
                      {patta.holder.fatherName})
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Village:</strong> {patta.location.village},{' '}
                      {patta.location.district}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Survey No:</strong> {patta.location.surveyNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Area:</strong> {patta.location.area.value}{' '}
                      {patta.location.area.unit}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Rights:</strong> {patta.rights.join(', ') || 'N/A'}
                    </p>

                    {/* Documents */}
                    {patta.documents.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">
                          Documents:
                        </h4>
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

              {pattas.length === 0 && (
                <p className="text-gray-500 col-span-full">
                  No pattas found for selected state.
                </p>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {/* Prev Button */}
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-sm flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={16}/>
                </button>

                {/* Page Numbers with limited display */}
                {(() => {
                  const maxVisible = 6;
                  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                  let end = start + maxVisible - 1;

                  if (end > totalPages) {
                    end = totalPages;
                    start = Math.max(1, end - maxVisible + 1);
                  }

                  const pages = [];
                  if (start > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => setCurrentPage(1)}
                        className={`btn btn-sm ${currentPage === 1 ? 'btn-primary' : 'btn-ghost'}`}
                      >
                        1
                      </button>
                    );
                    if (start > 2) {
                      pages.push(<span key="start-ellipsis">...</span>);
                    }
                  }

                  for (let i = start; i <= end; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`btn btn-sm ${
                          i === currentPage ? 'btn-primary font-extrabold rounded-full bg-gray-300 px-1' : 'btn-ghost'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }

                  if (end < totalPages) {
                    if (end < totalPages - 1) {
                      pages.push(<span key="end-ellipsis">...</span>);
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        className={`btn btn-sm ${
                          currentPage === totalPages ? 'btn-primary font-bold border' : 'btn-ghost'
                        }`}
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return pages;
                })()}

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn btn-sm flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRight size={16}/>
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ViewPattaPage;
