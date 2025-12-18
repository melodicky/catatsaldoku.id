"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Heart, TrendingUp, Target, PiggyBank, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/context";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";

export function FinancialHealthScore() {
  const { language } = useLanguage();
  const { transactions } = useTransactions();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const healthData = useMemo(() => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);

    const thisMonthTransactions = transactions.filter(
      (t) => new Date(t.date) >= thisMonthStart && new Date(t.date) <= thisMonthEnd
    );

    const thisMonthIncome = thisMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const thisMonthExpense = thisMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const balance = totalIncome - totalExpense;

    const savingsRate = thisMonthIncome > 0 
      ? ((thisMonthIncome - thisMonthExpense) / thisMonthIncome) * 100 
      : 0;

    const expenseControl = thisMonthIncome > 0 
      ? Math.max(0, 100 - (thisMonthExpense / thisMonthIncome) * 100) 
      : 0;

    const hasPositiveBalance = balance > 0;
    const balanceScore = hasPositiveBalance ? 100 : 0;

    const hasRegularTransactions = transactions.length >= 10;
    const consistencyScore = hasRegularTransactions ? 100 : (transactions.length / 10) * 100;

    const savingsRateScore = Math.min(100, Math.max(0, savingsRate * 5));
    const expenseControlScore = Math.min(100, Math.max(0, expenseControl));

    const totalScore = Math.round(
      (savingsRateScore * 0.3) + 
      (expenseControlScore * 0.3) + 
      (balanceScore * 0.2) + 
      (consistencyScore * 0.2)
    );

    const categories = [
      {
        name: language === "id" ? "Tingkat Tabungan" : "Savings Rate",
        score: Math.round(savingsRateScore),
        icon: PiggyBank,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
        description: language === "id" 
          ? `Kamu menyimpan ${savingsRate >= 0 ? savingsRate.toFixed(0) : 0}% dari pendapatan`
          : `You're saving ${savingsRate >= 0 ? savingsRate.toFixed(0) : 0}% of income`
      },
      {
        name: language === "id" ? "Kontrol Pengeluaran" : "Expense Control",
        score: Math.round(expenseControlScore),
        icon: TrendingUp,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        description: language === "id" 
          ? `Pengeluaran ${thisMonthIncome > 0 ? ((thisMonthExpense / thisMonthIncome) * 100).toFixed(0) : 0}% dari pendapatan`
          : `Expenses are ${thisMonthIncome > 0 ? ((thisMonthExpense / thisMonthIncome) * 100).toFixed(0) : 0}% of income`
      },
      {
        name: language === "id" ? "Kesehatan Saldo" : "Balance Health",
        score: Math.round(balanceScore),
        icon: Target,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        description: language === "id" 
          ? hasPositiveBalance ? "Saldo positif" : "Saldo negatif"
          : hasPositiveBalance ? "Positive balance" : "Negative balance"
      },
      {
        name: language === "id" ? "Konsistensi" : "Consistency",
        score: Math.round(consistencyScore),
        icon: CheckCircle2,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        description: language === "id" 
          ? `${transactions.length} transaksi tercatat`
          : `${transactions.length} transactions logged`
      },
    ];

    return { totalScore, categories, savingsRate, balance };
  }, [transactions, language]);

  if (!mounted) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return { color: "text-emerald-500", bg: "from-emerald-500 to-teal-500", ring: "ring-emerald-500" };
    if (score >= 60) return { color: "text-blue-500", bg: "from-blue-500 to-cyan-500", ring: "ring-blue-500" };
    if (score >= 40) return { color: "text-amber-500", bg: "from-amber-500 to-orange-500", ring: "ring-amber-500" };
    return { color: "text-rose-500", bg: "from-rose-500 to-pink-500", ring: "ring-rose-500" };
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return language === "id" ? "Sangat Baik" : "Excellent";
    if (score >= 60) return language === "id" ? "Baik" : "Good";
    if (score >= 40) return language === "id" ? "Cukup" : "Fair";
    return language === "id" ? "Perlu Perbaikan" : "Needs Improvement";
  };

  const scoreColor = getScoreColor(healthData.totalScore);

  return (
    <Card className="relative overflow-hidden">
      <div className={cn("absolute inset-0 opacity-5 bg-gradient-to-br", scoreColor.bg)} />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Heart className={cn("w-5 h-5", scoreColor.color)} />
          {language === "id" ? "Skor Kesehatan Keuangan" : "Financial Health Score"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-secondary"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                className={scoreColor.color}
                initial={{ strokeDasharray: "439.6 439.6", strokeDashoffset: 439.6 }}
                animate={{ 
                  strokeDashoffset: 439.6 - (439.6 * healthData.totalScore) / 100 
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{
                  filter: "drop-shadow(0 0 8px currentColor)",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
                className={cn("text-4xl font-bold", scoreColor.color)}
              >
                {healthData.totalScore}
              </motion.div>
              <span className="text-sm text-muted-foreground">/100</span>
              <span className={cn("text-xs font-semibold mt-1", scoreColor.color)}>
                {getScoreLabel(healthData.totalScore)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {healthData.categories.map((category, index) => {
            const categoryColor = getScoreColor(category.score);
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={cn("rounded-xl p-4 border", category.bgColor)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <category.icon className={cn("w-4 h-4", category.color)} />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <span className={cn("text-lg font-bold", categoryColor.color)}>
                    {category.score}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${category.score}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                    className={cn("h-full rounded-full bg-gradient-to-r", categoryColor.bg)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{category.description}</p>
              </motion.div>
            );
          })}
        </div>

        {healthData.totalScore < 60 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
          >
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                  {language === "id" ? "Tips untuk Meningkatkan Skor:" : "Tips to Improve Your Score:"}
                </p>
                <ul className="text-sm text-amber-600 dark:text-amber-400 space-y-1">
                  {healthData.savingsRate < 20 && (
                    <li>• {language === "id" 
                      ? "Tingkatkan tingkat tabungan minimal 20% dari pendapatan" 
                      : "Increase savings rate to at least 20% of income"}</li>
                  )}
                  {healthData.balance < 0 && (
                    <li>• {language === "id" 
                      ? "Kurangi pengeluaran untuk mencapai saldo positif" 
                      : "Reduce expenses to achieve a positive balance"}</li>
                  )}
                  <li>• {language === "id" 
                    ? "Catat transaksi secara rutin untuk tracking lebih baik" 
                    : "Log transactions regularly for better tracking"}</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {healthData.totalScore >= 80 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-lg p-4"
          >
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                🎉 {language === "id" 
                  ? "Luar biasa! Kesehatan keuangan Anda sangat baik. Pertahankan kebiasaan positif ini!" 
                  : "Excellent! Your financial health is outstanding. Keep up the great habits!"}
              </p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
