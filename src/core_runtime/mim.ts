import { paywallService, MIMPolicy } from '../lib/auth-paywall';
import { insforge } from '../lib/insforge';

export interface MIMContextPack {
  organization_id: string;
  policies: MIMPolicy[];
  memory_vectors: string[];
  revision_history: any[];
}

export const mim = {
  getGovernedContext: async (orgId: string): Promise<MIMContextPack> => {
    const { data: policies } = await paywallService.getPolicies(orgId);
    return {
      organization_id: orgId,
      policies: policies || [],
      memory_vectors: [],
      revision_history: []
    };
  },

  validateExecution: async (action: any, context: MIMContextPack): Promise<{ approved: boolean; reason?: string }> => {
    // Check action against active MIM policies
    for (const policy of context.policies) {
      if (!policy.is_active) continue;

      // Evaluation logic: 
      // 1. Literal rules check (if rules is defined as simple strings/keywords)
      const matchesRule = (rule: string) => {
        const lowerRule = rule.toLowerCase();
        return action.type?.toLowerCase().includes(lowerRule) || 
               action.role?.toLowerCase().includes(lowerRule) ||
               action.directive?.toLowerCase().includes(lowerRule);
      };

      if (policy.type === 'security') {
        const restrictedKeywords = policy.rules?.filter(r => typeof r === 'string') || [];
        for (const keyword of restrictedKeywords) {
          if (matchesRule(keyword)) {
             return { 
              approved: false, 
              reason: `Security Block: Action matches restricted rule '${keyword}' in policy '${policy.name}'` 
            };
          }
        }
      }

      // 2. Operational policy checks
      if (policy.type === 'operational' && action.type === 'external_request') {
        if (policy.description.toLowerCase().includes('restricted') || policy.description.toLowerCase().includes('audit only')) {
           // Allow but log (in a real scenario)
           console.log(`MIM [OPERATIONAL]: Auditing external request per policy: ${policy.name}`);
        }
      }
    }

    return { approved: true }; 
  },

  syncMemory: async (orgId: string, content: string): Promise<void> => {
    if (!insforge) return;

    try {
      console.log(`MIM: Generating embeddings for memory sync (Org: ${orgId})`);
      const response = await insforge.ai.embeddings.create({
        model: 'openai/text-embedding-3-small',
        input: content
      });

      const payload = 'data' in response ? response.data : response;
      const error = 'error' in response ? response.error : null;

      if (error) {
        throw new Error(error.message || 'Embedding generation failed');
      }

      const embedding = payload?.[0]?.embedding;
      if (!embedding) {
        throw new Error('Embedding payload was empty');
      }

      // Store in memory_store table (hypothetical table for long-term memory)
      await insforge.database.from('memory_store').insert([{
        organization_id: orgId,
        content: content,
        embedding: embedding,
        created_at: new Date().toISOString()
      }]);

      console.log(`MIM: Memory synchronized successfully.`);
    } catch (error) {
      console.error(`MIM: Memory sync failed:`, error);
    }
  }
};
