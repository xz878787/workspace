import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="text-6xl font-bold leading-none tracking-tight text-black dark:text-zinc-50">
            404
          </h1>
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              Page Not Found
            </h2>
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Sorry, the page you are looking for does not exist.
            </p>
          </div>
        </div>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-12 w-full px-5 sm:w-[158px]"
        >
          <a href="/">Back to Home</a>
        </Button>
      </main>
    </div>
  );
}
