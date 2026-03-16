import { authService, paywallService } from '../lib/auth-paywall';
import { insforge } from '../lib/insforge';

export const onboardingService = {
  /**
   * Onboards a new customer by creating an organization and initial MIM policies.
   */
  async onboardCustomer(userId: string, orgName: string) {
    console.log(`Onboarding: Starting for user ${userId}, Org: ${orgName}`);

    try {
      // 1. Create Organization
      const org = await authService.createOrganization(userId, orgName);
      console.log(`Onboarding: Org created with ID: ${org.id}`);

      // 2. Provision Default MIM Policies (Governance-First)
      const defaultPolicies = [
        {
          organization_id: org.id,
          name: 'Core Security Filter',
          description: 'Restricts external requests to approved domains.',
          type: 'security' as const,
          rules: ['external_request', 'untrusted_api'],
          is_active: true
        },
        {
          organization_id: org.id,
          name: 'Operational Audit',
          description: 'Logs all high-LUC actions for financial governance.',
          type: 'operational' as const,
          rules: ['high_cost_tool'],
          is_active: true
        },
        {
          organization_id: org.id,
          name: 'Memory Discipline',
          description: 'Ensures all outputs conform to the organizational memory schema.',
          type: 'technical' as const,
          rules: ['schema_validation'],
          is_active: true
        }
      ];

      for (const policy of defaultPolicies) {
        await paywallService.createPolicy(policy);
      }
      console.log(`Onboarding: Default MIM policies provisioned.`);

      // 3. Initialize Memory Store (Empty)
      // This is implicit since we created the table, but we could add a welcome entry
      if (insforge) {
        await insforge.database.from('memory_store').insert([{
          organization_id: org.id,
          content: `Welcome to GRAMMAR. Organization ${orgName} has been successfully initialized.`,
          embedding: Array(1536).fill(0), // Dummy zero vector for initialization
          created_at: new Date().toISOString()
        }]);
      }

      return {
        success: true,
        orgId: org.id,
        message: 'Customer onboarded successfully with governed runtime.'
      };
    } catch (error: unknown) {
      console.error('Onboarding Error:', error);
      throw error;
    }
  }
};
