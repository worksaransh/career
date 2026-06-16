import { useI18n, LANG_LABELS, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const langs: Lang[] = ["en", "hi", "hinglish"];
  return (
    <div className={cn("inline-flex rounded-full bg-muted p-1 text-xs font-medium", className)}>
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            "rounded-full px-3 py-1 transition-colors",
            lang === l ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
          )}
        >
          {LANG_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
