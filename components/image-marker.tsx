import React from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import type { Location } from '@/public/location';
import { useLocale, T } from '@/app/locale-context';

interface ImageMarkerProps {
  location: Location;
  onMarkerClick: (location: Location) => void;
  isActive?: boolean;
  isHovered?: boolean;
  isPanelOpen?: boolean;
}


export function ImageMarker({ location, onMarkerClick, isActive = false, isHovered = false, isPanelOpen = false }: ImageMarkerProps) {
  const { language } = useLocale();

  // Marker should be large only if it's active AND panel is open
  // OR if it's being hovered from the grid (without opening panel)
  const shouldBeLarge = (isActive && isPanelOpen) || isHovered;

  // Get translations for marker tooltip
  const getTranslation = (key: string) => {
    const translations = {
      'marker.date': {
        en: 'Date',
        de: 'Datum',
        it: 'Data',
        fr: 'Date'
      },
      'marker.time': {
        en: 'Time',
        de: 'Zeit',
        it: 'Ora',
        fr: 'Heure'
      }
    };
    return translations[key as keyof typeof translations]?.[language] || translations[key as keyof typeof translations]?.en || key;
  };

  // Create a custom marker with pure CSS hover animations
  const createCustomIcon = () => {
    const borderColor = '#ffffff';
    
    return new L.DivIcon({
      className: `custom-marker-icon ${shouldBeLarge ? 'marker-active' : ''}`,
      html: `
        <div class="marker-wrapper">
          <!-- Marker Image -->
          <div class="w-12 h-12 hover:w-20 hover:h-20 transition-all duration-300 ease-in-out
  ${shouldBeLarge ? '!w-20 !h-20' : ''}
  border-2 
  border-black dark:border-white 
  rounded-full 
  overflow-hidden 
  bg-gray-800 
  flex 
  items-center 
  justify-center 
  shadow-lg
  hover:shadow-xl
  ${shouldBeLarge ? '!shadow-xl' : ''}
  absolute
  top-1/2
  left-1/2
  transform
  -translate-x-1/2
  -translate-y-1/2
  marker-image group
">

            <img 
              src="${location.imageMap}" 
              class="w-full h-full object-cover transition-all duration-300 ease-in-out"
              style="display: block;"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            />
            <div class="hidden text-white text-lg">📷</div>
          </div>
          
          <!-- Tooltip - Pure CSS Hover -->
       <div class="absolute 
  top-full 
  left-1/2 
  transform 
  -translate-x-1/2 
  mt-[6px] 
  bg-black dark:bg-white
  rounded-lg 
  shadow-md 
  px-[4px] 
  py-[0px]
  text-center      
  whitespace-nowrap 
  opacity-0 invisible group-hover:opacity-100 group-hover:visible 
  transition-all duration-300 ease-in-out
  [transition-delay:0ms] group-hover:[transition-delay:100ms]
  ${shouldBeLarge ? '!opacity-100 !visible' : ''}
  marker-tooltip
  translate-y-1 group-hover:translate-y-0
  ${shouldBeLarge ? '!translate-y-0' : ''}
  pointer-events-none
">
  <span class="text-xs font-medium text-white dark:text-black">
    ${location.short}
  </span>
</div>
        </div>
      `,
      iconSize: [48, 48], // Base size
      iconAnchor: [24, 24], // Center anchor point
    });
  };

  return (
    <Marker
      position={location.coordinates}
      icon={createCustomIcon()}
      eventHandlers={{
        click: () => onMarkerClick(location),
      }}
    />
  );
}