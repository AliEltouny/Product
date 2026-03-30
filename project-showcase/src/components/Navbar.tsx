"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Moon, Sun, ShoppingBag, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  decrementCartItem,
  getCartItems,
  removeCartItem,
  type CartItem,
} from '@/lib/cart';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const syncCart = () => setCartItems(getCartItems());
    syncCart();
    window.addEventListener('cart:updated', syncCart as EventListener);
    return () => window.removeEventListener('cart:updated', syncCart as EventListener);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    document.documentElement.classList.toggle('dark');
  };

  const navClassName = isScrolled
    ? 'bg-background/80 backdrop-blur-md py-4 border-b'
    : isDarkMode
      ? 'bg-transparent py-8'
      : 'bg-background/20 backdrop-blur-md py-6 border-b border-border/20';

  const navLinks = [
    { name: 'Product', href: '#product' },
    { name: 'Ingredients', href: '#ingredients' },
    { name: 'Nutrition', href: '#nutrition' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact Now', href: '#taste-future' },
  ];

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navClassName}`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-2xl font-bold tracking-tighter font-headline">
            FIZZYO<span className="text-fizzyo-purple">.</span>
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-sm font-medium hover:text-fizzyo-purple transition-colors uppercase tracking-widest"
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="rounded-full hover:bg-white/10"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-white/10">
                <ShoppingBag className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-fizzyo-purple text-white text-[10px] font-bold flex items-center justify-center">
                    {totalCartCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-center">Your Cart</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {cartItems.length === 0 ? (
                <DropdownMenuItem className="text-muted-foreground justify-center">No items yet.</DropdownMenuItem>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="group relative overflow-hidden rounded-md border border-border/40 bg-background/40">
                    <div className="flex items-center gap-2 px-2 py-2 pr-20 transition-[margin-right] duration-300 group-hover:mr-[72px]">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="truncate">{item.name} {item.subtitle}</span>
                      </div>
                    </div>

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-70 transition-[right] duration-300 group-hover:right-20">
                      x{item.qty}
                    </span>

                    <div className="absolute inset-y-0 right-0 flex w-[72px] translate-x-full transition-transform duration-300 group-hover:translate-x-0">
                      <button
                        type="button"
                        aria-label={`Decrease ${item.name}`}
                        onClick={() => decrementCartItem(item.id)}
                        className="flex-1 bg-white/5 hover:bg-white/10 flex items-center justify-center"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeCartItem(item.id)}
                        className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button asChild className="hidden sm:flex rounded-full px-6 py-6 bg-fizzyo-purple hover:bg-fizzyo-purple/90 text-white border-none uppercase text-xs font-bold tracking-widest">
            <Link href="/shop">Buy Now</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
