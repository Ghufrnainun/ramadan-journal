import { useLanguage } from '@/i18n';
import { Heart } from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 bg-navy-deep border-t border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          {/* Logo */}
          <span className="text-primary font-serif text-xl font-semibold">
            MyRamadhanku
          </span>
          
          {/* Tagline */}
          <p className="text-sm text-muted-foreground">
            {t.footer.tagline}
          </p>
          
          {/* Made with love */}
          <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
            {t.footer.madeWith}
            <Heart className="w-3 h-3 text-primary fill-primary" />
            {t.footer.forUmmah}
          </p>
          
          {/* Copyright */}
          <p className="text-xs text-muted-foreground/40">
            © {currentYear} MyRamadhanku
          </p>
        </div>
      </div>
    </footer>
  );
}
