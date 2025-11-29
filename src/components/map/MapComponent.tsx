import React, { useEffect, useRef } from 'react';
import { useMapContext } from '../../context/MapContext';
import {
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
  useMap as useLeafletMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import SearchBar from './SearchBar';

// Fix for default marker icons in Leaflet
const defaultIcon = new L.Icon.Default();
// @ts-ignore
delete defaultIcon._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// WMS Layer Component
const WMSLayer = () => {
  const map = useLeafletMap();

  useEffect(() => {
    const wmsLayer = L.tileLayer.wms('https://www.wms.nrw.de/geobasis/wms_nw_dop', {
      layers: 'nw_dop_rgb',
      format: 'image/png',
      transparent: true,
      attribution: '© Geobasis NRW',
    });

    wmsLayer.addTo(map);

    return () => {
      map.removeLayer(wmsLayer);
    };
  }, [map]);

  return null;
};

// Component to render AOIs on the map
const AoiLayers = React.memo(() => {
  const { aois, selectedAoiId, showAllAois } = useMapContext();
  const map = useLeafletMap();
  const layersRef = useRef<Map<string, L.Polygon>>(new Map());

  useEffect(() => {
    // Remove old layers
    layersRef.current.forEach((layer) => {
      map.removeLayer(layer);
    });
    layersRef.current.clear();

    // Performance optimization: Only render if we have AOIs
    if (aois.length === 0) {
      return;
    }

    // Add new layers - show all if showAllAois is true, otherwise only show selected
    const aoisToRender = showAllAois 
      ? aois 
      : selectedAoiId 
        ? aois.filter(aoi => aoi.id === selectedAoiId)
        : [];

    aoisToRender.forEach((aoi) => {
      // Convert [lng, lat] to [lat, lng] for Leaflet
      const latLngs = aoi.geometry.map(([lng, lat]) => [lat, lng] as [number, number]);
      
      const polygon = L.polygon(latLngs, {
        color: selectedAoiId === aoi.id ? '#ef4444' : '#3388ff',
        weight: selectedAoiId === aoi.id ? 3 : 2,
        opacity: 0.8,
        fillColor: selectedAoiId === aoi.id ? '#ef4444' : '#3388ff',
        fillOpacity: 0.2,
      });

      polygon.bindPopup(`<b>${aoi.name}</b>${aoi.description ? `<br>${aoi.description}` : ''}`);
      polygon.addTo(map);
      layersRef.current.set(aoi.id, polygon);
    });

    return () => {
      layersRef.current.forEach((layer) => {
        map.removeLayer(layer);
      });
    };
  }, [aois, selectedAoiId, showAllAois, map]);

  return null;
});

const MapEvents = () => {
  const { updateMapView } = useMapContext();
  const map = useMap();

  useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      updateMapView([center.lat, center.lng], zoom);
    },
    zoomend: () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      updateMapView([center.lat, center.lng], zoom);
    },
  });

  return null;
};

const MapContent = () => {
  const { addAoi, isDrawing, setDrawingMode } = useMapContext();
  const map = useMap();
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);

  // Initialize feature group
  useEffect(() => {
    if (!map) return;
    featureGroupRef.current = L.featureGroup().addTo(map);
    
    return () => {
      if (featureGroupRef.current) {
        map.removeLayer(featureGroupRef.current);
        featureGroupRef.current = null;
      }
    };
  }, [map]);

  // Handle drawing mode toggle
  useEffect(() => {
    if (!map || !featureGroupRef.current) return;

    // Remove existing draw control
    if (drawControlRef.current) {
      map.removeControl(drawControlRef.current);
      drawControlRef.current = null;
    }

    // Add draw control when drawing mode is enabled
    if (isDrawing) {
      const drawControl = new (L.Control as any).Draw({
        position: 'topright',
        draw: {
          polygon: {
            allowIntersection: false,
            drawError: {
              color: '#e1e100',
              message: '<strong>Error:</strong> shapes cannot intersect!',
            },
            shapeOptions: {
              color: '#3388ff',
              weight: 2,
              fillOpacity: 0.2,
            },
          },
          polyline: false,
          circle: false,
          rectangle: false,
          circlemarker: false,
          marker: false,
        },
        edit: {
          featureGroup: featureGroupRef.current,
          remove: true,
        },
      });

      map.addControl(drawControl);
      drawControlRef.current = drawControl;
    }

    return () => {
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      }
    };
  }, [map, isDrawing]);

  // Handle draw events
  useEffect(() => {
    if (!map || !featureGroupRef.current || !isDrawing) return;

    const handleDrawCreated = (e: L.DrawEvents.Created) => {
      const layer = e.layer;
      featureGroupRef.current?.addLayer(layer);

      // Extract coordinates - Leaflet uses [lat, lng], we store as [lng, lat]
      const latLngs = (layer as L.Polygon).getLatLngs()[0] as L.LatLng[];
      const coords = latLngs.map((latlng) => [latlng.lng, latlng.lat] as [number, number]);

      addAoi({
        name: `AOI ${new Date().toLocaleTimeString()}`,
        geometry: coords,
      });

      // Exit drawing mode after creating
      setDrawingMode(false);
    };

    map.on(L.Draw.Event.CREATED, handleDrawCreated);

    return () => {
      map.off(L.Draw.Event.CREATED, handleDrawCreated);
    };
  }, [map, isDrawing, addAoi, setDrawingMode]);

  return (
    <>
      <SearchBar />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <WMSLayer />
      <AoiLayers />
      <MapEvents />
    </>
  );
};

const MapComponent = () => {
  const { mapCenter, zoom } = useMapContext();

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={true}
        style={{ height: '100%', width: '100%', position: 'relative' }}
        zoomAnimation={true}
        zoomAnimationThreshold={0}
      >
        <MapContent />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
