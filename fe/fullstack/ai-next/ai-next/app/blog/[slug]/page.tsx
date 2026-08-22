import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getPostBySlug, posts } from "../posts";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <article className="flex w-full max-w-3xl flex-1 flex-col gap-6 py-32 px-16 bg-white dark:bg-black">
        <time className="text-sm text-zinc-500 dark:text-zinc-400">
          {post.date}
        </time>
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
          {post.title}
        </h1>
        <div className="flex flex-col gap-4">
          {post.content.map((paragraph, index) => (
            <p
              key={index}
              className="text-lg leading-8 text-zinc-600 dark:text-zinc-400"
            >
              {paragraph}
            </p>
          ))}
        </div>
        <Button asChild variant="outline" className="mt-auto w-fit">
          <Link href="/blog">← Back to Blog</Link>
        </Button>
      </article>
    </div>
  );
}
