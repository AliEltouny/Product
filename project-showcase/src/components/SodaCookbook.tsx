"use client";

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

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
  const [expandedRecipe, setExpandedRecipe] = useState<Recipe | null>(null);

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

      <div className="relative rounded-[2rem] border-4 border-fizzyo-purple/60 bg-gradient-to-br from-[#f8eec8] to-[#f2e3ae] dark:from-[#2b1e23] dark:to-[#191116] shadow-[0_16px_40px_rgba(0,0,0,0.28)] overflow-visible px-3 py-3 md:px-4 md:py-4 aspect-[2/1] sm:aspect-[2/1] md:aspect-auto">
        <div className="relative px-2 py-2 md:px-3 md:py-3 overflow-visible">
          <div className="absolute inset-0 rounded-[1.45rem] border border-black/10 dark:border-white/10 pointer-events-none" />
          <div className="relative overflow-hidden rounded-[1.45rem]">
          <div className="pointer-events-none absolute inset-y-0 left-1/2 z-30 w-[2px] -translate-x-1/2 bg-gradient-to-b from-fizzyo-purple/20 via-fizzyo-purple/45 to-fizzyo-purple/20" />

          <div className="grid grid-cols-2">
            <RecipePage recipe={baseLeftPage} onExpand={setExpandedRecipe} />
            <RecipePage recipe={baseRightPage} onExpand={setExpandedRecipe} />
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
              <RecipePage recipe={turnFrontPage} isTurningFace onExpand={setExpandedRecipe} />
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
              <RecipePage recipe={turnBackPage} isTurningFace onExpand={setExpandedRecipe} />
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

      {expandedRecipe && <RecipeModal recipe={expandedRecipe} onClose={() => setExpandedRecipe(null)} />}
    </div>
  );
}

function RecipePage({ recipe, isTurningFace = false, onExpand }: { recipe: Recipe; isTurningFace?: boolean; onExpand?: (recipe: Recipe) => void }) {
  return (
    <article className={`p-3 sm:p-4 md:p-5 border-r last:border-r-0 border-black/10 dark:border-white/10 h-auto sm:h-[380px] md:h-[420px] bg-gradient-to-br from-[#f7edc5]/90 to-[#f0e2af]/90 dark:from-[#2a1d23]/80 dark:to-[#1d1519]/80 overflow-y-auto sm:overflow-y-visible flex flex-col ${isTurningFace ? 'h-full' : ''}`}>
      <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
        <img
          src={recipe.image}
          alt={`${recipe.soda} soda`}
          className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain rounded-lg bg-black/40 border border-black/10 dark:border-white/10 flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2.5 text-[10px] sm:text-[11px] md:text-xs flex-1 overflow-y-auto">
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

      {onExpand && (
        <button
          type="button"
          onClick={() => onExpand(recipe)}
          className="mt-3 sm:hidden w-full py-2 bg-white font-bold text-black rounded-lg hover:bg-white/90 transition-colors text-sm"
        >
          View Full Recipe
        </button>
      )}
    </article>
  );
}

function RecipeModal({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50">
      <div className="bg-gradient-to-br from-[#f7edc5] to-[#f0e2af] dark:from-[#2a1d23] dark:to-[#1d1519] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-4 sm:p-6 border-b border-black/10 dark:border-white/10 bg-gradient-to-br from-[#f7edc5] to-[#f0e2af] dark:from-[#2a1d23] dark:to-[#1d1519]">
          <div className="flex items-center gap-4">
            <img
              src={recipe.image}
              alt={`${recipe.soda} soda`}
              className="h-20 w-20 object-contain rounded-lg bg-black/40 border border-black/10 dark:border-white/10"
            />
            <div>
              <p className="inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-black/70 dark:text-white/80 bg-black/10 dark:bg-white/10 mb-2">
                {recipe.subtitle}
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-black/90 dark:text-white">
                {recipe.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors text-black/70 dark:text-white/70"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <p className="text-base text-black/80 dark:text-white/80 mb-6">{recipe.summary}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-[14px] font-black uppercase tracking-[0.15em] mb-4 text-black/80 dark:text-white/80">Ingredients</h3>
              <ul className="space-y-2 text-sm text-black/80 dark:text-white/80 leading-relaxed">
                {recipe.ingredients.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-black/40 dark:bg-white/40 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[14px] font-black uppercase tracking-[0.15em] mb-4 text-black/80 dark:text-white/80">Instructions</h3>
              <ol className="space-y-3 text-sm text-black/80 dark:text-white/80 leading-relaxed">
                {recipe.instructions.map((item, idx) => (
                  <li key={item} className="flex gap-3">
                    <span className="font-black text-base bg-black/10 dark:bg-white/10 text-black/70 dark:text-white/70 rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
