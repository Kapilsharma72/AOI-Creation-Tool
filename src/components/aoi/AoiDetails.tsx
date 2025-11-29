// src/components/aoi/AoiDetails.tsx
import { useState, useEffect } from 'react';
import { X, Save, Ruler, Calendar, MapPin, Edit2 } from 'lucide-react';
import type { Aoi } from '../../types/aoi';
import { calculateArea } from '../../utils/geoUtils';

interface AoiDetailsProps {
  aoi: Aoi | null;
  onClose: () => void;
  onSave: (aoi: Aoi) => void;
}

export default function AoiDetails({ aoi, onClose, onSave }: AoiDetailsProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Aoi>>({});

  useEffect(() => {
    if (aoi) {
      setFormData(aoi);
      setEditing(false);
    }
  }, [aoi]);

  if (!aoi) return null;

  const area = calculateArea(aoi.geometry);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...aoi, ...formData });
    setEditing(false);
  };

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">AOI Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label="Close details"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              aria-label="AOI name"
              aria-required="true"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Save className="inline-block h-4 w-4 mr-1" />
              Save
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Name</h4>
            <p className="mt-1 text-gray-900">{aoi.name}</p>
          </div>
          {aoi.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="mt-1 text-gray-900">{aoi.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="flex items-center text-sm font-medium text-gray-500">
                <Ruler className="h-4 w-4 mr-1" />
                Area
              </h4>
              <p className="mt-1 text-gray-900">
                {area.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{' '}
                m²
              </p>
            </div>
            <div>
              <h4 className="flex items-center text-sm font-medium text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                Created
              </h4>
              <p className="mt-1 text-gray-900">
                {new Date(aoi.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => setEditing(true)}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit AOI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}