import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [transactionsResult, savingsResult, categoriesResult] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(50),
      supabase
        .from("savings_goals")
        .select("*")
        .eq("user_id", user.id),
      supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id),
    ]);

    const transactions = transactionsResult.data || [];
    const savings = savingsResult.data || [];
    const categories = categoriesResult.data || [];

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    const categoryExpenses: { [key: string]: number } = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoryExpenses[t.category_id] = (categoryExpenses[t.category_id] || 0) + t.amount;
      });

    const systemPrompt = `You are a professional financial consultant AI. You have access to the user's financial data:

Financial Summary:
- Total Income: Rp ${totalIncome.toLocaleString()}
- Total Expenses: Rp ${totalExpense.toLocaleString()}
- Current Balance: Rp ${balance.toLocaleString()}
- Number of Transactions: ${transactions.length}
- Active Savings Goals: ${savings.length}

Recent Transactions:
${transactions.slice(0, 10).map((t) => {
  const category = categories.find((c) => c.id === t.category_id);
  return `- ${t.type === "income" ? "Income" : "Expense"}: Rp ${t.amount.toLocaleString()} (${category?.name || "Unknown"}) on ${t.date}`;
}).join("\n")}

Savings Goals:
${savings.map((s) => `- ${s.name}: Rp ${s.current_amount.toLocaleString()} / Rp ${s.target_amount.toLocaleString()} (${Math.round((s.current_amount / s.target_amount) * 100)}%)`).join("\n")}

Instructions:
- Provide personalized, actionable financial advice based on this data
- Be conversational and friendly
- Use Indonesian Rupiah (Rp) format
- Respond in the same language as the user's message
- Keep responses concise and helpful
- Suggest specific actions when appropriate`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    await supabase.from("ai_chat_messages").insert({
      user_id: user.id,
      message,
      response: aiResponse,
    });

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    );
  }
}
