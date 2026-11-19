export type DoodleKind = 'agents' | 'research' | 'rag' | 'finetune' | 'loop';

const PROJECT_DOODLES: Record<string, DoodleKind> = {
  'deep-research-agent-qubitz': 'research',
  'knowledge-bot-edtech': 'rag',
  'fine-tuned-qwen-model': 'finetune',
  'omni-agent-computer-control': 'loop',
};

export function doodleForProject(slug: string): DoodleKind {
  return PROJECT_DOODLES[slug] ?? 'agents';
}
