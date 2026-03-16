import { insforge } from '../lib/insforge';

export type BoomerAngRole = 'researcher' | 'coder' | 'analyst';

export interface BoomerAngTask {
  id: string;
  role: BoomerAngRole;
  directive: string;
  context: any;
}

export const boomerAngs = {
  execute: async (task: BoomerAngTask) => {
    console.log(`Boomer_Ang [${task.role.toUpperCase()}]: Executing directive: ${task.directive}`);
    
    if (!insforge) {
      return { 
        status: 'completed', 
        result: `Mock result for ${task.role}: ${task.directive} (Client not available)` 
      };
    }

    const systemPrompts = {
      researcher: "You are a specialized deep research agent. Provide detailed findings, facts, and citations for the given directive.",
      coder: "You are a specialized coding agent. Provide production-grade code, architecture patterns, and implementation details.",
      analyst: "You are a specialized analysis agent. Provide strategic insights, risk assessments, and executive summaries."
    };

    try {
      const response = await insforge.ai.chat.completions.create({
        model: 'gpt-4o', // Or other available model
        messages: [
          { role: 'system', content: systemPrompts[task.role] },
          { role: 'user', content: `Directive: ${task.directive}\nContext: ${JSON.stringify(task.context)}` }
        ]
      });

      const result = response.choices[0]?.message?.content || 'No output generated.';

      return { 
        status: 'completed', 
        result 
      };
    } catch (error: any) {
      console.error(`Boomer_Ang Error:`, error);
      return { 
        status: 'failed', 
        error: error.message 
      };
    }
  }
};
