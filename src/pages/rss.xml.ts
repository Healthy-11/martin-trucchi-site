import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
    const posts = (await getCollection('blog'))
        .filter((post) => !post.data.draft)
        .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

    return rss({
        title: 'Martin Trucchi — Blog',
        description: 'Research notes, expository writing, and mathematical musings.',
        site: context.site!.toString(),
        items: posts.map((post) => ({
            title: post.data.title,
            description: post.data.description,
            pubDate: post.data.date,
            link: `/blog/${post.slug}/`,
        })),
    });
};
