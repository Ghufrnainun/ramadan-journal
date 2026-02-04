import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookmarkMinus } from 'lucide-react';
import { getProfile } from '@/lib/storage';
import { useI18n } from '@/hooks/useI18n';
import { getBookmarksByType, removeBookmark, BookmarkItem } from '@/lib/bookmarks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BookmarksPage: React.FC = () => {
  const navigate = useNavigate();
  const profile = getProfile();
  const dict = useI18n(profile.language);

  const [quotes, setQuotes] = useState<BookmarkItem[]>([]);
  const [ayahs, setAyahs] = useState<BookmarkItem[]>([]);
  const [doa, setDoa] = useState<BookmarkItem[]>([]);
  const [reflections, setReflections] = useState<BookmarkItem[]>([]);

  const refresh = () => {
    setQuotes(getBookmarksByType('quote'));
    setAyahs(getBookmarksByType('ayah'));
    setDoa(getBookmarksByType('doa'));
    setReflections(getBookmarksByType('reflection'));
  };

  useEffect(() => {
    refresh();
  }, []);

  const renderList = (items: BookmarkItem[]) => {
    if (items.length === 0) {
      return <p className="text-sm text-slate-500">{dict.bookmarks.empty}</p>;
    }
    return (
      <div className="space-y-3">
        {items.map(item => (
          <div key={`${item.type}-${item.id}`} className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate">{item.title}</p>
                {item.subtitle && <p className="text-xs text-slate-500">{item.subtitle}</p>}
                {item.content && (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{item.content}</p>
                )}
              </div>
                <button
                  onClick={() => {
                    removeBookmark(item.type, item.id);
                    refresh();
                  }}
                  className="p-2 rounded-lg hover:bg-slate-700/60 transition-colors"
                >
                <BookmarkMinus className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-dvh bg-[#020617] text-slate-200 pb-20">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-800/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div className="text-center">
          <span className="font-serif text-lg text-white">{dict.bookmarks.title}</span>
          <p className="text-xs text-slate-500">{dict.bookmarks.subtitle}</p>
        </div>
        <div className="w-9" />
      </header>

      <main className="px-6 py-6">
        <Tabs defaultValue="quotes">
          <TabsList className="grid grid-cols-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <TabsTrigger value="quotes" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              {dict.bookmarks.quotes}
            </TabsTrigger>
            <TabsTrigger value="ayah" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              {dict.bookmarks.ayah}
            </TabsTrigger>
            <TabsTrigger value="doa" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              {dict.bookmarks.doa}
            </TabsTrigger>
            <TabsTrigger value="reflection" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              {dict.bookmarks.reflection}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quotes" className="mt-6">
            {renderList(quotes)}
          </TabsContent>
          <TabsContent value="ayah" className="mt-6">
            {renderList(ayahs)}
          </TabsContent>
          <TabsContent value="doa" className="mt-6">
            {renderList(doa)}
          </TabsContent>
          <TabsContent value="reflection" className="mt-6">
            {renderList(reflections)}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BookmarksPage;
