import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "./posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Read the latest blog posts.",
};

export default function BlogPage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col gap-8 py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
          Blog
        </h1>
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex flex-col gap-3 rounded-2xl border border-solid border-black/[.08] p-6 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            >
              <time className="text-sm text-zinc-500 dark:text-zinc-400">
                {post.date}
              </time>
              <h2 className="text-xl font-semibold leading-7 tracking-tight text-black dark:text-zinc-50">
                {post.title}
              </h2>
              <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
                {post.excerpt}
              </p>
              <span className="mt-auto text-sm font-medium text-zinc-950 dark:text-zinc-50">
                Read more →
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
