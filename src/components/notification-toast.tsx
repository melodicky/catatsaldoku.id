"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, Target, CheckCircle, Info, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export type ToastType = "income" | "expense" | "goal" | "success" | "info" | "warning";

interface NotificationToastProps {
  type: ToastType;
  title: string;
  message?: string;
  amount?: number;
}

export function showNotificationToast({ type, title, message, amount }: NotificationToastProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getConfig = (type: ToastType) => {
    switch (type) {
      case "income":
        return {
          icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
          style: { border: "2px solid rgb(59 130 246)", background: "rgb(59 130 246 / 0.1)" },
        };
      case "expense":
        return {
          icon: <TrendingDown className="w-5 h-5 text-rose-500" />,
          style: { border: "2px solid rgb(244 63 94)", background: "rgb(244 63 94 / 0.1)" },
        };
      case "goal":
        return {
          icon: <Target className="w-5 h-5 text-amber-500" />,
          style: { border: "2px solid rgb(245 158 11)", background: "rgb(245 158 11 / 0.1)" },
        };
      case "success":
        return {
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
          style: { border: "2px solid rgb(16 185 129)", background: "rgb(16 185 129 / 0.1)" },
        };
      case "info":
        return {
          icon: <Info className="w-5 h-5 text-blue-500" />,
          style: { border: "2px solid rgb(59 130 246)", background: "rgb(59 130 246 / 0.1)" },
        };
      case "warning":
        return {
          icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
          style: { border: "2px solid rgb(245 158 11)", background: "rgb(245 158 11 / 0.1)" },
        };
    }
  };

  const config = getConfig(type);
  const description = amount ? `${message || ""} ${formatCurrency(amount)}` : message;

  toast(title, {
    description,
    icon: config.icon,
    duration: 4000,
    style: config.style,
  });
}

export function NotificationToastProvider() {
  const { language } = useLanguage();

  useEffect(() => {
    const demoNotifications = [
      {
        type: "income" as ToastType,
        title: language === "id" ? "Pemasukan Baru" : "New Income",
        message: language === "id" ? "Gaji bulan ini" : "Monthly salary",
        amount: 8500000,
      },
      {
        type: "expense" as ToastType,
        title: language === "id" ? "Pengeluaran Baru" : "New Expense",
        message: language === "id" ? "Belanja bulanan" : "Monthly groceries",
        amount: 1250000,
      },
      {
        type: "goal" as ToastType,
        title: language === "id" ? "Goal Tercapai!" : "Goal Achieved!",
        message: language === "id" ? "Dana darurat target 50%" : "Emergency fund 50% target",
      },
    ];

    const timer = setTimeout(() => {
      const notification = demoNotifications[Math.floor(Math.random() * demoNotifications.length)];
      showNotificationToast(notification);
    }, 3000);

    return () => clearTimeout(timer);
  }, [language]);

  return null;
}
