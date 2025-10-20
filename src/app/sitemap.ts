import { MetadataRoute } from 'next';
import { getAllProjects, getAllUpdates } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://yoursite.com';

    // Get all projects
    const projects = getAllProjects();
    const projectUrls = projects.map((project) => ({
        url: `${baseUrl}/projects/${project.slug}`,
        lastModified: new Date(project.date),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));

    // Get all updates
    const updates = getAllUpdates();
    const updateUrls = updates.map((update) => ({
        url: `${baseUrl}/updates/${update.slug}`,
        lastModified: new Date(update.date),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Static pages
    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 1.0,
        },
        {
            url: `${baseUrl}/projects`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/updates`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        },
    ];

    return [...staticPages, ...projectUrls, ...updateUrls];
}
