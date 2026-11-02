import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const noticias = defineCollection({
    loader: glob({
        pattern: "**/*.{md,mdx}",
        base: "./src/content/noticias",
    }),

    schema: z.object({
        title: z.string(),

        slug: z.string(),

        description: z.string().optional(),

        publishedAt: z.coerce.date(),

        updatedAt: z.coerce.date().optional(),

        author: z.string().default("redaccion"),

        category: z.string(),

        subcategory: z.string().optional(),

        drivers: z.array(z.string()).default([]),

        teams: z.array(z.string()).default([]),

        tags: z.array(z.string()).default([]),

        image: z.string().optional(),

        imageAlt: z.string().optional(),

        featured: z.boolean().default(false),

        breaking: z.boolean().default(false),

        status: z
            .enum(["draft", "published"])
            .default("draft"),
    }),
});

export const collections = {
    noticias,
};