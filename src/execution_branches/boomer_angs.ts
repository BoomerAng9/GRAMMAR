import { insforge } from '../lib/insforge';
import { agentFleet } from '../core_runtime/agent_fleet';

export type BoomerAngRole = 'researcher' | 'coder' | 'analyst';

export interface BoomerAngTask {
  id: string;
  role: BoomerAngRole;
  directive: string;
  context: Record<string, unknown>;
}

export interface BoomerAngResult {
  name: string;
  agent_id: string;
  role: BoomerAngRole;
  provider: string;
  summary: string;
  content: string;
  completed_at: string;
}

export const boomerAngs = {
  execute: async (task: BoomerAngTask) => {
    const agent = agentFleet.getByExecutionRole(task.role);
    console.log(`Boomer_Ang [${task.role.toUpperCase()}]: Executing directive: ${task.directive}`);
    
    if (!insforge) {
      const mockResult: BoomerAngResult = {
        name: agent?.name ?? `Boomer_Ang ${task.role}`,
        agent_id: agent?.id ?? task.role,
        role: task.role,
        provider: agent?.provider ?? 'Offline Mock',
        summary: `Mock ${task.role} output generated while InsForge client is unavailable.`,
        content: `Mock result for ${task.role}: ${task.directive}`,
        completed_at: new Date().toISOString(),
      };

      return { 
        status: 'completed', 
        result: mockResult,
      };
    }

    const systemPrompts = {
      researcher: "You are a specialized deep research agent. Provide detailed findings, facts, and citations for the given directive.",
      coder: "You are a specialized coding agent. Provide production-grade code, architecture patterns, and implementation details.",
      analyst: "You are a specialized analysis agent. Provide strategic insights, risk assessments, and executive summaries."
    };

    try {
      const response = await insforge.ai.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompts[task.role] },
          { role: 'user', content: `Directive: ${task.directive}\nContext: ${JSON.stringify(task.context)}` }
        ]
      });

      const payload = 'data' in response ? response.data : response;
      const error = 'error' in response ? response.error : null;

      if (error) {
        throw new Error(error.message || 'AI completion failed');
      }

      const content = payload?.choices?.[0]?.message?.content?.trim() || 'No output generated.';
      const result: BoomerAngResult = {
        name: agent?.name ?? `Boomer_Ang ${task.role}`,
        agent_id: agent?.id ?? task.role,
        role: task.role,
        provider: agent?.provider ?? 'InsForge AI',
        summary: `${task.role} completed step ${task.id} for the active workload.`,
        content,
        completed_at: new Date().toISOString(),
      };

      return { 
        status: 'completed', 
        result 
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown execution error';
      console.error(`Boomer_Ang Error:`, error);
      return { 
        status: 'failed', 
        error: message 
      };
    }
  }
};
