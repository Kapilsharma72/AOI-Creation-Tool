import { MapPin, Trash2, Edit2, Eye, EyeOff, Layers, Clock, Plus } from 'lucide-react';
import { useMapContext } from '../../context/MapContext';
import type { Aoi } from '../../types/aoi';
import { formatDistanceToNow } from 'date-fns';
import { useState, useMemo } from 'react';

interface AoiListProps {
  onCreateNew: () => void;
  onEdit: (aoi: Aoi) => void;
}

export default function AoiList({ onCreateNew, onEdit }: AoiListProps) {
  const { aois, selectedAoiId, selectAoi, deleteAoi, showAllAois, setShowAllAois } = useMapContext();
  const [searchQuery, setSearchQuery] = useState('');

  const toggleVisibility = (aoiId: string) => {
    selectAoi(selectedAoiId === aoiId ? null : aoiId);
  };

  const handleDelete = (e: React.MouseEvent, aoi: Aoi) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${aoi.name}"?`)) {
      deleteAoi(aoi.id);
    }
  };

  // Filter and sort AOIs
  const filteredAndSortedAois = useMemo(() => {
    let filtered = [...aois];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (aoi) =>
          aoi.name.toLowerCase().includes(query) ||
          aoi.description?.toLowerCase().includes(query)
      );
    }
    
    // Sort by creation date (newest first)
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [aois, searchQuery]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Areas of Interest</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAllAois(!showAllAois)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title={showAllAois ? 'Hide all AOIs' : 'Show all AOIs'}
              aria-label={showAllAois ? 'Hide all AOIs' : 'Show all AOIs'}
            >
              {showAllAois ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
            <button
              onClick={onCreateNew}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Create new area of interest"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>New</span>
            </button>
          </div>
        </div>
        
        <div className="relative">
          <label htmlFor="aoi-search" className="sr-only">Search areas of interest</label>
          <input
            id="aoi-search"
            type="text"
            placeholder="Search AOIs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search areas of interest"
          />
          <svg
            className="absolute right-3 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredAndSortedAois.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500">
            <Layers className="h-10 w-10 mb-2 text-gray-300" />
            <p className="font-medium">
              {searchQuery.trim() ? 'No AOIs match your search' : 'No areas of interest'}
            </p>
            <p className="text-sm mt-1">
              {searchQuery.trim() ? 'Try a different search term' : 'Click "New" to create your first area'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAndSortedAois.map((aoi) => (
              <div
                key={aoi.id}
                role="button"
                tabIndex={0}
                className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  selectedAoiId === aoi.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => toggleVisibility(aoi.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleVisibility(aoi.id);
                  }
                }}
                aria-label={`${aoi.name} area of interest`}
                aria-pressed={selectedAoiId === aoi.id}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <MapPin 
                        className={`h-4 w-4 flex-shrink-0 ${
                          selectedAoiId === aoi.id ? 'text-blue-600' : 'text-gray-400'
                        }`} 
                      />
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {aoi.name}
                      </h3>
                    </div>
                    
                    {aoi.description && (
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                        {aoi.description}
                      </p>
                    )}
                    
                    <div className="mt-1.5 flex items-center space-x-3 text-xs text-gray-500">
                      <span className="inline-flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(aoi.createdAt), { addSuffix: true })}
                      </span>
                      {aoi.updatedAt && aoi.updatedAt > aoi.createdAt && (
                        <span className="text-xs text-gray-400">
                          - Edited {formatDistanceToNow(new Date(aoi.updatedAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-2 flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(aoi);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Edit AOI"
                      aria-label={`Edit ${aoi.name}`}
                    >
                      <Edit2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, aoi)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      title="Delete AOI"
                      aria-label={`Delete ${aoi.name}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {filteredAndSortedAois.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
          {filteredAndSortedAois.length} {searchQuery.trim() ? 'matching' : ''} area{filteredAndSortedAois.length !== 1 ? 's' : ''} of interest
          {searchQuery.trim() && aois.length > filteredAndSortedAois.length && (
            <span> (of {aois.length} total)</span>
          )}
        </div>
      )}
    </div>
  );
}