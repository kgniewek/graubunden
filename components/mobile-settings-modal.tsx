'use client';

import React from 'react';
import { X, Check } from 'lucide-react';
import { RangeSlider } from '@/components/ui/range-slider';
import { Switch } from '@/components/ui/switch';
import { T, useLocale } from '@/app/locale-context';
import { useTheme } from 'next-themes';

interface MobileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMapStyle: string;
  onMapStyleChange: (style: string) => void;
  showOnlyEditorsChoice: boolean;
  onEditorsChoiceChange: (show: boolean) => void;
  showOnlySwitzerland: boolean;
  onSwitzerlandChange: (show: boolean) => void;
  showOnlyGraubunden: boolean;
  onGraubundenChange: (show: boolean) => void;
  heightRange: [number, number];
  onHeightRangeChange: (range: [number, number]) => void;
  difficultyRange: [number, number];
  onDifficultyRangeChange: (range: [number, number]) => void;
}

export default function MobileSettingsModal({
  isOpen,
  onClose,
  selectedMapStyle,
  onMapStyleChange,
  showOnlyEditorsChoice,
  onEditorsChoiceChange,
  showOnlySwitzerland,
  onSwitzerlandChange,
  showOnlyGraubunden,
  onGraubundenChange,
  heightRange,
  onHeightRangeChange,
  difficultyRange,
  onDifficultyRangeChange,
}: MobileSettingsModalProps) {
  const { language } = useLocale();
  const { theme, setTheme } = useTheme();

  const mapStyles = [
    { id: 'light-simple', name: { en: 'Light Simple', de: 'Hell Einfach', it: 'Semplice Chiaro', fr: 'Simple Clair' }, image: '/map-simple-light.webp' },
    { id: 'dark-simple',  name: { en: 'Dark Simple',  de: 'Dunkel Einfach', it: 'Semplice Scuro', fr: 'Simple Sombre' }, image: '/map-simple-dark.webp' },
    { id: 'satellite',    name: { en: 'Satellite',    de: 'Satellit',       it: 'Satellite',      fr: 'Satellite'     }, image: '/map-satelite.webp' },
    { id: 'terrain',      name: { en: 'Terrain',      de: 'Gelände',        it: 'Terreno',        fr: 'Terrain'       }, image: '/map-terrain.webp' },
    { id: 'street',       name: { en: 'Street',       de: 'Straße',         it: 'Strada',         fr: 'Rue'           }, image: '/map-street.webp' },
    { id: 'swisstopo',    name: { en: 'SwissTopo',    de: 'SwissTopo',      it: 'SwissTopo',      fr: 'SwissTopo'     }, image: '/map-swisstopo.webp' },
  ];

  const difficultyLabels = {
    hiking: { en: 'Hiking', de: 'Wandern', it: 'Escursionismo', fr: 'Randonnée' },
    mountain_hiking: { en: 'Mountain hiking', de: 'Bergwandern', it: 'Escursionismo in montagna', fr: 'Randonnée en montagne' },
    demanding_mountain_hiking: { en: 'Demanding mountain hiking', de: 'Anspruchsvolles Bergwandern', it: 'Escursionismo impegnativo', fr: 'Randonnée exigeante' },
    alpine_hiking: { en: 'Alpine hiking', de: 'Alpine Wanderung', it: 'Escursionismo alpino', fr: 'Randonnée alpine' },
    difficult_alpine_hiking: { en: 'Difficult alpine hiking', de: 'Schwierige alpine Wanderung', it: 'Escursionismo difficile', fr: 'Randonnée difficile' },
  } as const;

  const difficultyKeys = ['hiking', 'mountain_hiking', 'demanding_mountain_hiking', 'alpine_hiking', 'difficult_alpine_hiking'] as const;

  const getActiveStyle = () => {
    if (selectedMapStyle === 'simple') {
      return theme === 'dark' ? 'dark-simple' : 'light-simple';
    }
    return selectedMapStyle;
  };

  const handleMapStyleChange = (styleId: string) => {
    if (styleId === 'light-simple') {
      setTheme('light');
      onMapStyleChange('simple');
    } else if (styleId === 'dark-simple') {
      setTheme('dark');
      onMapStyleChange('simple');
    } else {
      onMapStyleChange(styleId);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="relative bg-background rounded-xl shadow-lg w-full max-w-[95%] max-h-[90%] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
  <div className="flex items-center justify-between p-5">
    <h2 className="font-bold text-2xl">
      <T
        en="Preferences"
        de="Einstellungen"
        it="Preferenze"
        fr="Préférences"
      />
    </h2>
    <button
      className="text-muted-foreground hover:text-foreground"
      onClick={onClose}
      aria-label="Close"
    >
      <X className="h-[32px] w-[32px]" />
    </button>
  </div>

        {/* Filters */}
        <div className=" space-y-5 pb-5 pl-5 pr-5 ">
<h3 className="font-bold text-lg">
  <T 
    en="Location Filters" 
    de="Standortfilter" 
    it="Filtri località" 
    fr="Filtres de localisation" 
  />
</h3>


          {/* Height Range (label left, slider right) */}
          <div className="flex items-start gap-4">
            <label className="text-md font-medium w-20">
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
                  if (max - min >= 200) onHeightRangeChange(value);
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

          {/* Difficulty (label left, slider right) */}
          <div className="flex items-start gap-4">
            <label className="text-md font-medium w-20">
              <T en="Difficulty" de="Grad" it="Difficoltà" fr="Difficulté" />
            </label>
            <div className="flex-1">
              <RangeSlider
                min={0}
                max={4}
                step={1}
                value={difficultyRange}
                onValueChange={(value: [number, number]) => {
                  onDifficultyRangeChange(value);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-[12px] text-muted-foreground mt-[5px]">
                <span>{difficultyLabels[difficultyKeys[difficultyRange[0]]][language]}</span>
                <span>{difficultyLabels[difficultyKeys[difficultyRange[1]]][language]}</span>
              </div>
            </div>
          </div>

          {/* Switches (extra spacing) */}
          <div className="space-y-[14px] pt-2">
            <div className="flex items-center justify-between">
              <span className="text-md font-medium">
<T
  en="Show only Editor's Choice locations"
  de="Nur Editor's Choice Standorte anzeigen"
  it="Mostra solo le località scelte dall'editore"
  fr="Afficher uniquement les lieux choisis par l'éditeur"
  />
              </span>
              <Switch
                className=""
                checked={showOnlyEditorsChoice}
                onCheckedChange={onEditorsChoiceChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-md font-medium">
<T
  en="Show locations only within Switzerland"
  de="Nur Standorte innerhalb der Schweiz anzeigen"
  it="Mostra solo località in Svizzera"
  fr="Afficher uniquement les lieux en Suisse"
/>
              </span>
              <Switch
                className=""
                checked={showOnlySwitzerland}
                onCheckedChange={onSwitzerlandChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-md font-medium">
                <T
        en="Show locations only within Graubünden"
        de="Nur Standorte innerhalb Graubündens anzeigen"
        it="Mostra solo località nei Grigioni"
  fr="Afficher uniquement les lieux dans les Grisons"
      />  
              </span>
              <Switch
                className=""
                checked={showOnlyGraubunden}
                onCheckedChange={onGraubundenChange}
              />
            </div>
          </div>
        </div>

        {/* Full-width 1px separator */}
        <div className="w-full h-[1px] bg-border mt-1" />

        {/* Map Styles (styled like sidebar) */}
        <div className="space-y-3 p-5">
          <h3 className="font-bold text-lg">
  <T 
    en="Map Source" 
    de="Kartenquelle" 
    it="Fonte della mappa" 
    fr="Source de la carte" 
  />
</h3>


          <div className="grid grid-cols-3 gap-4">
            {mapStyles.map((style) => {
              const isActive = getActiveStyle() === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => handleMapStyleChange(style.id)}
                  className={`relative aspect-[3/2] rounded-md border-2 overflow-hidden ${
                    isActive ? 'border-primary' : 'border-border'
                  }`}
                >
                  {/* Image area */}
                  <div className="absolute top-0 left-0 right-0 bottom-[20px]">
                    <img
  src={style.image}
  alt={style.name[language]}
  className="w-full h-full object-cover object-top"
/>

                    <div className="absolute inset-0 bg-black/20" />

                    {/* Bigger centered check on active */}
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="bg-primary text-primary-foreground rounded-full p-1.5">
                          <Check className="h-5 w-5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom label with bg like original */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 px-1 py-[3px] z-10 text-xs font-medium text-center truncate leading-tight
                      ${isActive
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-white/80 text-black dark:bg-black dark:text-white'
                      }`}
                  >
                    {style.name[language]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
