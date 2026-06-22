import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-semibold sm:text-4xl">
        AI Automation Diagnostic
      </h1>
      <p className="max-w-md text-gray-500">
        Дізнайся за 5 хвилин, що у твоєму бізнесі можна автоматизувати.
      </p>
      <Link
        href="/chat"
        className="rounded-lg bg-white px-6 py-3 font-medium text-black hover:opacity-90"
      >
        Почати
      </Link>
    </main>
  );
}
