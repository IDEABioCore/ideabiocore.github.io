import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Projects — one Markdown file per project in src/content/projects/.
// Frontmatter holds the metadata; the Markdown body is the description.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    partner: z.string().optional(),
    category: z.string(),
    order: z.number(),
    image: z.string(),
    alt: z.string(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { projects };
