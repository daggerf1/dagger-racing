import { getCollection } from "astro:content";

export async function getPublishedArticles() {
    const articles = await getCollection("noticias");

    return articles
        .filter((article) => article.data.status === "published")
        .sort(
            (a, b) =>
                b.data.publishedAt.getTime() -
                a.data.publishedAt.getTime()
        );
}

export async function getFeaturedArticles() {
    const articles = await getPublishedArticles();

    return articles.filter(
        (article) => article.data.featured === true
    );
}

export async function getBreakingArticles() {
    const articles = await getPublishedArticles();

    return articles.filter(
        (article) => article.data.breaking === true
    );
}

export async function getArticlesByCategory(category: string) {
    const articles = await getPublishedArticles();

    return articles.filter(
        (article) => article.data.category === category
    );
}

export async function getArticlesBySubcategory(subcategory: string) {
    const articles = await getPublishedArticles();

    return articles.filter(
        (article) => article.data.subcategory === subcategory
    );
}

export async function getArticlesByDriver(driver: string) {
    const articles = await getPublishedArticles();

    return articles.filter(
        (article) => article.data.drivers.includes(driver)
    );
}

export async function getArticlesByTeam(team: string) {
    const articles = await getPublishedArticles();

    return articles.filter(
        (article) => article.data.teams.includes(team)
    );
}

export async function getArticlesByTag(tag: string) {
    const articles = await getPublishedArticles();

    return articles.filter(
        (article) => article.data.tags.includes(tag)
    );
}

export async function getArticleBySlug(slug: string) {
    const articles = await getPublishedArticles();

    return articles.find(
        (article) =>
            article.data.slug === slug ||
            article.id === slug
    );
}

export async function getRelatedArticles(
    currentArticle: Awaited<
        ReturnType<typeof getPublishedArticles>
    >[number],
    limit = 4
) {
    const articles = await getPublishedArticles();

    const related = articles
        .filter((article) => article.id !== currentArticle.id)
        .map((article) => {
            let score = 0;

            for (const driver of currentArticle.data.drivers) {
                if (article.data.drivers.includes(driver)) {
                    score += 4;
                }
            }

            for (const team of currentArticle.data.teams) {
                if (article.data.teams.includes(team)) {
                    score += 3;
                }
            }

            for (const tag of currentArticle.data.tags) {
                if (article.data.tags.includes(tag)) {
                    score += 2;
                }
            }

            if (
                article.data.category ===
                currentArticle.data.category
            ) {
                score += 1;
            }

            return {
                article,
                score,
            };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }

            return (
                b.article.data.publishedAt.getTime() -
                a.article.data.publishedAt.getTime()
            );
        })
        .slice(0, limit)
        .map((item) => item.article);

    return related;
}

export async function getAllTags() {
    const articles = await getPublishedArticles();

    const tags = new Set<string>();

    for (const article of articles) {
        for (const tag of article.data.tags) {
            tags.add(tag);
        }
    }

    return Array.from(tags).sort();
}

export async function getAllDriversWithArticles() {
    const articles = await getPublishedArticles();

    const drivers = new Set<string>();

    for (const article of articles) {
        for (const driver of article.data.drivers) {
            drivers.add(driver);
        }
    }

    return Array.from(drivers).sort();
}

export async function getAllTeamsWithArticles() {
    const articles = await getPublishedArticles();

    const teams = new Set<string>();

    for (const article of articles) {
        for (const team of article.data.teams) {
            teams.add(team);
        }
    }

    return Array.from(teams).sort();
}