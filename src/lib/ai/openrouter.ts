// A.I.M.S. Model Gateway 客户端 — Inworld Realtime Router 实时函数路由器。
// 文件名保留 openrouter.ts 以避免破坏现有 import；内部已切换到
// 网关。OPENAI 兼容协议，所以请求/响应格式不变。
// 提供商名称对用户隐藏（神圣分离规则）。

interface GatewayMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GatewayResponse {
  id?: string;
  model?: string;
  choices?: Array<{
    message?: {
      role?: string;
      content?: string | null;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    cost?: number;
  };
  error?: {
    message?: string;
  };
}

const GATEWAY_BASE_URL = process.env.AIMS_GATEWAY_URL || 'https://api.inworld.ai/v1';

function getGatewayHeaders() {
  // 优先使用 INWORLD_API_KEY；保留 OPENROUTER_KEY / OPENAI_API_KEY 兼容
  // 回退，便于尚未轮换密钥的环境继续运行。
  const apiKey =
    process.env.INWORLD_API_KEY ||
    process.env.OPENROUTER_KEY ||
    process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('A.I.M.S. Gateway 未配置。请设置 INWORLD_API_KEY。');
  }

  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

export function getOpenRouterModel(inputMode: 'text' | 'voice' = 'text') {
  // 默认走零售对话表面（Gemma 4 26B —— 速度/成本/品牌语调三者平衡）。
  // GRAMMAR_TEXT_MODEL / GRAMMAR_VOICE_MODEL 环境变量可显式覆盖；
  // 兼容 OPENROUTER_TEXT_MODEL 旧变量名以避免现网中断。
  const textModel =
    process.env.GRAMMAR_TEXT_MODEL ||
    process.env.OPENROUTER_TEXT_MODEL ||
    'google-vertex/gemma-4-26b-a4b';
  const voiceModel =
    process.env.GRAMMAR_VOICE_MODEL ||
    process.env.OPENROUTER_VOICE_MODEL ||
    textModel;
  return inputMode === 'voice' ? voiceModel : textModel;
}

export async function createOpenRouterChatCompletion(input: {
  messages: GatewayMessage[];
  model?: string;
  inputMode?: 'text' | 'voice';
  userId?: string;
}) {
  const model = input.model || getOpenRouterModel(input.inputMode || 'text');
  const response = await fetch(`${GATEWAY_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: getGatewayHeaders(),
    body: JSON.stringify({
      model,
      messages: input.messages,
      temperature: 0.4,
      user: input.userId,
    }),
  });

  const payload = (await response.json()) as GatewayResponse;
  if (!response.ok) {
    throw new Error(
      payload.error?.message || `Gateway request failed with status ${response.status}`,
    );
  }

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('Gateway returned an empty response.');
  }

  return {
    id: payload.id,
    model: payload.model || model,
    content,
    usage: payload.usage,
    raw: payload,
  };
}
