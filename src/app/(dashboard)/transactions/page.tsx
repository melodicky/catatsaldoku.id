"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit3,
  X,
  Calendar,
  Wallet,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/lib/i18n/context";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { AdvancedFilterSidebar } from "@/components/advanced-filter-sidebar";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function TransactionsPage() {
  const { t, language } = useLanguage();
  const {
    transactions,
    categories,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();
  const locale = language === "id" ? idLocale : enUS;

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<any>({
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: "",
    type: "all",
    category: "all",
  });

  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    category_id: "",
    amount: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.category?.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || t.type === typeFilter;
      const matchesCategory = categoryFilter === "all" || t.category_id === categoryFilter;

      const matchesAdvancedType =
        advancedFilters.type === "all" || t.type === advancedFilters.type;
      const matchesAdvancedCategory =
        advancedFilters.category === "all" || t.category_id === advancedFilters.category;

      const transactionDate = new Date(t.date);
      const matchesDateFrom =
        !advancedFilters.dateFrom || transactionDate >= new Date(advancedFilters.dateFrom);
      const matchesDateTo =
        !advancedFilters.dateTo || transactionDate <= new Date(advancedFilters.dateTo);

      const amount = Number(t.amount);
      const matchesAmountMin =
        !advancedFilters.amountMin || amount >= Number(advancedFilters.amountMin);
      const matchesAmountMax =
        !advancedFilters.amountMax || amount <= Number(advancedFilters.amountMax);

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory &&
        matchesAdvancedType &&
        matchesAdvancedCategory &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesAmountMin &&
        matchesAmountMax
      );
    });
  }, [transactions, search, typeFilter, categoryFilter, advancedFilters]);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => c.type === formData.type);
  }, [categories, formData.type]);

  const resetForm = () => {
    setFormData({
      type: "expense",
      category_id: "",
      amount: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
    });
    setEditingTransaction(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      type: formData.type,
      category_id: formData.category_id || null,
      amount: parseFloat(formData.amount),
      description: formData.description || null,
      date: formData.date,
    };

    if (editingTransaction) {
      const result = await updateTransaction(editingTransaction, data);
      if (result) {
        toast.success(t.transactions.transactionUpdated);
        setDialogOpen(false);
        resetForm();
      } else {
        toast.error(t.common.error);
      }
    } else {
      const result = await addTransaction(data);
      if (result) {
        toast.success(t.transactions.transactionAdded);
        setDialogOpen(false);
        resetForm();
      } else {
        toast.error(t.common.error);
      }
    }
  };

  const handleEdit = (transaction: typeof transactions[0]) => {
    setFormData({
      type: transaction.type,
      category_id: transaction.category_id || "",
      amount: transaction.amount.toString(),
      description: transaction.description || "",
      date: transaction.date,
    });
    setEditingTransaction(transaction.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteTransaction(id);
    if (result) {
      toast.success(t.transactions.transactionDeleted);
    } else {
      toast.error(t.common.error);
    }
  };

  const exportToExcel = () => {
    const data = filteredTransactions.map((t) => ({
      [t.common?.date || "Tanggal"]: format(new Date(t.date), "dd/MM/yyyy"),
      [t.common?.type || "Jenis"]: t.type === "income" ? "Pemasukan" : "Pengeluaran",
      [t.common?.category || "Kategori"]: t.category?.name || "-",
      [t.common?.description || "Deskripsi"]: t.description || "-",
      [t.common?.amount || "Jumlah"]: Number(t.amount),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `tabung-aja-transactions-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    toast.success(language === "id" ? "Berhasil diekspor ke Excel" : "Exported to Excel successfully");
  };

    const exportToPDF = () => {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("CatatSaldoku - Transactions", 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 30);

    let y = 45;
    doc.setFontSize(9);
    doc.text("Date", 14, y);
    doc.text("Type", 40, y);
    doc.text("Category", 65, y);
    doc.text("Description", 100, y);
    doc.text("Amount", 160, y);

    y += 8;
    filteredTransactions.slice(0, 30).forEach((t) => {
      doc.text(format(new Date(t.date), "dd/MM/yy"), 14, y);
      doc.text(t.type === "income" ? "Income" : "Expense", 40, y);
      doc.text((t.category?.name || "-").substring(0, 15), 65, y);
      doc.text((t.description || "-").substring(0, 25), 100, y);
      doc.text(formatCurrency(Number(t.amount)), 160, y);
      y += 7;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`tabung-aja-transactions-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success(language === "id" ? "Berhasil diekspor ke PDF" : "Exported to PDF successfully");
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">{t.transactions.title}</h1>
          <p className="text-muted-foreground">
            {language === "id" ? "Kelola semua transaksi Anda" : "Manage all your transactions"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAdvancedFilterOpen(true)}>
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            {language === "id" ? "Filter" : "Filters"}
          </Button>
          <Select onValueChange={(v) => (v === "excel" ? exportToExcel() : exportToPDF())}>
            <SelectTrigger className="w-[140px]">
              <Download className="w-4 h-4 mr-2" />
              {t.common.export}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                {t.transactions.addTransaction}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingTransaction ? t.transactions.editTransaction : t.transactions.addTransaction}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={formData.type === "income" ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, type: "income", category_id: "" })}
                    className={formData.type === "income" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                  >
                    {t.transactions.income}
                  </Button>
                  <Button
                    type="button"
                    variant={formData.type === "expense" ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, type: "expense", category_id: "" })}
                    className={formData.type === "expense" ? "bg-rose-500 hover:bg-rose-600" : ""}
                  >
                    {t.transactions.expense}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>{t.common.category}</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.transactions.selectCategory} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t.common.amount}</Label>
                  <Input
                    type="number"
                    placeholder={t.transactions.enterAmount}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    min="0"
                    step="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.common.description}</Label>
                  <Input
                    placeholder={t.transactions.enterDescription}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.common.date}</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                  >
                    {t.common.cancel}
                  </Button>
                  <Button type="submit" className="flex-1 gradient-primary">
                    {t.common.save}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t.common.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder={t.common.type} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.common.all}</SelectItem>
                <SelectItem value="income">{t.transactions.income}</SelectItem>
                <SelectItem value="expense">{t.transactions.expense}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder={t.common.category} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.common.all}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
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
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">{t.common.noData}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.map((transaction, index) => {
                  const IconComponent = transaction.category?.icon
                    ? (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[transaction.category.icon] || Wallet
                    : Wallet;

                  return (
                    <motion.div
                      key={transaction.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.02 }}
                      className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors group"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${transaction.category?.color || "#10b981"}20` }}
                      >
                        <IconComponent
                          className="w-5 h-5"
                          style={{ color: transaction.category?.color || "#10b981" }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {transaction.category?.name ||
                            (transaction.type === "income" ? t.transactions.income : t.transactions.expense)}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {transaction.description ||
                            format(new Date(transaction.date), "dd MMM yyyy", { locale })}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p
                          className={cn(
                            "font-semibold",
                            transaction.type === "income" ? "text-emerald-500" : "text-rose-500"
                          )}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(Number(transaction.amount))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.date), "dd MMM", { locale })}
                        </p>
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t.transactions.deleteTransaction}</AlertDialogTitle>
                              <AlertDialogDescription>{t.transactions.confirmDelete}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(transaction.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {t.common.delete}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <AdvancedFilterSidebar
        isOpen={advancedFilterOpen}
        onClose={() => setAdvancedFilterOpen(false)}
        categories={categories}
        onApplyFilters={(filters) => setAdvancedFilters(filters)}
      />
    </div>
  );
}
