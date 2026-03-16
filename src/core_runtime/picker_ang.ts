/**
 * Picker_Ang (Capability Router)
 * Routes needs by capability first, provider second.
 */

export interface CapabilityMetadata {
  id: string;
  name: string;
  type: 'llm' | 'tool' | 'branch';
  provider: string;
  cost_index: number; // 1-10
  latency_index: number; // 1-10
  quality_index: number; // 1-10
  tags: string[];
}

export const CAPABILITY_REGISTRY: CapabilityMetadata[] = [
  {
    id: 'mercury-2',
    name: 'Mercury-2 (Fast Reasoning)',
    type: 'llm',
    provider: 'OpenRouter',
    cost_index: 2,
    latency_index: 1,
    quality_index: 7,
    tags: ['fast', 'huddle', 'intent']
  },
  {
    id: 'deep-research',
    name: 'DeerFlow Research',
    type: 'branch',
    provider: 'Native',
    cost_index: 8,
    latency_index: 9,
    quality_index: 10,
    tags: ['research', 'slow', 'comprehensive']
  }
];

export const pickerAng = {
  route: async (capability_needed: string, constraints: string[]): Promise<CapabilityMetadata | null> => {
    // Basic filtering logic
    const matches = CAPABILITY_REGISTRY.filter(c => 
      c.tags.includes(capability_needed) || c.id === capability_needed
    );

    if (matches.length === 0) return null;

    // Pick best match (simplistic for now: highest quality)
    return matches.sort((a, b) => b.quality_index - a.quality_index)[0];
  }
};
