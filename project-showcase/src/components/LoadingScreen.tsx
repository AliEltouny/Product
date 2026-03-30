"use client";

import React, { useEffect, useState } from 'react';
import { Progress } from "@/components/ui/progress";

interface LoadingScreenProps {
  progress: number;
  isLoaded: boolean;
}

export function LoadingScreen({ progress, isLoaded }: LoadingScreenProps) {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => setShouldRender(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-fizzyo-charcoal transition-opacity duration-700 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="mb-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
          FIZZYO<span className="text-fizzyo-purple">.</span>
        </h1>
      </div>
      <div className="w-64 space-y-2">
        <Progress value={progress} className="h-1 bg-white/10" />
        <p className="text-xs text-center font-mono text-muted-foreground uppercase tracking-widest">
          Loading {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}
