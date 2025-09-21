import { useState, useRef } from 'react';
import { processPattaOcr } from '../utils/pattaUtils';

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
  const [isUploading, setIsUploading] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      date: new Date().toISOString().split('T')[0],
    },
  });

  const [currentRight, setCurrentRight] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);

    try {
      const response = await fetch('http://localhost:5000/api/ocr/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to process image');

      const result = await response.json();
      setOcrResult(result);

      if (result) {
        const mappedData = await processPattaOcr(result);
        setFormData(mappedData);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...formData,
        location: {
          ...formData.location,
          coordinates: {
            type: 'Point',
            coordinates: [
              Number(formData.location.coordinates.coordinates[0]) || 0,
              Number(formData.location.coordinates.coordinates[1]) || 0,
            ],
          },
        },
        rights: formData.rights.filter(r => r.trim() !== ''),
      };

      const response = await fetch('http://localhost:5000/api/pattas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to add patta');

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
      setFormData({ ...formData, rights: [...formData.rights, currentRight] });
      setCurrentRight('');
    }
  };

  const handleRemoveRight = (rightToRemove: string) => {
    setFormData({
      ...formData,
      rights: formData.rights.filter(right => right !== rightToRemove),
    });
  };

  return (
    <div className="p-4">
      <div className="bg-white">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Add New Patta</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-2xl">&times;</button>
        </div>

        {/* Upload Section */}
        <div className="p-4">
          <h3 className="text-lg font-medium mb-2">Upload Patta Document</h3>
          <div
            className="border-2 border-dashed border-gray-300 p-6 rounded-lg cursor-pointer text-center hover:bg-gray-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            {isUploading ? (
              <p className="text-gray-500">Processing image...</p>
            ) : (
              <>
                <p className="text-gray-700">Click to upload an image of your patta document</p>
                <p className="text-xs text-gray-500">Supports JPG, PNG (Max 2MB)</p>
              </>
            )}
          </div>
          {ocrResult && (
            <div className="mt-4 bg-gray-50 p-3 rounded-lg text-sm overflow-auto max-h-40">
              <h4 className="font-medium">Extracted Information:</h4>
              <pre className="text-xs">{JSON.stringify(ocrResult, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Patta Details */}
          <div>
            <h3 className="font-semibold mb-2">Patta Details</h3>
            <input
              type="text"
              placeholder="Patta Number"
              value={formData.pattaNumber}
              onChange={(e) => setFormData({ ...formData, pattaNumber: e.target.value })}
              required
              className="w-full border rounded p-2"
            />
          </div>

          {/* Holder Info */}
          <div>
            <h3 className="font-semibold mb-2">Holder Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Name"
                value={formData.holder.name}
                onChange={(e) => setFormData({ ...formData, holder: { ...formData.holder, name: e.target.value } })}
                className="border rounded p-2"
                required
              />
              <input
                type="text"
                placeholder="Father's Name"
                value={formData.holder.fatherName}
                onChange={(e) => setFormData({ ...formData, holder: { ...formData.holder, fatherName: e.target.value } })}
                className="border rounded p-2"
                required
              />
              <input
                type="text"
                placeholder="Tribe"
                value={formData.holder.tribe}
                onChange={(e) => setFormData({ ...formData, holder: { ...formData.holder, tribe: e.target.value } })}
                className="border rounded p-2"
                required
              />
              <select
                value={formData.holder.category}
                onChange={(e) =>
                  setFormData({ ...formData, holder: { ...formData.holder, category: e.target.value as any } })
                }
                className="border rounded p-2"
                required
              >
                <option value="Scheduled Tribe">Scheduled Tribe</option>
                <option value="Other Traditional Forest Dweller">Other Traditional Forest Dweller</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-semibold mb-2">Location Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="State"
                value={formData.location.state}
                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, state: e.target.value } })}
                className="border rounded p-2"
                required
              />
              <input
                type="text"
                placeholder="District"
                value={formData.location.district}
                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, district: e.target.value } })}
                className="border rounded p-2"
                required
              />
              <input
                type="text"
                placeholder="Village"
                value={formData.location.village}
                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, village: e.target.value } })}
                className="border rounded p-2"
                required
              />
              <input
                type="text"
                placeholder="Survey Number"
                value={formData.location.surveyNumber}
                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, surveyNumber: e.target.value } })}
                className="border rounded p-2"
                required
              />
            </div>
          </div>

          {/* Rights */}
          <div>
            <h3 className="font-semibold mb-2">Rights</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentRight}
                onChange={(e) => setCurrentRight(e.target.value)}
                placeholder="Enter a right"
                className="flex-1 border rounded p-2"
              />
              <button type="button" onClick={handleAddRight} className="bg-blue-600 text-white px-3 rounded">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.rights.map((right, index) => (
                <span key={index} className="bg-gray-200 px-2 py-1 rounded flex items-center">
                  {right}
                  <button
                    type="button"
                    onClick={() => handleRemoveRight(right)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Issued By */}
          <div>
            <h3 className="font-semibold mb-2">Issued By</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Authority"
                value={formData.issuedBy.authority}
                onChange={(e) => setFormData({ ...formData, issuedBy: { ...formData.issuedBy, authority: e.target.value } })}
                className="border rounded p-2"
                required
              />
              <input
                type="text"
                placeholder="Designation"
                value={formData.issuedBy.designation}
                onChange={(e) => setFormData({ ...formData, issuedBy: { ...formData.issuedBy, designation: e.target.value } })}
                className="border rounded p-2"
                required
              />
              <input
                type="date"
                value={formData.issuedBy.date}
                onChange={(e) => setFormData({ ...formData, issuedBy: { ...formData.issuedBy, date: e.target.value } })}
                className="border rounded p-2"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border border-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">
              Add Patta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPattaForm;
