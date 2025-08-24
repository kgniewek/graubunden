'use client';

import React, { useState } from 'react';
import { Moon, Sun, ChevronDown, MapPin, Settings } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import MapGallery from '@/components/map-gallery';
import { ImagePanel, FullscreenModal } from '@/components/image-panel';
import type { Location } from '@/types/location';
import { useTheme } from 'next-themes';
import { useLocale, T } from '@/app/locale-context';
import { Button } from '@/components/ui/button';
import MobileSettingsModal from '@/components/mobile-settings-modal';

export function ClientLayout() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [selectedMapStyle, setSelectedMapStyle] = useState('simple');
  const [showOnlyEditorsChoice, setShowOnlyEditorsChoice] = useState(false);
  const [showOnlySwitzerland, setShowOnlySwitzerland] = useState(false);
  const [showOnlyGraubunden, setShowOnlyGraubunden] = useState(false);
  const [difficultyRange, setDifficultyRange] = useState<[number, number]>([0, 4]);
  const [heightRange, setHeightRange] = useState<[number, number]>([100, 4000]);
  const [visibleLocations, setVisibleLocations] = useState<Location[]>([]);
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLocale();

  const languages = [
    { code: 'en', name: 'English', flag: 'https://webexposed.org/flag/en.webp' },
    { code: 'de', name: 'Deutsch', flag: 'https://webexposed.org/flag/de.webp' },
    { code: 'it', name: 'Italiano', flag: 'https://webexposed.org/flag/it.webp' },
    { code: 'fr', name: 'Français', flag: 'https://webexposed.org/flag/fr.webp' }
  ] as const;

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    if (!isPanelOpen) setIsPanelOpen(true);
  };

  const handlePanelClose = () => setIsPanelOpen(false);
  const handleFullscreenOpen = () => setIsFullscreenOpen(true);
  const handleFullscreenClose = () => setIsFullscreenOpen(false);
  const handleVisibleLocationsChange = (locations: Location[]) => setVisibleLocations(locations);
  const handleLocationHover = (location: Location | null) => setHoveredLocation(location);

  return (
    <>
      <div className="flex h-screen overflow-hidden flex-col">
        {/* Navigation - fully inside client layout */}
<nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
<div className="flex h-[55px] sm:h-12 w-full items-center justify-between px-1 sm:px-6">
    {/* Left: Logo */}
    <a className="flex items-center space-x-[6px]" href="/">
      <img
        src="/logo-light-map.svg"
        alt="Graubünden Gallery"
        className="h-[30px] w-auto flex-shrink-0 dark:hidden"
      />
      <img
        src="/logo-dark-map.svg"
        alt="Graubünden Gallery"
        className="h-[30px] w-auto flex-shrink-0 hidden dark:inline-block"
      />
      <img
        src="/logo-light-text.svg"
        alt="Graubünden Gallery"
        className="h-[26px] w-auto flex-shrink-0 dark:hidden"
      />
      <img
        src="/logo-dark-text.svg"
        alt="Graubünden Gallery"
        className="h-[26px] w-auto flex-shrink-0 hidden dark:inline-block"
      />
      <span>by Krzysztof Gniewek</span>
    </a>

    {/* Right: Language selector + Theme toggle */}
    <div className="flex items-center space-x-1">
      <div className="relative group">
        <Button variant="ghost" className="h-8 px-3 flex items-center space-x-2">
          <img
            src={currentLanguage.flag}
            alt={currentLanguage.name}
            className="w-[23px] h-auto rounded-sm object-contain"
          />
          <span className="text-sm font-medium">{currentLanguage.name}</span>
  <ChevronDown className="hidden sm:block h-4 w-4 -ml-1 transition-transform group-hover:rotate-180" />
        </Button>

        <div className="absolute right-0 top-full mt-1 w-44 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="py-1">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code as any)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm hover:bg-accent transition-colors ${
                  language === lang.code ? 'bg-accent' : ''
                }`}
              >
                <img src={lang.flag} alt={lang.name} className="w-[22px] h-auto rounded-sm object-contain" />
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        <Sun className="h-[21px] w-[21px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[21px] w-[21px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">
          <T en="Toggle theme" de="Thema wechseln" it="Cambia tema" fr="Changer de thème" />
        </span>
      </Button>
      <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 md:hidden"
                onClick={() => setIsMobileSettingsOpen(true)}
              >
                <Settings className="h-[21px] w-[21px]" />
              </Button>
    </div>
  </div>
</nav>



        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar 
            className="w-[400px] hidden md:flex" 
            selectedMapStyle={selectedMapStyle}
            onMapStyleChange={setSelectedMapStyle}
            onEditorsChoiceChange={setShowOnlyEditorsChoice}
            onSwitzerlandChange={setShowOnlySwitzerland}
            onGraubundenChange={setShowOnlyGraubunden}
            onDifficultyRangeChange={setDifficultyRange}
            onHeightRangeChange={setHeightRange}
            visibleLocations={visibleLocations}
            onLocationSelect={handleLocationSelect}
            onLocationHover={handleLocationHover}
          />

          <main className="flex-1 relative">
            <MapGallery 
              className="h-full w-full" 
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
              hoveredLocation={hoveredLocation}
              isPanelOpen={isPanelOpen}
              selectedMapStyle={selectedMapStyle}
              showOnlyEditorsChoice={showOnlyEditorsChoice}
              showOnlySwitzerland={showOnlySwitzerland}
              showOnlyGraubunden={showOnlyGraubunden}
              difficultyRange={difficultyRange}
              heightRange={heightRange}
              onVisibleLocationsChange={handleVisibleLocationsChange}
            />
          </main>
        </div>

        <ImagePanel
          location={selectedLocation}
          isOpen={isPanelOpen}
          onClose={handlePanelClose}
          onFullscreenOpen={handleFullscreenOpen}
        />

        <FullscreenModal
          isOpen={isFullscreenOpen}
          onClose={handleFullscreenClose}
          imageSrc={selectedLocation?.filename || ''}
          imageAlt={selectedLocation?.location || ''}
        />
      </div>



       <MobileSettingsModal
        isOpen={isMobileSettingsOpen}
        onClose={() => setIsMobileSettingsOpen(false)}
        selectedMapStyle={selectedMapStyle}
        onMapStyleChange={(id) => {
          if (id === 'light-simple') {
            setTheme('light');
            setSelectedMapStyle('simple');
          } else if (id === 'dark-simple') {
            setTheme('dark');
            setSelectedMapStyle('simple');
          } else {
            setSelectedMapStyle(id);
          }
        }}
        showOnlyEditorsChoice={showOnlyEditorsChoice}
        onEditorsChoiceChange={setShowOnlyEditorsChoice}
        showOnlySwitzerland={showOnlySwitzerland}
        onSwitzerlandChange={setShowOnlySwitzerland}
        showOnlyGraubunden={showOnlyGraubunden}
        onGraubundenChange={setShowOnlyGraubunden}
        heightRange={heightRange}
        onHeightRangeChange={setHeightRange}
        difficultyRange={difficultyRange}
        onDifficultyRangeChange={setDifficultyRange}
      />
    </>
  );
}
