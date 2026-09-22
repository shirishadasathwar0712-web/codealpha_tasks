import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type TranslationLog = {
  id: string;
  source_text: string;
  translated_text: string;
  source_lang: string;
  source_lang_name: string;
  target_lang: string;
  target_lang_name: string;
  created_at: string;
};
