"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/context";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { format, isToday, isYesterday, subDays, startOfDay, differenceInDays } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function StreakCounter() {
  const { language } = useLanguage();
  const { transactions } = useTransactions();
  const [mounted, setMounted] = useState(false);
  const locale = language === "id" ? idLocale : enUS;

  useEffect(() => {
    setMounted(true);
  }, []);

  const streakData = useMemo(() => {
    if (!transactions.length) return { currentStreak: 0, longestStreak: 0, calendar: [] };

    const uniqueDates = new Set(
      transactions.map(t => format(startOfDay(new Date(t.date)), "yyyy-MM-dd"))
    );

    const sortedDates = Array.from(uniqueDates)
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    let currentStreak = 0;
    const today = startOfDay(new Date());
    
    const hasToday = sortedDates.some(d => isToday(d));
    const hasYesterday = sortedDates.some(d => isYesterday(d));
    
    if (hasToday) {
      currentStreak = 1;
      let checkDate = subDays(today, 1);
      
      for (let i = 0; i < 365; i++) {
        const hasDate = sortedDates.some(d => 
          format(d, "yyyy-MM-dd") === format(checkDate, "yyyy-MM-dd")
        );
        if (hasDate) {
          currentStreak++;
          checkDate = subDays(checkDate, 1);
        } else {
          break;
        }
      }
    } else if (hasYesterday) {
      currentStreak = 1;
      let checkDate = subDays(today, 2);
      
      for (let i = 0; i < 365; i++) {
        const hasDate = sortedDates.some(d => 
          format(d, "yyyy-MM-dd") === format(checkDate, "yyyy-MM-dd")
        );
        if (hasDate) {
          currentStreak++;
          checkDate = subDays(checkDate, 1);
        } else {
          break;
        }
      }
    }

    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const diff = differenceInDays(sortedDates[i], sortedDates[i + 1]);
      if (diff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    const calendar = [];
    for (let i = 13; i >= 0; i--) {
      const date = subDays(today, i);
      const hasTransaction = sortedDates.some(d => 
        format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      );
      calendar.push({
        date,
        hasTransaction,
        isToday: isToday(date),
      });
    }

    return { currentStreak, longestStreak, calendar };
  }, [transactions]);

  if (!mounted) return null;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-orange-500 to-rose-500" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Flame className="w-5 h-5 text-orange-500" />
          {language === "id" ? "Streak Aktivitas" : "Activity Streak"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange-500/10 to-rose-500/10 rounded-xl p-4 border border-orange-200/20 dark:border-orange-800/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">
                {language === "id" ? "Streak Saat Ini" : "Current Streak"}
              </span>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-3xl font-bold text-orange-500"
            >
              {streakData.currentStreak}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {language === "id" ? "hari" : "days"}
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-200/20 dark:border-blue-800/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">
                {language === "id" ? "Rekor Terpanjang" : "Longest Streak"}
              </span>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
              className="text-3xl font-bold text-blue-500"
            >
              {streakData.longestStreak}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {language === "id" ? "hari" : "days"}
              </span>
            </motion.div>
          </motion.div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {language === "id" ? "14 Hari Terakhir" : "Last 14 Days"}
            </span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {streakData.calendar.map((day, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all cursor-pointer",
                    day.hasTransaction
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-secondary text-muted-foreground",
                    day.isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                  title={format(day.date, "dd MMM yyyy", { locale })}
                >
                  {day.hasTransaction ? "✓" : format(day.date, "d")}
                </motion.div>
                <span className="text-[10px] text-muted-foreground mt-1">
                  {format(day.date, "EEE", { locale }).slice(0, 1)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {streakData.currentStreak === 0 && transactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3"
          >
            <p className="text-sm text-amber-700 dark:text-amber-400">
              💡 {language === "id" 
                ? "Catat transaksi hari ini untuk memulai streak baru!" 
                : "Log a transaction today to start a new streak!"}
            </p>
          </motion.div>
        )}

        {streakData.currentStreak >= 7 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-500/10 to-rose-500/10 border border-orange-500/20 rounded-lg p-3"
          >
            <p className="text-sm font-medium">
              🎉 {language === "id" 
                ? `Luar biasa! Kamu sudah konsisten ${streakData.currentStreak} hari berturut-turut!` 
                : `Amazing! You've been consistent for ${streakData.currentStreak} days in a row!`}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
