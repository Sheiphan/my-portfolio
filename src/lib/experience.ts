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
  skills?: string[];
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
  },
  {
    title: 'AI Engineer',
    company: 'Cloud202',
    employmentType: 'Full-time',
    start: '2025-06',
    end: '2025-12',
    location: 'Remote',
    skills: ['Generative AI', 'Amazon Web Services (AWS)'],
  },
  {
    title: 'NLP Prompt Engineer',
    company: 'SciSpace',
    employmentType: 'Full-time',
    start: '2025-01',
    end: '2025-04',
    location: 'Remote',
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
    skills: ['Generative AI', 'Docker Swarm'],
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
