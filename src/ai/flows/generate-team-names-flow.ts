'use server';
/**
 * @fileOverview A Genkit flow for generating creative and fun team names.
 *
 * - generateTeamNames - A function that generates team names based on context and quantity.
 * - GenerateTeamNamesInput - The input type for the generateTeamNames function.
 * - GenerateTeamNamesOutput - The return type for the generateTeamNames function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTeamNamesInputSchema = z.object({
  numberOfTeams: z.number().describe('The number of team names to generate.'),
  context: z.string().describe('The sport or competitive theme for the team names.'),
});
export type GenerateTeamNamesInput = z.infer<typeof GenerateTeamNamesInputSchema>;

const GenerateTeamNamesOutputSchema = z.object({
  teamNames: z.array(z.string()).describe('An array of creative and fun team names.'),
});
export type GenerateTeamNamesOutput = z.infer<typeof GenerateTeamNamesOutputSchema>;

export async function generateTeamNames(input: GenerateTeamNamesInput): Promise<GenerateTeamNamesOutput> {
  return generateTeamNamesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTeamNamesPrompt',
  input: { schema: GenerateTeamNamesInputSchema },
  output: { schema: GenerateTeamNamesOutputSchema },
  prompt: `You are a creative assistant specializing in generating fun and catchy team names.

Generate {{numberOfTeams}} creative and fun team names for a game with a '{{context}}' theme.
Ensure the names are unique, suitable for competitive play, and engaging.

List the names as a JSON array of strings, for example: {"teamNames": ["Team Alpha", "Team Beta"]}.`,
});

const generateTeamNamesFlow = ai.defineFlow(
  {
    name: 'generateTeamNamesFlow',
    inputSchema: GenerateTeamNamesInputSchema,
    outputSchema: GenerateTeamNamesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
