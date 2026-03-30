"use client";

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { DrinkVariant } from '@/lib/constants';

interface ScrollSequenceProps {
  variant: DrinkVariant;
  onImageLoadProgress?: (progress: number) => void;
}

export function ScrollSequence({ variant, onImageLoadProgress }: ScrollSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Preload logic
  useEffect(() => {
    setIsLoaded(false);
    const loadedImages: HTMLImageElement[] = [];
    let count = 0;

    const loadAllImages = async () => {
      for (let i = 1; i <= variant.frameCount; i++) {
        const img = new Image();
        const frameStr = i.toString().padStart(4, '0');
        img.src = `${variant.basePath}${frameStr}.webp`;
        
        img.onload = () => {
          count++;
          if (onImageLoadProgress) {
            onImageLoadProgress((count / variant.frameCount) * 100);
          }
          if (count === variant.frameCount) {
            setImages(loadedImages);
            setIsLoaded(true);
          }
        };
        loadedImages[i-1] = img;
      }
    };

    loadAllImages();
  }, [variant, onImageLoadProgress]);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Calculate progress based on 1.2x viewport height to control scroll speed
      const progress = Math.min(Math.max(scrollY / (windowHeight * 1.2), 0), 1);
      const index = Math.floor(progress * (variant.frameCount - 1));
      
      setCurrentIndex(index);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [variant]);

  // Render loop
  useEffect(() => {
    if (!isLoaded || images.length === 0 || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const img = images[currentIndex];
      if (!img) return;

      const dpr = window.devicePixelRatio || 1;
      
      // Fill background with pure black to match the asset's edges
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Scale to 100% of the screen height so it doesn't look cut off
      const targetHeight = canvas.height; 
      const scale = targetHeight / (img.height * dpr);
      
      const drawWidth = img.width * dpr * scale;
      const drawHeight = img.height * dpr * scale;
      
      const x = (canvas.width - drawWidth) / 2;
      const y = (canvas.height - drawHeight) / 2;
      
      ctx.drawImage(img, x, y, drawWidth, drawHeight);
    };

    render();
  }, [currentIndex, isLoaded, images]);

  // Resize canvas with DPI support
  useEffect(() => {
    const resize = () => {
      if (canvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        canvasRef.current.width = width * dpr;
        canvasRef.current.height = height * dpr;
        canvasRef.current.style.width = `${width}px`;
        canvasRef.current.style.height = `${height}px`;
      }
    };
    window.addEventListener('resize', resize);
    resize();
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="sequence-canvas pointer-events-none"
      style={{
        transition: 'opacity 0.8s ease-in-out',
        opacity: isLoaded ? 1 : 0,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0,
        backgroundColor: '#000000'
      }}
    />
  );
}
