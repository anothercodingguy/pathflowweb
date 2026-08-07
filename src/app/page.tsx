'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowDown, 
  Play, 
  Search, 
  Bot, 
  Database,
  CheckCircle2,
  AlertCircle,
  Network
} from 'lucide-react';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-black/10">
      
      {/* Navigation Bar */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass-nav py-3' : 'bg-transparent py-5'}`}>
        <div className="bw-container flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-text-1 text-xl uppercase font-sans">
              PATH<span className="text-accent">FLOW</span>
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-text-2 hover:text-text-1 transition-colors">Documentation</a>
            <a href="#" className="text-sm font-medium text-text-2 hover:text-text-1 transition-colors">Integrations</a>
            <a href="#" className="text-sm font-medium text-text-2 hover:text-text-1 transition-colors">GitHub</a>
            <button className="btn-primary rounded-full px-5 py-2 text-xs uppercase tracking-wide">
              Start Building
            </button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-40 pb-20 border-b border-border">
          <div className="bw-container flex flex-col items-start">
            <a href="#" className="inline-flex items-center gap-2 text-sm font-medium text-text-2 hover:text-text-1 transition-colors mb-8 bg-surface-2 px-3 py-1.5 rounded-full border border-border">
              <span className="flex h-2 w-2 rounded-full bg-success"></span>
              PathFlow Cloud is now in Public Beta
            </a>
            
            <h1 className="max-w-4xl text-balance text-5xl md:text-7xl font-semibold leading-[1.05] tracking-tight text-text-1">
              AI observability that <br/>finishes the job.
            </h1>
            
            <p className="mt-6 max-w-xl text-pretty text-lg md:text-xl leading-relaxed text-text-2">
              PathFlow traces your agents, computes token costs, and highlights critical latency bottlenecks. You just optimize the code.
            </p>
            
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button className="btn-primary text-base px-6 py-3">
                Start building <ArrowRight className="h-4 w-4" />
              </button>
              <a href="#how-it-works" className="btn-secondary text-base px-6 py-3">
                See how it works <ArrowDown className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Feature 1: Integrations Wheel */}
        <section id="how-it-works" className="py-24 border-b border-border bg-surface">
          <div className="bw-container grid gap-16 lg:grid-cols-[1fr_400px] items-center">
            
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-text-1 mb-4 text-balance">
                Works with the frameworks you already use.
              </h2>
              <p className="text-lg text-text-2 leading-relaxed text-pretty">
                LangChain, LlamaIndex, AutoGen, CrewAI, Swarm, and raw Python. No migration, no rip and replace. Just add <code className="bg-surface-2 px-1.5 py-0.5 rounded border border-border font-mono text-sm">@pf.trace()</code>.
              </p>
            </div>
            
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative w-[320px] h-[320px] bg-surface-2 rounded-2xl border border-border flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[length:16px_16px]"></div>
                
                {/* Simulated Wheel (Spinning gently) */}
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                >
                  {/* Nodes on circle */}
                  {[0, 72, 144, 216, 288].map((deg, i) => (
                    <div 
                      key={i}
                      className="absolute flex items-center justify-center"
                      style={{ transform: `rotate(${deg}deg) translateY(-100px)` }}
                    >
                      <div 
                        className="w-12 h-12 bg-surface rounded-xl shadow-sm border border-border flex items-center justify-center"
                        style={{ transform: `rotate(-${deg}deg)` }}
                      >
                        <Network className="h-5 w-5 text-text-3" />
                      </div>
                    </div>
                  ))}
                  <div className="w-[200px] h-[200px] rounded-full border border-border absolute"></div>
                </motion.div>
                
                {/* Center Hub */}
                <div className="glass w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center z-10 font-bold text-accent">
                  PF
                </div>
              </div>
            </div>
            
          </div>
        </section>

        {/* Feature 2: Animated Workflow */}
        <section className="py-24 border-b border-border bg-surface-2">
          <div className="bw-container grid gap-16 lg:grid-cols-[400px_1fr] items-center">
            
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-text-1 mb-4 text-balance">
                Inspect every execution step.
              </h2>
              <p className="text-lg text-text-2 leading-relaxed text-pretty">
                Follow your agent's thought process. See exactly where it searched the web, queried a database, or generated a hallucination.
              </p>
            </div>
            
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="w-full max-w-[400px] bg-surface rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
                
                <div className="border-b border-border px-4 py-3 bg-background flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-error"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-warning"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-success"></div>
                  </div>
                  <span className="mx-auto text-xs font-medium text-text-3">Customer Support Agent · Trace</span>
                </div>
                
                <div className="p-4 space-y-4 font-mono text-sm">
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background"
                  >
                    <Search className="h-4 w-4 text-text-3" />
                    <span className="text-text-1 font-medium text-xs">Vector Search</span>
                    <span className="ml-auto text-[10px] text-text-3">45ms</span>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background"
                  >
                    <Database className="h-4 w-4 text-text-3" />
                    <span className="text-text-1 font-medium text-xs">Retrieve History</span>
                    <span className="ml-auto text-[10px] text-text-3">12ms</span>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-3 p-3 rounded-lg border border-accent/30 bg-accent/5"
                  >
                    <Bot className="h-4 w-4 text-accent" />
                    <span className="text-text-1 font-medium text-xs">GPT-4o Generation</span>
                    <span className="ml-auto text-[10px] text-text-3">2.1s</span>
                  </motion.div>
                </div>

              </div>
            </div>
            
          </div>
        </section>

      </main>

      <footer className="py-12 bg-background text-center border-t border-border">
        <p className="text-sm text-text-3">© 2026 PathFlow Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
