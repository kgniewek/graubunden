'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { Loader2, Plus, Minus, Layers, ChevronUp, Check  } from 'lucide-react';
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
  onMapStyleChange?: (styleId: string) => void;

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
                                     onMapStyleChange,
                                   }: MapGalleryProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapKey, setMapKey] = useState(0);
  const [visibleLocationIds, setVisibleLocationIds] = useState<Set<string>>(new Set());
  const mapRef = useRef<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mapStyle, setMapStyle] = useState<string>(selectedMapStyle);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMapStyle(selectedMapStyle);
  }, [selectedMapStyle]);

  const getActiveStyle = () => {
    if (mapStyle === 'simple') {
      return theme === 'dark' ? 'dark-simple' : 'light-simple';
    }
    return mapStyle;
  };


  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const mapOptions = [
    {
      id: 'light-simple',
      label: { en: 'Light Simple', de: 'Hell Einfach', it: 'Semplice Chiaro', fr: 'Simple Clair' },
      image: '/map-simple-light.webp'
    },
    {
      id: 'dark-simple',
      label: { en: 'Dark Simple', de: 'Dunkel Einfach', it: 'Semplice Scuro', fr: 'Simple Sombre' },
      image: '/map-simple-dark.webp'
    },
    {
      id: 'satellite',
      label: { en: 'Satellite', de: 'Satellit', it: 'Satellite', fr: 'Satellite' },
      image: '/map-satelite.webp'
    },
    {
      id: 'terrain',
      label: { en: 'Terrain', de: 'Gelände', it: 'Terreno', fr: 'Terrain' },
      image: '/map-terrain.webp'
    },
    {
      id: 'street',
      label: { en: 'Street', de: 'Straße', it: 'Strada', fr: 'Rue' },
      image: '/map-street.webp'
    },
    {
      id: 'swisstopo',
      label: { en: 'SwissTopo', de: 'SwissTopo', it: 'SwissTopo', fr: 'SwissTopo' },
      image: '/map-swisstopo.webp'
    },
  ];

  const handleMapOptionClick = (optionId: string) => {
    setMapStyle(optionId); // local map style for dropdown UI
    setIsDropdownOpen(false);

    if (optionId === 'light-simple') {
      setTheme('light');
      onMapStyleChange?.('simple'); // notify parent map component
    } else if (optionId === 'dark-simple') {
      setTheme('dark');
      onMapStyleChange?.('simple'); // notify parent map component
    } else {
      onMapStyleChange?.(optionId);
    }
  };





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

  const getTileLayerUrl = () => {
    switch (mapStyle) {
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

  const getAttribution = () => {
    switch (mapStyle) {
      case 'light-simple':
      case 'dark-simple':
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
  center={[46.6, 9.8]}
  zoom={9}
  zoomControl={false}
  style={{ height: '100%', width: '100%' }}
  className={`z-0 leaflet-container ${theme === 'dark' ? 'map-bg-dark' : 'map-bg-light'}`}
       whenReady={handleMapReady}
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







      <div className="absolute  select-none  bottom-6 right-6 z-[1000] hidden md:flex items-end space-x-3">
        {/* Anchor wrapper: inline-flex ensures wrapper width matches button width */}
        <div className="relative inline-flex items-center justify-center">
          {/* Dropdown (kept mounted so close animation runs) */}
          <div
              className={
                `absolute bottom-full mb-8 left-1/2 -translate-x-1/2
         w-80 bg-background border border-border rounded-xl shadow-lg p-3 origin-bottom
         transition-[opacity,transform] duration-200 ease-out
         ${isDropdownOpen
                    ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                    : 'opacity-0 translate-y-3 scale-95 pointer-events-none'}`
              }
          >
            {mapOptions.map((option) => {
              const isActive = getActiveStyle() === option.id;
              const image = option.image;

              return (
                  <button
                      key={option.id}
                      onClick={() => handleMapOptionClick(option.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-all duration-200 group ${
                          isActive ? 'bg-muted/50 font-semibold' : 'bg-background'
                      }`}
                  >
                    {image && (
                        <div className="flex-shrink-0 w-24 h-16 overflow-hidden rounded-lg">
                          <img
                              src={image}
                              alt={option.label[useLocale().language as keyof typeof option.label]}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                    )}

                    <span className="flex-1 text-left text-base truncate">
              <T
                  en={option.label.en}
                  de={option.label.de}
                  it={option.label.it}
                  fr={option.label.fr}
              />
            </span>

                    {isActive && <Check className="w-5 h-5 text-primary ml-auto" />}
                  </button>
              );
            })}

            <div
                className={`
    absolute top-full left-1/2 -translate-x-1/2 mt-[-8px]
    w-[18px] h-[18px]
    rotate-45
    bg-background border border-b-border border-r-border border-t-transparent border-l-transparent
  `}
            />


          </div>

          {/* Toggle Button (anchor) */}
          <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 px-4 h-12 bg-background hover:bg-muted text-foreground border border-border rounded-full shadow-lg transition-all"
          >
            <Layers className="w-6 h-6" />
            <span className="text-sm font-medium">
        <T
            en="Change map view"
            de="Kartenansicht ändern"
            it="Cambia vista mappa"
            fr="Changer la vue de la carte"
        />
      </span>
            <ChevronUp
                className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : 'rotate-0'
                }`}
            />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex rounded-full  select-none shadow-lg overflow-hidden border border-border">
          <button
              onClick={() => mapRef.current?.zoomIn()}
              className="flex items-center justify-center w-12 h-12 bg-background hover:bg-muted transition-colors"
          >
            <Plus className="w-6 h-6 text-foreground" />
          </button>
          <div className="w-px bg-border" />
          <button
              onClick={() => mapRef.current?.zoomOut()}
              className="flex items-center justify-center w-12 h-12 bg-background hover:bg-muted transition-colors"
          >
            <Minus className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </div>










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
