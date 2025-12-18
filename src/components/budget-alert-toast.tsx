"use client";

import { useEffect, useState } from "react";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { useLanguage } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, AlertCircle, DollarSign } from "lucide-react";
import { startOfMonth, endOfMonth, format } from "date-fns";

interface Budget {
  id: string;
  category_id: string | null;
  amount: number;
  period: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function BudgetAlertToast() {
  const { transactions } = useTransactions();
  const { language } = useLanguage();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [checkedBudgets, setCheckedBudgets] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchBudgets = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from("budgets")
        .select(`
          *,
          category:categories(id, name, color)
        `)
        .eq("user_id", user.id)
        .eq("period", "monthly");

      if (!error && data) {
        setBudgets(data as Budget[]);
      }
    };

    fetchBudgets();
  }, []);

  useEffect(() => {
    if (!budgets.length || !transactions.length) return;

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const thisMonthTransactions = transactions.filter(
      (t) => t.type === "expense" && new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd
    );

    budgets.forEach((budget) => {
      const categoryTransactions = budget.category_id
        ? thisMonthTransactions.filter((t) => t.category_id === budget.category_id)
        : thisMonthTransactions;

      const totalSpent = categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const percentage = (totalSpent / Number(budget.amount)) * 100;
      const budgetKey = `${budget.id}-${format(now, "yyyy-MM")}`;

      if (percentage >= 80 && percentage < 100 && !checkedBudgets.has(budgetKey + "-80")) {
        setCheckedBudgets(prev => new Set(prev).add(budgetKey + "-80"));
        
        toast(
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm mb-1">
                {language === "id" ? "⚠️ Peringatan Budget" : "⚠️ Budget Warning"}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === "id" 
                  ? `Kamu sudah menggunakan ${percentage.toFixed(0)}% budget ${budget.category?.name || "total"}` 
                  : `You've used ${percentage.toFixed(0)}% of ${budget.category?.name || "total"} budget`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(totalSpent)} / {formatCurrency(Number(budget.amount))}
              </p>
            </div>
          </div>,
          {
            duration: 5000,
            className: "border-l-4 border-amber-500",
          }
        );
      }

      if (percentage >= 100 && !checkedBudgets.has(budgetKey + "-100")) {
        setCheckedBudgets(prev => new Set(prev).add(budgetKey + "-100"));
        
        toast(
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm mb-1">
                {language === "id" ? "🚨 Budget Terlampaui!" : "🚨 Budget Exceeded!"}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === "id" 
                  ? `Budget ${budget.category?.name || "total"} telah melampaui ${formatCurrency(totalSpent - Number(budget.amount))}` 
                  : `${budget.category?.name || "Total"} budget exceeded by ${formatCurrency(totalSpent - Number(budget.amount))}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(totalSpent)} / {formatCurrency(Number(budget.amount))}
              </p>
            </div>
          </div>,
          {
            duration: 6000,
            className: "border-l-4 border-rose-500",
          }
        );
      }

      if (percentage < 50 && percentage > 0 && !checkedBudgets.has(budgetKey + "-safe")) {
        const remaining = Number(budget.amount) - totalSpent;
        const daysLeft = Math.ceil((monthEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysLeft <= 7 && daysLeft > 0 && !checkedBudgets.has(budgetKey + "-tip")) {
          setCheckedBudgets(prev => new Set(prev).add(budgetKey + "-tip"));
          
          toast(
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1">
                  {language === "id" ? "💡 Tips Budget" : "💡 Budget Tip"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === "id" 
                    ? `Sisa budget ${budget.category?.name || "total"}: ${formatCurrency(remaining)} (${daysLeft} hari lagi)` 
                    : `Remaining ${budget.category?.name || "total"} budget: ${formatCurrency(remaining)} (${daysLeft} days left)`}
                </p>
              </div>
            </div>,
            {
              duration: 4000,
              className: "border-l-4 border-blue-500",
            }
          );
        }
      }
    });
  }, [budgets, transactions, language, checkedBudgets]);

  return null;
}
