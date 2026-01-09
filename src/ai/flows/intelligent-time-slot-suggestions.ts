// src/ai/flows/intelligent-time-slot-suggestions.ts
'use server';

/**
 * @fileOverview An AI agent for suggesting optimal appointment times.
 *
 * - suggestAppointmentTimes - A function that suggests appointment times.
 * - SuggestAppointmentTimesInput - The input type for the suggestAppointmentTimes function.
 * - SuggestAppointmentTimesOutput - The return type for the suggestAppointmentTimes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAppointmentTimesInputSchema = z.object({
  businessId: z.string().describe('The ID of the business.'),
  serviceId: z.string().describe('The ID of the service to be scheduled.'),
  customerId: z.string().optional().describe('The ID of the customer, if known.'),
  staffId: z.string().optional().describe('The ID of the staff member, if a preference exists.'),
  requestedDate: z.string().describe('The date for which appointment times are requested (ISO format).'),
});
export type SuggestAppointmentTimesInput = z.infer<typeof SuggestAppointmentTimesInputSchema>;

const SuggestAppointmentTimesOutputSchema = z.object({
  suggestedTimes: z.array(
    z.string().describe('Suggested appointment times in ISO format.')
  ).describe('A list of suggested appointment times.'),
  reasoning: z.string().describe('The AI reasoning behind the suggestions.'),
});
export type SuggestAppointmentTimesOutput = z.infer<typeof SuggestAppointmentTimesOutputSchema>;

export async function suggestAppointmentTimes(input: SuggestAppointmentTimesInput): Promise<SuggestAppointmentTimesOutput> {
  return suggestAppointmentTimesFlow(input);
}

const suggestAppointmentTimesPrompt = ai.definePrompt({
  name: 'suggestAppointmentTimesPrompt',
  input: {schema: SuggestAppointmentTimesInputSchema},
  output: {schema: SuggestAppointmentTimesOutputSchema},
  prompt: `You are an AI assistant that suggests optimal appointment times for a business.

  Consider the following factors when making your suggestions:
  - Historical booking data for the business.
  - Customer preferences (if known).
  - Service duration.
  - Staff availability.
  - Business hours.
  - Any existing appointments.

  Business ID: {{{businessId}}}
  Service ID: {{{serviceId}}}
  Customer ID (if known): {{{customerId}}}
  Staff ID (if known): {{{staffId}}}
  Requested Date: {{{requestedDate}}}

  Provide a list of suggested appointment times in ISO format and explain your reasoning for each suggestion.
  Format your output as a JSON object conforming to the schema: ${JSON.stringify(SuggestAppointmentTimesOutputSchema.shape)}`,
});

const suggestAppointmentTimesFlow = ai.defineFlow(
  {
    name: 'suggestAppointmentTimesFlow',
    inputSchema: SuggestAppointmentTimesInputSchema,
    outputSchema: SuggestAppointmentTimesOutputSchema,
  },
  async input => {
    const {output} = await suggestAppointmentTimesPrompt(input);
    return output!;
  }
);
