"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { SavingsGoal } from "@/lib/types";

export function useSavings() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("savings_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setGoals(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = async (goal: Omit<SavingsGoal, "id" | "user_id" | "created_at" | "updated_at" | "is_completed">) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("savings_goals")
      .insert({ ...goal, user_id: user.id, current_amount: goal.current_amount || 0 })
      .select()
      .single();

    if (error) return null;
    setGoals((prev) => [data, ...prev]);
    return data;
  };

  const updateGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    const supabase = createClient();
    
    const isCompleted = updates.current_amount !== undefined && updates.target_amount !== undefined
      ? updates.current_amount >= updates.target_amount
      : undefined;

    const { data, error } = await supabase
      .from("savings_goals")
      .update({ 
        ...updates, 
        updated_at: new Date().toISOString(),
        ...(isCompleted !== undefined && { is_completed: isCompleted })
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return null;
    setGoals((prev) => prev.map((g) => (g.id === id ? data : g)));
    return data;
  };

  const addFunds = async (id: string, amount: number) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return null;
    
    const newAmount = Number(goal.current_amount) + amount;
    return updateGoal(id, { 
      current_amount: newAmount,
      target_amount: goal.target_amount,
      is_completed: newAmount >= goal.target_amount 
    });
  };

  const deleteGoal = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("savings_goals").delete().eq("id", id);
    if (error) return false;
    setGoals((prev) => prev.filter((g) => g.id !== id));
    return true;
  };

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    addFunds,
    deleteGoal,
    refetch: fetchGoals,
  };
}
