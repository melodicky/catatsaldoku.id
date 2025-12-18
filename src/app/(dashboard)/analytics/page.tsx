"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon, BarChart3, Sparkles, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/context";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { startOfMonth, endOfMonth, subMonths, format, eachDayOfInterval, subDays, addMonths, startOfDay, endOfDay } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#ef4444", "#84cc16"];

export default function AnalyticsPage() {
  const { t, language } = useLanguage();
  const { transactions, loading } = useTransactions();
  const locale = language === "id" ? idLocale : enUS;
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const filterStartDate = dateRange.from || startOfMonth(selectedMonth);
  const filterEndDate = dateRange.to || endOfMonth(selectedMonth);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const date = new Date(t.date);
      return date >= startOfDay(filterStartDate) && date <= endOfDay(filterEndDate);
    });
  }, [transactions, filterStartDate, filterEndDate]);

  const stats = useMemo(() => {
    const prevMonthStart = startOfMonth(subMonths(selectedMonth, 1));
    const prevMonthEnd = endOfMonth(subMonths(selectedMonth, 1));

    const thisMonthTransactions = filteredTransactions;
    const lastMonthTransactions = transactions.filter(
      (t) => new Date(t.date) >= prevMonthStart && new Date(t.date) <= prevMonthEnd
    );

    const thisMonthExpense = thisMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const lastMonthExpense = lastMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenseChange = lastMonthExpense > 0 
      ? ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100 
      : 0;

    const days = eachDayOfInterval({ start: filterStartDate, end: filterEndDate }).length;
    const dailyAverage = thisMonthExpense / (days || 1);

    return {
      thisMonthExpense,
      lastMonthExpense,
      expenseChange,
      dailyAverage,
    };
  }, [filteredTransactions, transactions, selectedMonth, filterStartDate, filterEndDate]);

  const expenseByCategory = useMemo(() => {
    const thisMonthExpenses = filteredTransactions.filter((t) => t.type === "expense");

    const categoryTotals = thisMonthExpenses.reduce((acc, t) => {
      const categoryName = t.category?.name || "Lainnya";
      acc[categoryName] = (acc[categoryName] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const incomeByCategory = useMemo(() => {
    const thisMonthIncome = filteredTransactions.filter((t) => t.type === "income");

    const categoryTotals = thisMonthIncome.reduce((acc, t) => {
      const categoryName = t.category?.name || "Lainnya";
      acc[categoryName] = (acc[categoryName] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

    const monthlyTrend = useMemo(() => {
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        
        const monthTransactions = transactions.filter(
          (t) => new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd
        );

        const income = monthTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + Number(t.amount), 0);
        const expense = monthTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + Number(t.amount), 0);

        months.push({
          name: format(date, "MMM", { locale }),
          [language === "id" ? "Pemasukan" : "Income"]: income,
          [language === "id" ? "Pengeluaran" : "Expense"]: expense,
        });
      }
      return months;
    }, [transactions, language, locale]);

  const comparisonData = useMemo(() => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthTxs = transactions.filter(
      (t) => new Date(t.date) >= thisMonthStart && new Date(t.date) <= thisMonthEnd
    );
    const lastMonthTxs = transactions.filter(
      (t) => new Date(t.date) >= lastMonthStart && new Date(t.date) <= lastMonthEnd
    );

    const thisMonthIncome = thisMonthTxs.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
    const thisMonthExpense = thisMonthTxs.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);
    const lastMonthIncome = lastMonthTxs.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
    const lastMonthExpense = lastMonthTxs.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);

    const incomeChange = lastMonthIncome > 0 ? ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;
    const expenseChange = lastMonthExpense > 0 ? ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100 : 0;

    return {
      thisMonth: { income: thisMonthIncome, expense: thisMonthExpense },
      lastMonth: { income: lastMonthIncome, expense: lastMonthExpense },
      changes: { income: incomeChange, expense: expenseChange },
    };
  }, [transactions]);

  const dailyTrend = useMemo(() => {
    const days = eachDayOfInterval({ start: filterStartDate, end: filterEndDate }).slice(-7);
    
    return days.map(date => {
      const dayTransactions = filteredTransactions.filter(
        (t) => format(new Date(t.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      );

      const expense = dayTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        name: format(date, "EEE", { locale }),
        value: expense,
      };
    });
  }, [filteredTransactions, filterStartDate, filterEndDate, locale]);

  const insights = useMemo(() => {
    const result = [];
    
    if (stats.expenseChange !== 0) {
      const direction = stats.expenseChange > 0 ? t.analytics.increased : t.analytics.decreased;
      result.push({
        icon: stats.expenseChange > 0 ? ArrowUpRight : ArrowDownRight,
        color: stats.expenseChange > 0 ? "text-rose-500" : "text-emerald-500",
        text: `${language === "id" ? "Pengeluaran" : "Spending"} ${direction} ${Math.abs(stats.expenseChange).toFixed(1)}% ${t.analytics.comparedToLastMonth}`,
      });
    }

    if (expenseByCategory.length > 0) {
      result.push({
        icon: PieChartIcon,
        color: "text-blue-500",
        text: `${t.analytics.topExpense}: ${expenseByCategory[0].name} (${formatCurrency(expenseByCategory[0].value)})`,
      });
    }

    result.push({
      icon: BarChart3,
      color: "text-amber-500",
      text: `${t.analytics.averageDaily}: ${formatCurrency(stats.dailyAverage)}`,
    });

    return result;
  }, [stats, expenseByCategory, t, language]);

  const handlePrevMonth = () => {
    setSelectedMonth(prev => subMonths(prev, 1));
    setDateRange({ from: undefined, to: undefined });
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => addMonths(prev, 1));
    setDateRange({ from: undefined, to: undefined });
  };

  const handleResetFilter = () => {
    setSelectedMonth(new Date());
    setDateRange({ from: undefined, to: undefined });
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">{t.analytics.title}</h1>
          <p className="text-muted-foreground">
            {language === "id" ? "Analisis visual keuangan Anda" : "Visual analysis of your finances"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    `${format(dateRange.from, "dd MMM", { locale })} - ${format(dateRange.to, "dd MMM yyyy", { locale })}`
                  ) : (
                    format(dateRange.from, "dd MMM yyyy", { locale })
                  )
                ) : (
                  format(selectedMonth, "MMMM yyyy", { locale })
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                locale={locale}
                numberOfMonths={2}
              />
              <div className="p-3 border-t flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={handleResetFilter}>
                  {language === "id" ? "Reset" : "Reset"}
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <CardTitle className="text-lg">{t.analytics.insights}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50"
                >
                  <insight.icon className={cn("w-5 h-5 mt-0.5", insight.color)} />
                  <p className="text-sm text-foreground">{insight.text}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">{t.analytics.expenseByCategory}</CardTitle>
            </CardHeader>
            <CardContent>
              {expenseByCategory.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  {t.common.noData}
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expenseByCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {expenseByCategory.slice(0, 6).map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="truncate text-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">{t.analytics.monthlyTrend}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem"
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey={language === "id" ? "Pemasukan" : "Income"} 
                      fill="#10b981" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey={language === "id" ? "Pengeluaran" : "Expense"} 
                      fill="#f43f5e" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">{language === "id" ? "Tren 7 Hari Terakhir" : "Last 7 Days Trend"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyTrend}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#f43f5e" 
                      strokeWidth={2}
                      dot={{ fill: "#f43f5e", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">{t.analytics.incomeByCategory}</CardTitle>
              </CardHeader>
              <CardContent>
                {incomeByCategory.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    {t.common.noData}
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incomeByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {incomeByCategory.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "0.5rem"
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {incomeByCategory.slice(0, 6).map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="truncate text-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{language === "id" ? "Perbandingan Bulan Ini vs Bulan Lalu" : "This Month vs Last Month"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                    {language === "id" ? "Pemasukan" : "Income"}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div>
                        <p className="text-xs text-muted-foreground">{language === "id" ? "Bulan Ini" : "This Month"}</p>
                        <p className="text-2xl font-bold text-emerald-500">{formatCurrency(comparisonData.thisMonth.income)}</p>
                      </div>
                      <ArrowUpRight className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                      <div>
                        <p className="text-xs text-muted-foreground">{language === "id" ? "Bulan Lalu" : "Last Month"}</p>
                        <p className="text-2xl font-bold text-foreground">{formatCurrency(comparisonData.lastMonth.income)}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-xl font-semibold",
                      comparisonData.changes.income >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {comparisonData.changes.income >= 0 ? <TrendingUp className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      <span>{comparisonData.changes.income >= 0 ? "+" : ""}{comparisonData.changes.income.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                    {language === "id" ? "Pengeluaran" : "Expense"}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <div>
                        <p className="text-xs text-muted-foreground">{language === "id" ? "Bulan Ini" : "This Month"}</p>
                        <p className="text-2xl font-bold text-rose-500">{formatCurrency(comparisonData.thisMonth.expense)}</p>
                      </div>
                      <ArrowDownRight className="w-8 h-8 text-rose-500" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                      <div>
                        <p className="text-xs text-muted-foreground">{language === "id" ? "Bulan Lalu" : "Last Month"}</p>
                        <p className="text-2xl font-bold text-foreground">{formatCurrency(comparisonData.lastMonth.expense)}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-xl font-semibold",
                      comparisonData.changes.expense <= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {comparisonData.changes.expense >= 0 ? <TrendingUp className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      <span>{comparisonData.changes.expense >= 0 ? "+" : ""}{comparisonData.changes.expense.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }
