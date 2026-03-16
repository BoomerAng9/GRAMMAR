import { ntntn, NormalizedIntent } from './ntntn';
import { mim, MIMContextPack } from './mim';
import { pickerAng } from './picker_ang';
import { boomerAngs, BoomerAngRole } from '../execution_branches/boomer_angs';
import { buildSmith } from './buildsmith';
import { reviewHone } from './review_hone';
import { packaging } from './packaging';

export interface ActionBoardState {
  status: 'planning' | 'running' | 'review' | 'blocked' | 'approved' | 'packaged' | 'delivered';
  current_step: number;
  total_steps: number;
  checkpoints: string[];
  normalized_intent?: NormalizedIntent;
  results: any[];
}

export const acheevy = {
  huddle: async (rawIntent: string, orgId: string) => {
    console.log('ACHEEVY: Starting Huddle...');

    // 1. Normalize Intent (NTNTN)
    const normalized = await ntntn.normalize(rawIntent);
    console.log('ACHEEVY: Intent Normalized:', normalized.objective);

    // 2. Get Governed Context (MIM)
    const context = await mim.getGovernedContext(orgId);
    console.log('ACHEEVY: Governed Context Retrieved with', context.policies.length, 'policies.');

    // 3. Sequence Work Branches (Route via Picker_Ang)
    const executionPlan = [];
    
    // Add Research step if needed
    if (normalized.objective.toLowerCase().includes('research') || normalized.objective.toLowerCase().includes('analyze')) {
      const researchCap = await pickerAng.route('research', normalized.constraints);
      if (researchCap) {
        executionPlan.push({
          step: executionPlan.length + 1,
          role: 'researcher' as BoomerAngRole,
          capability: researchCap.id,
          directive: normalized.objective
        });
      }
    }

    // Add Coding step if needed
    if (normalized.objective.toLowerCase().includes('code') || normalized.objective.toLowerCase().includes('build')) {
      const codeCap = await pickerAng.route('coding', normalized.constraints);
      if (codeCap) {
        executionPlan.push({
          step: executionPlan.length + 1,
          role: 'coder' as BoomerAngRole,
          capability: codeCap.id,
          directive: `Implement the following based on the objective: ${normalized.objective}`
        });
      }
    }

    // Update Board State
    const initialState: ActionBoardState = {
      status: 'planning',
      current_step: 0,
      total_steps: executionPlan.length,
      checkpoints: [],
      normalized_intent: normalized,
      results: []
    };

    return {
      plan: executionPlan,
      state: initialState,
      context
    };
  },

  execute: async (plan: any[], state: ActionBoardState, context: MIMContextPack) => {
    console.log('ACHEEVY: Executing Work Plan...');
    let currentState: ActionBoardState = { ...state, status: 'running' };

    for (const step of plan) {
      currentState.current_step = step.step;
      await acheevy.updateBoard(currentState);

      // 1. Policy Re-Validation (MIM)
      const validation = await mim.validateExecution({ type: 'task', ...step }, context);
      if (!validation.approved) {
        currentState.status = 'blocked';
        currentState.checkpoints.push(`BLOCKED: ${validation.reason}`);
        await acheevy.updateBoard(currentState);
        return { success: false, state: currentState };
      }

      // 2. Perform Specialized Task (Boomer_Angs)
      const taskResult = await boomerAngs.execute({
        id: `step-${step.step}`,
        role: step.role,
        directive: step.directive,
        context: { ...context, previous_results: currentState.results }
      });

      if (taskResult.status === 'failed') {
        currentState.status = 'blocked';
        currentState.checkpoints.push(`FAILED Step ${step.step}: ${taskResult.error}`);
        await acheevy.updateBoard(currentState);
        return { success: false, state: currentState };
      }

      currentState.results.push(taskResult.result);
      currentState.checkpoints.push(`COMPLETED Step ${step.step}: ${step.role} finished.`);
    }

    // 3. Assemble and Review
    currentState.status = 'review';
    await acheevy.updateBoard(currentState);

    const manifest = await buildSmith.assemble(currentState.results);
    const review = await reviewHone.validate(manifest);

    if (!review.approved) {
      currentState.status = 'blocked';
      currentState.checkpoints.push(`REVIEW FAILED: ${review.feedback.join(', ')}`);
      await acheevy.updateBoard(currentState);
      return { success: false, state: currentState };
    }

    // 4. Package and Deliver
    currentState.status = 'packaged';
    await acheevy.updateBoard(currentState);

    const bundle = await packaging.package(manifest);
    
    currentState.status = 'delivered';
    currentState.checkpoints.push(`SUCCESS: Package delivered to ${bundle.retrieval_path}`);
    await acheevy.updateBoard(currentState);

    return { 
      success: true, 
      state: currentState,
      bundle 
    };
  },

  updateBoard: async (state: Partial<ActionBoardState>) => {
    // Push updates to Board_Monitor via WebSocket/Postgres
    console.log('ACHEEVY Board Update:', state.status, `Step: ${state.current_step}/${state.total_steps}`);
  }
};
