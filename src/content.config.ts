// The blog. Four posts a month from October 2026 (the SEO clause in Leon's agreement).
// draft: true keeps a post out of the build, the menu and the sitemap until Leon has approved it.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(165),
    answer: z.string(),                       // the short direct answer that opens the post: the part search and AI lift
    date: z.coerce.date(),
    kind: z.enum(['Exam advice', 'Choosing subjects', 'For parents', 'Study method']),
    questionLine: z.number().optional(),      // the Question Map line this post answers (Q4 2026 plan)
    draft: z.boolean().default(true)
  })
});

export const collections = { blog };
