export type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string[];
};

export const posts: Post[] = [
  {
    slug: "getting-started-with-nextjs",
    title: "Getting Started with Next.js",
    date: "2026-08-01",
    excerpt:
      "Learn how to build your first application with Next.js, React and TypeScript using the App Router.",
    content: [
      "Next.js is a React framework that gives you building blocks to create fast web applications. With the App Router, every folder inside the app directory maps to a route segment.",
      "A page is UI that is rendered on a specific route. To create a page, add a page file inside the app directory and default export a React component.",
      "Layouts are UI that is shared between multiple pages. On navigation, layouts preserve state, remain interactive, and do not rerender.",
    ],
  },
  {
    slug: "styling-with-tailwind-css",
    title: "Styling with Tailwind CSS",
    date: "2026-08-15",
    excerpt:
      "A practical guide to styling your Next.js application with Tailwind CSS utility classes.",
    content: [
      "Tailwind CSS is a utility-first CSS framework that lets you compose styles directly in your markup without writing custom CSS.",
      "It works great with the Next.js App Router. You can style layouts, pages, and components by composing small utility classes.",
      "The framework also supports dark mode, responsive design, and arbitrary values, making it easy to build beautiful interfaces quickly.",
    ],
  },
];

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}
