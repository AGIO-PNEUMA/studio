// src/ai/flows/expand-search-query.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow to expand a search query using AI.
 *
 * It takes a search query as input and returns an array of expanded search queries,
 * including variations, aliases, and common misspellings.
 *
 * @interface ExpandSearchQueryInput - The input type for the expandSearchQuery function.
 * @interface ExpandSearchQueryOutput - The output type for the expandSearchQuery function.
 * @function expandSearchQuery - The main function to expand the search query.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExpandSearchQueryInputSchema = z.object({
  query: z.string().describe('The original search query.'),
});
export type ExpandSearchQueryInput = z.infer<typeof ExpandSearchQueryInputSchema>;

const ExpandSearchQueryOutputSchema = z.object({
  expandedQueries: z
    .array(z.string())
    .describe('An array of expanded search queries including variations, aliases, and common misspellings.'),
});
export type ExpandSearchQueryOutput = z.infer<typeof ExpandSearchQueryOutputSchema>;

export async function expandSearchQuery(input: ExpandSearchQueryInput): Promise<ExpandSearchQueryOutput> {
  return expandSearchQueryFlow(input);
}

const expandSearchQueryPrompt = ai.definePrompt({
  name: 'expandSearchQueryPrompt',
  input: {schema: ExpandSearchQueryInputSchema},
  output: {schema: ExpandSearchQueryOutputSchema},
  prompt: `You are an expert in generating search queries.

  Given the original search query: {{{query}}},
  generate an array of expanded search queries that include variations, aliases, and common misspellings of the name.
  The expanded queries should help in finding the user across various social media platforms.
  Return the expanded queries as a JSON array of strings.
  Do not include the original query in the expanded queries.
  Limit the number of expanded queries to 10.
  `,
});

const expandSearchQueryFlow = ai.defineFlow(
  {
    name: 'expandSearchQueryFlow',
    inputSchema: ExpandSearchQueryInputSchema,
    outputSchema: ExpandSearchQueryOutputSchema,
  },
  async input => {
    const {output} = await expandSearchQueryPrompt(input);
    return output!;
  }
);
