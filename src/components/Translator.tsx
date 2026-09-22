import { useState } from "react";
import {
  ArrowRightLeft,
  Copy,
  Check,
  Trash2,
  Volume2,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { LANGUAGES, MAX_CHARS, type Language } from "@/lib/languages";
import { supabase, type TranslationLog } from "@/lib/supabase";

const TRANSLATE_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate`;

type TranslatorProps = {
  onLogged: (entry: TranslationLog) => void;
};

export default function Translator({ onLogged }: TranslatorProps) {
  const [sourceLang, setSourceLang] = useState<Language>(LANGUAGES[0]);
  const [targetLang, setTargetLang] = useState<Language>(LANGUAGES[1]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInput(output);
    setOutput(input);
    setError(null);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not copy to clipboard.");
    }
  };

  const handleSpeak = (text: string, langCode: string) => {
    if (!text || typeof window === "undefined" || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = langCode;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  const handleTranslate = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter some text to translate.");
      return;
    }
    if (trimmed.length > MAX_CHARS) {
      setError(`Text is too long — maximum is ${MAX_CHARS} characters.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(TRANSLATE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          text: trimmed,
          sourceLang: sourceLang.code,
          targetLang: targetLang.code,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }

      const data = await res.json();
      const translated: string | undefined = data?.translatedText;
      if (!translated) {
        throw new Error("No translation was returned.");
      }

      setOutput(translated);

      const { data: inserted, error: insertError } = await supabase
        .from("translation_logs")
        .insert({
          source_text: trimmed,
          translated_text: translated,
          source_lang: sourceLang.code,
          source_lang_name: sourceLang.name,
          target_lang: targetLang.code,
          target_lang_name: targetLang.name,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      if (inserted) onLogged(inserted as TranslationLog);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong while translating.";
      setError(message);
      setOutput("");
    } finally {
      setLoading(false);
    }
  };

  const charCount = input.length;
  const overLimit = charCount > MAX_CHARS;

  return (
    <section className="rounded-3xl bg-white shadow-xl shadow-slate-200/60 ring-1 ring-slate-200/70">
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <LanguageSelect
          label="From"
          value={sourceLang}
          onChange={setSourceLang}
        />
        <button
          type="button"
          onClick={handleSwap}
          aria-label="Swap languages"
          className="group mx-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition-all hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600 active:scale-90 sm:my-0"
        >
          <ArrowRightLeft className="h-5 w-5 transition-transform group-hover:rotate-180" />
        </button>
        <LanguageSelect
          label="To"
          value={targetLang}
          onChange={setTargetLang}
        />
      </div>

      <div className="grid gap-px bg-slate-200/70 md:grid-cols-2">
        <div className="flex flex-col bg-white p-5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type text to translate…"
            maxLength={MAX_CHARS + 200}
            className="h-40 w-full resize-none bg-transparent text-lg leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleSpeak(input, sourceLang.code)}
              disabled={!input.trim()}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-teal-600 disabled:opacity-40 disabled:hover:text-slate-500"
            >
              <Volume2 className="h-4 w-4" /> Listen
            </button>
            <span
              className={`text-xs font-medium tabular-nums ${
                overLimit ? "text-red-500" : "text-slate-400"
              }`}
            >
              {charCount} / {MAX_CHARS}
            </span>
          </div>
        </div>

        <div className="relative flex flex-col bg-slate-50/60 p-5">
          {output ? (
            <p className="h-40 w-full overflow-y-auto text-lg leading-relaxed text-slate-800">
              {output}
            </p>
          ) : (
            <div className="flex h-40 w-full items-center justify-center text-center text-slate-400">
              <p className="text-sm">Translation will appear here</p>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleSpeak(output, targetLang.code)}
              disabled={!output.trim()}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-teal-600 disabled:opacity-40 disabled:hover:text-slate-500"
            >
              <Volume2 className="h-4 w-4" /> Listen
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!output}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-white hover:text-teal-600 disabled:opacity-40 disabled:hover:text-slate-500"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-5 mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 px-5 pb-5">
        <button
          type="button"
          onClick={handleClear}
          disabled={!input && !output}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <Trash2 className="h-4 w-4" /> Clear
        </button>

        <button
          type="button"
          onClick={handleTranslate}
          disabled={loading || !input.trim() || overLimit}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-500 hover:to-cyan-500 hover:shadow-teal-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Translating…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Translate
            </>
          )}
        </button>
      </div>
    </section>
  );
}

function LanguageSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Language;
  onChange: (lang: Language) => void;
}) {
  return (
    <label className="flex flex-1 items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <div className="relative flex-1">
        <select
          value={value.code}
          onChange={(e) => {
            const next = LANGUAGES.find((l) => l.code === e.target.value);
            if (next) onChange(next);
          }}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          ▾
        </span>
      </div>
    </label>
  );
}
