import { builderAgent } from "../agents/builder/builder-agent";
import { supportAgent } from "../agents/support/support-agent";
import { MemoryStore } from "../platform/memory/memory-store";
import { ToolRegistry } from "../tools/registry/tool-registry";
import { ToolRunner } from "../tools/runner/tool-runner";
import { echoTool } from "../tools/plugins/echo-tool";
import { OrchestratorRequestSchema, type OrchestratorRequest, type OrchestratorResponse } from "./contracts/orchestrator-contract";
import { selectAgent } from "./router/router";

const memory = new MemoryStore();
const registry = new ToolRegistry();
registry.register(echoTool);
const runner = new ToolRunner(registry);

export async function handleRequest(input: OrchestratorRequest): Promise<OrchestratorResponse> {
  const request = OrchestratorRequestSchema.parse(input);
  const selectedAgent = selectAgent(request, [builderAgent, supportAgent]);
  const plan = ["analyze request", "invoke tool.echo", "compose response"];
  const toolResult = await runner.run(selectedAgent, "tool.echo", { message: request.userInput });

  memory.add({
    sessionId: request.sessionId,
    type: "session_note",
    content: `Handled by ${selectedAgent.id}`
  });

  return {
    requestId: request.requestId,
    sessionId: request.sessionId,
    selectedAgent: selectedAgent.id,
    selectedTools: ["tool.echo"],
    plan,
    resultPayload: { toolResult },
    policyDecisions: ["tool.echo allowed by whitelist"],
    auditMetadata: {
      timestamp: new Date().toISOString(),
      riskProfile: selectedAgent.riskProfile
    }
  };
}
