import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Aoi } from '../types/aoi';

interface MapContextType {
  mapCenter: [number, number];
  zoom: number;
  updateMapView: (center: [number, number], zoom: number) => void;
  isDrawing: boolean;
  setDrawingMode: (isDrawing: boolean) => void;
  aois: Aoi[];
  selectedAoiId: string | null;
  selectAoi: (id: string | null) => void;
  addAoi: (aoi: Omit<Aoi, 'id' | 'createdAt'>) => void;
  updateAoi: (id: string, updates: Partial<Aoi>) => void;
  deleteAoi: (id: string) => void;
  clearAllAois: () => void;
  showAllAois: boolean;
  setShowAllAois: (show: boolean) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

const STORAGE_KEY = 'aoi-creation-tool-aois';

// Load AOIs from localStorage
const loadAoisFromStorage = (): Aoi[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure dates are properly parsed
      return parsed.map((aoi: Aoi) => ({
        ...aoi,
        createdAt: new Date(aoi.createdAt),
        updatedAt: aoi.updatedAt ? new Date(aoi.updatedAt) : undefined,
      }));
    }
  } catch (error) {
    console.error('Error loading AOIs from storage:', error);
  }
  return [];
};

// Save AOIs to localStorage
const saveAoisToStorage = (aois: Aoi[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(aois));
  } catch (error) {
    console.error('Error saving AOIs to storage:', error);
  }
};

export const MapProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]);
  const [zoom, setZoom] = useState<number>(13);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [aois, setAois] = useState<Aoi[]>(loadAoisFromStorage);
  const [selectedAoiId, setSelectedAoiId] = useState<string | null>(null);
  const [showAllAois, setShowAllAois] = useState<boolean>(true);

  // Persist AOIs to localStorage whenever they change
  useEffect(() => {
    saveAoisToStorage(aois);
  }, [aois]);

  const updateMapView = useCallback((center: [number, number], newZoom: number) => {
    setMapCenter(center);
    setZoom(newZoom);
  }, []);

  const addAoi = useCallback((aoi: Omit<Aoi, 'id' | 'createdAt'>) => {
    const newAoi: Aoi = {
      ...aoi,
      id: `aoi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };
    setAois((prev) => [...prev, newAoi]);
    return newAoi;
  }, []);

  const updateAoi = useCallback((id: string, updates: Partial<Aoi>) => {
    setAois((prev) =>
      prev.map((aoi) =>
        aoi.id === id
          ? { ...aoi, ...updates, updatedAt: new Date() }
          : aoi
      )
    );
  }, []);

  const deleteAoi = useCallback((id: string) => {
    setAois((prev) => prev.filter((aoi) => aoi.id !== id));
    if (selectedAoiId === id) {
      setSelectedAoiId(null);
    }
  }, [selectedAoiId]);

  const clearAllAois = useCallback(() => {
    setAois([]);
    setSelectedAoiId(null);
  }, []);

  const selectAoi = useCallback((id: string | null) => {
    setSelectedAoiId(id);
  }, []);

  return (
    <MapContext.Provider
      value={{
        mapCenter,
        zoom,
        updateMapView,
        isDrawing,
        setDrawingMode: setIsDrawing,
        aois,
        selectedAoiId,
        selectAoi,
        addAoi,
        updateAoi,
        deleteAoi,
        clearAllAois,
        showAllAois,
        setShowAllAois,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
};

// Alias for backward compatibility
export const useMap = useMapContext;