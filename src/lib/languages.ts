export type Language = {
  code: string;
  name: string;
  flag: string;
};

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", flag: "EN" },
  { code: "es", name: "Spanish", flag: "ES" },
  { code: "fr", name: "French", flag: "FR" },
  { code: "de", name: "German", flag: "DE" },
  { code: "it", name: "Italian", flag: "IT" },
  { code: "pt", name: "Portuguese", flag: "PT" },
  { code: "nl", name: "Dutch", flag: "NL" },
  { code: "ru", name: "Russian", flag: "RU" },
  { code: "ja", name: "Japanese", flag: "JP" },
  { code: "ko", name: "Korean", flag: "KR" },
  { code: "zh", name: "Chinese", flag: "ZH" },
  { code: "ar", name: "Arabic", flag: "AR" },
  { code: "hi", name: "Hindi", flag: "HI" },
  { code: "tr", name: "Turkish", flag: "TR" },
  { code: "pl", name: "Polish", flag: "PL" },
  { code: "sv", name: "Swedish", flag: "SV" },
  { code: "el", name: "Greek", flag: "EL" },
  { code: "he", name: "Hebrew", flag: "HE" },
  { code: "id", name: "Indonesian", flag: "ID" },
];

export const MAX_CHARS = 5000;
