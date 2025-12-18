"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "@/lib/i18n/context";

interface TourStep {
  target: string;
  title_id: string;
  title_en: string;
  content_id: string;
  content_en: string;
  position?: "top" | "bottom" | "left" | "right";
}

const tourSteps: TourStep[] = [
  {
    target: "[data-tour='stats']",
    title_id: "Statistik Keuangan",
    title_en: "Financial Statistics",
    content_id: "Di sini Anda dapat melihat saldo total, pemasukan, dan pengeluaran bulan ini secara real-time.",
    content_en: "Here you can see your total balance, income, and expenses for this month in real-time.",
    position: "bottom",
  },
  {
    target: "[data-tour='quick-action']",
    title_id: "Tombol Quick Action",
    title_en: "Quick Action Button",
    content_id: "Gunakan tombol ini untuk cepat menambah transaksi atau membuat goal baru.",
    content_en: "Use this button to quickly add transactions or create new goals.",
    position: "left",
  },
  {
    target: "[data-tour='transactions']",
    title_id: "Transaksi Terkini",
    title_en: "Recent Transactions",
    content_id: "Lihat daftar transaksi terakhir Anda dan akses detail lengkapnya.",
    content_en: "View your recent transactions and access their full details.",
    position: "top",
  },
  {
    target: "[data-tour='sidebar']",
    title_id: "Menu Navigasi",
    title_en: "Navigation Menu",
    content_id: "Jelajahi fitur-fitur lainnya seperti Analytics, Savings Goals, dan AI Assistant.",
    content_en: "Explore other features like Analytics, Savings Goals, and AI Assistant.",
    position: "right",
  },
];

export function OnboardingTour() {
  const { language } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<DOMRect | null>(null);

  const startTour = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenOnboardingTour");
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
    
    if (typeof window !== "undefined") {
      (window as any).__startTour = startTour;
    }
  }, []);

  useEffect(() => {
    if (isActive && currentStep < tourSteps.length) {
      const selector = tourSteps[currentStep].target;
      const element = document.querySelector(selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetElement(rect);
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [isActive, currentStep]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("hasSeenOnboardingTour", "true");
    setIsActive(false);
    setCurrentStep(0);
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboardingTour", "true");
    setIsActive(false);
    setCurrentStep(0);
  };

  if (!isActive || !targetElement) return null;

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  const getTooltipPosition = () => {
    const padding = 20;
    const tooltipWidth = 350;
    const tooltipHeight = 200;

    switch (step.position) {
      case "bottom":
        return {
          top: targetElement.bottom + padding,
          left: targetElement.left + targetElement.width / 2 - tooltipWidth / 2,
        };
      case "top":
        return {
          top: targetElement.top - tooltipHeight - padding,
          left: targetElement.left + targetElement.width / 2 - tooltipWidth / 2,
        };
      case "left":
        return {
          top: targetElement.top + targetElement.height / 2 - tooltipHeight / 2,
          left: targetElement.left - tooltipWidth - padding,
        };
      case "right":
        return {
          top: targetElement.top + targetElement.height / 2 - tooltipHeight / 2,
          left: targetElement.right + padding,
        };
      default:
        return {
          top: targetElement.bottom + padding,
          left: targetElement.left,
        };
    }
  };

  const tooltipPosition = getTooltipPosition();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleSkip} />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute"
          style={{
            top: targetElement.top - 8,
            left: targetElement.left - 8,
            width: targetElement.width + 16,
            height: targetElement.height + 16,
            border: "3px solid rgb(16 185 129)",
            borderRadius: "12px",
            boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.2), 0 0 30px rgba(16, 185, 129, 0.4)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="absolute bg-card border-2 border-primary rounded-2xl shadow-2xl p-6 w-[350px]"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">
                {language === "id" ? step.title_id : step.title_en}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === "id" ? step.content_id : step.content_en}
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="ml-2 p-1 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-1">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentStep
                      ? "w-8 bg-primary"
                      : index < currentStep
                      ? "w-1.5 bg-primary/50"
                      : "w-1.5 bg-secondary"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={handlePrevious}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
              <Button size="sm" onClick={handleNext} className="gradient-primary">
                {isLastStep ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    {language === "id" ? "Selesai" : "Finish"}
                  </>
                ) : (
                  <>
                    {language === "id" ? "Lanjut" : "Next"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {language === "id" ? "Lewati tutorial" : "Skip tutorial"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
