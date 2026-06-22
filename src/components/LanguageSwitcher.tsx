import { useLanguage } from "@/hooks/useLanguage";
import type { Lang } from "@/lib/i18n";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  const options: Lang[] = ["tr", "en"];

  return (
    <div
      className={`inline-flex items-center rounded-md border border-border bg-card overflow-hidden text-xs ${className}`}
      role="group"
      aria-label="Language"
    >
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => setLang(opt)}
          aria-pressed={lang === opt}
          className={`px-2.5 py-1 font-medium transition-colors ${
            lang === opt
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
