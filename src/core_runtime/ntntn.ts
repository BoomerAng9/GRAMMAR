import { insforge } from '../lib/insforge';

export interface NormalizedIntent {
  objective: string;
  constraints: string[];
  inputs: any[];
  outputs: string[];
  risks: string[];
  approvals_needed: string[];
}

export const ntntn = {
  normalize: async (intent: string): Promise<NormalizedIntent> => {
    if (!insforge) {
      return {
        objective: intent,
        constraints: [],
        inputs: [],
        outputs: [],
        risks: [],
        approvals_needed: []
      };
    }

    const systemPrompt = `You are NTNTN, the intent framing module for GRAMMAR. 
Your job is to take raw human intent and normalize it into a governed objective context.

Return a JSON object with the following structure:
{
  "objective": "A clear, concise statement of the primary goal",
  "constraints": ["List of hard constraints or rules to follow"],
  "inputs": ["Identified data or resources needed"],
  "outputs": ["Expected deliverables or outcomes"],
  "risks": ["Potential failures or security risks"],
  "approvals_needed": ["Critical steps where human-in-the-loop is required"]
}`;

    try {
      const completion = await insforge.ai.chat.completions.create({
        model: 'anthropic/claude-3-5-haiku-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: intent }
        ],
        // @ts-ignore - Assuming standard response format from the SDK
        response_format: { type: 'json_object' }
      });

      const payload = 'data' in completion ? completion.data : completion;
      const error = 'error' in completion ? completion.error : null;

      if (error) {
        throw new Error(error.message || 'Intent normalization failed');
      }

      const rawContent = payload?.choices?.[0]?.message?.content;
      if (!rawContent) {
        throw new Error('Intent normalization returned an empty response');
      }

      const result = JSON.parse(rawContent);
      return result as NormalizedIntent;
    } catch (error) {
      console.error('NTNTN Normalization Error:', error);
      return {
        objective: intent,
        constraints: [],
        inputs: [],
        outputs: [],
        risks: [],
        approvals_needed: []
      };
    }
  }
};
