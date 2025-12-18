"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  Target, 
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  User,
  Edit2,
  Trash2,
  Plus,
  Tag,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Category } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NotificationPanel } from "@/components/notification-panel";

const navItems = [
  { icon: LayoutDashboard, path: "/dashboard", key: "dashboard" as const },
  { icon: ArrowLeftRight, path: "/transactions", key: "transactions" as const },
  { icon: PieChart, path: "/analytics", key: "analytics" as const },
  { icon: Target, path: "/savings", key: "savings" as const },
  { icon: Brain, path: "/ai", key: "ai" as const },
  { icon: Settings, path: "/settings", key: "settings" as const },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategories, setShowCategories] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (profile) {
          setUserName(profile.full_name);
        }
      }
    };
    
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", user.id)
          .order("name");
        if (data) setCategories(data);
      }
    };

    fetchUser();
    fetchCategories();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success(language === "id" ? "Berhasil keluar" : "Logged out successfully");
    router.push("/auth/login");
  };

  const handleUpdateCategory = async () => {
    if (!editCategory || !newCategoryName.trim()) return;
    
    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .update({ name: newCategoryName.trim() })
      .eq("id", editCategory.id);

    if (error) {
      toast.error(language === "id" ? "Gagal mengubah kategori" : "Failed to update category");
    } else {
      toast.success(language === "id" ? "Kategori berhasil diubah" : "Category updated successfully");
      setCategories(prev => prev.map(c => c.id === editCategory.id ? { ...c, name: newCategoryName.trim() } : c));
      setEditCategory(null);
      setNewCategoryName("");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      toast.error(language === "id" ? "Gagal menghapus kategori" : "Failed to delete category");
    } else {
      toast.success(language === "id" ? "Kategori berhasil dihapus" : "Category deleted successfully");
      setCategories(prev => prev.filter(c => c.id !== categoryId));
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("categories")
      .insert({ name: newCategoryName.trim(), user_id: user.id })
      .select()
      .single();

    if (error) {
      toast.error(language === "id" ? "Gagal menambah kategori" : "Failed to add category");
    } else {
      toast.success(language === "id" ? "Kategori berhasil ditambahkan" : "Category added successfully");
      setCategories(prev => [...prev, data]);
      setShowAddCategory(false);
      setNewCategoryName("");
    }
  };

  const NavContent = () => (
    <>
      <div className="px-4 py-6 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">{t.common.appName}</span>
        </div>
        {userName && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
            <User className="w-4 h-4 text-foreground" />
            <span className="text-sm text-foreground font-medium">
              {language === "id" ? "Login sebagai: " : "Logged in as: "}
              <span className="font-bold">{userName}</span>
            </span>
          </div>
        )}
      </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" data-tour="sidebar">
          {navItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all relative",
                  isActive
                    ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>
                {t.nav[item.key]}
                {item.key === "ai" && (
                  <span className="block text-xs opacity-75 font-normal mt-0.5">
                    {language === "id" ? "Tanya AI" : "Consult AI"}
                  </span>
                )}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}

          <div className="pt-4 mt-4 border-t border-border">
            <button
              onClick={() => {
                if (typeof window !== "undefined" && (window as any).__startTour) {
                  (window as any).__startTour();
                  setMobileOpen(false);
                }
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-amber-500 hover:bg-amber-500/10 transition-all w-full"
            >
              <Brain className="w-5 h-5" />
              <span>{language === "id" ? "🎓 Tutorial Interaktif" : "🎓 Interactive Tutorial"}</span>
            </button>
            
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-all w-full mt-1"
            >
              <Tag className="w-5 h-5" />
              <span>{language === "id" ? "Kategori" : "Categories"}</span>
            </button>
          
          <AnimatePresence>
            {showCategories && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-1 px-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-secondary/50 group"
                    >
                      <span className="text-sm text-foreground">{category.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditCategory(category);
                            setNewCategoryName(category.name);
                          }}
                          className="p-1 rounded hover:bg-secondary text-foreground"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-1 rounded hover:bg-destructive/10 text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowAddCategory(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/50 text-primary w-full text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === "id" ? "Tambah Kategori" : "Add Category"}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <div className="px-3 py-4 border-t border-border space-y-2">
        <div className="flex items-center gap-2 px-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex-1 justify-start text-foreground"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
            {theme === "dark" ? t.settings.lightMode : t.settings.darkMode}
          </Button>
        </div>
        <div className="flex items-center gap-2 px-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "id" ? "en" : "id")}
            className="flex-1 justify-start text-foreground"
          >
            <Globe className="w-4 h-4 mr-2" />
            {language === "id" ? "English" : "Indonesia"}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t.auth.logout}
        </Button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 h-screen bg-card border-r border-border fixed left-0 top-0">
        <NavContent />
      </aside>

      <div className="hidden lg:flex fixed top-4 right-4 z-40">
        <NotificationPanel />
      </div>

      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-foreground">{t.common.appName}</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationPanel />
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-foreground"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setMobileOpen(false)}
        >
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25 }}
            className="w-72 h-full bg-card flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <NavContent />
          </motion.aside>
        </motion.div>
      )}

      <Dialog open={editCategory !== null} onOpenChange={(open) => !open && setEditCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "id" ? "Edit Kategori" : "Edit Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">{language === "id" ? "Nama Kategori" : "Category Name"}</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder={language === "id" ? "Masukkan nama kategori" : "Enter category name"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCategory(null)}>
              {language === "id" ? "Batal" : "Cancel"}
            </Button>
            <Button onClick={handleUpdateCategory}>
              {language === "id" ? "Simpan" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "id" ? "Tambah Kategori Baru" : "Add New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-category-name">{language === "id" ? "Nama Kategori" : "Category Name"}</Label>
              <Input
                id="new-category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder={language === "id" ? "Masukkan nama kategori" : "Enter category name"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddCategory(false);
              setNewCategoryName("");
            }}>
              {language === "id" ? "Batal" : "Cancel"}
            </Button>
            <Button onClick={handleAddCategory}>
              {language === "id" ? "Tambah" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
