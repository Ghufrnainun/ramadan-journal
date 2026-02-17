import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Quote as QuoteIcon, Bookmark } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from '@/data/daily-quotes';
import { isBookmarked, toggleBookmark } from '@/lib/bookmarks';

interface QuoteCardProps {
  lang: 'id' | 'en';
  quote: Quote;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ lang, quote }) => {
  const text = lang === 'id' ? quote.textId : quote.textEn;
  const bookmarkId = useMemo(() => `quote-${quote.id}`, [quote.id]);
  const [saved, setSaved] = useState(() => isBookmarked('quote', bookmarkId));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-1">
              <QuoteIcon className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 text-sm leading-relaxed italic">
                "{text}"
              </p>
              <p className="text-amber-400/70 text-xs mt-3 font-medium">
                &mdash; {quote.source}
              </p>
            </div>
            <button
              type="button"
              aria-label={saved ? 'Remove bookmark quote' : 'Bookmark quote'}
              aria-pressed={saved}
              onClick={() => {
                const next = toggleBookmark({
                  id: bookmarkId,
                  type: 'quote',
                  title: text.slice(0, 60),
                  subtitle: quote.source,
                  content: text,
                  source: quote.source,
                  createdAt: new Date().toISOString(),
                });
                setSaved(next);
              }}
              className="h-11 w-11 flex items-center justify-center rounded-lg transition-colors hover:bg-slate-700/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 flex-shrink-0"
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}`} />
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuoteCard;

