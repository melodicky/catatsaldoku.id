"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Camera, Sun, Moon, Globe, Check, Plus, Trash2, Palette, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useLanguage } from "@/lib/i18n/context";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Category } from "@/lib/types";

const CATEGORY_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#ef4444", "#84cc16"];

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    avatar_url: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    color: CATEGORY_COLORS[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile({
            full_name: profileData.full_name || "",
            email: profileData.email || user.email || "",
            avatar_url: profileData.avatar_url || "",
          });
        }

        const { data: categoriesData } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", user.id)
          .order("name");

        if (categoriesData) {
          setCategories(categoriesData);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        toast.error(t.common.error);
      } else {
        toast.success(t.settings.profileUpdated);
      }
    }
    setSaving(false);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      type: "expense",
      color: CATEGORY_COLORS[0],
    });
    setEditingCategory(null);
  };

  const handleSaveCategory = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingCategory) {
      const { data, error } = await supabase
        .from("categories")
        .update({
          name: categoryForm.name,
          type: categoryForm.type,
          color: categoryForm.color,
        })
        .eq("id", editingCategory)
        .select()
        .single();

      if (error) {
        toast.error(t.common.error);
      } else {
        setCategories((prev) => prev.map((c) => (c.id === editingCategory ? data : c)));
        toast.success(language === "id" ? "Kategori berhasil diubah" : "Category updated successfully");
        setCategoryDialogOpen(false);
        resetCategoryForm();
      }
    } else {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          user_id: user.id,
          name: categoryForm.name,
          type: categoryForm.type,
          color: categoryForm.color,
          icon: categoryForm.type === "income" ? "TrendingUp" : "ShoppingBag",
        })
        .select()
        .single();

      if (error) {
        toast.error(t.common.error);
      } else {
        setCategories((prev) => [...prev, data]);
        toast.success(language === "id" ? "Kategori berhasil ditambahkan" : "Category added successfully");
        setCategoryDialogOpen(false);
        resetCategoryForm();
      }
    }
  };

  const handleEditCategory = (category: Category) => {
    setCategoryForm({
      name: category.name,
      type: category.type,
      color: category.color || CATEGORY_COLORS[0],
    });
    setEditingCategory(category.id);
    setCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    
    if (error) {
      toast.error(t.common.error);
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success(language === "id" ? "Kategori berhasil dihapus" : "Category deleted successfully");
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">{t.settings.title}</h1>
        <p className="text-muted-foreground">
          {language === "id" ? "Kelola profil dan preferensi Anda" : "Manage your profile and preferences"}
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">{t.settings.profile}</TabsTrigger>
          <TabsTrigger value="preferences">{t.settings.preferences}</TabsTrigger>
          <TabsTrigger value="categories">{t.settings.categories}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>{t.settings.profile}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {profile.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{profile.full_name || "User"}</h3>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                </div>

                <div className="grid gap-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t.auth.fullName}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.auth.email}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={saving}
                    className="w-fit gradient-primary"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {t.settings.updateProfile}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="preferences">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>{t.settings.preferences}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="mb-3 block">{t.settings.theme}</Label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setTheme("light")}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                          theme === "light" 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <Sun className="w-5 h-5" />
                        <span className="font-medium">{t.settings.lightMode}</span>
                        {theme === "light" && <Check className="w-4 h-4 text-primary ml-2" />}
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                          theme === "dark" 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <Moon className="w-5 h-5" />
                        <span className="font-medium">{t.settings.darkMode}</span>
                        {theme === "dark" && <Check className="w-4 h-4 text-primary ml-2" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">{t.settings.language}</Label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setLanguage("id")}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                          language === "id" 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <Globe className="w-5 h-5" />
                        <span className="font-medium">Indonesia</span>
                        {language === "id" && <Check className="w-4 h-4 text-primary ml-2" />}
                      </button>
                      <button
                        onClick={() => setLanguage("en")}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                          language === "en" 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <Globe className="w-5 h-5" />
                        <span className="font-medium">English</span>
                        {language === "en" && <Check className="w-4 h-4 text-primary ml-2" />}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="categories">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t.settings.categories}</CardTitle>
                <Dialog open={categoryDialogOpen} onOpenChange={(open) => { setCategoryDialogOpen(open); if (!open) resetCategoryForm(); }}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gradient-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      {t.settings.addCategory}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingCategory ? t.settings.editCategory : t.settings.addCategory}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t.settings.categoryName}</Label>
                        <Input
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                          placeholder={language === "id" ? "Nama kategori" : "Category name"}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t.settings.categoryType}</Label>
                        <Select
                          value={categoryForm.type}
                          onValueChange={(v) => setCategoryForm({ ...categoryForm, type: v as "income" | "expense" })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">{t.transactions.income}</SelectItem>
                            <SelectItem value="expense">{t.transactions.expense}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t.settings.categoryColor}</Label>
                        <div className="flex gap-2">
                          {CATEGORY_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setCategoryForm({ ...categoryForm, color })}
                              className={cn(
                                "w-8 h-8 rounded-full transition-transform",
                                categoryForm.color === color && "ring-2 ring-offset-2 ring-offset-background scale-110"
                              )}
                              style={{ backgroundColor: color, ringColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" className="flex-1" onClick={() => { setCategoryDialogOpen(false); resetCategoryForm(); }}>
                          {t.common.cancel}
                        </Button>
                        <Button className="flex-1 gradient-primary" onClick={handleSaveCategory}>
                          {t.common.save}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">{t.transactions.income}</h4>
                    <div className="grid gap-2">
                      {categories
                        .filter((c) => c.type === "income")
                        .map((category) => (
                          <div
                            key={category.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 group"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: category.color || CATEGORY_COLORS[0] }}
                              />
                              <span className="font-medium">{category.name}</span>
                              {category.is_default && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                  Default
                                </span>
                              )}
                            </div>
                              {!category.is_default && (
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 px-3 text-xs" 
                                    onClick={() => handleEditCategory(category)}
                                  >
                                    <Palette className="w-3 h-3 mr-1" />
                                    {language === "id" ? "Edit" : "Edit"}
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 px-3 text-xs text-destructive border-destructive/50 hover:bg-destructive hover:text-white"
                                      >
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        {language === "id" ? "Hapus" : "Delete"}
                                      </Button>
                                    </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>{t.settings.deleteCategory}</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {language === "id" 
                                          ? "Yakin ingin menghapus kategori ini?"
                                          : "Are you sure you want to delete this category?"}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        {t.common.delete}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">{t.transactions.expense}</h4>
                    <div className="grid gap-2">
                      {categories
                        .filter((c) => c.type === "expense")
                        .map((category) => (
                          <div
                            key={category.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 group"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: category.color || CATEGORY_COLORS[0] }}
                              />
                              <span className="font-medium">{category.name}</span>
                              {category.is_default && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                  Default
                                </span>
                              )}
                            </div>
                              {!category.is_default && (
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 px-3 text-xs" 
                                    onClick={() => handleEditCategory(category)}
                                  >
                                    <Palette className="w-3 h-3 mr-1" />
                                    {language === "id" ? "Edit" : "Edit"}
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 px-3 text-xs text-destructive border-destructive/50 hover:bg-destructive hover:text-white"
                                      >
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        {language === "id" ? "Hapus" : "Delete"}
                                      </Button>
                                    </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>{t.settings.deleteCategory}</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {language === "id" 
                                          ? "Yakin ingin menghapus kategori ini?"
                                          : "Are you sure you want to delete this category?"}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        {t.common.delete}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
