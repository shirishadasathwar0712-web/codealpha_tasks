import { Languages, Github, Heart } from "lucide-react";
import Translator from "@/components/Translator";
import SessionLog from "@/components/SessionLog";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40 text-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-teal-200/20 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-cyan-200/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col items-center gap-4 pt-4 text-center sm:mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/30">
              <Languages className="h-6 w-6" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Lingo<span className="text-teal-600">Bridge</span>
              </h1>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                Translate across 19 languages
              </p>
            </div>
          </div>
          <p className="max-w-lg text-sm text-slate-500 sm:text-base">
            A fast, free translator powered by the MyMemory Translation API.
            Type up to 5,000 characters, swap languages instantly, and keep a
            running log of your session.
          </p>
        </header>

        <main className="flex flex-1 flex-col gap-6 pb-8 lg:flex-row lg:items-start">
          <div className="flex-1 lg:sticky lg:top-6">
            <Translator onLogged={() => {}} />
          </div>
          <div className="w-full lg:w-[26rem] lg:shrink-0">
            <SessionLog />
          </div>
        </main>

        <footer className="flex flex-col items-center gap-2 border-t border-slate-200/70 py-6 text-center text-xs text-slate-400">
          <p className="flex items-center gap-1.5">
            Built with <Heart className="h-3.5 w-3.5 text-teal-500" /> using React,
            Supabase & the MyMemory Translation API
          </p>
          <a
            href="https://mymemory.translated.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-slate-500 transition-colors hover:text-teal-600"
          >
            <Github className="h-3.5 w-3.5" /> CodeAlpha Task 1
          </a>
        </footer>
      </div>
    </div>
  );
}
