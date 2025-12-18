"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, Calendar, DollarSign, Tag, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useLanguage } from "@/lib/i18n/context";
import { Category } from "@/lib/types";

interface FilterState {
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  type: string;
  category: string;
}

interface AdvancedFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onApplyFilters: (filters: FilterState) => void;
}

export function AdvancedFilterSidebar({
  isOpen,
  onClose,
  categories,
  onApplyFilters,
}: AdvancedFilterSidebarProps) {
  const { language } = useLanguage();
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: "",
    type: "all",
    category: "all",
  });

  const handleReset = () => {
    const resetFilters = {
      dateFrom: "",
      dateTo: "",
      amountMin: "",
      amountMax: "",
      type: "all",
      category: "all",
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l shadow-2xl z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-background border-b z-10 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <SlidersHorizontal className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">
                      {language === "id" ? "Filter Lanjutan" : "Advanced Filters"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {language === "id" ? "Filter transaksi sesuai kebutuhan" : "Filter transactions as needed"}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {language === "id" ? "Rentang Tanggal" : "Date Range"}
                </div>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="dateFrom" className="text-sm">
                      {language === "id" ? "Dari Tanggal" : "From Date"}
                    </Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateTo" className="text-sm">
                      {language === "id" ? "Sampai Tanggal" : "To Date"}
                    </Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  {language === "id" ? "Rentang Jumlah" : "Amount Range"}
                </div>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="amountMin" className="text-sm">
                      {language === "id" ? "Jumlah Minimum" : "Minimum Amount"}
                    </Label>
                    <Input
                      id="amountMin"
                      type="number"
                      placeholder="0"
                      value={filters.amountMin}
                      onChange={(e) => setFilters({ ...filters, amountMin: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amountMax" className="text-sm">
                      {language === "id" ? "Jumlah Maksimum" : "Maximum Amount"}
                    </Label>
                    <Input
                      id="amountMax"
                      type="number"
                      placeholder="999999999"
                      value={filters.amountMax}
                      onChange={(e) => setFilters({ ...filters, amountMax: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Tag className="w-4 h-4" />
                  {language === "id" ? "Tipe & Kategori" : "Type & Category"}
                </div>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="type" className="text-sm">
                      {language === "id" ? "Tipe Transaksi" : "Transaction Type"}
                    </Label>
                    <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                      <SelectTrigger id="type" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{language === "id" ? "Semua Tipe" : "All Types"}</SelectItem>
                        <SelectItem value="income">{language === "id" ? "Pemasukan" : "Income"}</SelectItem>
                        <SelectItem value="expense">{language === "id" ? "Pengeluaran" : "Expense"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-sm">
                      {language === "id" ? "Kategori" : "Category"}
                    </Label>
                    <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                      <SelectTrigger id="category" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{language === "id" ? "Semua Kategori" : "All Categories"}</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="bg-secondary/50 rounded-xl p-4">
                  <p className="text-sm font-medium mb-2">
                    {language === "id" ? "Filter Aktif" : "Active Filters"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filters.dateFrom && (
                      <div className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                        {language === "id" ? "Dari: " : "From: "}{filters.dateFrom}
                      </div>
                    )}
                    {filters.dateTo && (
                      <div className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                        {language === "id" ? "Sampai: " : "To: "}{filters.dateTo}
                      </div>
                    )}
                    {filters.amountMin && (
                      <div className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                        Min: Rp {parseInt(filters.amountMin).toLocaleString()}
                      </div>
                    )}
                    {filters.amountMax && (
                      <div className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                        Max: Rp {parseInt(filters.amountMax).toLocaleString()}
                      </div>
                    )}
                    {filters.type !== "all" && (
                      <div className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                        {filters.type === "income" ? (language === "id" ? "Pemasukan" : "Income") : (language === "id" ? "Pengeluaran" : "Expense")}
                      </div>
                    )}
                    {filters.category !== "all" && (
                      <div className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                        {categories.find((c) => c.id === filters.category)?.name}
                      </div>
                    )}
                    {Object.values(filters).every((v) => !v || v === "all") && (
                      <div className="text-xs text-muted-foreground italic">
                        {language === "id" ? "Tidak ada filter aktif" : "No active filters"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-background border-t p-6 space-y-3">
              <Button onClick={handleApply} className="w-full gradient-primary" size="lg">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                {language === "id" ? "Terapkan Filter" : "Apply Filters"}
              </Button>
              <Button onClick={handleReset} variant="outline" className="w-full" size="lg">
                <RotateCcw className="w-4 h-4 mr-2" />
                {language === "id" ? "Reset Semua" : "Reset All"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
