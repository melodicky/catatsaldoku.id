"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import Link from "next/link";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { StreakCounter } from "@/components/dashboard/streak-counter";
import { FinancialHealthScore } from "@/components/dashboard/financial-health-score";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const { transactions, loading } = useTransactions();
  const [mounted, setMounted] = useState(false);
  const locale = language === "id" ? idLocale : enUS;

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthTransactions = transactions.filter(
      (t) => new Date(t.date) >= thisMonthStart && new Date(t.date) <= thisMonthEnd
    );
    const lastMonthTransactions = transactions.filter(
      (t) => new Date(t.date) >= lastMonthStart && new Date(t.date) <= lastMonthEnd
    );

    const thisMonthIncome = thisMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const thisMonthExpense = thisMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const lastMonthIncome = lastMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const lastMonthExpense = lastMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const incomeChange = lastMonthIncome > 0 
      ? ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 
      : 0;
    const expenseChange = lastMonthExpense > 0 
      ? ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100 
      : 0;

    return {
      balance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      thisMonthIncome,
      thisMonthExpense,
      incomeChange,
      expenseChange,
    };
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  if (!mounted) return null;

  const statCards = [
    {
      title: t.dashboard.totalBalance,
      value: stats.balance,
      icon: Wallet,
      color: "from-emerald-500 to-teal-500",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-500",
    },
    {
      title: t.dashboard.totalIncome,
      value: stats.thisMonthIncome,
      change: stats.incomeChange,
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-500",
      subtitle: t.dashboard.thisMonth,
    },
    {
      title: t.dashboard.totalExpense,
      value: stats.thisMonthExpense,
      change: stats.expenseChange,
      icon: TrendingDown,
      color: "from-rose-500 to-pink-500",
      iconBg: "bg-rose-500/20",
      iconColor: "text-rose-500",
      subtitle: t.dashboard.thisMonth,
    },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl lg:text-3xl font-bold"
          >
            {t.dashboard.welcome}! 👋
          </motion.h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), "EEEE, dd MMMM yyyy", { locale })}
          </p>
        </div>
        <Link href="/transactions">
          <Button className="gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            {t.transactions.addTransaction}
          </Button>
        </Link>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6" data-tour="stats" style={{ perspective: "1500px" }}>
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40, z: -60, rotateX: 45, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, z: 0, rotateX: 0, scale: 1 }}
              transition={{ 
                delay: index * 0.12, 
                duration: 0.7,
                type: "spring",
                stiffness: 80,
              }}
              whileHover={{ 
                scale: 1.03, 
                y: -8, 
                z: 30,
                rotateX: -5,
                transition: { duration: 0.3 }
              }}
              style={{ transformStyle: "preserve-3d" }}
              className="dashboard-card-3d"
            >
              <Card className="relative overflow-hidden glow-border-card">
              <div className={cn(
                "absolute inset-0 opacity-5 bg-gradient-to-br",
                card.color
              )} />
              <motion.div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-30"
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  background: `linear-gradient(135deg, ${card.color.includes('emerald') ? 'rgba(16, 185, 129, 0.2)' : card.color.includes('blue') ? 'rgba(59, 130, 246, 0.2)' : 'rgba(244, 63, 94, 0.2)'}, transparent)`,
                }}
              />
              <CardContent className="p-6 relative z-10 group">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <motion.p 
                      className="text-2xl lg:text-3xl font-bold"
                      animate={{
                        textShadow: [
                          "0 0 0px rgba(16, 185, 129, 0)",
                          "0 0 8px rgba(16, 185, 129, 0.3)",
                          "0 0 0px rgba(16, 185, 129, 0)",
                        ],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                    >
                      {loading ? "..." : formatCurrency(card.value)}
                    </motion.p>
                    {card.subtitle && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{card.subtitle}</span>
                        {card.change !== undefined && card.change !== 0 && (
                          <motion.span 
                            className={cn(
                              "text-xs font-medium flex items-center",
                              card.change > 0 ? "text-emerald-500" : "text-rose-500"
                            )}
                            animate={{
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                          >
                            <motion.div
                              animate={{
                                y: card.change > 0 ? [-2, 0, -2] : [2, 0, 2],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                              }}
                            >
                              {card.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            </motion.div>
                            {Math.abs(card.change).toFixed(1)}%
                          </motion.span>
                        )}
                      </div>
                    )}
                  </div>
                  <motion.div 
                    className={cn("p-3 rounded-xl relative", card.iconBg)}
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    whileHover={{
                      scale: 1.15,
                      rotate: 360,
                      transition: { duration: 0.6 }
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      animate={{
                        boxShadow: [
                          `0 0 0px ${card.color.includes('emerald') ? 'rgba(16, 185, 129, 0)' : card.color.includes('blue') ? 'rgba(59, 130, 246, 0)' : 'rgba(244, 63, 94, 0)'}`,
                          `0 0 20px ${card.color.includes('emerald') ? 'rgba(16, 185, 129, 0.4)' : card.color.includes('blue') ? 'rgba(59, 130, 246, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
                          `0 0 0px ${card.color.includes('emerald') ? 'rgba(16, 185, 129, 0)' : card.color.includes('blue') ? 'rgba(59, 130, 246, 0)' : 'rgba(244, 63, 94, 0)'}`,
                        ],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                      }}
                    />
                    <card.icon className={cn("w-6 h-6 relative z-10", card.iconColor)} />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StreakCounter />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <FinancialHealthScore />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              data-tour="transactions"
            >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {t.dashboard.recentTransactions}
                </CardTitle>
              <Link href="/transactions">
                <Button variant="ghost" size="sm">
                  {language === "id" ? "Lihat Semua" : "View All"}
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="w-10 h-10 rounded-xl bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-1/4" />
                      </div>
                      <div className="h-4 bg-muted rounded w-24" />
                    </div>
                  ))}
                </div>
              ) : recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t.dashboard.noTransactions}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map((transaction, index) => {
                    const IconComponent = transaction.category?.icon 
                      ? (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[transaction.category.icon] || Wallet
                      : Wallet;
                    return (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4"
                      >
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${transaction.category?.color || "#10b981"}20` }}
                        >
                          <IconComponent 
                            className="w-5 h-5" 
                            style={{ color: transaction.category?.color || "#10b981" }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {transaction.category?.name || (transaction.type === "income" ? t.transactions.income : t.transactions.expense)}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {transaction.description || format(new Date(transaction.date), "dd MMM yyyy", { locale })}
                          </p>
                        </div>
                        <p className={cn(
                          "font-semibold whitespace-nowrap",
                          transaction.type === "income" ? "text-emerald-500" : "text-rose-500"
                        )}>
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(Number(transaction.amount))}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {t.dashboard.quickStats}
              </CardTitle>
            </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.transactions.income}</span>
                    <motion.span 
                      className="font-medium text-emerald-500"
                      animate={{
                        textShadow: [
                          "0 0 0px rgba(16, 185, 129, 0)",
                          "0 0 10px rgba(16, 185, 129, 0.5)",
                          "0 0 0px rgba(16, 185, 129, 0)",
                        ],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                      }}
                    >
                      {formatCurrency(stats.thisMonthIncome)}
                    </motion.span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden relative" style={{ perspective: "400px" }}>
                    <motion.div
                      initial={{ width: 0, scaleY: 0.8 }}
                      animate={{ 
                        width: `${stats.thisMonthIncome + stats.thisMonthExpense > 0 
                          ? (stats.thisMonthIncome / (stats.thisMonthIncome + stats.thisMonthExpense)) * 100 
                          : 0}%`,
                        scaleY: [0.8, 1, 0.8],
                      }}
                      transition={{ 
                        width: { duration: 0.8, ease: "easeOut" },
                        scaleY: { duration: 2, repeat: Infinity }
                      }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full relative"
                      style={{
                        transformStyle: "preserve-3d",
                        boxShadow: "0 2px 10px rgba(16, 185, 129, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-white/20 rounded-full"
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        style={{
                          width: '50%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        }}
                      />
                    </motion.div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.transactions.expense}</span>
                    <motion.span 
                      className="font-medium text-rose-500"
                      animate={{
                        textShadow: [
                          "0 0 0px rgba(244, 63, 94, 0)",
                          "0 0 10px rgba(244, 63, 94, 0.5)",
                          "0 0 0px rgba(244, 63, 94, 0)",
                        ],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: 0.5,
                      }}
                    >
                      {formatCurrency(stats.thisMonthExpense)}
                    </motion.span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden relative" style={{ perspective: "400px" }}>
                    <motion.div
                      initial={{ width: 0, scaleY: 0.8 }}
                      animate={{ 
                        width: `${stats.thisMonthIncome + stats.thisMonthExpense > 0 
                          ? (stats.thisMonthExpense / (stats.thisMonthIncome + stats.thisMonthExpense)) * 100 
                          : 0}%`,
                        scaleY: [0.8, 1, 0.8],
                      }}
                      transition={{ 
                        width: { duration: 0.8, ease: "easeOut" },
                        scaleY: { duration: 2, repeat: Infinity, delay: 0.5 }
                      }}
                      className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full relative"
                      style={{
                        transformStyle: "preserve-3d",
                        boxShadow: "0 2px 10px rgba(244, 63, 94, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-white/20 rounded-full"
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                          delay: 0.5,
                        }}
                        style={{
                          width: '50%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        }}
                      />
                    </motion.div>
                  </div>
                </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {language === "id" ? "Sisa bulan ini" : "Balance this month"}
                  </span>
                  <span className={cn(
                    "text-lg font-bold",
                    stats.thisMonthIncome - stats.thisMonthExpense >= 0 
                      ? "text-emerald-500" 
                      : "text-rose-500"
                  )}>
                    {formatCurrency(stats.thisMonthIncome - stats.thisMonthExpense)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
