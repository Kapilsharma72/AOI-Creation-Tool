// src/components/layout/Sidebar.tsx
import { Upload, Pencil } from 'lucide-react';
import { useMapContext } from '../../context/MapContext';
import { useRef } from 'react';
import AoiList from '../aoi/AoiList';
import AoiDetails from '../aoi/AoiDetails';
import { useState } from 'react';
import type { Aoi } from '../../types/aoi';
import * as shp from 'shpjs';
import L from 'leaflet';

const Sidebar: React.FC = () => {
  const { isDrawing, setDrawingMode, addAoi, updateAoi, selectedAoiId, selectAoi, aois } = useMapContext();
  const [editingAoi, setEditingAoi] = useState<Aoi | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrawClick = () => {
    setDrawingMode(!isDrawing);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      const fileName = file.name.toLowerCase();
      let geojson: any;

      // Handle GeoJSON files separately (they're just JSON, not shapefiles)
      if (fileName.endsWith('.geojson') || fileName.endsWith('.json')) {
        const text = await file.text();
        geojson = JSON.parse(text);
      } else {
        // Handle shapefiles (.shp, .zip) using shpjs
        geojson = await shp(file);
      }

      if (!geojson) {
        throw new Error('Failed to parse file. File may be empty or corrupted.');
      }

      let importedCount = 0;

      // Process GeoJSON features and add as AOIs
      if (geojson.type === 'FeatureCollection' && geojson.features && Array.isArray(geojson.features)) {
        geojson.features.forEach((feature: any, index: number) => {
          if (feature.geometry && feature.geometry.type === 'Polygon' && feature.geometry.coordinates) {
            try {
              // GeoJSON coordinates are [lng, lat] which matches our format
              const coords = feature.geometry.coordinates[0].map(([lng, lat]: [number, number]) => {
                if (typeof lng !== 'number' || typeof lat !== 'number') {
                  throw new Error('Invalid coordinates');
                }
                return [lng, lat] as [number, number];
              });

              // Validate polygon has at least 3 points
              if (coords.length < 3) {
                console.warn(`Skipping polygon ${index + 1}: insufficient coordinates`);
                return;
              }

              addAoi({
                name: feature.properties?.name || `Imported AOI ${index + 1}`,
                description: feature.properties?.description || `Imported from ${file.name}`,
                geometry: coords,
              });
              importedCount++;
            } catch (err) {
              console.warn(`Error processing feature ${index + 1}:`, err);
            }
          } else {
            console.warn(`Skipping feature ${index + 1}: not a Polygon (type: ${feature.geometry?.type})`);
          }
        });
      } else if (geojson.type === 'Feature' && geojson.geometry?.type === 'Polygon') {
        try {
          const coords = geojson.geometry.coordinates[0].map(([lng, lat]: [number, number]) => {
            if (typeof lng !== 'number' || typeof lat !== 'number') {
              throw new Error('Invalid coordinates');
            }
            return [lng, lat] as [number, number];
          });

          if (coords.length < 3) {
            throw new Error('Polygon must have at least 3 coordinates');
          }

          addAoi({
            name: geojson.properties?.name || `Imported AOI`,
            description: geojson.properties?.description || `Imported from ${file.name}`,
            geometry: coords,
          });
          importedCount++;
        } catch (err) {
          throw new Error(`Error processing feature: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      } else {
        throw new Error(
          `Unsupported GeoJSON type: ${geojson.type}. Expected 'FeatureCollection' or 'Feature' with Polygon geometry.`
        );
      }

      if (importedCount === 0) {
        alert('No valid polygons found in the file. Please ensure the file contains Polygon geometries.');
      } else {
        // Success message (optional - you can remove this if you prefer silent success)
        console.log(`Successfully imported ${importedCount} AOI(s) from ${file.name}`);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';
      alert(`Error processing file: ${errorMessage}\n\nPlease ensure:\n- File is a valid GeoJSON or Shapefile\n- File contains Polygon geometries\n- File is not corrupted`);
    }
  };

  const handleCreateNew = () => {
    setDrawingMode(true);
    setEditingAoi(null);
    selectAoi(null);
  };

  const handleEdit = (aoi: Aoi) => {
    setEditingAoi(aoi);
    selectAoi(aoi.id);
  };

  const handleSave = (aoi: Aoi) => {
    updateAoi(aoi.id, aoi);
    setEditingAoi(null);
  };

  const handleCloseDetails = () => {
    setEditingAoi(null);
    selectAoi(null);
  };

  const selectedAoi = editingAoi || (selectedAoiId ? 
    aois.find(a => a.id === selectedAoiId) || null : null);

  return (
    <div className="fixed inset-y-0 left-0 z-30 w-80 bg-white shadow-lg transform transition-transform duration-200 ease-in-out flex flex-col">
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-medium text-gray-900">AOI Creation Tool</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4 mb-6">
          <button
            onClick={handleDrawClick}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isDrawing 
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-500' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-label={isDrawing ? 'Cancel drawing mode' : 'Enable drawing mode'}
          >
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Pencil className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">
              {isDrawing ? 'Cancel Drawing' : 'Draw on Map'}
            </span>
          </button>

          <button
            onClick={handleUploadClick}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            aria-label="Upload shapefile"
          >
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Upload Shapefile</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".shp,.zip,.geojson"
            style={{ display: 'none' }}
            aria-label="Shapefile input"
          />
        </div>

        <AoiList onCreateNew={handleCreateNew} onEdit={handleEdit} />
      </div>

      {selectedAoi && (
        <div className="border-t border-gray-200 flex-shrink-0">
          <AoiDetails 
            aoi={selectedAoi} 
            onClose={handleCloseDetails}
            onSave={handleSave}
          />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
