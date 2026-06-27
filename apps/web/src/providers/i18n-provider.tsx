"use client";

import * as React from "react";
import { useSession } from "next-auth/react";

export type Lang = "en" | "hi" | "hinglish";

type Dict = Record<string, { en: string; hi: string; hinglish: string }>;

export const STRINGS = {
  appName: { en: "Disha", hi: "दिशा", hinglish: "Disha" },
  tagline: {
    en: "Your AI Career GPS",
    hi: "आपका AI करियर GPS",
    hinglish: "Aapka AI Career GPS",
  },
  heroTitle: {
    en: "Find the right career, degree & college — in 15 minutes.",
    hi: "सही करियर, डिग्री और कॉलेज खोजें — सिर्फ 15 मिनट में।",
    hinglish: "Sahi career, degree aur college dhoondho — sirf 15 minutes mein.",
  },
  heroSub: {
    en: "Built for Class 11–12 students and parents in India. Trusted by 1,00,000+ families.",
    hi: "कक्षा 11–12 के छात्रों और अभिभावकों के लिए बनाया गया। 1,00,000+ परिवारों का भरोसा।",
    hinglish: "Class 11–12 ke students aur parents ke liye. 1 lakh+ families ka bharosa.",
  },
  startFree: { en: "Start free assessment", hi: "नि:शुल्क मूल्यांकन शुरू करें", hinglish: "Free assessment shuru karo" },
  loginCta: { en: "I already have an account", hi: "मेरा पहले से खाता है", hinglish: "Mera already account hai" },
  whyDisha: { en: "Why Disha", hi: "दिशा क्यों?", hinglish: "Disha kyun?" },
  feat1Title: { en: "Personalised career match", hi: "व्यक्तिगत करियर मिलान", hinglish: "Personal career match" },
  feat1Body: {
    en: "5 careers picked from 200+, based on your interests, personality & marks.",
    hi: "आपकी रुचियों, व्यक्तित्व और अंकों के आधार पर 200+ में से 5 करियर।",
    hinglish: "Aapke interests, personality aur marks pe based 200+ mein se 5 careers.",
  },
  feat2Title: { en: "Step-by-step roadmap", hi: "चरण-दर-चरण रोडमैप", hinglish: "Step-by-step roadmap" },
  feat2Body: {
    en: "Class → degree → internship → job. Exact timeline, exact cost.",
    hi: "कक्षा → डिग्री → इंटर्नशिप → नौकरी। सटीक समय, सटीक खर्च।",
    hinglish: "Class → degree → internship → job. Exact time, exact cost.",
  },
  feat3Title: { en: "Parent ROI dashboard", hi: "अभिभावक ROI डैशबोर्ड", hinglish: "Parent ROI dashboard" },
  feat3Body: {
    en: "See investment vs expected salary, payback period & alternatives.",
    hi: "निवेश बनाम अपेक्षित वेतन, वापसी अवधि और विकल्प देखें।",
    hinglish: "Investment vs expected salary, payback period aur alternatives dekho.",
  },
  selectLang: { en: "Choose your language", hi: "अपनी भाषा चुनें", hinglish: "Apni language chuno" },
  continue: { en: "Continue", hi: "जारी रखें", hinglish: "Continue" },
  login: { en: "Log in", hi: "लॉग इन", hinglish: "Log in" },
  signup: { en: "Sign up", hi: "साइन अप", hinglish: "Sign up" },
  mobile: { en: "Mobile number", hi: "मोबाइल नंबर", hinglish: "Mobile number" },
  sendOtp: { en: "Send OTP", hi: "OTP भेजें", hinglish: "OTP bhejo" },
  dashboard: { en: "Dashboard", hi: "डैशबोर्ड", hinglish: "Dashboard" },
  roadmap: { en: "Roadmap", hi: "रोडमैप", hinglish: "Roadmap" },
  report: { en: "Report", hi: "रिपोर्ट", hinglish: "Report" },
  settings: { en: "Settings", hi: "सेटिंग्स", hinglish: "Settings" },
  parent: { en: "Parent", hi: "अभिभावक", hinglish: "Parent" },
  assessment: { en: "Assessment", hi: "मूल्यांकन", hinglish: "Assessment" },
  hi_user: { en: "Hi", hi: "नमस्ते", hinglish: "Hi" },
  yourMatch: { en: "Your top match", hi: "आपका सर्वश्रेष्ठ मिलान", hinglish: "Aapka top match" },
  viewReport: { en: "View full report", hi: "पूरी रिपोर्ट देखें", hinglish: "Full report dekho" },
  streak: { en: "day streak", hi: "दिन की लय", hinglish: "day streak" },
  level: { en: "Level", hi: "स्तर", hinglish: "Level" },
  xp: { en: "XP", hi: "XP", hinglish: "XP" },
  next: { en: "Next", hi: "अगला", hinglish: "Next" },
  back: { en: "Back", hi: "पीछे", hinglish: "Back" },
  question: { en: "Question", hi: "प्रश्न", hinglish: "Sawal" },
  of: { en: "of", hi: "में से", hinglish: "of" },
  done: { en: "Done", hi: "पूर्ण", hinglish: "Done" },
  loggingIn: { en: "Logging in…", hi: "लॉग इन हो रहा है…", hinglish: "Login ho raha hai…" },
} satisfies Dict;

type Key = keyof typeof STRINGS;

const Ctx = React.createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => STRINGS[k].en,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { data: session, update } = useSession();
  const sessionLang = (session?.user as any)?.language as Lang | undefined;
  const [lang, setLangState] = React.useState<Lang>("en");

  React.useEffect(() => {
    if (sessionLang) {
      setLangState(sessionLang);
    } else {
      const saved = typeof window !== "undefined" && window.localStorage.getItem("disha.lang") as Lang | null;
      if (saved) setLangState(saved);
    }
  }, [sessionLang]);

  const setLang = React.useCallback(
    (l: Lang) => {
      setLangState(l);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("disha.lang", l);
      }
      if (session) {
        update({ language: l });
      }
    },
    [session, update],
  );

  const t = React.useCallback((k: Key) => STRINGS[k]?.[lang] ?? STRINGS[k]?.en ?? "", [lang]);

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return React.useContext(Ctx);
}

export const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  hi: "हिन्दी",
  hinglish: "Hinglish",
};
