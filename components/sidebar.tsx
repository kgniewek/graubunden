'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Filter, Check, RotateCcw, MapIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RangeSlider } from '@/components/ui/range-slider';
import { Separator } from '@/components/ui/separator';
import { useLocale, T } from '@/app/locale-context';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import type { Location } from '@/types/location';

interface SidebarProps {
  className?: string;
  onEditorsChoiceChange?: (showOnly: boolean) => void;
  onSwitzerlandChange?: (showOnly: boolean) => void;
  onGraubundenChange?: (showOnly: boolean) => void;
  onDifficultyRangeChange?: (range: [number, number]) => void;
  onHeightRangeChange?: (range: [number, number]) => void;
  visibleLocations?: Location[];
  onLocationSelect?: (location: Location) => void;
  onLocationHover?: (location: Location | null) => void;
}


function Sidebar({ 
  className,
  onEditorsChoiceChange,
  onSwitzerlandChange,
  onGraubundenChange,
  onDifficultyRangeChange,
  onHeightRangeChange,
  visibleLocations = [],
  onLocationSelect,
  onLocationHover
}: SidebarProps) {
  const [heightRange, setHeightRange] = useState<[number, number]>([100, 4000]);
  const [showOnlyEditorsChoice, setShowOnlyEditorsChoice] = useState(false);
  const [showOnlySwitzerland, setShowOnlySwitzerland] = useState(false);
  const [showOnlyGraubunden, setShowOnlyGraubunden] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([
    'Switzerland',
    'Italy',
    'Liechtenstein',
    'Austria',
  ]);
  const difficultyKeys = [
    'hiking',
    'mountain_hiking',
    'demanding_mountain_hiking',
    'alpine_hiking',
    'difficult_alpine_hiking',
  ];
  const [difficultyRange, setDifficultyRange] = useState<[number, number]>([0, 4]);
  const { language } = useLocale();

  const handleResetFilters = () => {
    setShowOnlyEditorsChoice(false);
    setShowOnlySwitzerland(false);
    setShowOnlyGraubunden(false);
    
    setHeightRange([100, 4000]);
    setDifficultyRange([0, 4]);
    
    onEditorsChoiceChange?.(false);
    onSwitzerlandChange?.(false);
    onGraubundenChange?.(false);
    onHeightRangeChange?.([100, 4000]);
    onDifficultyRangeChange?.([0, 4]);
  };



  const difficultyLabels: Record<string, Record<string, string>> = {
    hiking: {
      en: 'Hiking',
      de: 'Wandern',
      it: 'Escursionismo',
      fr: 'Randonnée',
    },
    mountain_hiking: {
      en: 'Mountain hiking',
      de: 'Bergwandern',
      it: 'Escursionismo in montagna',
      fr: 'Randonnée en montagne',
    },
    demanding_mountain_hiking: {
      en: 'Demanding mountain hiking',
      de: 'Anspruchsvolles Bergwandern',
      it: 'Escursionismo in montagna impegnativo',
      fr: 'Randonnée en montagne exigeante',
    },
    alpine_hiking: {
      en: 'Alpine hiking',
      de: 'Alpine Wanderung',
      it: 'Escursionismo alpino',
      fr: 'Randonnée alpine',
    },
    difficult_alpine_hiking: {
      en: 'Difficult alpine hiking',
      de: 'Schwierige alpine Wanderung',
      it: 'Escursionismo alpino difficile',
      fr: 'Randonnée alpine difficile',
    },
  };

  const countries = [
    {
      key: 'Switzerland',
      labels: {
        en: 'Switzerland',
        de: 'Schweiz',
        it: 'Svizzera',
        fr: 'Suisse'
      }
    },
    {
      key: 'Italy',
      labels: {
        en: 'Italy',
        de: 'Italien',
        it: 'Italia',
        fr: 'Italie'
      }
    },
    {
      key: 'Liechtenstein',
      labels: {
        en: 'Liechtenstein',
        de: 'Liechtenstein',
        it: 'Liechtenstein',
        fr: 'Liechtenstein'
      }
    },
    {
      key: 'Austria',
      labels: {
        en: 'Austria',
        de: 'Österreich',
        it: 'Austria',
        fr: 'Autriche'
      }
    }
  ];

  const handleCountryChange = (countryKey: string, checked: boolean) => {
    if (checked) {
      setSelectedCountries([...selectedCountries, countryKey]);
    } else {
      setSelectedCountries(selectedCountries.filter(c => c !== countryKey));
    }
  };


  const filtersChanged =
  showOnlyEditorsChoice !== false ||
  showOnlySwitzerland !== false ||
  showOnlyGraubunden !== false ||
  heightRange[0] !== 100 ||
  heightRange[1] !== 4000 ||
  difficultyRange[0] !== 0 ||
  difficultyRange[1] !== 4;


  return (
    <div className={`relative flex flex-col border-r  bg-background ${className}`}>
<div className=" sidebar-scroll flex-1 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-black/40 hover:scrollbar-thumb-black/60 pt-3 pb-6">
  <div className="pl-6 pr-[14px] space-y-3">
          {/* Locations Section - Always at top */}
          <div className="space-y-2.5 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center space-x-2">
              
              <h3 className="font-bold text-sm">
                🌄 {visibleLocations.length} <T
    en="beautiful locations in this area"
    de="schöne Standorte in diesem Gebiet"
    it="belle località in questa zona"
    fr="beaux emplacements dans cette zone"
  />
              </h3>
          
            </div>
          
           <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-black/40 hover:scrollbar-thumb-black/60">
  <div className="grid grid-cols-2 gap-3">
    {visibleLocations
      .sort((a, b) => {
        if (a.recommended && !b.recommended) return -1;
        if (!a.recommended && b.recommended) return 1;
        return 0;
      })
      .map((location, index) => (
        <button
          key={`${location.filename}-${index}`}
          onClick={() => onLocationSelect?.(location)}
          onMouseEnter={() => onLocationHover?.(location)}
          onMouseLeave={() => onLocationHover?.(null)}
          className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-200 group bg-muted"
        >
          <img
            src={location.filename}
            alt={location.short || location.location}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'w-full h-full flex items-center justify-center text-2xl bg-muted';
                fallback.textContent = '📷';
                parent.appendChild(fallback);
              }
            }}
          />

          {/* Gradient bottom label, left-aligned */}
          <div className="absolute bottom-0 left-0 right-0 py-[3px] px-[5px] bg-gradient-to-t from-black/90 via-black/60 to-transparent">
            <span className="text-xs font-medium text-white block truncate text-left">
              {location.short || location.location}
            </span>
          </div>
        </button>
      ))}
  </div>

  {visibleLocations.length === 0 && (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <MapIcon className="h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">
        <T
          en="No locations visible in current map view"
          de="Keine Standorte in der aktuellen Kartenansicht sichtbar"
          it="Nessuna località visibile nella vista mappa corrente"
          fr="Aucun emplacement visible dans la vue carte actuelle"
        />
      </p>
    </div>
  )}
</div>

          </div>
        </div>
      </div>
    
      <div className="w-full h-px bg-border" />
    
      {/* Filters Section - Collapsible */}
      <div className="px-6 py-3 space-y-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className="flex items-center space-x-2 hover:text-primary transition-colors"
            >
              <ChevronDown className={`h-5 w-5 transition-transform ${isFiltersExpanded ? '' : '-rotate-90'}`} />
              <h3 className="font-bold text-sm">
  <T 
    en="Location Filters" 
    de="Standortfilter" 
    it="Filtri località" 
    fr="Filtres de localisation" 
  />
              </h3>
            </button>
            {isFiltersExpanded && filtersChanged && (
  <Button
    variant="ghost"
    size="sm"
    className="h-[20px] px-2 text-xs border border-border bg-muted text-foreground hover:bg-muted/80 transition-colors duration-150"
    onClick={handleResetFilters}
  >
{/*     <RotateCcw className="h-3 w-3 mr-1" /> */}
    <T en="Reset" de="Zurücksetzen" it="Ripristina" fr="Réinitialiser" />
  </Button>
)}

          </div>

          {isFiltersExpanded && (
            <>
              <div className="flex flex-col gap-3">
  {/* Height Range */}
  <div className="flex items-start gap-4">
    <label className="text-xs font-medium w-16">
      <T en="Height" de="Höhe" it="Altezza" fr="Hauteur" />
    </label>
    <div className="flex-1">
      <RangeSlider
        min={100}
        max={4000}
        step={50}
        value={heightRange}
        onValueChange={(value: [number, number]) => {
          const [min, max] = value;
          if (max - min >= 200) {
            setHeightRange(value);
            onHeightRangeChange?.(value);
          }
        }}
        minGap={200}
        className="w-full"
      />
      <div className="flex justify-between text-[12px] text-muted-foreground mt-[5px]">
        <span>{heightRange[0]}m</span>
        <span>{heightRange[1]}m</span>
      </div>
    </div>
  </div>

  {/* Difficulty */}
  <div className="flex items-start gap-4">
    <label className="text-xs font-medium w-16">
              <T en="Difficulty" de="Grad" it="Difficoltà" fr="Difficulté" />
    </label>
    <div className="flex-1">
      <RangeSlider
        min={0}
        max={4}
        step={1}
        value={difficultyRange}
        onValueChange={(value: [number, number]) => {
          setDifficultyRange(value);
          onDifficultyRangeChange?.(value);
        }}
        className="w-full"
      />
      <div className="flex justify-between text-[12px] text-muted-foreground mt-[5px]">
        <span>{difficultyLabels[difficultyKeys[difficultyRange[0]]][language]}</span>
        <span>{difficultyLabels[difficultyKeys[difficultyRange[1]]][language]}</span>
      </div>
    </div>
  </div>
</div>


              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium">
<T
  en="Show only Editor's Choice locations"
  de="Nur Editor's Choice Standorte anzeigen"
  it="Mostra solo le località scelte dall'editore"
fr="Afficher seulement les choix de l'éditeur"
  />
                  </span>
                  <Switch
                    className="scale-75 -mr-[5px]"
                    checked={showOnlyEditorsChoice}
                    onCheckedChange={(checked) => {
                      setShowOnlyEditorsChoice(checked);
                      onEditorsChoiceChange?.(checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium">
<T
  en="Show locations only within Switzerland"
  de="Nur Standorte innerhalb der Schweiz anzeigen"
  it="Mostra solo località in Svizzera"
  fr="Afficher uniquement les lieux en Suisse"
/>
                  </span>
                  <Switch
                    className="scale-75 -mr-[5px]"
                    checked={showOnlySwitzerland}
                    onCheckedChange={(checked) => {
                      setShowOnlySwitzerland(checked);
                      onSwitzerlandChange?.(checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium">
                <T
        en="Show locations only within Graubünden"
        de="Nur Standorte innerhalb Graubündens anzeigen"
        it="Mostra solo località nei Grigioni"
  fr="Afficher uniquement les lieux dans les Grisons"
      />  
                  </span>
                  <Switch
                    className="scale-75 -mr-[5px]"
                    checked={showOnlyGraubunden}
                    onCheckedChange={(checked) => {
                      setShowOnlyGraubunden(checked);
                      onGraubundenChange?.(checked);
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
