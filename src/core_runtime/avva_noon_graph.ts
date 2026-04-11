/**
 * AVVA NOON Reasoning Graph — LangGraph StateGraph
 *
 * Three entry nodes: simple_mode, deep_mode, heavy_mode
 * Each calls the Python DSPy service via subprocess (JSON stdin/stdout protocol).
 * Checkpointed to Neon via @langchain/langgraph-checkpoint-postgres.
 */

import { StateGraph, Annotation, END } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { spawn } from "child_process";
import path from "path";

// ---------------------------------------------------------------------------
// State schema
// ---------------------------------------------------------------------------

const ReasoningState = Annotation.Root({
  task: Annotation<string>(),
  context: Annotation<string>(),
  mode: Annotation<"simple" | "deep" | "heavy">(),
  assertions: Annotation<string[]>({ default: () => [] }),
  reasoning_chain: Annotation<string>({ default: () => "" }),
  answer: Annotation<string>({ default: () => "" }),
  confidence: Annotation<number>({ default: () => 0 }),
  mode_used: Annotation<string>({ default: () => "" }),
  error: Annotation<string | null>({ default: () => null }),
});

type ReasoningStateType = typeof ReasoningState.State;

// ---------------------------------------------------------------------------
// Python DSPy bridge
// ---------------------------------------------------------------------------

const PYTHON_SCRIPT = path.resolve(
  __dirname,
  "../../../../runtime/dspy/avva_noon.py"
);

const VENV_PYTHON = path.resolve(
  __dirname,
  "../../../../runtime/dspy/.venv/Scripts/python.exe"
);

function callDSPy(request: {
  mode: string;
  task: string;
  context: string;
  assertions?: string[];
}): Promise<{
  status: string;
  data?: {
    reasoning_chain: string;
    answer: string;
    confidence: number;
    mode_used: string;
  };
  error?: string;
}> {
  return new Promise((resolve, reject) => {
    const pythonPath = VENV_PYTHON;
    const child = spawn(pythonPath, [PYTHON_SCRIPT], {
      env: { ...process.env },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    child.on("close", (code: number) => {
      if (code !== 0) {
        reject(new Error(`DSPy process exited ${code}: ${stderr}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error(`Failed to parse DSPy output: ${stdout}`));
      }
    });

    child.on("error", (err: Error) => reject(err));

    child.stdin.write(JSON.stringify(request));
    child.stdin.end();
  });
}

// ---------------------------------------------------------------------------
// Graph nodes
// ---------------------------------------------------------------------------

async function routeMode(
  state: ReasoningStateType
): Promise<"simple_mode" | "deep_mode" | "heavy_mode"> {
  switch (state.mode) {
    case "deep":
      return "deep_mode";
    case "heavy":
      return "heavy_mode";
    default:
      return "simple_mode";
  }
}

async function simpleMode(
  state: ReasoningStateType
): Promise<Partial<ReasoningStateType>> {
  try {
    const result = await callDSPy({
      mode: "simple",
      task: state.task,
      context: state.context,
    });
    if (result.status === "error") {
      return { error: result.error ?? "Unknown DSPy error" };
    }
    return {
      reasoning_chain: result.data!.reasoning_chain,
      answer: result.data!.answer,
      confidence: result.data!.confidence,
      mode_used: result.data!.mode_used,
    };
  } catch (e: any) {
    return { error: e.message };
  }
}

async function deepMode(
  state: ReasoningStateType
): Promise<Partial<ReasoningStateType>> {
  try {
    const result = await callDSPy({
      mode: "deep",
      task: state.task,
      context: state.context,
      assertions: state.assertions.length > 0 ? state.assertions : undefined,
    });
    if (result.status === "error") {
      return { error: result.error ?? "Unknown DSPy error" };
    }
    return {
      reasoning_chain: result.data!.reasoning_chain,
      answer: result.data!.answer,
      confidence: result.data!.confidence,
      mode_used: result.data!.mode_used,
    };
  } catch (e: any) {
    return { error: e.message };
  }
}

async function heavyMode(
  state: ReasoningStateType
): Promise<Partial<ReasoningStateType>> {
  try {
    const result = await callDSPy({
      mode: "heavy",
      task: state.task,
      context: state.context,
      assertions: state.assertions.length > 0 ? state.assertions : undefined,
    });
    if (result.status === "error") {
      return { error: result.error ?? "Unknown DSPy error" };
    }
    return {
      reasoning_chain: result.data!.reasoning_chain,
      answer: result.data!.answer,
      confidence: result.data!.confidence,
      mode_used: result.data!.mode_used,
    };
  } catch (e: any) {
    return { error: e.message };
  }
}

// ---------------------------------------------------------------------------
// Graph construction
// ---------------------------------------------------------------------------

function buildReasoningGraph() {
  const graph = new StateGraph(ReasoningState)
    .addNode("simple_mode", simpleMode)
    .addNode("deep_mode", deepMode)
    .addNode("heavy_mode", heavyMode)
    .addConditionalEdges("__start__", routeMode, {
      simple_mode: "simple_mode",
      deep_mode: "deep_mode",
      heavy_mode: "heavy_mode",
    })
    .addEdge("simple_mode", END)
    .addEdge("deep_mode", END)
    .addEdge("heavy_mode", END);

  return graph;
}

// ---------------------------------------------------------------------------
// Neon-checkpointed compiled graph
// ---------------------------------------------------------------------------

/**
 * Create the AVVA NOON reasoning graph with Neon checkpoint persistence.
 *
 * Expects AVVA_NOON_DATABASE_URL env var pointing to the avva_noon database
 * on the same Neon project (e.g., postgresql://...@.../avva_noon?sslmode=require).
 */
export async function createReasoningApp() {
  const connString = process.env.AVVA_NOON_DATABASE_URL;
  if (!connString) {
    throw new Error(
      "AVVA_NOON_DATABASE_URL not set. Point it to the avva_noon Neon database."
    );
  }

  const checkpointer = PostgresSaver.fromConnString(connString);
  await checkpointer.setup();

  const graph = buildReasoningGraph();
  return graph.compile({ checkpointer });
}

/**
 * Run a reasoning task through the graph.
 */
export async function runReasoning(params: {
  task: string;
  context: string;
  mode: "simple" | "deep" | "heavy";
  assertions?: string[];
  threadId?: string;
}) {
  const app = await createReasoningApp();

  const config = {
    configurable: {
      thread_id: params.threadId ?? `avva-${Date.now()}`,
    },
  };

  const result = await app.invoke(
    {
      task: params.task,
      context: params.context,
      mode: params.mode,
      assertions: params.assertions ?? [],
    },
    config
  );

  return {
    reasoning_chain: result.reasoning_chain,
    answer: result.answer,
    confidence: result.confidence,
    mode_used: result.mode_used,
    error: result.error,
  };
}

export { buildReasoningGraph, ReasoningState };
export type { ReasoningStateType };
