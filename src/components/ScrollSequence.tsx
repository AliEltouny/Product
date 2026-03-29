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
  }, [variant]);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const containerHeight = windowHeight * 2; // Fixed height of parallax container
      
      const progress = Math.min(Math.max(scrollY / windowHeight, 0), 1);
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

      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    };

    render();
  }, [currentIndex, isLoaded, images]);

  // Resize canvas
  useEffect(() => {
    const resize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
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
        opacity: isLoaded ? 1 : 0
      }}
    />
  );
}
