import { useEffect, useState } from "react";
import { History, Trash2, Loader2, ArrowRight, Clock } from "lucide-react";
import { supabase, type TranslationLog } from "@/lib/supabase";

export default function SessionLog() {
  const [logs, setLogs] = useState<TranslationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("translation_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setLogs((data as TranslationLog[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("translation_logs_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "translation_logs" },
        (payload) => {
          setLogs((prev) => [payload.new as TranslationLog, ...prev].slice(0, 50));
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "translation_logs" },
        (payload) => {
          setLogs((prev) => prev.filter((l) => l.id !== (payload.old as { id: string }).id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleClearAll = async () => {
    const { error: deleteError } = await supabase
      .from("translation_logs")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setLogs([]);
    }
  };

  const handleDeleteOne = async (id: string) => {
    const { error: deleteError } = await supabase
      .from("translation_logs")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setLogs((prev) => prev.filter((l) => l.id !== id));
    }
  };

  return (
    <section className="flex flex-col rounded-3xl bg-white shadow-xl shadow-slate-200/60 ring-1 ring-slate-200/70">
      <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-teal-600" />
          <h2 className="text-base font-bold text-slate-800">Session Log</h2>
          {logs.length > 0 && (
            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">
              {logs.length}
            </span>
          )}
        </div>
        {logs.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear all
          </button>
        )}
      </header>

      {error && (
        <p className="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <History className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">No translations yet</p>
          <p className="text-xs text-slate-400">Your translation history will appear here</p>
        </div>
      ) : (
        <ul className="max-h-[28rem] divide-y divide-slate-100 overflow-y-auto">
          {logs.map((log) => (
            <li
              key={log.id}
              className="group flex flex-col gap-1.5 px-5 py-3.5 transition-colors hover:bg-slate-50/70"
            >
              <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-teal-700">
                    {log.source_lang_name}
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                  <span className="rounded-md bg-cyan-50 px-1.5 py-0.5 text-cyan-700">
                    {log.target_lang_name}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <Clock className="h-3 w-3" />
                  {formatTime(log.created_at)}
                </span>
              </div>
              <p className="line-clamp-2 text-sm text-slate-600">
                <span className="font-medium text-slate-400">From: </span>
                {log.source_text}
              </p>
              <p className="line-clamp-2 text-sm text-slate-800">
                <span className="font-medium text-teal-600">To: </span>
                {log.translated_text}
              </p>
              <button
                type="button"
                onClick={() => handleDeleteOne(log.id)}
                className="self-start text-xs font-medium text-slate-300 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
