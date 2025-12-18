"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Target, Trash2, Edit3, PiggyBank, Calendar, Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useLanguage } from "@/lib/i18n/context";
import { useSavings } from "@/lib/hooks/use-savings";
import { toast } from "sonner";
import { ProgressRingCard } from "@/components/progress-ring";
import { format, differenceInDays } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const GOAL_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

export default function SavingsPage() {
  const { t, language } = useLanguage();
  const { goals, loading, addGoal, updateGoal, addFunds, deleteGoal } = useSavings();
  const locale = language === "id" ? idLocale : enUS;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [addFundsDialogOpen, setAddFundsDialogOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [fundsAmount, setFundsAmount] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    current_amount: "0",
    deadline: "",
    color: GOAL_COLORS[0],
  });

  const resetForm = () => {
    setFormData({
      name: "",
      target_amount: "",
      current_amount: "0",
      deadline: "",
      color: GOAL_COLORS[0],
    });
    setEditingGoal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: formData.name,
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount) || 0,
      deadline: formData.deadline || null,
      color: formData.color,
      icon: "Target",
    };

    if (editingGoal) {
      const result = await updateGoal(editingGoal, data);
      if (result) {
        toast.success(t.savings.goalUpdated);
        setDialogOpen(false);
        resetForm();
      } else {
        toast.error(t.common.error);
      }
    } else {
      const result = await addGoal(data);
      if (result) {
        toast.success(t.savings.goalAdded);
        setDialogOpen(false);
        resetForm();
      } else {
        toast.error(t.common.error);
      }
    }
  };

  const handleEdit = (goal: typeof goals[0]) => {
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      deadline: goal.deadline || "",
      color: goal.color || GOAL_COLORS[0],
    });
    setEditingGoal(goal.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteGoal(id);
    if (result) {
      toast.success(t.savings.goalDeleted);
    } else {
      toast.error(t.common.error);
    }
  };

  const handleAddFunds = async () => {
    if (!selectedGoalId || !fundsAmount) return;
    
    const result = await addFunds(selectedGoalId, parseFloat(fundsAmount));
    if (result) {
      toast.success(t.savings.fundsAdded);
      if (result.is_completed) {
        toast.success(t.savings.goalCompleted, { icon: "🎉" });
      }
      setAddFundsDialogOpen(false);
      setFundsAmount("");
      setSelectedGoalId(null);
    } else {
      toast.error(t.common.error);
    }
  };

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);
  const completedGoals = goals.filter((g) => g.is_completed).length;

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">{t.savings.title}</h1>
          <p className="text-muted-foreground">
            {language === "id" ? "Atur dan capai target tabungan Anda" : "Set and achieve your savings goals"}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              {t.savings.addGoal}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? t.savings.editGoal : t.savings.addGoal}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t.savings.goalName}</Label>
                <Input
                  placeholder={language === "id" ? "Contoh: Beli Laptop" : "Example: Buy a Laptop"}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t.savings.targetAmount}</Label>
                <Input
                  type="number"
                  placeholder="10000000"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  required
                  min="0"
                  step="1000"
                />
              </div>
              <div className="space-y-2">
                <Label>{t.savings.currentAmount}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.current_amount}
                  onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                  min="0"
                  step="1000"
                />
              </div>
              <div className="space-y-2">
                <Label>{t.savings.deadline} ({language === "id" ? "opsional" : "optional"})</Label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === "id" ? "Warna" : "Color"}</Label>
                <div className="flex gap-2">
                  {GOAL_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={cn(
                        "w-8 h-8 rounded-full transition-transform",
                        formData.color === color && "ring-2 ring-offset-2 ring-offset-background scale-110"
                      )}
                      style={{ backgroundColor: color, ringColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setDialogOpen(false); resetForm(); }}>
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

        {!loading && goals.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {language === "id" ? "Progress Goals (Ring View)" : "Goals Progress (Ring View)"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {goals.slice(0, 4).map((goal, index) => (
                <motion.div
                  key={`ring-${goal.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProgressRingCard
                    title={goal.name}
                    current={Number(goal.current_amount)}
                    target={Number(goal.target_amount)}
                    color={goal.color || GOAL_COLORS[0]}
                    size={90}
                    icon={<Target className="w-5 h-5" style={{ color: goal.color || GOAL_COLORS[0] }} />}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500/20">
                    <PiggyBank className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === "id" ? "Total Ditabung" : "Total Saved"}
                    </p>
                    <p className="text-2xl font-bold">{formatCurrency(totalSaved)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <Target className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === "id" ? "Total Target" : "Total Target"}
                    </p>
                    <p className="text-2xl font-bold">{formatCurrency(totalTarget)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/20">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === "id" ? "Target Tercapai" : "Goals Completed"}
                    </p>
                    <p className="text-2xl font-bold">{completedGoals} / {goals.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">{t.savings.noGoals}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {goals.map((goal, index) => {
              const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
              const daysLeft = goal.deadline 
                ? differenceInDays(new Date(goal.deadline), new Date())
                : null;

              return (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={cn(
                    "relative overflow-hidden transition-shadow hover:shadow-lg",
                    goal.is_completed && "ring-2 ring-emerald-500"
                  )}>
                    <div 
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: goal.color || GOAL_COLORS[0] }}
                    />
                    {goal.is_completed && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-500">
                          {t.savings.goalCompleted}
                        </span>
                      </div>
                    )}
                    <CardContent className="p-6 pt-8">
                      <div className="flex items-start gap-4 mb-4">
                        <div 
                          className="p-3 rounded-xl"
                          style={{ backgroundColor: `${goal.color || GOAL_COLORS[0]}20` }}
                        >
                          <Target 
                            className="w-6 h-6" 
                            style={{ color: goal.color || GOAL_COLORS[0] }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{goal.name}</h3>
                          {daysLeft !== null && daysLeft >= 0 && !goal.is_completed && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <Calendar className="w-3 h-3" />
                              {daysLeft === 0 
                                ? (language === "id" ? "Hari ini" : "Today")
                                : `${daysLeft} ${language === "id" ? "hari lagi" : "days left"}`}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t.savings.progress}</span>
                          <span className="font-medium">{Math.min(progress, 100).toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={Math.min(progress, 100)} 
                          className="h-2"
                          style={{ 
                            ["--progress-color" as string]: goal.color || GOAL_COLORS[0]
                          }}
                        />
                        <div className="flex justify-between text-sm">
                          <span className="font-medium" style={{ color: goal.color || GOAL_COLORS[0] }}>
                            {formatCurrency(Number(goal.current_amount))}
                          </span>
                          <span className="text-muted-foreground">
                            / {formatCurrency(Number(goal.target_amount))}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedGoalId(goal.id);
                            setAddFundsDialogOpen(true);
                          }}
                          disabled={goal.is_completed}
                        >
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {t.savings.addFunds}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => handleEdit(goal)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t.savings.deleteGoal}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {language === "id" 
                                  ? "Yakin ingin menghapus target tabungan ini?"
                                  : "Are you sure you want to delete this savings goal?"}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(goal.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {t.common.delete}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={addFundsDialogOpen} onOpenChange={setAddFundsDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.savings.addFunds}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.common.amount}</Label>
              <Input
                type="number"
                placeholder="100000"
                value={fundsAmount}
                onChange={(e) => setFundsAmount(e.target.value)}
                min="0"
                step="1000"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setAddFundsDialogOpen(false); setFundsAmount(""); }}>
                {t.common.cancel}
              </Button>
              <Button className="flex-1 gradient-primary" onClick={handleAddFunds}>
                {t.common.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
