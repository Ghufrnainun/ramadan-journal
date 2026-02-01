import React from 'react';
import { motion } from 'framer-motion';
import { Quote as QuoteIcon, Bookmark } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from '@/data/daily-quotes';

interface QuoteCardProps {
  lang: 'id' | 'en';
  quote: Quote;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ lang, quote }) => {
  const text = lang === 'id' ? quote.textId : quote.textEn;

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
                — {quote.source}
              </p>
            </div>
            <button className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors flex-shrink-0">
              <Bookmark className="w-4 h-4 text-slate-500 hover:text-amber-400" />
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuoteCard;
