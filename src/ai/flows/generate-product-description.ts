'use server';
/**
 * @fileOverview A Genkit flow for generating and refining product descriptions for drink variants.
 *
 * - generateProductDescription - A function that handles the product description generation process.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  drinkName: z.string().describe('The name of the drink variant (e.g., "Cherry").'),
  drinkSubtitle: z.string().describe('The subtitle of the drink (e.g., "Soda").'),
  existingDescription: z.string().optional().describe('An optional existing description to refine. If not provided, a new one will be generated.'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  refinedDescription: z.string().describe('The refined or newly generated compelling product description.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(input: GenerateProductDescriptionInput): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const productDescriptionPrompt = ai.definePrompt({
  name: 'productDescriptionPrompt',
  input: { schema: GenerateProductDescriptionInputSchema },
  output: { schema: GenerateProductDescriptionOutputSchema },
  prompt: `You are an expert copywriter for Fizzyo, a modern functional soda brand inspired by classic flavors but made with better ingredients. Your goal is to create compelling, engaging, and high-quality product descriptions for our website. The brand voice should be playful, modern, vibrant, and clean.

Fizzyo Product Details:
Drink Name: {{{drinkName}}}
Drink Subtitle: {{{drinkSubtitle}}}

{{#if existingDescription}}
Refine the following existing product description, ensuring it aligns with Fizzyo's brand voice and tone. Make it compelling and engaging, focusing on the unique aspects and benefits.
Existing Description: {{{existingDescription}}}
{{else}}
Generate a new, compelling product description for the Fizzyo {{{drinkName}}} {{{drinkSubtitle}}}. Highlight its unique flavor profile, quality ingredients, and overall appeal, maintaining Fizzyo's brand voice.
{{/if}}

The description should be 1-3 sentences long and directly communicate the essence of the drink.`,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await productDescriptionPrompt(input);
    return output!;
  },
);
