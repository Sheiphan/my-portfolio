# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Hiring managers and recruiters filling software engineering roles that sit on AI: backend / SDE roles working with LLMs, agents and ML models, and forward-deployed engineering (FDE) roles. They skim many candidates quickly, usually arriving from a resume, LinkedIn or a job application, and decide within a minute whether this person is worth contacting.

## Product Purpose

The personal portfolio of Sheiphan Joseph, a software engineer (AI/ML) at Flexera in Bengaluru, India, who builds the backend side of AI: MCP servers, LLM agents and ML services in production, plus the auth, access control, testing and infrastructure around them. Success is a hiring manager reaching out by email or LinkedIn about a role.

## Positioning

The first screen introduces the person, meaning who Sheiphan is and what Sheiphan builds. The projects are one step away and back up that introduction.

## Operating Context

- Sections: Home (`/`), Projects (`/projects`, `/projects/[slug]`), Experience (`/experience`, data in `src/lib/experience.ts`), Updates (`/updates`, `/updates/[slug]`), and a 404 page.
- Projects and updates are Markdown files in `content/projects/` and `content/updates/`, rendered with next-mdx-remote.
- The site is meant to be deployed on Vercel.

## Capabilities and Constraints

- Stack: Next.js 15 (App Router), React 19, Tailwind CSS v4, framer-motion, shadcn-style `components/ui`.
- Copy was repositioned on 2026-11-19 (owner's request) from "AI Engineer / MLOps" to software engineer building AI backends. Experience highlights come from the owner's own commits and are kept free of internal details (org IDs, ticket numbers, hostnames, repo names).
- Routes and content structure stay as they are.

## Brand Commitments

- The site must feel alive: motion and visuals are central to the experience, not an afterthought. (Set by the owner, 2026-11-19.)

## Evidence on Hand

- 6 projects: Spokedown (VS Code extension), Training My MoE (from-scratch MoE LLM), Deep Research Agent (Qubitz), Knowledge Bot (EdTech), Fine-tuned Qwen model, Omni-Agent computer-control CLI.
- 4 roles in `src/lib/experience.ts`: Flexera (current), Cloud202, SciSpace, Creative Synergies Group.
- 3 updates (posts): agentic AI in production, building with LangChain, MLOps best practices.
- Contact: email and phone are in the footer.
- Missing, and not to be invented: project screenshots (every project points to `placeholder.png`), a resume file, a real LinkedIn URL (still a `yourusername` placeholder; GitHub is github.com/Sheiphan), the site's domain (`yoursite.com` placeholder), testimonials, and metrics.

## Product Principles

1. A hiring manager should know who this is, what level of work to expect, and how to make contact within one screen.
2. Reaching out is always one obvious step away, on every page.
3. The work supports the introduction. Show specifics; don't add adjectives.
4. Skimmable before deep: every project should make sense at a glance before anyone opens it.
