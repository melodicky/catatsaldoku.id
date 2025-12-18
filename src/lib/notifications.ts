import { createClient } from "@/lib/supabase/server";

export type NotificationType = "overspending" | "goal_achieved" | "low_balance" | "expense_spike" | "insight";

export interface NotificationRule {
  type: NotificationType;
  threshold?: number;
  message: string;
}

export async function checkAndCreateNotifications(userId: string) {
  const supabase = await createClient();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .gte("date", firstDay.toISOString())
    .lte("date", lastDay.toISOString());

  const { data: balance } = await supabase
    .from("balance")
    .select("*")
    .eq("user_id", userId)
    .single();

  const { data: goals } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("user_id", userId);

  if (!transactions) return;

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const notifications: Array<{
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    priority: "low" | "medium" | "high";
  }> = [];

  if (balance && balance.current_balance < 500000) {
    notifications.push({
      user_id: userId,
      type: "low_balance",
      title: "⚠️ Saldo Rendah",
      message: `Saldo Anda saat ini Rp ${balance.current_balance.toLocaleString()}. Pertimbangkan untuk mengurangi pengeluaran.`,
      priority: "high",
    });
  }

  if (expenses > income * 0.8) {
    notifications.push({
      user_id: userId,
      type: "overspending",
      title: "📊 Pengeluaran Tinggi",
      message: `Pengeluaran bulan ini (Rp ${expenses.toLocaleString()}) mencapai ${Math.round((expenses / income) * 100)}% dari pemasukan.`,
      priority: "medium",
    });
  }

  const lastWeekExpenses = transactions
    .filter((t) => {
      const tDate = new Date(t.date);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return t.type === "expense" && tDate >= weekAgo;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const prevWeekExpenses = transactions
    .filter((t) => {
      const tDate = new Date(t.date);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return t.type === "expense" && tDate >= twoWeeksAgo && tDate < weekAgo;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  if (lastWeekExpenses > prevWeekExpenses * 1.5 && prevWeekExpenses > 0) {
    notifications.push({
      user_id: userId,
      type: "expense_spike",
      title: "📈 Lonjakan Pengeluaran",
      message: `Pengeluaran minggu ini meningkat ${Math.round(((lastWeekExpenses - prevWeekExpenses) / prevWeekExpenses) * 100)}% dibanding minggu lalu.`,
      priority: "medium",
    });
  }

  if (goals) {
    for (const goal of goals) {
      if (goal.current_amount >= goal.target_amount && goal.status !== "completed") {
        await supabase
          .from("savings_goals")
          .update({ status: "completed" })
          .eq("id", goal.id);

        notifications.push({
          user_id: userId,
          type: "goal_achieved",
          title: "🎉 Target Tercapai!",
          message: `Selamat! Anda telah mencapai target tabungan "${goal.name}" sebesar Rp ${goal.target_amount.toLocaleString()}`,
          priority: "high",
        });
      }
    }
  }

  for (const notification of notifications) {
    const { data: existing } = await supabase
      .from("smart_notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("type", notification.type)
      .eq("is_read", false)
      .single();

    if (!existing) {
      await supabase.from("smart_notifications").insert(notification);
    }
  }
}
