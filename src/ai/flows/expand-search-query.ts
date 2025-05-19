
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

// Base schema for what the AI prompt itself is expected to return
const AIExpandedQueriesSchema = z.object({
  expandedQueries: z
    .array(z.string())
    .describe('An array of expanded search queries including variations, aliases, and common misspellings.'),
});

// Output schema for the exported function, which includes status information
// This schema is NOT exported to prevent "use server" errors. The type is exported.
const ExpandSearchQueryOutputSchema = AIExpandedQueriesSchema.extend({
  aiExpansionPerformed: z.boolean().describe('Indicates if AI-based query expansion was attempted and successful.'),
  aiExpansionSkippedReason: z.string().optional().describe('Reason why AI expansion might have been skipped or failed (e.g., API_KEY_MISSING, FLOW_EXECUTION_ERROR).'),
});
export type ExpandSearchQueryOutput = z.infer<typeof ExpandSearchQueryOutputSchema>;


// This is the main function called by the frontend component.
export async function expandSearchQuery(input: ExpandSearchQueryInput): Promise<ExpandSearchQueryOutput> {
  // Check if the GOOGLE_API_KEY is available in the environment.
  // This environment variable is typically set in a .env file for local development
  // or through environment configuration in a deployment environment.
  if (!process.env.GOOGLE_API_KEY) {
    console.warn(
      "GOOGLE_API_KEY is not set. AI query expansion will be skipped. " +
      "To enable AI features, please provide a GOOGLE_API_KEY in your environment."
    );
    // Return a default response indicating no expansion occurred due to missing API key.
    return { 
      expandedQueries: [input.query], // Return original query if AI is skipped
      aiExpansionPerformed: false, 
      aiExpansionSkippedReason: "API_KEY_MISSING" 
    };
  }

  // If the API key is present, proceed with calling the actual Genkit flow.
  try {
    const flowResult = await expandSearchQueryFlow(input);
    // If flowResult is null or undefined (e.g. prompt failed badly), ensure a valid structure.
    // Include original query in the results.
    const queries = [input.query, ...(flowResult?.expandedQueries || [])];
     // Remove duplicates if original query was somehow included by AI
    const uniqueQueries = Array.from(new Set(queries));

    return { 
      expandedQueries: uniqueQueries, 
      aiExpansionPerformed: true 
    };
  } catch (error) {
    console.error("Error calling expandSearchQueryFlow:", error);
    // If the flow execution itself throws an error.
    return { 
      expandedQueries: [input.query], // Return original query on error
      aiExpansionPerformed: false, 
      aiExpansionSkippedReason: "FLOW_EXECUTION_ERROR" 
    };
  }
}

const expandSearchQueryPrompt = ai.definePrompt({
  name: 'expandSearchQueryPrompt',
  input: {schema: ExpandSearchQueryInputSchema},
  // The prompt's direct output schema
  output: {schema: AIExpandedQueriesSchema}, 
  prompt: `You are an expert in generating search queries.

  Given the original search query: {{{query}}},
  generate an array of expanded search queries that include variations, aliases, and common misspellings of the name.
  The expanded queries should help in finding the user across various social media platforms.
  Return the expanded queries as a JSON array of strings.
  Do not include the original query in the expanded queries.
  Limit the number of expanded queries to 10.
  `,
});

// This is the actual Genkit flow. It assumes an API key is available if it's called by the wrapper.
// It's designed to return the AIExpandedQueriesSchema structure.
const expandSearchQueryFlow = ai.defineFlow(
  {
    name: 'expandSearchQueryFlow',
    inputSchema: ExpandSearchQueryInputSchema,
    outputSchema: AIExpandedQueriesSchema, // Flow's output schema matches what the prompt returns
  },
  async (input): Promise<z.infer<typeof AIExpandedQueriesSchema>> => {
    const {output} = await expandSearchQueryPrompt(input);
    // Ensure that if the prompt output is null/undefined (e.g. model failed to generate valid JSON),
    // we return a valid structure according to AIExpandedQueriesSchema.
    return output || { expandedQueries: [] };
  }
);
