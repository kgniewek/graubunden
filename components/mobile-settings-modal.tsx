'use client';

import React from 'react';
import { X, Check } from 'lucide-react';
import { RangeSlider } from '@/components/ui/range-slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { T, useLocale } from '@/app/locale-context';

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

  const mapStyles = [
    { id: 'light-simple', name: { en: 'Light Simple', de: 'Hell Einfach', it: 'Semplice Chiaro', fr: 'Simple Clair' }, image: '/map-simple-light.webp' },
    { id: 'dark-simple', name: { en: 'Dark Simple', de: 'Dunkel Einfach', it: 'Semplice Scuro', fr: 'Simple Sombre' }, image: '/map-simple-dark.webp' },
    { id: 'satellite', name: { en: 'Satellite', de: 'Satellit', it: 'Satellite', fr: 'Satellite' }, image: '/map-satelite.webp' },
    { id: 'terrain', name: { en: 'Terrain', de: 'Gelände', it: 'Terreno', fr: 'Terrain' }, image: '/map-terrain.webp' },
    { id: 'street', name: { en: 'Street', de: 'Straße', it: 'Strada', fr: 'Rue' }, image: '/map-street.webp' },
    { id: 'swisstopo', name: { en: 'SwissTopo', de: 'SwissTopo', it: 'SwissTopo', fr: 'SwissTopo' }, image: '/map-swisstopo.webp' },
  ];

  const difficultyLabels = {
    hiking: { en: 'Hiking', de: 'Wandern', it: 'Escursionismo', fr: 'Randonnée' },
    mountain_hiking: { en: 'Mountain hiking', de: 'Bergwandern', it: 'Escursionismo in montagna', fr: 'Randonnée en montagne' },
    demanding_mountain_hiking: { en: 'Demanding mountain hiking', de: 'Anspruchsvolles Bergwandern', it: 'Escursionismo impegnativo', fr: 'Randonnée exigeante' },
    alpine_hiking: { en: 'Alpine hiking', de: 'Alpine Wanderung', it: 'Escursionismo alpino', fr: 'Randonnée alpine' },
    difficult_alpine_hiking: { en: 'Difficult alpine hiking', de: 'Schwierige alpine Wanderung', it: 'Escursionismo difficile', fr: 'Randonnée difficile' },
  };

  const difficultyKeys = ['hiking', 'mountain_hiking', 'demanding_mountain_hiking', 'alpine_hiking', 'difficult_alpine_hiking'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-[95%] max-h-[90%] overflow-y-auto relative p-4">
        {/* Close Button */}
        <button className="absolute top-3 right-3" onClick={onClose}>
          <X className="h-6 w-6" />
        </button>

        {/* Filters */}
        <div className="space-y-4 mt-2">
          <h3 className="font-bold text-lg mb-2">
            <T en="Filters" de="Filter" it="Filtri" fr="Filtres" />
          </h3>

          {/* Height Range */}
          <div>
            <label className="text-sm font-medium"><T en="Height" de="Höhe" it="Altezza" fr="Hauteur" /></label>
            <RangeSlider min={100} max={4000} step={50} value={heightRange} onValueChange={onHeightRangeChange} minGap={200} />
            <div className="flex justify-between text-xs mt-1">
              <span>{heightRange[0]}m</span><span>{heightRange[1]}m</span>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-sm font-medium"><T en="Difficulty" de="Schwierigkeit" it="Difficoltà" fr="Difficulté" /></label>
            <RangeSlider min={0} max={4} step={1} value={difficultyRange} onValueChange={onDifficultyRangeChange} />
            <div className="flex justify-between text-xs mt-1">
              <span>{difficultyLabels[difficultyKeys[difficultyRange[0]]][language]}</span>
              <span>{difficultyLabels[difficultyKeys[difficultyRange[1]]][language]}</span>
            </div>
          </div>

          {/* Switches */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm"><T en="Show only Editor's Choice" de="Nur Editor's Choice" it="Solo Editor's Choice" fr="Seulement choix de l'éditeur" /></span>
              <Switch checked={showOnlyEditorsChoice} onCheckedChange={onEditorsChoiceChange} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Show only Switzerland</span>
              <Switch checked={showOnlySwitzerland} onCheckedChange={onSwitzerlandChange} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Show only Graubünden</span>
              <Switch checked={showOnlyGraubunden} onCheckedChange={onGraubundenChange} />
            </div>
          </div>
        </div>

        {/* Separator */}
        <Separator className="my-4" />

        {/* Map Styles */}
        <div>
          <h3 className="font-bold text-lg mb-3"><T en="Map Style" de="Kartenstil" it="Stile mappa" fr="Style de carte" /></h3>
          <div className="grid grid-cols-3 gap-2">
            {mapStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => onMapStyleChange(style.id)}
                className={`relative aspect-[3/2] rounded-md border-2 overflow-hidden ${selectedMapStyle === style.id ? 'border-primary' : 'border-border'}`}
              >
                <img src={style.image} alt={style.name[language]} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 w-full bg-black/50 text-white text-xs text-center py-1">
                  {style.name[language]}
                </div>
                {selectedMapStyle === style.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
