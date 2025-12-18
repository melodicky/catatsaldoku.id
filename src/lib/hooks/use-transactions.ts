"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Transaction, Category } from "@/lib/types";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("transactions")
      .select("*, category:categories(*)")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (data) setTransactions(data);
    setLoading(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (data) setCategories(data);
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [fetchTransactions, fetchCategories]);

  const addTransaction = async (transaction: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("transactions")
      .insert({ ...transaction, user_id: user.id })
      .select("*, category:categories(*)")
      .single();

    if (error) return null;
    setTransactions((prev) => [data, ...prev]);
    return data;
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("transactions")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*, category:categories(*)")
      .single();

    if (error) return null;
    setTransactions((prev) => prev.map((t) => (t.id === id ? data : t)));
    return data;
  };

  const deleteTransaction = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) return false;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    return true;
  };

  return {
    transactions,
    categories,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };
}
