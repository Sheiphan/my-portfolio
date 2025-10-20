import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// TypeScript interfaces for content types
export interface Project {
  slug: string;
  title: string;
  date: string;
  description: string;
  tech: string[];
  image?: string;
  github?: string;
  demo?: string;
}

export interface ProjectWithContent extends Project {
  content: string;
}

export interface Update {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags?: string[];
}

export interface UpdateWithContent extends Update {
  content: string;
}

// Get all projects with metadata
export function getAllProjects(): Project[] {
  const projectsDir = path.join(process.cwd(), 'content/projects');
  
  // Check if directory exists
  if (!fs.existsSync(projectsDir)) {
    return [];
  }
  
  const filenames = fs.readdirSync(projectsDir);
  
  const projects = filenames
    .filter(filename => filename.endsWith('.md') || filename.endsWith('.mdx'))
    .map(filename => {
      const filePath = path.join(projectsDir, filename);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(fileContent);
      const slug = filename.replace(/\.mdx?$/, '');
      
      return {
        slug,
        title: data.title || '',
        date: data.date || '',
        description: data.description || '',
        tech: data.tech || [],
        image: data.image,
        github: data.github,
        demo: data.demo,
      } as Project;
    });
  
  // Sort by date (newest first)
  return projects.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// Get single project by slug with content
export function getProjectBySlug(slug: string): ProjectWithContent {
  const filePath = path.join(process.cwd(), `content/projects/${slug}.md`);
  
  // Try .mdx extension if .md doesn't exist
  const finalPath = fs.existsSync(filePath) 
    ? filePath 
    : path.join(process.cwd(), `content/projects/${slug}.mdx`);
  
  const fileContent = fs.readFileSync(finalPath, 'utf-8');
  const { data, content } = matter(fileContent);
  
  return {
    slug,
    content,
    title: data.title || '',
    date: data.date || '',
    description: data.description || '',
    tech: data.tech || [],
    image: data.image,
    github: data.github,
    demo: data.demo,
  } as ProjectWithContent;
}

// Get all updates/blog posts with metadata
export function getAllUpdates(): Update[] {
  const updatesDir = path.join(process.cwd(), 'content/updates');
  
  // Check if directory exists
  if (!fs.existsSync(updatesDir)) {
    return [];
  }
  
  const filenames = fs.readdirSync(updatesDir);
  
  const updates = filenames
    .filter(filename => filename.endsWith('.md') || filename.endsWith('.mdx'))
    .map(filename => {
      const filePath = path.join(updatesDir, filename);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(fileContent);
      const slug = filename.replace(/\.mdx?$/, '');
      
      return {
        slug,
        title: data.title || '',
        date: data.date || '',
        summary: data.summary || '',
        tags: data.tags,
      } as Update;
    });
  
  // Sort by date (newest first)
  return updates.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// Get single update/blog post by slug with content
export function getUpdateBySlug(slug: string): UpdateWithContent {
  const filePath = path.join(process.cwd(), `content/updates/${slug}.md`);
  
  // Try .mdx extension if .md doesn't exist
  const finalPath = fs.existsSync(filePath) 
    ? filePath 
    : path.join(process.cwd(), `content/updates/${slug}.mdx`);
  
  const fileContent = fs.readFileSync(finalPath, 'utf-8');
  const { data, content } = matter(fileContent);
  
  return {
    slug,
    content,
    title: data.title || '',
    date: data.date || '',
    summary: data.summary || '',
    tags: data.tags,
  } as UpdateWithContent;
}
