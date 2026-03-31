"use client";

import React, { useEffect, useState } from 'react';

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
      <div className="flex items-center gap-4" aria-label="Loading">
        <span
          className="h-5 w-5 rounded-full bg-fizzyo-blue animate-bounce"
          style={{ animationDelay: '0ms', animationDuration: '800ms' }}
        />
        <span
          className="h-5 w-5 rounded-full bg-fizzyo-blue animate-bounce"
          style={{ animationDelay: '140ms', animationDuration: '800ms' }}
        />
        <span
          className="h-5 w-5 rounded-full bg-fizzyo-blue animate-bounce"
          style={{ animationDelay: '280ms', animationDuration: '800ms' }}
        />
      </div>
    </div>
  );
}
