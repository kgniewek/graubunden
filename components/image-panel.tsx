'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, Copy, Check, Navigation, Maximize2, Map, Mountain, Activity, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Location } from '@/types/location';
import { useLocale, T } from '@/app/locale-context';
import { cn } from '@/lib/utils';

interface ImagePanelProps {
  location: Location | null;
  isOpen: boolean;
  onClose: () => void;
  onFullscreenOpen: () => void;
}

export function ImagePanel({ location, isOpen, onClose, onFullscreenOpen }: ImagePanelProps) {
  const { language } = useLocale();
  const [previousLocation, setPreviousLocation] = useState<Location | null>(null);
  const [isContentChanging, setIsContentChanging] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Handle content changes without animation
  useEffect(() => {
    if (location && previousLocation && location !== previousLocation) {
      setIsContentChanging(true);
      const timer = setTimeout(() => {
        setIsContentChanging(false);
      }, 50);
      return () => clearTimeout(timer);
    }
    setPreviousLocation(location);
  }, [location, previousLocation]);

const difficultyLabels: Record<string, Record<string, string>> = {
  hiking: {
    en: "Hiking",
    de: "Wandern",
    it: "Escursionismo",
    fr: "Randonnée"
  },
  mountain_hiking: {
    en: "Mountain hiking",
    de: "Bergwandern",
    it: "Escursionismo in montagna",
    fr: "Randonnée en montagne"
  },
  demanding_mountain_hiking: {
    en: "Demanding mountain hiking",
    de: "Anspruchsvolles Bergwandern",
    it: "Escursionismo in montagna impegnativo",
    fr: "Randonnée en montagne exigeante"
  },
  alpine_hiking: {
    en: "Alpine hiking",
    de: "Alpine Wanderung",
    it: "Escursionismo alpino",
    fr: "Randonnée alpine"
  },
  difficult_alpine_hiking: {
    en: "Difficult alpine hiking",
    de: "Schwierige alpine Wanderung",
    it: "Escursionismo alpino difficile",
    fr: "Randonnée alpine difficile"
  }
};


// Convert WGS84 lat/lng to CH1903 (Swiss grid) E/N
function wgs84ToCH1903(lat: number, lng: number) {
  const φ = lat * 3600;
  const λ = lng * 3600;

  const φ_aux = (φ - 169028.66) / 10000;
  const λ_aux = (λ - 26782.5) / 10000;

  const E = 2600072.37
          + 211455.93 * λ_aux
          - 10938.51 * λ_aux * φ_aux
          - 0.36 * λ_aux * φ_aux * φ_aux
          - 44.54 * λ_aux * λ_aux * λ_aux;

  const N = 1200147.07
          + 308807.95 * φ_aux
          + 3745.25 * λ_aux * λ_aux
          + 76.63 * φ_aux * φ_aux
          - 194.56 * λ_aux * λ_aux * φ_aux
          + 119.79 * φ_aux * φ_aux * φ_aux;

  return { E: Math.round(E), N: Math.round(N) };
}

  
  
  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    const locales = {
      en: 'en-US',
      de: 'de-DE',
      it: 'it-IT',
      fr: 'fr-FR'
    };
    
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    
    return date.toLocaleDateString(locales[language], options);
  };

  const formatDateTime = (dateStr: string, timeStr: string) => {
    const formattedDate = formatDate(dateStr);
    
    const translations = {
      en: `Picture taken ${formattedDate} at ${timeStr}`,
      de: `Bild aufgenommen ${formattedDate} um ${timeStr}`,
      it: `Foto scattata ${formattedDate} alle ${timeStr}`,
      fr: `Photo prise ${formattedDate} à ${timeStr}`
    };
    
    return translations[language] || translations.en;
  };

  const handleCopyCoordinates = async () => {
    if (!location) return;
    
    const coordsText = `${location.coordinates[0].toFixed(4)}, ${location.coordinates[1].toFixed(4)}`;
    
    try {
      await navigator.clipboard.writeText(coordsText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy coordinates:', err);
    }
  };

  const handleNavigate = () => {
    if (!location) return;
    
    const [lat, lng] = location.coordinates;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(googleMapsUrl, '_blank');
  };

  // Always render the panel, but show placeholder when no location
  const displayLocation = location || {
    filename: '',
    location: '',
    province: '',
    country: '',
    date: '',
    time: '',
    coordinates: [0, 0] as [number, number]
  };

  return (
    <div className={cn(
      "fixed top-[49px] left-0 h-[calc(100vh-49px)] w-[400px] bg-background border-r z-50",
      "transform transition-transform duration-300 ease-in-out",
      "flex flex-col",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Image */}
        <div className="w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative group">
          {location && (
            <img
              src={displayLocation.filename}
              alt={displayLocation.location}
              className={`w-full h-full object-cover transition-opacity duration-200 ${isContentChanging ? 'opacity-0' : 'opacity-100'}`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl">📷</div>';
                }
              }}
            />
          )}
          {!location && (
            <div className="w-full h-full flex items-center justify-center text-4xl">📷</div>
          )}
          
{/* Light mode button */}
<button
  onClick={onClose}
  className="absolute top-3 left-3 dark:hidden flex items-center space-x-1 pl-[8px] pr-[13px] py-[3px] rounded-2xl text-black"
  style={{
    background: "rgba(255, 255, 255, 0.39)",
    borderRadius: "16px",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(3.7px)",
    WebkitBackdropFilter: "blur(3.7px)",
    border: "1px solid rgba(255, 255, 255, 0.06)"
  }}
>
  <ArrowLeft className="h-[18px] w-[18px]" />
  {location && (
    <span className="text-[15px] font-medium truncate max-w-[150px] ">
      {location.short || location.location}
    </span>
  )}
</button>

{/* Dark mode button */}
<button
  onClick={onClose}
  className="absolute top-3 left-3 hidden dark:inline-flex items-center space-x-1 pl-[8px] pr-[13px] py-[3px] rounded-2xl text-white"
  style={{
    background: "rgba(0, 0, 0, 0.39)",
    borderRadius: "16px",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(3.7px)",
    WebkitBackdropFilter: "blur(3.7px)",
    border: "1px solid rgba(0, 0, 0, 0.06)"
  }}
>
  <ArrowLeft className="h-[18px] w-[18px]" />
  {location && (
    <span className="text-[15px] font-medium truncate max-w-[150px] ">
      {location.short || location.location}
    </span>
  )}
</button>







          
          {/* Fullscreen Icon */}
          {location && (
            <button
              onClick={onFullscreenOpen}
              className="absolute bottom-2 left-2 p-2 bg-black/0 hover:bg-black/50 rounded-full transition-all duration-200 group-hover:opacity-100 opacity-80"
            >
              <Maximize2 className="h-4 w-4 text-white" />
            </button>
          )}
        </div>

        {/* Details */}
        <div className={`p-4 space-y-4 transition-opacity duration-200 ${isContentChanging ? 'opacity-0' : 'opacity-100'}`}>
          {location && (
            <div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{displayLocation.location}</h3>
                <p className="text-sm text-foreground">
                  {displayLocation.province}, {displayLocation.country}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-foreground">
                    {formatDateTime(displayLocation.date, displayLocation.time)}
                  </span>
                </div>

<div className="flex flex-wrap items-center text-sm text-muted-foreground pt-[4px] gap-x-4 gap-y-2">
  {displayLocation.height && (
    <div className="flex items-center whitespace-nowrap">
      <Mountain className="h-4 w-4 mr-1.5 text-foreground" />
      <span className="font-medium text-muted-foreground">
        {Math.round(displayLocation.height)}{" "}
        <T
          en="m a.s.l."
          de="m ü. M."
          it="m s.l.m."
          fr="m d'alt."
        />
      </span>
    </div>
  )}

  {displayLocation.difficulty && (
    <div className="flex items-center whitespace-nowrap">
      <Activity className="h-4 w-4 mr-1.5 text-foreground" />
      <span className="font-medium text-muted-foreground">
        {difficultyLabels[displayLocation.difficulty]?.[language] || displayLocation.difficulty}
      </span>
    </div>
  )}

  {displayLocation.recommended && (
    <div className="flex items-center whitespace-nowrap">
      <Star className="h-4 w-4 mr-1.5 text-foreground" />
      <T
        en="Editor's Choice"
        de="Editor's Choice"
        it="Scelta dell'editore"
        fr="Choix de la rédaction"
      />
    </div>
  )}
</div>




                
<div className="text-sm text-muted-foreground pt-[2px]">

{(displayLocation.hike_distance_km != null || displayLocation.elevation_gain_m != null || displayLocation.nearest_city) && (
  <div className="text-sm text-muted-foreground mt-1">
    <span className="font-medium text-muted-foreground">
      {{
        en: `This specific location near/in the area of ${displayLocation.short} is reachable via a ${displayLocation.hike_distance_km ?? '?'} km hike with ${displayLocation.elevation_gain_m ?? '?'} m total elevation gain from ${displayLocation.nearest_city ?? '?'}.`,
        de: `Dieser spezifische Ort in der Nähe von ${displayLocation.short} ist über eine ${displayLocation.hike_distance_km ?? '?'} km lange Wanderung mit insgesamt ${displayLocation.elevation_gain_m ?? '?'} m Höhenunterschied von ${displayLocation.nearest_city ?? '?' } erreichbar.`,
        it: `Questa località specifica nell'area di ${displayLocation.short} è raggiungibile tramite un'escursione di ${displayLocation.hike_distance_km ?? '?'} km con un dislivello totale di ${displayLocation.elevation_gain_m ?? '?'} m da ${displayLocation.nearest_city ?? '?'}.`,
        fr: `Cet emplacement spécifique près de ${displayLocation.short} est accessible via une randonnée de ${displayLocation.hike_distance_km ?? '?'} km avec un gain d'altitude total de ${displayLocation.elevation_gain_m ?? '?'} m depuis ${displayLocation.nearest_city ?? '?'}.`
      }[language]}
    </span>
  </div>
)}

</div>



                
                <div className="flex gap-3 pt-3">
                  

<Button
  variant="ghost"
  size="sm"
  className="flex-1 h-8 px-3 border border-border bg-muted text-foreground hover:bg-muted/80 transition-colors duration-150"
  onClick={() => {
    if (!location) return;
    const [lat, lng] = location.coordinates;
    const { E, N } = wgs84ToCH1903(lat, lng);
    const swissTopoUrl = `https://map.geo.admin.ch/?E=${E}&N=${N}&zoom=7&bgLayer=ch.swisstopo.pixelkarte-farbe&lang=${language}`;
    window.open(swissTopoUrl, "_blank");
  }}
>
  <T
    en="Open SwissTopo"
    de="SwissTopo öffnen"
    it="Apri SwissTopo"
    fr="Ouvrir SwissTopo"
  />
  <Map className="h-3 w-3 ml-1.5" />
</Button>





                  
                 <Button
 variant="ghost"
  size="sm"
  className="flex-1 h-8 px-3
             border border-border
             bg-muted
             text-foreground
             hover:bg-muted/80
             transition-colors duration-150"
  onClick={handleNavigate}
>
  <T
    en="Get Directions"
    de="Route berechnen"
    it="Indicazioni"
    fr="Itinéraire"
  />
  <Navigation className="h-3 w-3 ml-1.5" />
</Button>
                </div>
              </div>

<Button
 variant="ghost"
  size="sm"
  className="w-full  mt-3 h-8 px-3
             border border-border
             bg-muted
             text-foreground
             hover:bg-muted/80
             transition-colors duration-150"
  onClick={handleCopyCoordinates}
>
  {isCopied ? (
    <div className="flex items-center justify-center">
      <T
        en="Coordinates copied successfully"
        de="Koordinaten erfolgreich kopiert"
        it="Coordinate copiate con successo"
        fr="Coordonnées copiées avec succès"
      />
      <Check className="h-3.5 w-3.5 ml-1" />
    </div>
  ) : (
    <div className="flex items-center justify-center whitespace-nowrap">
      <div className="mr-1.5 flex items-center">
        <div className="mr-2">
          <T
            en="Coordinates:"
            de="Koordinaten:"
            it="Coordinate:"
            fr="Coordonnées:"
          />
        </div>
{displayLocation.coordinates[0]}, {displayLocation.coordinates[1]}
      </div>
      <Copy className="h-3 w-3 ml-1" />
    </div>
  )}
</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FullscreenModal({ 
  isOpen, 
  onClose, 
  imageSrc, 
  imageAlt 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  imageSrc: string; 
  imageAlt: string; 
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Wrap image in relative container so button can be positioned above it */}
      <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
        {/* Fullscreen Image */}
        <img
          src={imageSrc}
          alt={imageAlt}
          className="max-w-[90vw] max-h-[90vh] object-contain"
        />

        {/* Close button above image on the right */}
<button
  onClick={onClose}
  className="absolute -top-12 right-2 flex items-center space-x-2 px-3 py-2 text-white font-semibold rounded-lg transition-all
             bg-transparent hover:bg-gray-800/80"
>
  <span className="text-sm">
    <T 
      en="Close" 
      de="Schließen" 
      it="Chiudi" 
      fr="Fermer" 
    />
  </span>
  <X className="h-5 w-5" />
</button>

      </div>
    </div>
  );
}

