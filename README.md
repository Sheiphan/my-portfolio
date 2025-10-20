# AI Engineer Portfolio

A modern, minimalistic portfolio website built with Next.js, featuring a futuristic dark-mode design. This portfolio showcases AI and machine learning projects, blog posts, and professional experience.

## Features

- **Modern Tech Stack**: Built with Next.js 14+ (App Router), TypeScript, and Tailwind CSS
- **Dark Mode Design**: Sleek, futuristic dark theme optimized for readability
- **Static Site Generation**: All pages pre-rendered at build time for optimal performance
- **Markdown Content**: Easy content management using Markdown files with frontmatter
- **Responsive Design**: Fully responsive across mobile, tablet, and desktop devices
- **SEO Optimized**: Comprehensive metadata, Open Graph tags, and sitemap generation
- **Smooth Animations**: Subtle animations using Framer Motion for enhanced UX
- **Accessible**: WCAG AA compliant with keyboard navigation support
- **Performance**: Lighthouse scores >90 for performance, accessibility, and SEO

## Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Content Parsing**: [gray-matter](https://github.com/jonschlinkert/gray-matter)
- **Markdown Rendering**: [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote)
- **Deployment**: [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-portfolio
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

```
my-portfolio/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── projects/           # Projects pages
│   │   └── updates/            # Blog/updates pages
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── NavBar.tsx
│   │   ├── Footer.tsx
│   │   ├── ProjectCard.tsx
│   │   └── UpdateItem.tsx
│   └── lib/                    # Utility functions
│       ├── content.ts          # Content loading utilities
│       └── utils.ts
├── content/                    # Markdown content files
│   ├── projects/               # Project markdown files
│   └── updates/                # Blog post markdown files
├── public/                     # Static assets
│   └── images/                 # Images and media
└── tailwind.config.ts          # Tailwind configuration
```

## Content Management

### Adding Projects

Create a new Markdown file in `content/projects/` with the following frontmatter:

```markdown
---
title: "Project Title"
date: "2025-10-21"
description: "Brief project description"
tech: ["Python", "TensorFlow", "React"]
image: "/images/projects/project-name.png"
github: "https://github.com/username/project"
demo: "https://project-demo.vercel.app"
---

Your project content here in Markdown format...
```

### Adding Blog Posts/Updates

Create a new Markdown file in `content/updates/` with the following frontmatter:

```markdown
---
title: "Post Title"
date: "2025-10-21"
summary: "Brief post summary"
tags: ["AI", "Machine Learning", "Tutorial"]
---

Your blog post content here in Markdown format...
```

## Building for Production

Build the production-ready application:

```bash
npm run build
```

Test the production build locally:

```bash
npm start
```

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository in [Vercel](https://vercel.com/new)
3. Vercel will automatically detect Next.js and configure build settings
4. Deploy! Your site will be live with automatic deployments on every push

For more details, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Performance

- All pages are statically generated at build time
- Images are optimized using Next.js Image component
- CSS is purged to include only used Tailwind classes
- Lighthouse performance scores consistently >90

## Accessibility

- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation support
- WCAG AA color contrast compliance
- Focus indicators on interactive elements
- Alt text for all images

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

For questions or feedback, please reach out via the contact information on the live site.
