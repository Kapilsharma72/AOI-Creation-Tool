import React from 'react';
import Sidebar from './Sidebar';
import MapComponent from '../map/MapComponent';
import { useMapContext } from '../../context/MapContext';

const MainLayout: React.FC = () => {
  const { isDrawing } = useMapContext();

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 relative ml-80"> 
        <div className="h-full w-full">
          <MapComponent />
        </div>
        {isDrawing && (
          <div 
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded shadow-md z-[1000] border border-blue-500"
            role="alert"
            aria-live="polite"
          >
            <span className="text-sm font-medium text-blue-700">
              Click on the map to start drawing a polygon
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
