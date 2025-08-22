'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';
import * as Leaflet from 'leaflet';

import type { Location } from '@/types/location';
import { useLocale, T } from '@/app/locale-context';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const ImageMarker = dynamic(
  () => import('@/components/image-marker').then((mod) => ({ default: mod.ImageMarker })),
  { ssr: false }
);

interface MapGalleryProps {
  className?: string;
  onLocationSelect?: (location: Location) => void;
  selectedLocation?: Location | null;
  hoveredLocation?: Location | null;
  isPanelOpen?: boolean;
  selectedMapStyle?: string;
  showOnlyEditorsChoice?: boolean;
  showOnlySwitzerland?: boolean;
  showOnlyGraubunden?: boolean;
  difficultyRange?: [number, number];
  heightRange?: [number, number];
  onVisibleLocationsChange?: (locations: Location[]) => void;
}

export default function MapGallery({
  className = '',
  onLocationSelect,
  selectedLocation,
  hoveredLocation,
  isPanelOpen = false,
  selectedMapStyle = 'simple',
  showOnlyEditorsChoice = false,
  showOnlySwitzerland = false,
  showOnlyGraubunden = false,
  difficultyRange = [0, 4],
  heightRange = [100, 4000],
  onVisibleLocationsChange,
}: MapGalleryProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapKey, setMapKey] = useState(0);
  const [visibleLocationIds, setVisibleLocationIds] = useState<Set<string>>(new Set());
  const mapRef = useRef<any>(null);
  const [savedMapView, setSavedMapView] = useState<{center: [number, number], zoom: number} | null>(null);
  const { theme } = useTheme();

  // Filter locations based on Editor's Choice setting
  const filteredLocations = React.useMemo(() => {
    // Define difficulty levels mapping
    const difficultyLevels = [
      'hiking',
      'mountain_hiking', 
      'demanding_mountain_hiking',
      'alpine_hiking',
      'difficult_alpine_hiking'
    ];
    
    let filtered = locations;
    
    // Filter by Editor's Choice
    if (showOnlyEditorsChoice) {
      filtered = filtered.filter(location => location.recommended === true);
    }
    
    // Filter by Switzerland
    if (showOnlySwitzerland) {
      filtered = filtered.filter(location => location.country === 'Switzerland');
    }
    
    // Filter by Graubünden
    if (showOnlyGraubunden) {
      filtered = filtered.filter(location => location.province === 'Graubünden');
    }
    
    // Filter by difficulty range
    const [minDifficulty, maxDifficulty] = difficultyRange;
    filtered = filtered.filter(location => {
      if (!location.difficulty) return true; // Include locations without difficulty data
      
      const difficultyIndex = difficultyLevels.indexOf(location.difficulty);
      if (difficultyIndex === -1) return true; // Include unknown difficulties
      
      return difficultyIndex >= minDifficulty && difficultyIndex <= maxDifficulty;
    });
    
    // Filter by height range
    const [minHeight, maxHeight] = heightRange;
    filtered = filtered.filter(location => {
      if (!location.height) return true; // Include locations without height data
      
      return location.height >= minHeight && location.height <= maxHeight;
    });
    
    return filtered;
  }, [locations, showOnlyEditorsChoice, showOnlySwitzerland, showOnlyGraubunden, difficultyRange, heightRange]);

  // Get locations that are actually visible in the current map viewport
  const visibleLocations = React.useMemo(() => {
    return filteredLocations.filter(location => 
      visibleLocationIds.has(location.filename)
    );
  }, [filteredLocations, visibleLocationIds]);

  // Function to check which locations are visible in current viewport
  const updateVisibleLocations = React.useCallback(() => {
    if (!mapRef.current) return;
    
    const map = mapRef.current;
    const bounds = map.getBounds();
    
    if (!bounds) return;
    
    const visible = new Set<string>();
    
    filteredLocations.forEach(location => {
      const [lat, lng] = location.coordinates;
      const point = Leaflet.latLng(lat, lng);
      
      if (bounds.contains(point)) {
        visible.add(location.filename);
      }
    });
    
    console.log('Visible locations updated:', visible.size, 'out of', filteredLocations.length);
    setVisibleLocationIds(visible);
  }, [filteredLocations]);

  // Set up map event listeners when map is ready
  const handleMapReady = React.useCallback((e: any) => {
    // Get the map instance from the event
    const mapInstance = e.target;
    if (!mapInstance) return;
    
    mapRef.current = mapInstance;
    
    // Initial check
    setTimeout(() => updateVisibleLocations(), 100);
    
    // Listen to map events
    mapInstance.on('moveend', updateVisibleLocations);
    mapInstance.on('zoomend', updateVisibleLocations);
    mapInstance.on('resize', updateVisibleLocations);
  }, [updateVisibleLocations]);

  // Update parent component when visible locations change
  useEffect(() => {
    if (visibleLocations.length > 0) {
      console.log('Visible locations:', visibleLocations.length);
    }
    onVisibleLocationsChange?.(visibleLocations);
  }, [visibleLocations, onVisibleLocationsChange]);

  useEffect(() => {
    // Load locations data
    const loadLocations = async () => {
      try {
        const response = await fetch('/data/locations.json');
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error('Error loading locations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocations();
  }, []);

  // Force map refresh when theme changes
  useEffect(() => {
    if (theme) {
      // Save current map view before refresh
      if (mapRef.current) {
        const center = mapRef.current.getCenter();
        const zoom = mapRef.current.getZoom();
        setSavedMapView({
          center: [center.lat, center.lng],
          zoom: zoom
        });
      }
      
      // Force re-render of map component
      setMapKey(prev => prev + 1);
      
      // Also directly update the map container background if map exists
      setTimeout(() => {
        const mapContainer = document.querySelector('.leaflet-container');
        if (mapContainer) {
          if (theme === 'dark') {
            mapContainer.classList.remove('map-bg-light');
            mapContainer.classList.add('map-bg-dark');
          } else {
            mapContainer.classList.remove('map-bg-dark');
            mapContainer.classList.add('map-bg-light');
          }
        }
      }, 100);
    }
  }, [theme]);

  // Restore map view after re-render
  const handleMapReadyWithRestore = React.useCallback((e: any) => {
    const mapInstance = e.target;
    if (!mapInstance) return;
    
    mapRef.current = mapInstance;
    
    // Restore saved view if available
    if (savedMapView) {
      mapInstance.setView(savedMapView.center, savedMapView.zoom);
      setSavedMapView(null); // Clear saved view
    }
    
    // Initial check for visible locations
    setTimeout(() => updateVisibleLocations(), 100);
    
    // Listen to map events
    mapInstance.on('moveend', updateVisibleLocations);
    mapInstance.on('zoomend', updateVisibleLocations);
    mapInstance.on('resize', updateVisibleLocations);
  }, [updateVisibleLocations, savedMapView]);

  // Get tile layer URL based on selected map style
  const getTileLayerUrl = () => {
    switch (selectedMapStyle) {
      case 'simple':
        return theme === 'dark' 
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
      case 'satellite':
        return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      case 'terrain':
        return "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
      case 'street':
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      case 'swisstopo':
        return "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg";
      default:
        return theme === 'dark' 
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
    }
  };

  // Get attribution based on selected map style
  const getAttribution = () => {
    switch (selectedMapStyle) {
      case 'simple':
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
      case 'satellite':
        return '&copy; <a href="https://www.esri.com/">Esri</a>';
      case 'terrain':
        return '&copy; <a href="https://opentopomap.org/">OpenTopoMap</a>';
      case 'street':
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
      case 'swisstopo':
        return '&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>';
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    }
  };

  const handleMarkerClick = (location: Location) => {
    onLocationSelect?.(location);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">
            <T
              en="Loading map..."
              de="Karte wird geladen..."
              it="Caricamento mappa..."
              fr="Chargement de la carte..."
            />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
     <MapContainer
  key={mapKey}
  center={savedMapView?.center || [46.6, 9.8]}
  zoom={savedMapView?.zoom || 9}
  style={{ height: '100%', width: '100%' }}
  className={`z-0 leaflet-container ${theme === 'dark' ? 'map-bg-dark' : 'map-bg-light'}`}
       whenReady={() => handleMapReadyWithRestore()}
>

        <TileLayer
          attribution={getAttribution()}
          url={getTileLayerUrl()}
        />
        
        {filteredLocations.map((location, index) => (
          <ImageMarker
            key={`${location.location}-${index}`}
            location={location}
            onMarkerClick={handleMarkerClick}
            isActive={selectedLocation?.filename === location.filename}
            isHovered={hoveredLocation?.filename === location.filename}
            isPanelOpen={isPanelOpen}
          />
        ))}
      </MapContainer>
      
      {/* SwissTopo Attribution Strip */}
      {selectedMapStyle === 'swisstopo' && (
        <div className="absolute bottom-2 left-2 z-[1000]">
          <div className="bg-white dark:bg-black text-black dark:text-white text-xs px-2 py-1 rounded shadow-sm">
            © Federal Office of Topography swisstopo
          </div>
        </div>
      )}
    </div>
  );
}