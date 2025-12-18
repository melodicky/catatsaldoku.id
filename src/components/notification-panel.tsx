"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, AlertCircle, TrendingUp, Target, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./ui/button";
import { useLanguage } from "@/lib/i18n/context";

interface Notification {
  id: string;
  type: "overspending" | "goal_achieved" | "low_balance" | "expense_spike" | "insight";
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  is_read: boolean;
  created_at: string;
}

export function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { language } = useLanguage();
  const supabase = createClient();

  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "smart_notifications",
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("smart_notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from("smart_notifications")
      .update({ is_read: true })
      .eq("id", id);
    loadNotifications();
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("smart_notifications")
      .update({ is_read: true })
      .eq("user_id", user.id);
    loadNotifications();
  };

  const deleteNotification = async (id: string) => {
    await supabase.from("smart_notifications").delete().eq("id", id);
    loadNotifications();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "overspending":
        return <TrendingUp className="w-5 h-5" />;
      case "goal_achieved":
        return <Target className="w-5 h-5" />;
      case "low_balance":
        return <Wallet className="w-5 h-5" />;
      case "expense_spike":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      case "medium":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full sm:w-96 bg-background border-l shadow-2xl z-50 flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold">
                      {language === "id" ? "Notifikasi" : "Notifications"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {unreadCount} {language === "id" ? "belum dibaca" : "unread"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      {language === "id" ? "Tandai Semua" : "Mark All"}
                    </Button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                      <Bell className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      {language === "id" ? "Tidak ada notifikasi" : "No notifications"}
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`p-4 rounded-xl border ${getPriorityColor(notif.priority)} ${
                          !notif.is_read ? "border-2" : ""
                        } transition-all hover:shadow-md relative group`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getPriorityColor(notif.priority)}`}>
                            {getIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm mb-1">{notif.title}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {notif.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(notif.created_at).toLocaleDateString(
                                language === "id" ? "id-ID" : "en-US",
                                {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          {!notif.is_read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notif.id)}
                              className="text-xs h-7"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              {language === "id" ? "Tandai Baca" : "Mark Read"}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notif.id)}
                            className="text-xs h-7 text-rose-500 hover:text-rose-600"
                          >
                            <X className="w-3 h-3 mr-1" />
                            {language === "id" ? "Hapus" : "Delete"}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
