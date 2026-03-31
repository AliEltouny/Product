"use client";

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Recipe = {
  id: number;
  soda: string;
  subtitle: string;
  image: string;
  color: string;
  title: string;
  summary: string;
  ingredients: string[];
  instructions: string[];
};

const RECIPES: Recipe[] = [
  {
    id: 1,
    soda: 'Cherry',
    subtitle: 'Bright + Tart',
    image: 'https://braszseedmeagubxkkyp.supabase.co/storage/v1/object/public/Products/Cherry%201.png?v=4',
    color: '#FF1F44',
    title: 'Cherry Spark Cooler',
    summary: 'A crisp cherry mocktail with citrus lift and a clean finish.',
    ingredients: [
      '1 can Fizzyo Cherry',
      '1/2 lime, juiced',
      '4 fresh mint leaves',
      'Ice cubes',
      'Pinch of sea salt',
    ],
    instructions: [
      'Muddle mint with lime juice in a tall glass.',
      'Add ice and a tiny pinch of sea salt.',
      'Top with Fizzyo Cherry and stir gently.',
      'Garnish with mint and a lime wheel.',
    ],
  },
  {
    id: 2,
    soda: 'Grape',
    subtitle: 'Deep + Smooth',
    image: 'https://braszseedmeagubxkkyp.supabase.co/storage/v1/object/public/Products/Grape%201.png?v=4',
    color: '#5226D9',
    title: 'Grape Night Fizz',
    summary: 'Layered grape fizz balanced with citrus and a ginger snap.',
    ingredients: [
      '1 can Fizzyo Grape',
      '1 tsp fresh lemon juice',
      '1 tsp grated ginger',
      'Crushed ice',
      '1 thin orange peel strip',
    ],
    instructions: [
      'Add ginger and lemon to the base of the glass.',
      'Fill with crushed ice and pour Fizzyo Grape.',
      'Stir once to keep bubbles lively.',
      'Express orange peel oils over the top and serve.',
    ],
  },
  {
    id: 3,
    soda: 'Orange',
    subtitle: 'Zesty + Sunny',
    image: 'https://braszseedmeagubxkkyp.supabase.co/storage/v1/object/public/Products/Orange%201.png?v=4',
    color: '#FF8C00',
    title: 'Orange Sunrise Twist',
    summary: 'Citrus-forward refresher with a mellow vanilla edge.',
    ingredients: [
      '1 can Fizzyo Orange',
      '1 tsp honey or agave',
      '1/4 tsp vanilla extract',
      'Orange slices',
      'Ice cubes',
    ],
    instructions: [
      'Whisk honey and vanilla in a chilled glass.',
      'Add ice and a few orange slices.',
      'Pour Fizzyo Orange slowly to keep foam silky.',
      'Serve immediately with a citrus stir stick.',
    ],
  },
];

export function SodaCookbook() {
  const [index, setIndex] = useState(0);
  const [isTurning, setIsTurning] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [nextIndex, setNextIndex] = useState(0);

  const getRecipe = (recipeIndex: number) => RECIPES[(recipeIndex + RECIPES.length) % RECIPES.length];

  const leftPage = getRecipe(index);
  const rightPage = useMemo(() => getRecipe(index + 1), [index]);

  const targetLeftPage = getRecipe(nextIndex);
  const targetRightPage = getRecipe(nextIndex + 1);

  const baseLeftPage = isTurning && direction === 'prev' ? targetLeftPage : leftPage;
  const baseRightPage = isTurning && direction === 'next' ? targetRightPage : rightPage;

  const turnFrontPage = direction === 'next' ? rightPage : leftPage;
  const turnBackPage = direction === 'next' ? targetLeftPage : targetRightPage;

  const runTurn = (nextIndex: number, turnDirection: 'next' | 'prev') => {
    if (isTurning) return;
    setDirection(turnDirection);
    setNextIndex(nextIndex);
    setIsTurning(true);
    window.setTimeout(() => {
      setIndex(nextIndex);
      setIsTurning(false);
    }, 860);
  };

  const goNext = () => runTurn((index + 1) % RECIPES.length, 'next');
  const goPrev = () => runTurn((index - 1 + RECIPES.length) % RECIPES.length, 'prev');

  return (
    <div className="relative max-w-[860px] mx-auto">
      <h3 className="text-center text-3xl md:text-4xl font-black tracking-tight uppercase mb-5 text-fizzyo-blue dark:text-fizzyo-purple">
        Our Fizzy Recipe Book
      </h3>

      <div className="relative rounded-[2rem] border-4 border-fizzyo-purple/60 bg-gradient-to-br from-[#f8eec8] to-[#f2e3ae] dark:from-[#2b1e23] dark:to-[#191116] shadow-[0_16px_40px_rgba(0,0,0,0.28)] overflow-visible px-3 py-3 md:px-4 md:py-4">
        <div className="relative px-2 py-2 md:px-3 md:py-3 overflow-visible">
          <div className="absolute inset-0 rounded-[1.45rem] border border-black/10 dark:border-white/10 pointer-events-none" />
          <div className="relative overflow-hidden rounded-[1.45rem]">
          <div className="pointer-events-none absolute inset-y-0 left-1/2 z-30 w-[2px] -translate-x-1/2 bg-gradient-to-b from-fizzyo-purple/20 via-fizzyo-purple/45 to-fizzyo-purple/20" />

          <div className="grid grid-cols-2">
            <RecipePage recipe={baseLeftPage} />
            <RecipePage recipe={baseRightPage} />
          </div>

          <div
            className={`pointer-events-none absolute inset-y-0 z-40 w-1/2 ${direction === 'next' ? 'left-1/2' : 'left-0'}`}
            style={{
              transformStyle: 'preserve-3d',
              transformOrigin: direction === 'next' ? 'left center' : 'right center',
              transform: `perspective(1500px) rotateY(${isTurning ? (direction === 'next' ? '-168deg' : '168deg') : '0deg'})`,
              transition: 'transform 860ms cubic-bezier(0.16, 0.77, 0.27, 1)',
              opacity: isTurning ? 1 : 0,
            }}
          >
            <div
              className="absolute inset-0"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <RecipePage recipe={turnFrontPage} isTurningFace />
              <div className="absolute inset-y-0 right-0 w-[14%] bg-gradient-to-l from-black/20 to-transparent dark:from-black/40" />
            </div>
            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <RecipePage recipe={turnBackPage} isTurningFace />
              <div className="absolute inset-y-0 left-0 w-[14%] bg-gradient-to-r from-black/20 to-transparent dark:from-black/40" />
            </div>
          </div>
          </div>
        </div>

        <div className="absolute right-[-14px] top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2">
          {RECIPES.map((recipe, recipeIndex) => (
            <button
              key={recipe.id}
              type="button"
              onClick={() => runTurn(recipeIndex, recipeIndex > index ? 'next' : 'prev')}
              className="relative h-16 w-9 rounded-r-xl overflow-hidden transition-all shadow-sm"
              style={{
                backgroundColor: recipeIndex === index ? recipe.color : '#e7dca8',
                color: recipeIndex === index ? '#fff' : '#3a2f17',
              }}
              aria-label={`Open ${recipe.soda} recipe page`}
            >
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black uppercase tracking-[0.12em] whitespace-nowrap rotate-90">
                {recipe.soda}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={goPrev}
          className="h-11 w-11 rounded-xl bg-fizzyo-blue text-black dark:text-white dark:bg-fizzyo-purple flex items-center justify-center hover:opacity-90 transition-opacity"
          aria-label="Previous recipe spread"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="h-11 w-11 rounded-xl bg-fizzyo-blue text-black dark:text-white dark:bg-fizzyo-purple flex items-center justify-center hover:opacity-90 transition-opacity"
          aria-label="Next recipe spread"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function RecipePage({ recipe, isTurningFace = false }: { recipe: Recipe; isTurningFace?: boolean }) {
  return (
    <article className={`p-3 sm:p-4 md:p-5 border-r last:border-r-0 border-black/10 dark:border-white/10 h-auto sm:h-[380px] md:h-[420px] bg-gradient-to-br from-[#f7edc5]/90 to-[#f0e2af]/90 dark:from-[#2a1d23]/80 dark:to-[#1d1519]/80 overflow-y-auto sm:overflow-y-visible ${isTurningFace ? 'h-full' : ''}`}>
      <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
        <img
          src={recipe.image}
          alt={`${recipe.soda} soda`}
          className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain rounded-lg bg-black/40 border border-black/10 dark:border-white/10 flex-shrink-0"
        />
        <div className="min-w-0">
          <p className="inline-flex rounded-full px-2 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-black/70 dark:text-white/80 bg-black/10 dark:bg-white/10 mb-2">
            {recipe.subtitle}
          </p>
          <h4 className="text-base sm:text-xl md:text-2xl font-black leading-tight tracking-tight text-black/90 dark:text-white">
            {recipe.title}
          </h4>
          <p className="text-[11px] sm:text-xs md:text-sm text-black/70 dark:text-white/75 mt-1">{recipe.summary}</p>
        </div>
      </div>

      <div className="h-[1px] bg-black/15 dark:bg-white/15 mb-3 sm:mb-4" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2.5 text-[10px] sm:text-[11px] md:text-xs">
        <div>
          <h5 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] mb-1.5 text-black/80 dark:text-white/80">Ingredients</h5>
          <ul className="space-y-1 text-black/80 dark:text-white/80 leading-snug">
            {recipe.ingredients.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] mb-1.5 text-black/80 dark:text-white/80">Instructions</h5>
          <ol className="space-y-1 text-black/80 dark:text-white/80 leading-snug list-decimal list-inside">
            {recipe.instructions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </div>
    </article>
  );
}
