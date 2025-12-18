"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wallet, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success(t.auth.resetEmailSent);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-mesh">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl shadow-xl p-8 border">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setLanguage(language === "id" ? "en" : "id")}
              className="px-3 py-1 text-sm font-medium rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            >
              {language === "id" ? "EN" : "ID"}
            </button>
          </div>

          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">{t.common.appName}</span>
          </div>

          {!sent ? (
            <>
              <h2 className="text-2xl font-bold mb-2 text-center">{t.auth.forgotPassword}</h2>
              <p className="text-muted-foreground mb-8 text-center">
                {language === "id" 
                  ? "Masukkan email Anda untuk menerima link reset kata sandi"
                  : "Enter your email to receive a password reset link"}
              </p>

              <form onSubmit={handleReset} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">{t.auth.email}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 transition-opacity"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {t.auth.sendResetLink}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {language === "id" ? "Email Terkirim!" : "Email Sent!"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {language === "id" 
                  ? "Silakan cek inbox email Anda untuk link reset kata sandi."
                  : "Please check your email inbox for the password reset link."}
              </p>
            </motion.div>
          )}

          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-2 mt-6 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === "id" ? "Kembali ke Login" : "Back to Login"}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
