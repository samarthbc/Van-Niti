import { useState } from 'react';
import './AddPattaForm.css';

interface PattaFormData {
  pattaNumber: string;
  holder: {
    name: string;
    fatherName: string;
    tribe: string;
    category: 'Scheduled Tribe' | 'Other Traditional Forest Dweller';
  };
  location: {
    state: string;
    district: string;
    village: string;
    surveyNumber: string;
    coordinates: {
      type: string;
      coordinates: [number, number];
    };
    area: {
      value: number;
      unit: 'acres' | 'hectares';
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
  status: 'active' | 'inactive' | 'pending';
  issuedBy: {
    authority: string;
    designation: string;
    date: string;
  };
}

const AddPattaForm = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState<PattaFormData>({
    pattaNumber: '',
    holder: {
      name: '',
      fatherName: '',
      tribe: '',
      category: 'Scheduled Tribe',
    },
    location: {
      state: '',
      district: '',
      village: '',
      surveyNumber: '',
      coordinates: {
        type: 'Point',
        coordinates: [0, 0],
      },
      area: {
        value: 0,
        unit: 'acres',
      },
      boundaries: {
        north: '',
        south: '',
        east: '',
        west: '',
      },
    },
    rights: [],
    isHeritable: true,
    status: 'active',
    issuedBy: {
      authority: '',
      designation: '',
      date: new Date().toISOString().split('T')[0], // Default to today's date
    },
  });

  const [currentRight, setCurrentRight] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Format the data to match the backend's expected structure
      const formattedData = {
        ...formData,
        location: {
          ...formData.location,
          coordinates: {
            type: 'Point',
            // Ensure coordinates are in [longitude, latitude] order for GeoJSON
            coordinates: [
              parseFloat(formData.location.coordinates.coordinates[1] || 0), // Longitude
              parseFloat(formData.location.coordinates.coordinates[0] || 0)  // Latitude
            ]
          },
          area: {
            value: formData.location.area.value || 0,
            unit: formData.location.area.unit || 'acres'
          },
          boundaries: {
            north: formData.location.boundaries.north || '',
            south: formData.location.boundaries.south || '',
            east: formData.location.boundaries.east || '',
            west: formData.location.boundaries.west || ''
          }
        },
        holder: {
          name: formData.holder.name.trim(),
          fatherName: formData.holder.fatherName.trim(),
          tribe: formData.holder.tribe.trim(),
          category: formData.holder.category
        },
        issuedBy: {
          authority: formData.issuedBy.authority.trim(),
          designation: formData.issuedBy.designation.trim(),
          date: new Date(formData.issuedBy.date)
        },
        rights: formData.rights.filter(right => right.trim() !== '')
      };

      console.log('Submitting data:', JSON.stringify(formattedData, null, 2));

      const response = await fetch('http://localhost:5000/api/pattas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error response:', data);
        throw new Error(data.message || 'Failed to add patta');
      }

      if (data.success) {
        alert('Patta added successfully!');
        onClose();
      } else {
        throw new Error(data.error || 'Failed to add patta');
      }
    } catch (error) {
      console.error('Error adding patta:', error);
      alert('Error adding patta. Please try again.');
    }
  };

  const handleAddRight = () => {
    if (currentRight && !formData.rights.includes(currentRight)) {
      setFormData({
        ...formData,
        rights: [...formData.rights, currentRight],
      });
      setCurrentRight('');
    }
  };

  const handleRemoveRight = (rightToRemove: string) => {
    setFormData({
      ...formData,
      rights: formData.rights.filter((right) => right !== rightToRemove),
    });
  };

  return (
    <div className="modal-overlay">
      <div className="add-patta-form">
        <div className="form-header">
          <h2>Add New Patta</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Patta Details</h3>
            <div className="form-group">
              <label>Patta Number*</label>
              <input
                type="text"
                value={formData.pattaNumber}
                onChange={(e) =>
                  setFormData({ ...formData, pattaNumber: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Holder Information</h3>
            <div className="form-group">
              <label>Name*</label>
              <input
                type="text"
                value={formData.holder.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    holder: { ...formData.holder, name: e.target.value },
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Father's Name*</label>
              <input
                type="text"
                value={formData.holder.fatherName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    holder: { ...formData.holder, fatherName: e.target.value },
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Tribe*</label>
              <input
                type="text"
                value={formData.holder.tribe}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    holder: { ...formData.holder, tribe: e.target.value },
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Category*</label>
              <select
                value={formData.holder.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    holder: {
                      ...formData.holder,
                      category: e.target.value as 'Scheduled Tribe' | 'Other Traditional Forest Dweller',
                    },
                  })
                }
                required
              >
                <option value="Scheduled Tribe">Scheduled Tribe</option>
                <option value="Other Traditional Forest Dweller">
                  Other Traditional Forest Dweller
                </option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Location Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>State*</label>
                <input
                  type="text"
                  value={formData.location.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        state: e.target.value,
                      },
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>District*</label>
                <input
                  type="text"
                  value={formData.location.district}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        district: e.target.value,
                      },
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Village*</label>
                <input
                  type="text"
                  value={formData.location.village}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        village: e.target.value,
                      },
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Survey Number*</label>
                <input
                  type="text"
                  value={formData.location.surveyNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        surveyNumber: e.target.value,
                      },
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h4>Coordinates</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Longitude*</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.location.coordinates.coordinates[0]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          coordinates: {
                            ...formData.location.coordinates,
                            coordinates: [
                              parseFloat(e.target.value) || 0,
                              formData.location.coordinates.coordinates[1],
                            ],
                          },
                        },
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Latitude*</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.location.coordinates.coordinates[1]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          coordinates: {
                            ...formData.location.coordinates,
                            coordinates: [
                              formData.location.coordinates.coordinates[0],
                              parseFloat(e.target.value) || 0,
                            ],
                          },
                        },
                      })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Area</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Value*</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.location.area.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          area: {
                            ...formData.location.area,
                            value: parseFloat(e.target.value) || 0,
                          },
                        },
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Unit*</label>
                  <select
                    value={formData.location.area.unit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          area: {
                            ...formData.location.area,
                            unit: e.target.value as 'acres' | 'hectares',
                          },
                        },
                      })
                    }
                    required
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Boundaries</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>North</label>
                  <input
                    type="text"
                    value={formData.location.boundaries.north}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          boundaries: {
                            ...formData.location.boundaries,
                            north: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>South</label>
                  <input
                    type="text"
                    value={formData.location.boundaries.south}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          boundaries: {
                            ...formData.location.boundaries,
                            south: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>East</label>
                  <input
                    type="text"
                    value={formData.location.boundaries.east}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          boundaries: {
                            ...formData.location.boundaries,
                            east: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>West</label>
                  <input
                    type="text"
                    value={formData.location.boundaries.west}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          boundaries: {
                            ...formData.location.boundaries,
                            west: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Rights</h3>
            <div className="rights-input">
              <input
                type="text"
                value={currentRight}
                onChange={(e) => setCurrentRight(e.target.value)}
                placeholder="Enter a right (e.g., 'Right to cultivate')"
              />
              <button
                type="button"
                onClick={handleAddRight}
                className="add-right-button"
              >
                Add Right
              </button>
            </div>
            <div className="rights-list">
              {formData.rights.map((right, index) => (
                <div key={index} className="right-tag">
                  {right}
                  <button
                    type="button"
                    onClick={() => handleRemoveRight(right)}
                    className="remove-right"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>Additional Information</h3>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isHeritable}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isHeritable: e.target.checked,
                    })
                  }
                />
                Is Heritable
              </label>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'active' | 'inactive' | 'pending',
                  })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Issued By</h3>
            <div className="form-group">
              <label>Authority</label>
              <input
                type="text"
                value={formData.issuedBy.authority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    issuedBy: {
                      ...formData.issuedBy,
                      authority: e.target.value,
                    },
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Designation</label>
              <input
                type="text"
                value={formData.issuedBy.designation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    issuedBy: {
                      ...formData.issuedBy,
                      designation: e.target.value,
                    },
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Issue Date</label>
              <input
                type="date"
                value={formData.issuedBy.date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    issuedBy: {
                      ...formData.issuedBy,
                      date: e.target.value,
                    },
                  })
                }
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Add Patta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPattaForm;
