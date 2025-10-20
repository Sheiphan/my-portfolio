"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Project } from '@/lib/content';

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{ willChange: 'opacity, transform' }}
    >
      <Link 
        href={`/projects/${project.slug}`} 
        className="block group focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded-xl"
        aria-label={`View details for ${project.title}`}
      >
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ willChange: 'transform' }}
        >
          <Card className="h-full border-neutral-700 bg-neutral-800/50 backdrop-blur hover:shadow-xl hover:shadow-blue-500/10 transition-shadow duration-300 overflow-hidden">
            {/* Project Image */}
            {project.image && (
              <div className="relative w-full h-48 sm:h-56 md:h-48 overflow-hidden">
                <Image
                  src={project.image}
                  alt={`${project.title} preview`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px"
                  priority={index < 3}
                />
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl group-hover:text-blue-400 transition-colors duration-300">
                {project.title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-400">
                <time dateTime={project.date}>
                  {new Date(project.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm sm:text-base text-gray-300 line-clamp-3">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2" role="list" aria-label="Technologies used">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    role="listitem"
                    className="px-2.5 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Link>
    </motion.div>
  );
}
