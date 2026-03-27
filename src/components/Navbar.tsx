import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, UserCircle, LogOut, Phone } from "lucide-react";
import logo from "@/assets/logo.png";

interface NavbarProps {
  lang: "hi" | "en" | "ta";
  onSetLang: (lang: "hi" | "en" | "ta") => void;
}

const langLabels: Record<string, string> = {
  hi: "हिंदी",
  en: "English",
  ta: "தமிழ்",
};

const Navbar = ({ lang, onSetLang }: NavbarProps) => {
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/50">
      <div className="container flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Sahayak AI" className="h-9 w-9" />
          <span className="text-base font-bold text-foreground">
            Sahayak <span className="text-gradient-primary">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-card border border-border shadow-soft text-foreground hover:bg-secondary transition-all"
            >
              {langLabels[lang]}
              <ChevronDown size={14} className={`transition-transform ${langOpen ? "rotate-180" : ""}`} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-36 bg-card rounded-2xl shadow-elevated border border-border overflow-hidden z-50">
                {(["hi", "en", "ta"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => { onSetLang(l); setLangOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                      lang === l
                        ? "bg-primary-light text-primary font-bold"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    {langLabels[l]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
            >
              <UserCircle size={20} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-card rounded-2xl shadow-elevated border border-border overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                    <Phone size={14} className="text-primary" />
                    +91 98765 43210
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-left px-4 py-3 text-sm text-destructive font-medium hover:bg-destructive/5 transition-colors flex items-center gap-2"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
