"use client";

import React from 'react';
import Link from 'next/link';
import { DrinkVariant } from '@/lib/constants';
import { addCartItem } from '@/lib/cart';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Instagram, Twitter, Facebook } from 'lucide-react';

interface HeroOverlayProps {
  variant: DrinkVariant;
  index: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  isTransitioning: boolean;
}

export function HeroOverlay({ variant, index, total, onNext, onPrev, isTransitioning }: HeroOverlayProps) {
  const handleAddToCart = () => {
    addCartItem({
      id: variant.id,
      name: variant.name,
      subtitle: variant.subtitle,
      color: variant.themeColor,
    });
  };

  return (
    <div className="relative z-10 w-full min-h-screen pointer-events-none flex items-center px-6 md:px-12 lg:px-24">
      {/* Left Content */}
      <div className={`max-w-xl transition-all duration-700 pointer-events-auto ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <h2 className="text-xl md:text-2xl font-light text-fizzyo-blue/80 mb-2 uppercase tracking-[0.3em]">
          {variant.subtitle}
        </h2>
        <h1 className="text-7xl md:text-9xl font-black font-headline tracking-tighter text-white mb-6 uppercase">
          {variant.name}
        </h1>
        <p className="text-lg text-white/70 font-light leading-relaxed mb-10 max-w-md">
          {variant.description}
        </p>
        <div className="flex items-center gap-4">
          <Button asChild className="rounded-full px-8 py-7 bg-transparent border-2 border-white hover:bg-white hover:text-fizzyo-charcoal text-white uppercase text-xs font-bold tracking-widest transition-all duration-300">
            <Link href="#taste-future">Contact Now</Link>
          </Button>
          <Button 
            style={{ backgroundColor: variant.themeColor }}
            className="rounded-full px-8 py-7 hover:opacity-90 text-white border-none uppercase text-xs font-bold tracking-widest transition-all duration-300"
            onClick={handleAddToCart}
          >
            Add To Cart
          </Button>
        </div>
      </div>

      {/* Right Variant Nav */}
      <div className="absolute right-6 md:right-12 lg:right-24 top-1/2 -translate-y-1/2 flex items-center gap-8 pointer-events-auto">
        <div className="flex flex-col items-center gap-2">
          <span className="text-5xl md:text-8xl font-black text-white/10 font-headline leading-none">
            {index.toString().padStart(2, '0')}
          </span>
          <div className="flex flex-col items-center gap-4 py-8 relative">
            <button 
              onClick={onPrev}
              className="flex flex-col items-center gap-1 group transition-all"
            >
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] rotate-90 mb-4 text-white/40 group-hover:text-white">PREV</span>
              <ChevronUp className="w-5 h-5 text-white/40 group-hover:text-white" />
            </button>
            <div className="h-16 w-[1px] bg-white/10" />
            <button 
              onClick={onNext}
              className="flex flex-col items-center gap-1 group transition-all"
            >
              <ChevronDown className="w-5 h-5 text-white/40 group-hover:text-white" />
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] rotate-90 mt-4 text-white/40 group-hover:text-white">NEXT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Social Icons */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 text-white/40">
        <a href="#" className="hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
        <a href="#" className="hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
        <a href="#" className="hover:text-white transition-colors"><Facebook className="w-4 h-4" /></a>
      </div>
    </div>
  );
}
