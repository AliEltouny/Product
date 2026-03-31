"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { DRINK_VARIANTS } from '@/lib/constants';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Navbar } from '@/components/Navbar';
import { ScrollSequence } from '@/components/ScrollSequence';
import { HeroOverlay } from '@/components/HeroOverlay';
import { ContentSections } from '@/components/ContentSections';

export default function Home() {
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isInitiallyLoaded, setIsInitiallyLoaded] = useState(false);

  const currentVariant = DRINK_VARIANTS[currentVariantIndex];

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentVariantIndex((prev) => (prev + 1) % DRINK_VARIANTS.length);
      setIsTransitioning(false);
    }, 600);
  }, [isTransitioning]);

  const handlePrev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentVariantIndex((prev) => (prev - 1 + DRINK_VARIANTS.length) % DRINK_VARIANTS.length);
      setIsTransitioning(false);
    }, 600);
  }, [isTransitioning]);

  const handleProgress = useCallback((progress: number) => {
    setLoadProgress(progress);
    if (progress === 100) {
      setTimeout(() => setIsInitiallyLoaded(true), 500);
    }
  }, []);

  return (
    <main className="relative min-h-screen">
      <LoadingScreen progress={loadProgress} isLoaded={isInitiallyLoaded} />
      
      {isInitiallyLoaded && <Navbar />}

      <div className="parallax-container">
        <div className="sticky top-0 h-screen overflow-hidden">
          <ScrollSequence 
            variant={currentVariant} 
            onImageLoadProgress={handleProgress}
            onVideoEnd={handleNext}
          />

          <div className="absolute inset-0 z-[5] pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(13,11,15,0.4)_100%)]" />

          <HeroOverlay 
            variant={currentVariant} 
            index={currentVariantIndex + 1}
            total={DRINK_VARIANTS.length}
            onNext={handleNext}
            onPrev={handlePrev}
            isTransitioning={isTransitioning}
          />
        </div>
      </div>

      <ContentSections />
    </main>
  );
}
