"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ContentSections() {
  return (
    <div className="relative z-10 bg-background pt-24 pb-12">
      {/* Product Section */}
      <section id="product" className="container mx-auto px-6 py-24 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <Badge className="mb-6 bg-fizzyo-purple/20 text-fizzyo-purple border-fizzyo-purple/30 px-4 py-1">
              THE STORY
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter mb-8 uppercase">
              REINVENTING THE SODA <br /> YOU LOVE.
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Fizzyo was born from a simple question: why do the drinks that taste the best have to be the worst for you? We spent two years in the lab perfecting a formula that captures the nostalgic magic of classic soda without the artificial junk.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-2xl font-bold font-headline text-fizzyo-purple mb-2">0g</h4>
                <p className="text-sm text-muted-foreground uppercase tracking-widest">Added Sugar</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold font-headline text-fizzyo-purple mb-2">100%</h4>
                <p className="text-sm text-muted-foreground uppercase tracking-widest">Real Juice</p>
              </div>
            </div>
          </div>
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-fizzyo-charcoal border border-white/10 group">
            <img 
              src="https://picsum.photos/seed/fizzyo1/800/800" 
              alt="Fizzyo Studio" 
              className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
              data-ai-hint="drink can studio"
            />
          </div>
        </div>
      </section>

      {/* Ingredients & Benefits */}
      <section id="ingredients" className="py-24 bg-fizzyo-charcoal/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter uppercase mb-4">Functional & Flavorful</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Better ingredients, better body. We only use what matters.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Prebiotic Fiber', desc: 'Sourced from agave inulin to support a healthy gut microbiome.' },
              { title: 'Real Fruit Juice', desc: 'No "natural flavors" here. We use pure cold-pressed juices.' },
              { title: 'Botanicals', desc: 'Infused with calming extracts for a focused, clear-headed spark.' }
            ].map((item, idx) => (
              <Card key={idx} className="bg-fizzyo-charcoal/50 border-white/5 hover:border-fizzyo-purple/30 transition-all">
                <CardHeader>
                  <CardTitle className="text-xl font-headline uppercase tracking-widest">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Nutrition Labels */}
      <section id="nutrition" className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
           <div className="p-8 border-4 border-foreground text-foreground max-w-sm mx-auto font-body uppercase font-bold">
              <h2 className="text-4xl border-b-8 border-foreground pb-2 leading-none">Nutrition Facts</h2>
              <div className="text-sm border-b border-foreground py-1 flex justify-between">
                <span>Serving Size</span>
                <span>1 Can (12 fl oz)</span>
              </div>
              <div className="text-sm border-b-8 border-foreground py-1 flex justify-between font-black">
                <span>Amount Per Serving</span>
                <span></span>
              </div>
              <div className="text-3xl border-b border-foreground py-1 flex justify-between">
                <span>Calories</span>
                <span>35</span>
              </div>
              <div className="text-xs border-b border-foreground py-1 flex justify-end">
                <span>% Daily Value*</span>
              </div>
              <div className="text-sm border-b border-foreground py-1 flex justify-between">
                <span>Total Fat 0g</span>
                <span>0%</span>
              </div>
              <div className="text-sm border-b border-foreground py-1 flex justify-between">
                <span>Sodium 15mg</span>
                <span>1%</span>
              </div>
              <div className="text-sm border-b border-foreground py-1 flex justify-between">
                <span>Total Carbohydrate 12g</span>
                <span>4%</span>
              </div>
              <div className="text-sm border-b border-foreground py-1 pl-4 flex justify-between">
                <span>Dietary Fiber 5g</span>
                <span>18%</span>
              </div>
              <div className="text-sm border-b-8 border-foreground py-1 pl-4 flex justify-between">
                <span>Total Sugars 4g</span>
                <span></span>
              </div>
              <div className="text-xs pt-2 font-normal lowercase leading-tight">
                *The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.
              </div>
           </div>
           <div>
              <h2 className="text-4xl font-bold font-headline mb-8 uppercase">Nothing to Hide.</h2>
              <p className="text-lg text-muted-foreground mb-12">
                We believe in transparency. That's why our label is simple, readable, and free from hidden synthetic sweeteners or confusing chemicals.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-fizzyo-purple flex items-center justify-center text-white font-bold">01</div>
                  <p className="font-bold uppercase tracking-widest">No Stevia Aftertaste</p>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-fizzyo-purple flex items-center justify-center text-white font-bold">02</div>
                  <p className="font-bold uppercase tracking-widest">Vegan & Gluten-Free</p>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-fizzyo-purple flex items-center justify-center text-white font-bold">03</div>
                  <p className="font-bold uppercase tracking-widest">Keto Friendly</p>
                </div>
              </div>
           </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="container mx-auto px-6 py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold font-headline text-center mb-16 uppercase tracking-widest">Questions & Answers</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-white/10">
              <AccordionTrigger className="text-left font-bold uppercase tracking-wider">How many calories per can?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Every can of Fizzyo contains exactly 35 calories, primarily derived from real fruit juices and organic agave.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-white/10">
              <AccordionTrigger className="text-left font-bold uppercase tracking-wider">Is there any caffeine?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Nope! All our core flavors are caffeine-free. We rely on botanicals and real fruit to give you that natural boost without the jitters.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-white/10">
              <AccordionTrigger className="text-left font-bold uppercase tracking-wider">What about shipping?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                We ship nationwide. Orders over $40 qualify for free standard shipping. Typically, delivery takes 3-5 business days.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-6 py-48">
        <div className="bg-fizzyo-purple rounded-[3rem] p-12 md:p-24 text-center text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
          <h2 className="text-5xl md:text-8xl font-black font-headline tracking-tighter uppercase mb-8 relative z-10">
            TASTE THE <br /> FUTURE NOW.
          </h2>
          <p className="text-xl md:text-2xl opacity-80 mb-12 max-w-2xl mx-auto relative z-10">
            Join the fizzy revolution. Get 10% off your first variety pack when you sign up for our newsletter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Button size="lg" className="rounded-full bg-white text-fizzyo-purple hover:bg-white/90 px-12 py-8 text-lg font-bold uppercase tracking-widest">
              Shop All
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-white/30 hover:bg-white/10 text-white px-12 py-8 text-lg font-bold uppercase tracking-widest">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-fizzyo-charcoal py-24 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
            <div className="col-span-1 md:col-span-1">
              <h2 className="text-3xl font-bold font-headline tracking-tighter mb-6 uppercase">FIZZYO.</h2>
              <p className="text-muted-foreground text-sm leading-relaxed uppercase tracking-widest">
                Modern functional soda for a <br /> better state of mind.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 mb-8">Navigation</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm font-bold uppercase tracking-widest hover:text-fizzyo-purple transition-colors">Home</a></li>
                <li><a href="#product" className="text-sm font-bold uppercase tracking-widest hover:text-fizzyo-purple transition-colors">Products</a></li>
                <li><a href="#ingredients" className="text-sm font-bold uppercase tracking-widest hover:text-fizzyo-purple transition-colors">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 mb-8">Legal</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm font-bold uppercase tracking-widest hover:text-fizzyo-purple transition-colors">Privacy</a></li>
                <li><a href="#" className="text-sm font-bold uppercase tracking-widest hover:text-fizzyo-purple transition-colors">Terms</a></li>
                <li><a href="#" className="text-sm font-bold uppercase tracking-widest hover:text-fizzyo-purple transition-colors">Cookies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 mb-8">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"><Instagram className="w-4 h-4" /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"><Twitter className="w-4 h-4" /></a>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-4">
            <p className="text-xs font-bold text-white/20 uppercase tracking-widest">
              © 2024 Fizzyo Beverage Co. All rights reserved.
            </p>
            <p className="text-xs font-bold text-white/20 uppercase tracking-widest">
              Built with purpose in California.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Instagram(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function Twitter(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  )
}
