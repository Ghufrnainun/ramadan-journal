import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Search, X } from "lucide-react";
import { getProfile } from "@/lib/storage";
import { getHadithList, HadithItem } from "@/lib/api/muslim-data";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
const content = {
  id: {
    title: "Hadits Arbain",
    subtitle: "Koleksi 42 Hadits Nawawi",
    search: "Cari hadits...",
    loading: "Memuat hadits...",
    readMore: "Baca Selengkapnya",
    noResult: "Tidak ditemukan hadits",
  },
  en: {
    title: "Arbain Hadith",
    subtitle: "Collection of 42 Nawawi Hadiths",
    search: "Search hadith...",
    loading: "Loading hadith...",
    readMore: "Read More",
    noResult: "No hadith found",
  },
};
const HadithPage: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<"id" | "en">("id");
  const [hadiths, setHadiths] = useState<HadithItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHadith, setSelectedHadith] = useState<HadithItem | null>(null);
  useEffect(() => {
    const profile = getProfile();
    setLang(profile.language);
    const loadData = async () => {
      setIsLoading(true);
      const data = await getHadithList();
      setHadiths(data);
      setIsLoading(false);
    };
    loadData();
  }, []);
  const t = content[lang];
  const filteredHadiths = hadiths.filter(
    (h) =>
      h.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.no.toString().includes(searchQuery),
  );
  return (
    <ResponsiveLayout className="pb-24">
      {" "}
      {/* Header */}{" "}
      {!selectedHadith && (
        <>
          {" "}
          <header className="flex md:hidden items-center justify-between px-6 py-4 border-b border-slate-800/50 sticky top-0 bg-[#020617]/80 backdrop-blur z-20">
            {" "}
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-800/50 transition-colors"
              aria-label="Back to dashboard"
            >
              {" "}
              <ArrowLeft className="w-5 h-5 text-slate-400" />{" "}
            </button>{" "}
            <div className="text-center">
              {" "}
              <span className="font-serif text-lg text-white">
                {t.title}
              </span>{" "}
              <p className="text-xs text-slate-500">{t.subtitle}</p>{" "}
            </div>{" "}
            <div className="w-9" />{" "}
          </header>{" "}
          <div className="hidden md:flex items-center justify-between mb-8">
            {" "}
            <div>
              {" "}
              <h1 className="font-serif text-3xl text-white">{t.title}</h1>{" "}
              <p className="text-slate-400 mt-1">{t.subtitle}</p>{" "}
            </div>{" "}
            <div className="relative w-64">
              {" "}
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                aria-hidden="true"
              />{" "}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                aria-label={t.search}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              />{" "}
            </div>{" "}
          </div>{" "}
          {/* Mobile Search */}{" "}
          <div className="md:hidden px-6 mb-6">
            {" "}
            <div className="relative">
              {" "}
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                aria-hidden="true"
              />{" "}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                aria-label={t.search}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              />{" "}
            </div>{" "}
          </div>{" "}
        </>
      )}{" "}
      {/* Main Content */}{" "}
      <div className={cn("md:p-0", !selectedHadith && "px-6")}>
        {" "}
        {isLoading ? (
          <div className="flex justify-center py-20">
            {" "}
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />{" "}
          </div>
        ) : selectedHadith ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {" "}
            {/* Detail View Header */}{" "}
            <div className="flex items-center gap-4 mb-6 pt-4 md:pt-0">
              {" "}
              <button
                onClick={() => setSelectedHadith(null)}
                className="p-2 -ml-2 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Back to list"
              >
                {" "}
                <ArrowLeft className="w-5 h-5 text-slate-400" />{" "}
              </button>{" "}
              <div>
                {" "}
                <h2 className="text-xl font-serif text-white">
                  {" "}
                  Hadits {selectedHadith.no}{" "}
                </h2>{" "}
                <p className="text-xs text-slate-400 truncate max-w-[200px]">
                  {" "}
                  {selectedHadith.judul}{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8">
              {" "}
              <div className="mb-8">
                {" "}
                <p
                  className="text-2xl md:text-3xl font-serif text-right text-white leading-loose md:leading-loose"
                  dir="rtl"
                >
                  {" "}
                  {selectedHadith.arab}{" "}
                </p>{" "}
              </div>{" "}
              <div className="prose prose-invert prose-sm max-w-none">
                {" "}
                <p className="text-slate-300 leading-relaxed whitespace-pre-line text-base">
                  {" "}
                  {selectedHadith.indo}{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {" "}
            {filteredHadiths.map((h, i) => (
              <motion.button
                key={h.no}
                onClick={() => setSelectedHadith(h)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="text-left group relative p-5 rounded-2xl bg-slate-900/40 border border-slate-800 hover:bg-slate-800/60 hover:border-emerald-500/30 transition-colors duration-300 hover:shadow-lg"
              >
                {" "}
                <div className="flex justify-between items-start mb-3">
                  {" "}
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-emerald-500 font-serif font-medium group-hover:bg-emerald-500/10 group-hover:scale-110 transition-[transform,background-color]">
                    {" "}
                    {h.no}{" "}
                  </span>{" "}
                  <BookOpen className="w-4 h-4 text-slate-600 group-hover:text-emerald-500/50 transition-colors" />{" "}
                </div>{" "}
                <h3 className="text-lg font-medium text-white mb-2 line-clamp-1 group-hover:text-emerald-200 transition-colors">
                  {" "}
                  {h.judul}{" "}
                </h3>{" "}
                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                  {" "}
                  {h.indo}{" "}
                </p>{" "}
              </motion.button>
            ))}{" "}
            {filteredHadiths.length === 0 && (
              <div className="col-span-full py-20 text-center">
                {" "}
                <p className="text-slate-500">{t.noResult}</p>{" "}
              </div>
            )}{" "}
          </div>
        )}{" "}
      </div>{" "}
    </ResponsiveLayout>
  );
};
export default HadithPage;
