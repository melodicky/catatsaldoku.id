"use client";

import { AIChatPanel } from "@/components/ai-chat-panel";
import { useLanguage } from "@/lib/i18n/context";
import { Brain, Sparkles, TrendingUp, AlertCircle } from "lucide-react";

export default function AIPage() {
  const { language } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            {language === "id" ? "AI Konsultan Keuangan" : "AI Financial Consultant"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === "id" 
              ? "Dapatkan saran keuangan personal berdasarkan data Anda" 
              : "Get personalized financial advice based on your data"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AIChatPanel />
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold">
                {language === "id" ? "Tips Penggunaan" : "Usage Tips"}
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span>•</span>
                <span>
                  {language === "id" 
                    ? "Tanyakan tentang pengeluaran bulanan Anda" 
                    : "Ask about your monthly expenses"}
                </span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>
                  {language === "id" 
                    ? "Minta saran untuk mencapai target tabungan" 
                    : "Get advice on reaching savings goals"}
                </span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>
                  {language === "id" 
                    ? "Analisis pola pengeluaran Anda" 
                    : "Analyze your spending patterns"}
                </span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>
                  {language === "id" 
                    ? "Dapatkan rekomendasi budget" 
                    : "Get budget recommendations"}
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-card rounded-xl p-6 border">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              <h3 className="font-semibold">
                {language === "id" ? "Pertanyaan Populer" : "Popular Questions"}
              </h3>
            </div>
            <div className="space-y-2">
              {[
                language === "id" 
                  ? "Bagaimana cara mengurangi pengeluaran?" 
                  : "How can I reduce expenses?",
                language === "id" 
                  ? "Apakah tabungan saya sudah cukup?" 
                  : "Are my savings enough?",
                language === "id" 
                  ? "Kategori mana yang paling boros?" 
                  : "Which category is most wasteful?",
              ].map((q, i) => (
                <button
                  key={i}
                  className="w-full text-left px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                  {language === "id" ? "Catatan" : "Note"}
                </p>
                <p className="text-amber-800 dark:text-amber-200">
                  {language === "id" 
                    ? "AI ini menganalisis data keuangan Anda untuk memberikan saran yang personal. Semua percakapan bersifat privat." 
                    : "This AI analyzes your financial data to provide personalized advice. All conversations are private."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
