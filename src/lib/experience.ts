export interface RoleProject {
  label: string;
  href: string;
}

export interface Role {
  title: string;
  company: string;
  employmentType: string;
  /** First month of the role, as YYYY-MM. */
  start: string;
  /** Last month of the role, as YYYY-MM. Omit for a role that is still current. */
  end?: string;
  location: string;
  /** Work arrangement, when known. */
  mode?: string;
  /** One sentence: what the job was. Shown on the home page too. */
  summary: string;
  /** What was built, shown on the Experience page. */
  highlights?: string[];
  skills?: string[];
  projects?: RoleProject[];
  /** Posts written from what was learned in the role. */
  writing?: RoleProject[];
}

/** Newest first. */
export const experience: Role[] = [
  {
    title: 'Software Engineer - AI/ML',
    company: 'Flexera',
    employmentType: 'Full-time',
    start: '2026-01',
    location: 'Bengaluru, Karnataka, India',
    mode: 'Hybrid',
    summary:
      "I build the backend services that let LLM agents work with Flexera's cloud-cost data in production: MCP servers, agents and the auth, access control and infrastructure around them.",
    highlights: [
      'Built and own the FinOps MCP server, a Python service that gives LLM agents cloud-cost queries, cost dimensions and anomaly root-cause analysis as tools. It runs on Kubernetes behind the company-wide MCP gateway and is live in production in three regions.',
      "Secured every tool call end to end: the server verifies the gateway's signed token, mints its own service-to-service tokens, and checks a per-org feature flag and the caller's privileges before any tool runs. It is read-only by default, and cost queries are limited to the billing centers the caller can see.",
      'Registered and rolled out the server on the MCP gateway region by region, and kept it healthy with contract tests, a regression suite run against staging through the gateway, and dependency upgrades that clear security advisories.',
      'Built an earlier multi-server MCP host with FastMCP, one HTTP service mounting several MCP servers, with JWT and ACL checks and Terraform-managed AWS infrastructure.',
      "Worked on the GenAI assistant's agents: connected the documentation agent to Amazon Q Business and built an ECS right-sizing agent.",
      'On the classical-ML side, added MLflow experiment tracking to the ML services and moved training to the Databricks 17.3 LTS ML runtime.',
    ],
    skills: ['Python', 'MCP', 'LLM agents', 'Kubernetes', 'AWS', 'Terraform', 'OAuth / JWT', 'Databricks', 'MLflow'],
    writing: [
      {
        label: 'Building MCP Servers That Survive Production: 12 Design Decisions',
        href: '/updates/production-ready-mcp-servers',
      },
    ],
  },
  {
    title: 'AI Engineer',
    company: 'Cloud202',
    employmentType: 'Full-time',
    start: '2025-06',
    end: '2025-12',
    location: 'Remote',
    summary: 'Built generative-AI systems on AWS, including an autonomous deep research agent on Bedrock and SageMaker.',
    skills: ['Generative AI', 'Amazon Web Services (AWS)'],
    projects: [{ label: 'Deep Research Agent', href: '/projects/deep-research-agent-qubitz' }],
  },
  {
    title: 'NLP Prompt Engineer',
    company: 'SciSpace',
    employmentType: 'Full-time',
    start: '2025-01',
    end: '2025-04',
    location: 'Remote',
    summary: 'Prompt engineering and NLP work with large language models.',
    skills: ['Prompt Engineering', 'Large Language Models (LLM)'],
  },
  {
    title: 'Generative AI Engineer',
    company: 'Creative Synergies Group',
    employmentType: 'Full-time',
    start: '2024-01',
    end: '2025-01',
    location: 'Bangalore Urban, Karnataka, India',
    mode: 'On-site',
    summary:
      'Built an agentic RAG knowledge bot with locally hosted LLMs and fine-tuned a Qwen 1.5 4B model with FSDP and DDP, both deployed on AWS.',
    skills: ['Generative AI', 'Docker Swarm'],
    projects: [
      { label: 'Knowledge Bot', href: '/projects/knowledge-bot-edtech' },
      { label: 'Fine-tuned Qwen model', href: '/projects/fine-tuned-qwen-model' },
    ],
  },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseMonth(value: string): { year: number; month: number } {
  const [year, month] = value.split('-').map(Number);
  return { year, month: month - 1 };
}

function formatMonth(value: string): string {
  const { year, month } = parseMonth(value);
  return `${MONTHS[month]} ${year}`;
}

/** "Jan 2026 - Present" */
export function formatRange(role: Role): string {
  return `${formatMonth(role.start)} - ${role.end ? formatMonth(role.end) : 'Present'}`;
}

/** "7 mos", "1 yr 1 mo". Counts both the first and last month, the way LinkedIn does. */
export function formatDuration(role: Role, now: Date = new Date()): string {
  const start = parseMonth(role.start);
  const end = role.end ? parseMonth(role.end) : { year: now.getFullYear(), month: now.getMonth() };
  const total = (end.year - start.year) * 12 + (end.month - start.month) + 1;
  const years = Math.floor(total / 12);
  const months = total % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mo' : 'mos'}`);
  return parts.join(' ');
}
