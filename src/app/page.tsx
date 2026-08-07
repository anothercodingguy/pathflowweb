'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  ArrowRight, 
  ArrowDown,
  Search, 
  Bot, 
  Database,
  Network,
  Terminal,
  Activity,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const workflows = [
    { title: "Deep Research Agents", status: "Running", progress: 65 },
    { title: "Customer Support Triager", status: "Completed", progress: 100 },
    { title: "Code Generation Pipeline", status: "Failed", progress: 32 }
  ];

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-black/10">
      
      {/* Navigation Bar */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass-nav py-3' : 'bg-transparent py-5'}`}>
        <div className="bw-container flex items-center justify-between">
          <div className="flex items-center gap-1.5 cursor-pointer">
            <span className="font-extrabold tracking-tight text-text-1 text-xl uppercase font-sans">
              PATH<span className="text-accent">FLOW</span>
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <button className="btn-primary rounded-md px-4 py-2 text-sm tracking-wide">
              Start Building
            </button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 md:pt-40 pb-16 border-b border-border bg-surface">
          <div className="bw-container flex flex-col items-center text-center">
            


            <h1 className="max-w-4xl text-balance text-5xl md:text-[5rem] font-semibold leading-[1.05] tracking-tight text-text-1">
              AI observability that handles the debugging.
            </h1>
            
            <p className="mt-6 max-w-2xl text-pretty text-lg md:text-xl leading-relaxed text-text-2">
              PathFlow traces your agents, computes token costs, and pinpoints hallucinations. You just review the exceptions.
            </p>
            
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button className="btn-primary text-base px-6 py-3">
                Start Building <ArrowRight className="h-4 w-4" />
              </button>
              <a href="#how-it-works" className="btn-secondary text-base px-6 py-3">
                See how it works <ArrowDown className="h-4 w-4" />
              </a>
            </div>
            
            {/* Massive Hero Demo */}
            <div className="mt-16 w-full max-w-5xl mx-auto">
              <div className="rounded-[8px] border border-border bg-surface-2 p-1.5 overflow-hidden shadow-2xl">
                <Image 
                  src="/demo.png" 
                  alt="PathFlow Tracing Dashboard in Light Mode" 
                  width={1440} 
                  height={900} 
                  className="rounded-[4px] w-full h-auto object-cover border border-border/50"
                  priority
                />
              </div>
            </div>
          </div>
        </section>



        {/* TheBillow-Style Features Grid */}
        <section id="how-it-works" className="py-24 border-b border-border bg-surface">
          <div className="bw-container">
            
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:items-start lg:gap-16 mb-16">
              <h2 className="text-balance text-4xl md:text-[2.75rem] font-medium leading-tight max-w-2xl text-text-1">
                Meet your new favorite profiler.
              </h2>
              <p className="text-pretty text-lg leading-relaxed lg:pt-2 text-text-2">
                The visibility a senior engineer demands, every execution, without writing manual logs.
              </p>
            </div>

            <div className="grid gap-x-8 gap-y-16 lg:grid-cols-3">
              
              {/* Feature 1 */}
              <div className="min-w-0">
                <div className="relative">
                  <div className="flex flex-col justify-center overflow-hidden rounded-2xl p-6 w-full aspect-square bg-[#eaeae4]">
                    <div className="glass overflow-hidden rounded-xl h-full flex flex-col relative group">
                      
                      {/* Spinning Wheel */}
                      <motion.div 
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                      >
                        {[0, 72, 144, 216, 288].map((deg, i) => (
                          <div 
                            key={i}
                            className="absolute flex items-center justify-center"
                            style={{ transform: `rotate(${deg}deg) translateY(-85px)` }}
                          >
                            <div 
                              className="w-12 h-12 bg-white rounded-xl shadow-sm border border-border flex items-center justify-center font-bold text-[10px] text-text-2"
                              style={{ transform: `rotate(-${deg}deg)` }}
                            >
                              {['Llama', 'Crew', 'Auto', 'Swarm', 'Chain'][i]}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                      
                      {/* Center Hub */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="glass w-16 h-16 rounded-[16px] shadow-lg flex items-center justify-center z-10 font-bold text-accent text-lg">
                          PF
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-medium text-text-1">Works with the tools you have</h3>
                <p className="mt-2 text-base leading-relaxed text-text-2">
                  LangChain, AutoGen, CrewAI, Swarm, and raw Python. No migration, no rip and replace.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="min-w-0">
                <div className="relative">
                  <div className="flex flex-col justify-center overflow-hidden rounded-2xl p-4 sm:p-5 lg:p-4 w-full aspect-square bg-[#eaeae4]">
                    <div className="glass overflow-hidden rounded-xl w-full h-full">
                      <div className="relative flex items-center border-b border-black/5 px-3 py-2 bg-white/50">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]"></span>
                          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]"></span>
                          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]"></span>
                        </span>
                        <span className="absolute inset-x-0 text-center text-[10px] font-medium text-text-3">Checkout Pipeline · Trace</span>
                      </div>
                      
                      <div className="p-3 space-y-3 font-mono text-[11px] relative h-[calc(100%-36px)] overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle, var(--color-border) 1px, transparent 1px)', backgroundSize: '12px 12px' }}>
                        
                        {/* Connecting Line */}
                        <div className="absolute left-[21px] top-6 bottom-10 w-px bg-border z-0"></div>

                        <div className="relative z-10 flex items-center gap-3 p-2.5 rounded-lg border border-border bg-white shadow-sm hover:-translate-y-0.5 transition-transform">
                          <Search className="h-3.5 w-3.5 text-text-3" />
                          <div className="flex flex-col">
                            <span className="text-text-1 font-medium leading-none">Vector Search</span>
                            <span className="text-[9px] text-text-3 mt-1">Pinecone DB</span>
                          </div>
                          <span className="ml-auto text-text-3">45ms</span>
                        </div>

                        <div className="relative z-10 flex items-center gap-3 p-2.5 rounded-lg border border-accent/20 bg-accent/5 shadow-sm ml-4 hover:-translate-y-0.5 transition-transform">
                          <Bot className="h-3.5 w-3.5 text-accent" />
                          <div className="flex flex-col">
                            <span className="text-accent font-medium leading-none">GPT-4o Generation</span>
                            <span className="text-[9px] text-accent/70 mt-1">Tokens: 1,200</span>
                          </div>
                          <span className="ml-auto text-accent/70">2.1s</span>
                        </div>
                        
                        <div className="relative z-10 flex items-center gap-3 p-2.5 rounded-lg border border-border bg-white shadow-sm hover:-translate-y-0.5 transition-transform">
                          <Terminal className="h-3.5 w-3.5 text-text-3" />
                          <div className="flex flex-col">
                            <span className="text-text-1 font-medium leading-none">Execute Code</span>
                            <span className="text-[9px] text-text-3 mt-1">Python Runtime</span>
                          </div>
                          <span className="ml-auto text-text-3">8.9s</span>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-medium text-text-1">Inspects every step</h3>
                <p className="mt-2 text-base leading-relaxed text-text-2">
                  Follow your agent's thought process. See exactly where it searched, generated, or executed.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="min-w-0">
                <div className="relative">
                  <div className="flex flex-col justify-center overflow-hidden rounded-2xl p-4 sm:p-5 lg:p-4 w-full aspect-square bg-[#eaeae4]">
                    <div className="glass overflow-hidden rounded-xl w-full h-full relative group">
                       <div className="absolute inset-0 m-4 rounded-lg overflow-hidden border border-border shadow-md group-hover:scale-105 transition-transform duration-500">
                          <Image 
                            src="/demo.png" 
                            alt="Intelligence Summary" 
                            width={800} 
                            height={600} 
                            className="w-full h-[250%] object-cover object-[right_20%]"
                          />
                       </div>
                    </div>
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-medium text-text-1">Finishes the job</h3>
                <p className="mt-2 text-base leading-relaxed text-text-2">
                  PathFlow automatically highlights the critical path and bottlenecks so you don't have to hunt for them.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Detailed Process Section (Like TheBillow) */}
        <section className="border-b border-border bg-surface-2 py-24">
          <div className="bw-container">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:items-start lg:gap-16 mb-14">
              <h2 className="text-balance text-4xl font-medium leading-tight max-w-4xl text-text-1">
                Automate the most tedious parts of debugging.
              </h2>
              <p className="text-pretty text-lg leading-relaxed lg:pt-1 text-text-2">
                Pick a workflow to watch PathFlow track it, start to finish.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-[300px_1fr] gap-10 lg:gap-16">
              
              {/* Left sidebar tabs */}
              <div className="flex flex-col gap-2">
                {workflows.map((wf, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`text-left p-4 rounded-xl transition-all duration-200 border ${activeTab === idx ? 'bg-white border-border shadow-sm' : 'bg-transparent border-transparent hover:bg-black/5'}`}
                  >
                    <div className="font-medium text-text-1 mb-1">{wf.title}</div>
                    <div className="flex items-center justify-between text-xs text-text-3 font-mono uppercase">
                      <span>{wf.status}</span>
                      <span className={wf.status === 'Running' ? 'text-accent' : wf.status === 'Completed' ? 'text-success' : 'text-error'}>
                        {wf.progress}%
                      </span>
                    </div>
                    {activeTab === idx && (
                      <div className="mt-3 h-1 w-full bg-border rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full ${wf.status === 'Running' ? 'bg-accent' : wf.status === 'Completed' ? 'bg-success' : 'bg-error'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${wf.progress}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Right content area: Interactive mock shell */}
              <div className="bg-[#eaeae4] p-4 lg:p-6 rounded-2xl">
                <div className="glass rounded-xl h-[400px] overflow-hidden flex flex-col bg-white/70">
                  <div className="border-b border-black/5 px-4 py-3 flex items-center bg-white/50">
                     <div className="flex gap-1.5 mr-4">
                        <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#FEBC2E]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
                     </div>
                     <span className="text-xs font-semibold text-text-3 font-mono uppercase">Live Trace View</span>
                     <button className="ml-auto bg-text-1 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-black">
                       <Play className="w-3 h-3"/> Resume Agent
                     </button>
                  </div>
                  
                  <div className="p-6 flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4 font-mono text-sm"
                      >
                         <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-white shadow-sm">
                           <div className="flex items-center gap-3">
                             <CheckCircle2 className="text-success w-5 h-5" />
                             <div>
                               <div className="font-semibold text-text-1">Initialize Context</div>
                               <div className="text-xs text-text-3 mt-1">Loaded 45 variables</div>
                             </div>
                           </div>
                           <div className="text-right">
                             <div className="text-xs font-bold">12ms</div>
                             <div className="text-[10px] text-text-3 mt-1">$0.000</div>
                           </div>
                         </div>

                         <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-white shadow-sm">
                           <div className="flex items-center gap-3">
                             {activeTab === 2 ? <AlertTriangle className="text-error w-5 h-5"/> : <CheckCircle2 className="text-success w-5 h-5" />}
                             <div>
                               <div className="font-semibold text-text-1">LLM Chain Execution</div>
                               <div className="text-xs text-text-3 mt-1">GPT-4o • 4,200 tokens</div>
                             </div>
                           </div>
                           <div className="text-right">
                             <div className="text-xs font-bold">4,120ms</div>
                             <div className="text-[10px] text-accent mt-1">$0.045</div>
                           </div>
                         </div>

                         {activeTab === 0 && (
                           <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-white shadow-sm animate-pulse opacity-70">
                             <div className="flex items-center gap-3">
                               <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin"></div>
                               <div>
                                 <div className="font-semibold text-text-1">Web Search (Playwright)</div>
                                 <div className="text-xs text-text-3 mt-1">Running headless browser...</div>
                               </div>
                             </div>
                             <div className="text-right text-text-3">
                               <div className="text-xs">--</div>
                             </div>
                           </div>
                         )}

                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Dashboard Overview Section */}
        <section className="py-32 border-b border-border bg-surface text-center">
          <div className="bw-container">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-text-1 mb-6">
              Your entire agent fleet,<br/>visible from above.
            </h2>
            <p className="text-lg text-text-2 max-w-2xl mx-auto mb-16">
              Track thousands of concurrent agents. Identify failing runs, latency spikes, and cost anomalies instantly across your whole infrastructure.
            </p>
            
            <div className="w-full shadow-2xl rounded-xl border border-border overflow-hidden bg-surface-2 p-1.5">
              <Image 
                src="/runs.png" 
                alt="PathFlow Runs Dashboard in Light Mode" 
                width={1600} 
                height={900} 
                className="rounded-lg w-full h-auto border border-border/50"
              />
            </div>
          </div>
        </section>

      </main>

      <footer className="py-16 bg-surface-2 border-t border-border">
        <div className="bw-container grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-bold text-text-1 mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-text-2">
              <li><a href="#" className="hover:text-text-1">Features</a></li>
              <li><a href="#" className="hover:text-text-1">Integrations</a></li>
              <li><a href="#" className="hover:text-text-1">Pricing</a></li>
              <li><a href="#" className="hover:text-text-1">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-text-1 mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-text-2">
              <li><a href="#" className="hover:text-text-1">Documentation</a></li>
              <li><a href="#" className="hover:text-text-1">API Reference</a></li>
              <li><a href="#" className="hover:text-text-1">Blog</a></li>
              <li><a href="#" className="hover:text-text-1">Community</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-text-1 mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-text-2">
              <li><a href="#" className="hover:text-text-1">About</a></li>
              <li><a href="#" className="hover:text-text-1">Customers</a></li>
              <li><a href="#" className="hover:text-text-1">Careers</a></li>
              <li><a href="#" className="hover:text-text-1">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-text-1 mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-text-2">
              <li><a href="#" className="hover:text-text-1">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-text-1">Terms of Service</a></li>
              <li><a href="#" className="hover:text-text-1">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="bw-container flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border">
          <span className="font-extrabold tracking-tight text-text-1 text-lg uppercase font-sans">
            PATH<span className="text-accent">FLOW</span>
          </span>
          <p className="text-sm text-text-3 mt-4 md:mt-0">© 2026 PathFlow Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
