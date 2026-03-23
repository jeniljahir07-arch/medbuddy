import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import en from "@/translations/en.json";

type Translations = Record<string, string>;

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translationCache: Record<string, Translations> = { english: en };

export const LANGUAGES = [
  { code: "english", label: "English" },
  { code: "telugu", label: "తెలుగు (Telugu)" },
  { code: "hindi", label: "हिन्दी (Hindi)" },
  { code: "bengali", label: "বাংলা (Bengali)" },
  { code: "tamil", label: "தமிழ் (Tamil)" },
  { code: "kannada", label: "ಕನ್ನಡ (Kannada)" },
  { code: "malayalam", label: "മലയാളം (Malayalam)" },
  { code: "gujarati", label: "ગુજરાતી (Gujarati)" },
  { code: "marathi", label: "मराठी (Marathi)" },
  { code: "odia", label: "ଓଡ଼ିଆ (Odia)" },
  { code: "punjabi", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "assamese", label: "অসমীয়া (Assamese)" },
  { code: "maithili", label: "मैथिली (Maithili)" },
  { code: "konkani", label: "कोंकणी (Konkani)" },
  { code: "meitei", label: "মৈতৈলোন্ (Meitei)" },
  { code: "santali", label: "ᱥᱟᱱᱛᱟᱲᱤ (Santali)" },
  { code: "rajasthani", label: "राजस्थानी (Rajasthani)" },
  { code: "chhattisgarhi", label: "छत्तीसगढ़ी (Chhattisgarhi)" },
  { code: "haryanvi", label: "हरियाणवी (Haryanvi)" },
  { code: "pahari", label: "पहाड़ी (Pahari)" },
  { code: "bundeli", label: "बुन्देली (Bundeli)" },
  { code: "awadhi", label: "अवधी (Awadhi)" },
  { code: "garhwali", label: "गढ़वाली (Garhwali)" },
  { code: "lambadi", label: "లంబాడి (Lambadi)" },
  { code: "nyishi", label: "Nyishi" },
  { code: "khasi", label: "Khasi" },
  { code: "mizo", label: "Mizo" },
  { code: "ao", label: "Ao" },
  { code: "lepcha", label: "Lepcha" },
  { code: "kokborok", label: "Kokborok" },
];

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState("english");
  const [translations, setTranslations] = useState<Translations>(en);

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("medbuddy_language", lang);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("medbuddy_language");
    if (saved) setLanguageState(saved);
  }, []);

  useEffect(() => {
    if (language === "english") {
      setTranslations(en);
      return;
    }
    if (translationCache[language]) {
      setTranslations(translationCache[language]);
      return;
    }
    // For non-English, we use English as fallback (translations can be added later)
    setTranslations(en);
  }, [language]);

  const t = useCallback((key: string) => {
    return translations[key] || en[key as keyof typeof en] || key;
  }, [translations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
