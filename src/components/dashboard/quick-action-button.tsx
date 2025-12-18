"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, TrendingUp, TrendingDown, Target, Wallet } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import Link from "next/link";

export function QuickActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();

  const actions = [
    {
      icon: TrendingUp,
      label: language === "id" ? "Tambah Pemasukan" : "Add Income",
      color: "from-blue-500 to-cyan-500",
      href: "/transactions?type=income",
    },
    {
      icon: TrendingDown,
      label: language === "id" ? "Tambah Pengeluaran" : "Add Expense",
      color: "from-rose-500 to-pink-500",
      href: "/transactions?type=expense",
    },
    {
      icon: Target,
      label: language === "id" ? "Buat Goal Baru" : "Create New Goal",
      color: "from-amber-500 to-orange-500",
      href: "/savings",
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50" data-tour="quick-action">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-20 right-0 space-y-3 mb-2"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={action.href}>
                  <motion.button
                    whileHover={{ scale: 1.05, x: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r ${action.color} text-white shadow-lg hover:shadow-xl transition-shadow whitespace-nowrap`}
                  >
                    <action.icon className="w-5 h-5" />
                    <span className="font-medium">{action.label}</span>
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all ${
          isOpen 
            ? "bg-rose-500 hover:bg-rose-600 rotate-45" 
            : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-emerald-500/50"
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="plus"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
        />
      )}
    </div>
  );
}
