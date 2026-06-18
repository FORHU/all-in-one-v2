"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Code,
  Globe,
  Layout,
  Cpu,
  ShieldCheck,
  Zap,
  Moon,
  Sun,
  ArrowRight,
  BarChart2,
  FileText,
} from "lucide-react";
import { StatsCard } from "@/features/dashboard/components/StatsCard";
import { RevenueChart } from "@/features/dashboard/components/RevenueChart";
import { useDashboardStats } from "@/features/dashboard/hooks/useDashboardStats";
import { PostList } from "@/features/posts/components/PostList";
import { CreatePostForm } from "@/features/posts/components/CreatePostForm";
import { usePosts } from "@/features/posts/hooks/posts.hooks";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { resolvedTheme, setTheme } = useTheme();
  const isDark = mounted ? resolvedTheme === "dark" : true;
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
  const router = useRouter();

  const specs = [
    {
      icon: Cpu,
      title: "Next.js 15",
      desc: "Latest App Router, Server Actions, and Partial Prerendering.",
    },
    {
      icon: Layout,
      title: "Tailwind 4",
      desc: "High-performance CSS engine with native cascade layers.",
    },
    {
      icon: ShieldCheck,
      title: "Auth Ready",
      desc: "Pre-built Auth flows with global state management.",
    },
    {
      icon: Zap,
      title: "Framer Motion",
      desc: "Smooth micro-animations and physics-based transitions.",
    },
    {
      icon: Code,
      title: "Zustand & Query",
      desc: "Clean state management and powerful data fetching.",
    },
    {
      icon: Globe,
      title: "Scalable Arch",
      desc: "Modular structure designed for large-scale applications.",
    },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background-primary text-text-primary selection:bg-brand-vibrant/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.05),transparent_50%)]" />
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-core/10 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, delay: 1 }}
          className="absolute top-[20%] -right-[5%] w-[35%] h-[35%] bg-brand-vibrant/10 blur-[120px] rounded-full"
        />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto backdrop-blur-md sticky top-0 transition-all duration-300">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-core to-brand-vibrant flex items-center justify-center glow-primary">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gradient-2026">
              BOILERPLATE 2026
            </span>
          </motion.div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl glass-light hover:bg-white/10 transition-colors border border-white/5"
            >
              {isDark ? (
                <Sun className="w-5 h-4" />
              ) : (
                <Moon className="w-5 h-4" />
              )}
            </button>
            <button
              onClick={() => router.push("/auth")}
              className="px-6 py-2.5 rounded-xl font-semibold glass hover:bg-white/5 transition-all hidden sm:block"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push("/register")}
              className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-brand-core to-brand-vibrant text-white glow-vibrant hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-24 pb-16 px-6 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light border border-white/5 mb-8 animate-float">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-vibrant opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-vibrant"></span>
              </span>
              <span className="text-xs font-medium text-brand-light">
                v1.0.0 Now Live
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
              The Future of <br />
              <span className="text-gradient-2026">Development.</span>
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              A premium Next.js 15 boilerplate crafted for high-performance web
              applications with an ultra-modern 2026 aesthetic.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/register")}
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-brand-dark font-black text-lg shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-white/30 transition-all flex items-center justify-center gap-3"
              >
                Launch App
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <button
                onClick={() =>
                  document
                    .getElementById("specs")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="w-full sm:w-auto px-10 py-5 rounded-2xl glass font-bold text-lg border-white/10 hover:bg-white/5 transition-all"
              >
                View Specs
              </button>
            </div>
          </motion.div>
        </section>

        {/* Specifications Grid */}
        <section id="specs" className="py-24 px-6 max-w-7xl mx-auto text-left">
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-4">Technical Specs</h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-brand-core to-brand-vibrant rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specs.map((spec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl glass-light border border-white/5 group hover:border-brand-core/30 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/5 group-hover:bg-brand-core group-hover:glow-primary transition-all duration-500">
                  <spec.icon className="w-7 h-7 text-brand-light group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{spec.title}</h3>
                <p className="text-text-tertiary leading-relaxed font-medium">
                  {spec.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Dashboard Feature Showcase ─────────────────────────────── */}
        <DashboardShowcase />

        {/* ── Posts Feature Showcase ─────────────────────────────────── */}
        <PostsShowcase />

        {/* Call to Action */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto rounded-[3rem] p-12 md:p-24 relative overflow-hidden text-center bg-brand-burgundy/20 border border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.2),transparent_70%)]" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <h2 className="text-4xl md:text-6xl font-black mb-8">
                Ready to build the <br />
                <span className="text-gradient-2026">Next Generation?</span>
              </h2>
              <button
                onClick={() => router.push("/register")}
                className="px-12 py-5 rounded-2xl bg-gradient-to-r from-brand-core to-brand-vibrant text-white font-black text-xl glow-vibrant hover:scale-105 active:scale-95 transition-all"
              >
                Deploy Now
              </button>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-core" />
              <span className="font-bold tracking-widest text-sm opacity-50">
                2026 EDITION
              </span>
            </div>
            <p className="text-sm text-text-quaternary font-medium">
              © 2026 Boilerplate Labs. All rights reserved.
            </p>
            <div className="flex gap-8 text-sm font-bold text-text-tertiary">
              <a
                href="#"
                className="hover:text-brand-vibrant transition-colors"
              >
                Github
              </a>
              <a
                href="#"
                className="hover:text-brand-vibrant transition-colors"
              >
                Docs
              </a>
              <a
                href="#"
                className="hover:text-brand-vibrant transition-colors"
              >
                Templates
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ── Dashboard Showcase ────────────────────────────────────────────────────────
function DashboardShowcase() {
  const { data, isLoading } = useDashboardStats();

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="mb-12 flex items-center gap-3">
        <BarChart2 className="w-7 h-7 text-brand-core" />
        <div>
          <h2 className="text-4xl font-bold">Dashboard Feature</h2>
          <p className="text-text-tertiary text-sm mt-1">
            Read-only data display with Recharts ·{" "}
            <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">
              useDashboardStats
            </code>{" "}
            hook
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl glass-light animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {data?.stats.map((stat, i) => (
              <StatsCard key={stat.id} stat={stat} index={i} />
            ))}
          </div>
          {data?.revenueChart && <RevenueChart data={data.revenueChart} />}
        </>
      )}
    </section>
  );
}

// ── Posts Showcase ────────────────────────────────────────────────────────────
function PostsShowcase() {
  const { data: posts, isLoading } = usePosts();

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="mb-12 flex items-center gap-3">
        <FileText className="w-7 h-7 text-brand-core" />
        <div>
          <h2 className="text-4xl font-bold">Posts Feature</h2>
          <p className="text-text-tertiary text-sm mt-1">
            Full CRUD with{" "}
            <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">
              useSafeMutation
            </code>{" "}
            · create + delete with automatic cache invalidation
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-8 items-start">
        <CreatePostForm />
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-2xl glass-light animate-pulse"
              />
            ))}
          </div>
        ) : (
          <PostList posts={posts ?? []} />
        )}
      </div>
    </section>
  );
}
