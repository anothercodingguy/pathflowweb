'use client';

import React, { useState, useEffect } from "react";
import ProductScreenshot from "@/components/ProductScreenshot";
import { PLANS } from "@/lib/plans";
import { 
  ArrowRight, 
  ArrowDown, 
  Check, 
  Copy, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  XCircle, 
  Terminal, 
  Activity, 
  GitCommit, 
  Search, 
  Zap, 
  FileCode, 
  ExternalLink, 
  Menu, 
  X, 
  Clock, 
  DollarSign, 
  Server, 
  Split
} from "lucide-react";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHeroTab, setActiveHeroTab] = useState<"trace" | "rootcause" | "patch">("trace");
  const [activeScenario, setActiveScenario] = useState<number>(0);
  const [activeDemoTab, setActiveDemoTab] = useState<"timeline" | "evidence" | "fix">("timeline");
  const [copiedSdk, setCopiedSdk] = useState(false);
  const [activeScreenshotTab, setActiveScreenshotTab] = useState<"dashboard" | "trace" | "failure" | "investigation" | "billing" | "settings">("dashboard");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSdk(true);
    setTimeout(() => setCopiedSdk(false), 2000);
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "/app";

  const scenarios = [
    {
      id: "checkout-err",
      title: "Payment Checkout 500",
      subtitle: "Uncaught null customer reference in payment handler",
      method: "POST",
      endpoint: "/api/checkout/process",
      status: "500 Internal Error",
      statusType: "error",
      duration: "412ms",
      cost: "$0.004",
      errorMsg: "TypeError: Cannot read properties of null (reading 'customer_id')",
      rootCause: "A recent migration altered the user profile payload, omitting customer_id during guest-checkout sessions. The payment worker expected customer_id unconditionally.",
      confidence: 98,
      commit: "a49f82d (Add guest-checkout fast path)",
      file: "services/billing/stripe_handler.ts:42",
      spans: [
        { name: "AuthMiddleware.verifySession", duration: "18ms", status: "ok", type: "MIDDLEWARE" },
        { name: "CartService.calculateTotals", duration: "45ms", status: "ok", type: "DB_QUERY" },
        { name: "StripeCustomerLookup", duration: "184ms", status: "error", type: "EXTERNAL_API", error: "NULL_CUSTOMER_ID" },
        { name: "PaymentIntent.create", duration: "165ms", status: "skipped", type: "PAYMENT_GATEWAY" }
      ],
      patchCode: `@@ -41,3 +41,5 @@ export async function handlePayment(req) {
-  const customerId = user.profile.customer_id;
+  const customerId = user?.profile?.customer_id ?? await createGuestCustomer(user.email);
+  if (!customerId) throw new PaymentError("Unable to establish customer identity");
   return stripe.paymentIntents.create({ customer: customerId, ... });`
    },
    {
      id: "agent-timeout",
      title: "Agent Async Loop Leak",
      subtitle: "Unclosed websocket event listener causing event loop lockup",
      method: "POST",
      endpoint: "/api/v1/agents/research/run",
      status: "504 Gateway Timeout",
      statusType: "error",
      duration: "12,400ms",
      cost: "$0.042",
      errorMsg: "TimeoutError: Task was cancelled after 10000ms limit",
      rootCause: "Playwright browser worker spawned recursive event listeners inside a retry loop without cleanup, exhausting async event loop worker threads.",
      confidence: 96,
      commit: "f18b39c (Parallelize browser research agents)",
      file: "agents/research_agent.py:118",
      spans: [
        { name: "AgentContext.initialize", duration: "35ms", status: "ok", type: "INITIALIZE" },
        { name: "LLMChain.planner (Claude 3.5)", duration: "1,840ms", status: "ok", type: "LLM_INFERENCE" },
        { name: "BrowserAutomation.scrapePages", duration: "10,020ms", status: "error", type: "TOOL_CALL", error: "ASYNC_LOOP_LEAK" },
        { name: "SynthesizeFindings", duration: "505ms", status: "skipped", type: "LLM_INFERENCE" }
      ],
      patchCode: `@@ -117,4 +117,6 @@ async def scrape_pages(urls):
-    for url in urls:
-        page = await browser.new_page()
+    async with browser_pool.acquire() as session:
+        async with asyncio.timeout(8.0):
+            return await session.scrape_all(urls)`
    },
    {
      id: "schema-drift",
      title: "LLM Tool Schema Mismatch",
      subtitle: "JSON parser crash caused by unvalidated markdown fence output",
      method: "POST",
      endpoint: "/api/v1/support/triage",
      status: "422 Unprocessable",
      statusType: "warning",
      duration: "890ms",
      cost: "$0.015",
      errorMsg: "JSONDecodeError: Expecting property name enclosed in double quotes",
      rootCause: "GPT-4o output included markdown backticks surrounding JSON output, failing strict Pydantic schema validation in downstream triager.",
      confidence: 99,
      commit: "3b2901a (Update system prompt for ticket triaging)",
      file: "pipelines/triage_parser.py:54",
      spans: [
        { name: "IngestTicketPayload", duration: "12ms", status: "ok", type: "VALIDATE" },
        { name: "GPT4o.TriageDecision", duration: "840ms", status: "ok", type: "LLM_INFERENCE" },
        { name: "PydanticSchemaValidation", duration: "38ms", status: "error", type: "SCHEMA_VALIDATE", error: "SCHEMA_DRIFT" }
      ],
      patchCode: `@@ -53,2 +53,4 @@ def parse_model_response(raw_output: str):
-    return json.loads(raw_output)
+    cleaned = sanitize_markdown_fences(raw_output)
+    return TriageResult.model_validate_json(cleaned)`
    }
  ];

  const currentScenario = scenarios[activeScenario];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-black/10 flex flex-col">
      
      {/* ========================================================================= */}
      {/* 1. NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-200 ${scrolled ? "glass-nav py-3" : "bg-transparent py-4"}`}>
        <div className="bw-container flex items-center justify-between">
          
          {/* Brand Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <span className="font-extrabold tracking-tight text-text-1 text-lg uppercase font-sans flex items-center gap-0.5">
              PATH<span className="text-accent">FLOW</span>
            </span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-surface-2 text-text-2 border border-border">
              v1.0
            </span>
          </a>
          
          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-text-2">
            <a href="#product" className="hover:text-text-1 transition-colors">Product</a>
            <a href="#screenshots" className="hover:text-text-1 transition-colors">Screenshots</a>
            <a href="#how-it-works" className="hover:text-text-1 transition-colors">How it works</a>
            <a href="#capabilities" className="hover:text-text-1 transition-colors">Capabilities</a>
            <a href="#why-pathflow" className="hover:text-text-1 transition-colors">Comparison</a>
            <a href="#pricing" className="hover:text-text-1 transition-colors">Pricing</a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <a 
              href="https://github.com/anothercodingguy/pathflow" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="GitHub Repository" 
              className="text-text-2 hover:text-text-1 transition-colors p-2 rounded-lg hover:bg-black/5"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            <a 
              href={appUrl} 
              className="btn-primary py-2 px-3.5 text-xs font-semibold tracking-wide"
            >
              Open PathFlow <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-2 rounded-lg text-text-1 hover:bg-black/5"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-nav border-t border-border px-4 py-6 mt-3 space-y-4">
            <nav className="flex flex-col space-y-3 font-medium text-sm text-text-1">
              <a 
                href="#product" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-accent transition-colors"
              >
                Product
              </a>
              <a 
                href="#screenshots" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-accent transition-colors"
              >
                Screenshots
              </a>
              <a 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-accent transition-colors"
              >
                How it works
              </a>
              <a 
                href="#capabilities" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-accent transition-colors"
              >
                Capabilities
              </a>
              <a 
                href="#why-pathflow" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-accent transition-colors"
              >
                Comparison
              </a>
              <a 
                href="#pricing" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-accent transition-colors"
              >
                Pricing
              </a>
              <a 
                href="https://github.com/anothercodingguy/pathflow" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="py-1.5 flex items-center justify-between text-text-2"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </nav>
            <div className="pt-2 border-t border-border">
              <a 
                href={appUrl} 
                className="btn-primary w-full py-2.5 text-sm"
              >
                Open PathFlow <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        
        {/* ========================================================================= */}
        {/* 2. HERO SECTION */}
        {/* ========================================================================= */}
        <section className="pt-32 md:pt-40 pb-20 border-b border-border bg-surface">
          <div className="bw-container flex flex-col items-center text-center">
            


            {/* Main Headline */}
            <h1 className="max-w-4xl text-balance text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-semibold leading-[1.08] tracking-tight text-text-1">
              Debug production failures with confidence.
            </h1>
            
            {/* Supporting Explanation */}
            <p className="mt-6 max-w-2xl text-pretty text-lg md:text-xl leading-relaxed text-text-2">
              PathFlow investigates production errors, traces execution paths, isolates root causes with evidence, and helps you get to a fix faster.
            </p>
            
            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <a 
                href={appUrl} 
                className="btn-primary text-sm sm:text-base px-6 py-3"
              >
                Open PathFlow <ArrowRight className="h-4 w-4" />
              </a>
              <a 
                href="#how-it-works" 
                className="btn-secondary text-sm sm:text-base px-6 py-3"
              >
                See how it works <ArrowDown className="h-4 w-4" />
              </a>
            </div>

            {/* Zero Friction Line */}
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-text-3 font-mono">
              <span>✓ No credit card required</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">Connects via Python SDK, REST API, or OpenTelemetry</span>
            </div>

            {/* Realistic Investigation Hero Window */}
            <div id="product" className="mt-14 w-full max-w-5xl text-left">
              <div className="rounded-2xl border border-border bg-[#0C0C0F] text-white shadow-2xl overflow-hidden">
                
                {/* Window Topbar */}
                <div className="px-4 py-3 bg-[#141418] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                      <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                      <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                    </div>
                    <span className="text-zinc-400 ml-2 font-sans font-semibold text-xs">
                      Investigation #8492
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] uppercase font-bold">
                      500 Error
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" /> 412ms
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-zinc-500" /> $0.004
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] text-zinc-300">
                      production (iad1)
                    </span>
                  </div>
                </div>

                {/* Subheader: Incident Target */}
                <div className="px-5 py-3.5 bg-[#101014] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-mono font-semibold text-zinc-200">
                      <span className="text-blue-400 font-bold">POST</span>
                      <span>/api/checkout/process</span>
                    </div>
                    <div className="text-xs text-red-400 font-mono mt-1">
                      TypeError: Cannot read properties of null (reading 'customer_id')
                    </div>
                  </div>

                  {/* Interactive Inspector Tabs */}
                  <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 text-xs font-mono">
                    <button 
                      onClick={() => setActiveHeroTab("trace")}
                      className={`px-3 py-1 rounded transition-colors ${activeHeroTab === "trace" ? "bg-blue-600 text-white font-medium shadow-sm" : "text-zinc-400 hover:text-white"}`}
                    >
                      Execution Trace
                    </button>
                    <button 
                      onClick={() => setActiveHeroTab("rootcause")}
                      className={`px-3 py-1 rounded transition-colors ${activeHeroTab === "rootcause" ? "bg-blue-600 text-white font-medium shadow-sm" : "text-zinc-400 hover:text-white"}`}
                    >
                      Root Cause
                    </button>
                    <button 
                      onClick={() => setActiveHeroTab("patch")}
                      className={`px-3 py-1 rounded transition-colors ${activeHeroTab === "patch" ? "bg-blue-600 text-white font-medium shadow-sm" : "text-zinc-400 hover:text-white"}`}
                    >
                      Suggested Patch
                    </button>
                  </div>
                </div>

                {/* Tab Content 1: Execution Trace Waterfall */}
                {activeHeroTab === "trace" && (
                  <div className="p-5 space-y-3 font-mono text-xs">
                    <div className="text-[11px] text-zinc-500 uppercase font-semibold tracking-wider flex items-center justify-between pb-1 border-b border-white/5">
                      <span>Span Execution Hierarchy</span>
                      <span>Latency & Status</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-zinc-300 font-semibold">1. AuthMiddleware.verifySession</span>
                          <span className="text-[10px] text-zinc-500 px-1.5 py-0.5 rounded bg-white/5">JWT Auth</span>
                        </div>
                        <span className="text-zinc-400">18ms</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors ml-3">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-zinc-300 font-semibold">2. CartService.calculateTotals</span>
                          <span className="text-[10px] text-zinc-500 px-1.5 py-0.5 rounded bg-white/5">PostgreSQL</span>
                        </div>
                        <span className="text-zinc-400">45ms</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/30 hover:border-red-500/50 transition-colors ml-6 shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                          <span className="text-red-300 font-semibold">3. StripeCustomerLookup</span>
                          <span className="text-[10px] text-red-400 px-1.5 py-0.5 rounded bg-red-500/20 font-bold">
                            CRITICAL FAILURE
                          </span>
                        </div>
                        <span className="text-red-400 font-bold">184ms</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 text-zinc-600 ml-9">
                        <div className="flex items-center gap-2.5">
                          <div className="w-4 h-4 rounded-full border border-zinc-700 flex items-center justify-center text-[9px] text-zinc-600">4</div>
                          <span className="line-through">4. PaymentIntent.create</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5">Skipped</span>
                        </div>
                        <span>--</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content 2: Root Cause Diagnosis */}
                {activeHeroTab === "rootcause" && (
                  <div className="p-5 space-y-4 font-sans text-xs">
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-400 font-semibold font-mono uppercase text-xs">
                          <Zap className="w-4 h-4" /> Root Cause Identified
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-mono font-bold">
                          98% Confidence
                        </span>
                      </div>
                      <p className="text-zinc-200 text-sm leading-relaxed">
                        A recent migration altered the user profile payload, omitting <code className="bg-black/30 px-1 py-0.5 rounded text-blue-300 font-mono">customer_id</code> during guest-checkout sessions. The payment worker expected customer_id unconditionally.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-mono uppercase text-zinc-400 font-semibold">Evidence Collected:</div>
                      <ul className="space-y-1.5 text-zinc-300 font-mono text-xs">
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Correlated with commit <code className="text-zinc-400">a49f82d</code> (Add guest-checkout fast path)
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Failure location isolated to <code className="text-blue-300">services/billing/stripe_handler.ts:42</code>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Request payload contains <code className="text-zinc-400">isGuest: true</code> with missing foreign key
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Tab Content 3: Suggested Patch */}
                {activeHeroTab === "patch" && (
                  <div className="p-5 font-mono text-xs space-y-3">
                    <div className="flex items-center justify-between text-zinc-400 pb-1 border-b border-white/10">
                      <span>services/billing/stripe_handler.ts</span>
                      <span className="text-[11px] text-emerald-400 font-sans font-semibold">Ready to apply</span>
                    </div>
                    <pre className="p-4 rounded-xl bg-black/40 border border-white/5 overflow-x-auto text-zinc-300 leading-relaxed">
{`@@ -41,3 +41,5 @@ export async function handlePayment(req) {
-  const customerId = user.profile.customer_id;
+  const customerId = user?.profile?.customer_id ?? await createGuestCustomer(user.email);
+  if (!customerId) throw new PaymentError("Unable to establish customer identity");
   return stripe.paymentIntents.create({ customer: customerId, ... });`}
                    </pre>
                  </div>
                )}

              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. TRUST & CREDIBILITY SECTION */}
        {/* ========================================================================= */}
        
        {/* ========================================================================= */}
        {/* PRODUCTION PRODUCT SCREENSHOTS & WALKTHROUGH                              */}
        {/* ========================================================================= */}
        <section id="screenshots" className="py-24 border-b border-border bg-[#07070A] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">

              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                Real engineering tooling for production agents.
              </h2>
              <p className="mt-3 text-base text-zinc-400">
                Explore high-resolution captures of the live PathFlow platform—from real-time execution waterfall traces to automated root cause investigations.
              </p>

              {/* Interactive Screenshot Selector Tabs */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-xl bg-white/[0.04] border border-white/10 max-w-2xl mx-auto">
                <button
                  onClick={() => setActiveScreenshotTab("dashboard")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    activeScreenshotTab === "dashboard"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Runs Dashboard
                </button>
                <button
                  onClick={() => setActiveScreenshotTab("trace")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    activeScreenshotTab === "trace"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Trace Waterfall
                </button>
                <button
                  onClick={() => setActiveScreenshotTab("failure")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    activeScreenshotTab === "failure"
                      ? "bg-red-600 text-white shadow-md shadow-red-500/20"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Incident Failure
                </button>
                <button
                  onClick={() => setActiveScreenshotTab("investigation")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    activeScreenshotTab === "investigation"
                      ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Root Cause
                </button>
                <button
                  onClick={() => setActiveScreenshotTab("billing")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    activeScreenshotTab === "billing"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Billing & Plans
                </button>
                <button
                  onClick={() => setActiveScreenshotTab("settings")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    activeScreenshotTab === "settings"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  SDK Setup
                </button>
              </div>
            </div>

            {/* Rendered Screenshot Item */}
            <div className="max-w-5xl mx-auto">
              {activeScreenshotTab === "dashboard" && (
                <ProductScreenshot
                  src="/screenshots/screenshot_dashboard.png"
                  alt="PathFlow Production Runs Dashboard"
                  title="Real-Time Execution Runs & Token Economics"
                  caption="See every production execution in one place. Monitor status, model family, duration, token usage, and quality scores at a glance."
                  badge="Runs Dashboard"
                  urlPath="/app/runs"
                  priority={true}
                />
              )}

              {activeScreenshotTab === "trace" && (
                <ProductScreenshot
                  src="/screenshots/screenshot_trace.png"
                  alt="PathFlow Interactive Trace Waterfall"
                  title="Interactive Trace Waterfall & Span Hierarchy"
                  caption="Follow the execution path step by step. Inspect child spans, tool invocations, prompts, token breakdowns, and latency bottlenecks."
                  badge="Trace Waterfall"
                  urlPath="/app/runs/path-1"
                />
              )}

              {activeScreenshotTab === "failure" && (
                <ProductScreenshot
                  src="/screenshots/screenshot_failure.png"
                  alt="PathFlow Production Incident Failure Diagnostics"
                  title="Pinpoint Failure Points & Retry Loops"
                  caption="See where things actually went wrong. Isolate 429 rate limits, bad tool schemas, and unclosed event loop leaks instantly."
                  badge="Incident Diagnostics"
                  urlPath="/app/runs/path-3"
                />
              )}

              {activeScreenshotTab === "investigation" && (
                <ProductScreenshot
                  src="/screenshots/screenshot_investigation.png"
                  alt="PathFlow Root Cause Diagnosis"
                  title="Verifiable Root Cause Diagnosis with Evidence"
                  caption="Isolate root causes with 87%+ confidence. PathFlow correlates spans, failure tags, and code diffs to output concrete code remediations."
                  badge="Root Cause Diagnosis"
                  urlPath="/app/runs/path-3?tab=investigation"
                />
              )}

              {activeScreenshotTab === "billing" && (
                <ProductScreenshot
                  src="/screenshots/screenshot_billing.png"
                  alt="PathFlow Subscription & Billing Management"
                  title="Subscription & Plan Management"
                  caption="Transparent monthly subscriptions in Indian Rupees (INR). Select Pro or Team tier and manage billing seamlessly."
                  badge="Billing & Plans"
                  urlPath="/app/settings/billing"
                />
              )}

              {activeScreenshotTab === "settings" && (
                <ProductScreenshot
                  src="/screenshots/screenshot_settings.png"
                  alt="PathFlow SDK Telemetry & Ingestion Settings"
                  title="Zero-Friction Ingestion & API Keys"
                  caption="Connect PathFlow to the way your team already works. Export PATHFLOW_API_KEY and wrap your agent in 2 lines of Python code."
                  badge="SDK & Ingestion"
                  urlPath="/app/settings"
                />
              )}
            </div>
          </div>
        </section>


        <section className="py-14 border-b border-border bg-surface-subtle">
          <div className="bw-container text-center">
            <p className="text-xs font-mono uppercase tracking-widest text-text-3 font-semibold mb-6">
              Built around the signals engineers already use to debug production
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-4xl mx-auto text-left font-mono">
              <div className="p-3.5 rounded-xl bg-white border border-border shadow-xs hover:border-text-3 transition-colors">
                <div className="text-xs font-bold text-text-1 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-accent" /> Runtime Logs
                </div>
                <div className="text-[11px] text-text-2 mt-1">Structured errors & console streams</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-border shadow-xs hover:border-text-3 transition-colors">
                <div className="text-xs font-bold text-text-1 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-accent" /> Traces
                </div>
                <div className="text-[11px] text-text-2 mt-1">Waterfall spans & critical paths</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-border shadow-xs hover:border-text-3 transition-colors">
                <div className="text-xs font-bold text-text-1 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-accent" /> Code Context
                </div>
                <div className="text-[11px] text-text-2 mt-1">AST traversal & function scopes</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-border shadow-xs hover:border-text-3 transition-colors">
                <div className="text-xs font-bold text-text-1 flex items-center gap-1.5">
                  <GitCommit className="w-3.5 h-3.5 text-accent" /> Git Commits
                </div>
                <div className="text-[11px] text-text-2 mt-1">Recent diffs & code regressions</div>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-white border border-border shadow-xs hover:border-text-3 transition-colors">
                <div className="text-xs font-bold text-text-1 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-accent" /> Deployments
                </div>
                <div className="text-[11px] text-text-2 mt-1">Release tags & runtime configs</div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. THE PROBLEM SECTION */}
        {/* ========================================================================= */}
        <section className="py-24 border-b border-border bg-surface">
          <div className="bw-container">
            <div className="max-w-3xl mb-16">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase font-semibold text-error mb-3">
                <span>The Problem</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-text-1 leading-tight">
                Production failures rarely have one obvious cause.
              </h2>
              <p className="mt-4 text-lg text-text-2 leading-relaxed">
                When something breaks in production, context is scattered across half a dozen tools.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              
              {/* Fragmented reality */}
              <div className="space-y-3 font-mono text-sm">
                <div className="p-4 rounded-xl bg-surface-subtle border border-border flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-error/10 text-error flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">1</div>
                  <div>
                    <div className="font-semibold text-text-1">An alert tells you something broke.</div>
                    <div className="text-xs text-text-3 mt-0.5">PagerDuty or Slack notifies you of an incident.</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-subtle border border-border flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-warning/10 text-warning flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">2</div>
                  <div>
                    <div className="font-semibold text-text-1">Logs tell you what was recorded.</div>
                    <div className="text-xs text-text-3 mt-0.5">Grepping megabytes of stdout across containers.</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-subtle border border-border flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">3</div>
                  <div>
                    <div className="font-semibold text-text-1">Traces tell you what executed.</div>
                    <div className="text-xs text-text-3 mt-0.5">Browsing disconnected waterfall spans.</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-subtle border border-border flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-text-2/10 text-text-2 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">4</div>
                  <div>
                    <div className="font-semibold text-text-1">Git tells you what changed.</div>
                    <div className="text-xs text-text-3 mt-0.5">Reviewing recent PRs and deployments manually.</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black text-white font-sans text-xs flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-warning shrink-0" />
                  <span>Someone still has to connect the dots under incident pressure.</span>
                </div>
              </div>

              {/* PathFlow unified solution */}
              <div className="p-8 rounded-2xl bg-surface-2 border border-border space-y-6">
                <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-bold font-mono">
                  PF
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-text-1">
                    PathFlow connects that context into a single investigation.
                  </h3>
                  <p className="text-text-2 text-sm leading-relaxed">
                    Instead of jumping between disconnected dashboards, PathFlow automatically correlates runtime telemetry, execution paths, and recent code changes to determine exactly why your system failed.
                  </p>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-mono text-text-2">
                  <span>Zero guesswork</span>
                  <span>•</span>
                  <span>Evidence-backed</span>
                  <span>•</span>
                  <span>Direct to fix</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. HOW IT WORKS (5 STEPS) */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="py-24 border-b border-border bg-surface-subtle">
          <div className="bw-container">
            <div className="text-center max-w-2xl mx-auto mb-16">

              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-1">
                From production failure to root cause.
              </h2>
              <p className="mt-3 text-base text-text-2">
                How PathFlow isolates issues step-by-step.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              
              {/* Step 1 */}
              <div className="p-5 rounded-2xl bg-white border border-border flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-transform">
                <div className="space-y-3">
                  <div className="text-xs font-mono text-error font-bold uppercase tracking-wider">
                    01 — Trigger
                  </div>
                  <h3 className="text-base font-semibold text-text-1">Production failure happens</h3>
                  <p className="text-xs text-text-2 leading-relaxed">
                    An unhandled exception, HTTP 500, or tool timeout triggers automatic telemetry capture.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 text-[11px] font-mono text-text-3">
                  Ingress capture
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-2xl bg-white border border-border flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-transform">
                <div className="space-y-3">
                  <div className="text-xs font-mono text-accent font-bold uppercase tracking-wider">
                    02 — Investigate
                  </div>
                  <h3 className="text-base font-semibold text-text-1">Collects relevant context</h3>
                  <p className="text-xs text-text-2 leading-relaxed">
                    Captures runtime stack frames, variable state, span latencies, and deployment metadata.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 text-[11px] font-mono text-text-3">
                  Context correlation
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-2xl bg-white border border-border flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-transform">
                <div className="space-y-3">
                  <div className="text-xs font-mono text-amber-600 font-bold uppercase tracking-wider">
                    03 — Trace
                  </div>
                  <h3 className="text-base font-semibold text-text-1">Reconstructs execution path</h3>
                  <p className="text-xs text-text-2 leading-relaxed">
                    Builds the step-by-step DAG of function calls, database queries, and external API requests.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 text-[11px] font-mono text-text-3">
                  Path reconstruction
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-5 rounded-2xl bg-white border border-border flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-transform">
                <div className="space-y-3">
                  <div className="text-xs font-mono text-blue-600 font-bold uppercase tracking-wider">
                    04 — Explain
                  </div>
                  <h3 className="text-base font-semibold text-text-1">Isolates root cause</h3>
                  <p className="text-xs text-text-2 leading-relaxed">
                    Identifies the exact bug with verifiable telemetry evidence and confidence ratings.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 text-[11px] font-mono text-text-3">
                  Evidence reasoning
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-5 rounded-2xl bg-white border border-border flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-transform">
                <div className="space-y-3">
                  <div className="text-xs font-mono text-success font-bold uppercase tracking-wider">
                    05 — Fix
                  </div>
                  <h3 className="text-base font-semibold text-text-1">Moves toward a fix</h3>
                  <p className="text-xs text-text-2 leading-relaxed">
                    Proposes the code patch or configuration adjustment needed to resolve the incident permanently.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 text-[11px] font-mono text-text-3">
                  Actionable patch
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. PRODUCT DEMO SECTION */}
        {/* ========================================================================= */}
        <section className="py-24 border-b border-border bg-surface">
          <div className="bw-container">
            <div className="max-w-3xl mb-12">

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-text-1">
                See what happened, not just that it failed.
              </h2>
              <p className="mt-3 text-lg text-text-2">
                Switch between real production scenarios to see how PathFlow diagnoses incidents.
              </p>
            </div>

            {/* Scenario Switcher Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {scenarios.map((sc, idx) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    setActiveScenario(idx);
                    setActiveDemoTab("timeline");
                  }}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-mono transition-all ${activeScenario === idx ? "bg-black text-white border-black shadow-sm font-semibold" : "bg-white text-text-2 border-border hover:bg-surface-subtle"}`}
                >
                  <span className="mr-2 font-bold">{idx + 1}.</span>
                  <span>{sc.title}</span>
                </button>
              ))}
            </div>

            {/* Interactive Shell */}
            <div className="rounded-2xl border border-border bg-surface-2 p-4 sm:p-6 shadow-xl">
              
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2 text-sm font-mono font-bold text-text-1">
                    <span className="px-2 py-0.5 rounded bg-black text-white text-xs">{currentScenario.method}</span>
                    <span>{currentScenario.endpoint}</span>
                    <span className="text-xs text-error font-semibold">({currentScenario.status})</span>
                  </div>
                  <div className="text-xs text-text-2 mt-1">
                    {currentScenario.subtitle}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-md bg-white border border-border text-text-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-text-3" /> {currentScenario.duration}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white border border-border text-text-2 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-text-3" /> {currentScenario.cost}
                  </span>
                </div>
              </div>

              {/* Subtabs */}
              <div className="flex gap-2 my-4">
                <button
                  onClick={() => setActiveDemoTab("timeline")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${activeDemoTab === "timeline" ? "bg-white text-text-1 border border-border font-bold shadow-xs" : "text-text-3 hover:text-text-1"}`}
                >
                  Span Waterfall ({currentScenario.spans.length} spans)
                </button>
                <button
                  onClick={() => setActiveDemoTab("evidence")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${activeDemoTab === "evidence" ? "bg-white text-text-1 border border-border font-bold shadow-xs" : "text-text-3 hover:text-text-1"}`}
                >
                  Root Cause Diagnosis
                </button>
                <button
                  onClick={() => setActiveDemoTab("fix")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${activeDemoTab === "fix" ? "bg-white text-text-1 border border-border font-bold shadow-xs" : "text-text-3 hover:text-text-1"}`}
                >
                  Verified Patch
                </button>
              </div>

              {/* Tab 1: Timeline */}
              {activeDemoTab === "timeline" && (
                <div className="space-y-2.5 font-mono text-xs">
                  {currentScenario.spans.map((sp, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3.5 rounded-xl border flex items-center justify-between ${sp.status === "error" ? "bg-red-500/10 border-red-500/30 text-red-900" : sp.status === "skipped" ? "bg-black/[0.02] border-border text-text-3 line-through" : "bg-white border-border text-text-1"}`}
                    >
                      <div className="flex items-center gap-3">
                        {sp.status === "error" ? (
                          <AlertTriangle className="w-4 h-4 text-error shrink-0" />
                        ) : sp.status === "skipped" ? (
                          <div className="w-4 h-4 rounded-full border border-border text-center text-[10px] text-text-3 leading-none flex items-center justify-center">∅</div>
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                        )}
                        <span className="font-semibold">{sp.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 text-text-3 font-normal">{sp.type}</span>
                        {sp.error && (
                          <span className="text-[10px] font-bold text-error px-1.5 py-0.5 rounded bg-error/10 uppercase">
                            {sp.error}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold">{sp.duration}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Root Cause */}
              {activeDemoTab === "evidence" && (
                <div className="p-6 rounded-xl bg-white border border-border space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-accent uppercase">
                      <Zap className="w-4 h-4" /> Root Cause Diagnosis
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-mono text-xs font-bold">
                      {currentScenario.confidence}% Confidence
                    </span>
                  </div>

                  <p className="text-text-1 text-sm leading-relaxed">
                    {currentScenario.rootCause}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3 pt-2 font-mono text-xs">
                    <div className="p-3 rounded-lg bg-surface-subtle border border-border">
                      <span className="text-text-3 block text-[10px] uppercase font-bold">Correlated Git Commit</span>
                      <span className="text-text-1 font-semibold">{currentScenario.commit}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-subtle border border-border">
                      <span className="text-text-3 block text-[10px] uppercase font-bold">Source Location</span>
                      <span className="text-accent font-semibold">{currentScenario.file}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Fix */}
              {activeDemoTab === "fix" && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-text-2">
                    <span>{currentScenario.file}</span>
                    <span className="text-success font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Patch generated from trace evidence
                    </span>
                  </div>
                  <pre className="p-4 rounded-xl bg-white border border-border overflow-x-auto text-text-1 leading-relaxed">
                    {currentScenario.patchCode}
                  </pre>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. CURRENT PRODUCT CAPABILITIES */}
        {/* ========================================================================= */}
        <section id="capabilities" className="py-24 border-b border-border bg-surface-subtle">
          <div className="bw-container">
            <div className="max-w-3xl mb-16">

              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-1">
                Engineered for rapid production diagnosis.
              </h2>
              <p className="mt-3 text-base text-text-2">
                Everything you need to turn raw failures into actionable fixes.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Card 1 */}
              <div className="p-6 rounded-2xl bg-white border border-border shadow-xs hover:-translate-y-1 transition-transform flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-1">Understand every execution</h3>
                  <p className="text-sm text-text-2 leading-relaxed">
                    See what happened across the entire request or workflow. Trace complex multi-step pipelines from initial HTTP request to internal function calls.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 text-xs font-mono text-text-3">
                  Full execution graph
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-6 rounded-2xl bg-white border border-border shadow-xs hover:-translate-y-1 transition-transform flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Search className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-1">Investigate failures automatically</h3>
                  <p className="text-sm text-text-2 leading-relaxed">
                    Bring logs, traces, errors, stack frames, and runtime variable context together into a unified incident investigation without manual log writing.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 text-xs font-mono text-text-3">
                  Unified context capture
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-6 rounded-2xl bg-white border border-border shadow-xs hover:-translate-y-1 transition-transform flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-1">Find the root cause</h3>
                  <p className="text-sm text-text-2 leading-relaxed">
                    PathFlow correlates evidence and isolates the exact failure point with high confidence, distinguishing symptoms from the true root cause.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 text-xs font-mono text-text-3">
                  Evidence-backed diagnosis
                </div>
              </div>

              {/* Card 4 */}
              <div className="p-6 rounded-2xl bg-white border border-border shadow-xs hover:-translate-y-1 transition-transform flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <GitCommit className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-1">Understand recent changes</h3>
                  <p className="text-sm text-text-2 leading-relaxed">
                    Connect runtime failures directly with recent Git commits, code migrations, and deployment revisions that introduced the regression.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 text-xs font-mono text-text-3">
                  Git & deployment diffing
                </div>
              </div>

              {/* Card 5 */}
              <div className="p-6 rounded-2xl bg-white border border-border shadow-xs hover:-translate-y-1 transition-transform flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                    <Split className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-1">Reconstruct failures step-by-step</h3>
                  <p className="text-sm text-text-2 leading-relaxed">
                    Turn production exceptions into concrete debugging paths you can inspect, step through, and compare with successful baseline runs.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 text-xs font-mono text-text-3">
                  PR-style run comparison
                </div>
              </div>

              {/* Card 6 */}
              <div className="p-6 rounded-2xl bg-white border border-border shadow-xs hover:-translate-y-1 transition-transform flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-1">Get to a fix faster</h3>
                  <p className="text-sm text-text-2 leading-relaxed">
                    Move directly from diagnosis toward an actionable code change with concrete diff patches ready for developer review and verification.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 text-xs font-mono text-text-3">
                  Direct patch proposals
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. INTEGRATIONS & COMPATIBILITY */}
        {/* ========================================================================= */}
        <section className="py-24 border-b border-border bg-surface">
          <div className="bw-container">
            <div className="grid lg:grid-cols-[400px_1fr] gap-12 items-center">
              
              <div className="space-y-4">

                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-1">
                  Works with the systems your team already runs.
                </h2>
                <p className="text-text-2 text-base leading-relaxed">
                  Zero migration needed. PathFlow instruments your Python microservices, FastAPI backends, or agentic frameworks in 2 lines of code.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-3 py-1 rounded-lg bg-surface-2 border border-border text-xs font-mono text-text-1">Python SDK</span>
                  <span className="px-3 py-1 rounded-lg bg-surface-2 border border-border text-xs font-mono text-text-1">LangChain</span>
                  <span className="px-3 py-1 rounded-lg bg-surface-2 border border-border text-xs font-mono text-text-1">CrewAI</span>
                  <span className="px-3 py-1 rounded-lg bg-surface-2 border border-border text-xs font-mono text-text-1">AutoGen</span>
                  <span className="px-3 py-1 rounded-lg bg-surface-2 border border-border text-xs font-mono text-text-1">OpenTelemetry</span>
                  <span className="px-3 py-1 rounded-lg bg-surface-2 border border-border text-xs font-mono text-text-1">REST API</span>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="rounded-2xl border border-border bg-[#0C0C0F] text-white p-5 shadow-xl font-mono text-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-zinc-400">
                  <span>app.py</span>
                  <button 
                    onClick={() => handleCopyCode(`import pathflow\n\npathflow.init(\n    api_key="pf_live_secret_key",\n    endpoint="https://thepathflow.online/app/api/v1"\n)\n\n# Wrap any function or framework workflow\n@pathflow.trace()\ndef process_request(data):\n    return handle_business_logic(data)`)}
                    className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedSdk ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSdk ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <pre className="text-zinc-300 leading-relaxed overflow-x-auto">
{`import pathflow

# 1. Initialize PathFlow client
pathflow.init(
    api_key="pf_live_secret_key",
    endpoint="https://thepathflow.online/app/api/v1"
)

# 2. Trace critical execution paths automatically
@pathflow.trace()
def process_checkout(user_id, cart):
    return billing_service.charge(user_id, cart)`}
                </pre>

                <div className="pt-2 text-[11px] text-zinc-500 flex items-center justify-between">
                  <span>pip install pathflow</span>
                  <span className="text-emerald-400">Zero overhead runtime wrapper</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 9. WHY PATHFLOW (OBSERVABILITY VS DEBUGGING) */}
        {/* ========================================================================= */}
        <section id="why-pathflow" className="py-24 border-b border-border bg-surface-subtle">
          <div className="bw-container">
            <div className="text-center max-w-3xl mx-auto mb-16">

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-text-1">
                Observability tells you something is wrong.<br />PathFlow helps you debug why.
              </h2>
              <p className="mt-4 text-base text-text-2">
                Traditional dashboards aggregate metrics. PathFlow reconstructs individual failures with code context.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="max-w-4xl mx-auto rounded-2xl border border-border bg-white overflow-hidden shadow-xs">
              <div className="grid grid-cols-2 text-xs font-mono font-bold uppercase tracking-wider border-b border-border bg-surface-2 p-4">
                <span className="text-text-3">Traditional Observability</span>
                <span className="text-accent flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> PathFlow Debugger
                </span>
              </div>

              <div className="divide-y divide-border text-sm">
                <div className="grid grid-cols-2 p-4 items-center">
                  <span className="text-text-2 text-xs">Alert fires (PagerDuty / Slack)</span>
                  <span className="font-semibold text-text-1 text-xs">Incident captured automatically with full stack state</span>
                </div>
                <div className="grid grid-cols-2 p-4 items-center bg-surface-subtle/50">
                  <span className="text-text-2 text-xs">Search through disconnected logs manually</span>
                  <span className="font-semibold text-text-1 text-xs">Correlated execution path mapped from entry point</span>
                </div>
                <div className="grid grid-cols-2 p-4 items-center">
                  <span className="text-text-2 text-xs">Inspect raw distributed waterfall spans</span>
                  <span className="font-semibold text-text-1 text-xs">Critical path & bottleneck highlighting</span>
                </div>
                <div className="grid grid-cols-2 p-4 items-center bg-surface-subtle/50">
                  <span className="text-text-2 text-xs">Browse Git history to guess regressions</span>
                  <span className="font-semibold text-text-1 text-xs">Direct commit & AST diff correlation</span>
                </div>
                <div className="grid grid-cols-2 p-4 items-center">
                  <span className="text-text-2 text-xs">Guess the cause under incident pressure</span>
                  <span className="font-semibold text-text-1 text-xs">Evidence-backed root cause with confidence score</span>
                </div>
                <div className="grid grid-cols-2 p-4 items-center bg-surface-subtle/50">
                  <span className="text-text-2 text-xs">Manual trial-and-error debugging</span>
                  <span className="font-semibold text-accent text-xs">Move directly toward verified patch</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 10. WHO IT IS FOR */}
        {/* ========================================================================= */}
        <section className="py-24 border-b border-border bg-surface">
          <div className="bw-container">
            <div className="max-w-2xl mb-16">

              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-1">
                Built for the people who own production.
              </h2>
              <p className="mt-3 text-base text-text-2">
                Designed for developers and engineering teams operating real production systems.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div className="p-6 rounded-2xl bg-surface-subtle border border-border space-y-3">
                <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs font-mono">
                  BE
                </div>
                <h3 className="text-base font-semibold text-text-1">Backend Engineers</h3>
                <p className="text-xs text-text-2 leading-relaxed">
                  Triage elusive 500s, database deadlock spikes, and external service timeout cascades without manual reproduction steps.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-surface-subtle border border-border space-y-3">
                <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs font-mono">
                  FS
                </div>
                <h3 className="text-base font-semibold text-text-1">Full-Stack Teams</h3>
                <p className="text-xs text-text-2 leading-relaxed">
                  Connect user-facing frontend error reports directly to the downstream API call and database query that caused the breakdown.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-surface-subtle border border-border space-y-3">
                <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs font-mono">
                  AI
                </div>
                <h3 className="text-base font-semibold text-text-1">AI & Agent Teams</h3>
                <p className="text-xs text-text-2 leading-relaxed">
                  Inspect multi-step LLM chains, diagnose tool schema mismatches, prompt drift, token cost spikes, and execution loops.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-surface-subtle border border-border space-y-3">
                <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs font-mono">
                  YC
                </div>
                <h3 className="text-base font-semibold text-text-1">Startup Teams</h3>
                <p className="text-xs text-text-2 leading-relaxed">
                  Slash incident MTTR so your small team can spend time building customer features rather than digging through log archives.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 11. PRICING SECTION */}
        {/* ========================================================================= */}
        
        {/* ========================================================================= */}
        {/* PRICING (INR PRICING POWERED BY RAZORPAY)                                 */}
        {/* ========================================================================= */}
        <section id="pricing" className="py-24 border-b border-border bg-surface-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">

              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-1">
                Simple, transparent plans in Indian Rupees.
              </h2>
              <p className="mt-3 text-base text-text-2">
                Start free for personal prototypes. Upgrade seamlessly as your team scales.
              </p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              
              {/* Free Plan */}
              <div className="p-6 rounded-2xl bg-white border border-border flex flex-col justify-between shadow-xs">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-text-1">{PLANS.FREE.name}</h3>
                    <p className="text-xs text-text-2 mt-1">{PLANS.FREE.description}</p>
                  </div>
                  <div className="py-2">
                    <span className="text-3xl font-black text-text-1 font-sans">{PLANS.FREE.priceFormatted}</span>
                    <span className="text-xs text-text-3 font-mono"> {PLANS.FREE.period}</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-text-2 font-mono pt-2 border-t border-border">
                    {PLANS.FREE.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-success shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <a href={appUrl + "/login"} className="btn-secondary w-full py-2.5 text-xs font-semibold text-center block">
                    {PLANS.FREE.ctaText}
                  </a>
                </div>
              </div>

              {/* Pro Plan (Featured) */}
              <div className="p-6 rounded-2xl bg-black text-white border-2 border-blue-500 flex flex-col justify-between shadow-2xl relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{PLANS.PRO.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1">{PLANS.PRO.description}</p>
                  </div>
                  <div className="py-2">
                    <span className="text-3xl font-black text-white font-sans">{PLANS.PRO.priceFormatted}</span>
                    <span className="text-xs text-zinc-400 font-mono"> {PLANS.PRO.period}</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-zinc-300 font-mono pt-2 border-t border-white/10">
                    {PLANS.PRO.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <a 
                    href={appUrl + "/login?callbackUrl=%2Fsettings%2Fbilling%3Fplan%3Dpro"} 
                    className="btn-primary bg-blue-600 hover:bg-blue-500 text-white w-full py-2.5 text-xs font-semibold shadow-lg shadow-blue-500/20 text-center block"
                  >
                    {PLANS.PRO.ctaText}
                  </a>
                </div>
              </div>

              {/* Team Plan */}
              <div className="p-6 rounded-2xl bg-white border border-border flex flex-col justify-between shadow-xs">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-text-1">{PLANS.TEAM.name}</h3>
                    <p className="text-xs text-text-2 mt-1">{PLANS.TEAM.description}</p>
                  </div>
                  <div className="py-2">
                    <span className="text-3xl font-black text-text-1 font-sans">{PLANS.TEAM.priceFormatted}</span>
                    <span className="text-xs text-text-3 font-mono"> {PLANS.TEAM.period}</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-text-2 font-mono pt-2 border-t border-border">
                    {PLANS.TEAM.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-success shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <button 
                    disabled
                    className="btn-secondary w-full py-2.5 text-xs font-semibold text-center block opacity-70 cursor-not-allowed bg-surface-2 text-text-3 border-border"
                  >
                    {PLANS.TEAM.ctaText}
                  </button>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="p-6 rounded-2xl bg-white border border-border flex flex-col justify-between shadow-xs">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-text-1">{PLANS.ENTERPRISE.name}</h3>
                    <p className="text-xs text-text-2 mt-1">{PLANS.ENTERPRISE.description}</p>
                  </div>
                  <div className="py-2">
                    <span className="text-2xl font-bold text-text-1 font-sans">Custom</span>
                    <span className="text-xs text-text-3 font-mono block mt-1">Volume & VPC Deployments</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-text-2 font-mono pt-2 border-t border-border">
                    {PLANS.ENTERPRISE.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-success shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <button 
                    disabled
                    className="btn-secondary w-full py-2.5 text-xs font-semibold text-center block opacity-70 cursor-not-allowed bg-surface-2 text-text-3 border-border"
                  >
                    {PLANS.ENTERPRISE.ctaText}
                  </button>
                </div>
              </div>
            </div>

            
          </div>
        </section>


        {/* ========================================================================= */}
        {/* 12. FINAL CTA */}
        {/* ========================================================================= */}
        <section className="py-24 border-b border-border bg-surface text-center">
          <div className="bw-container max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-text-1">
              Your next production bug is going to happen.
            </h2>
            <p className="text-lg text-text-2 max-w-xl mx-auto">
              Make figuring it out faster. Connect your stack in minutes.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a 
                href={appUrl} 
                className="btn-primary text-base px-8 py-3.5"
              >
                Open PathFlow <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <p className="text-xs font-mono text-text-3">
              Get started with free developer tier · Full access to investigation dashboard
            </p>
          </div>
        </section>

      </main>

      {/* ========================================================================= */}
      {/* 13. FOOTER */}
      {/* ========================================================================= */}
      <footer className="py-16 bg-surface-subtle border-t border-border font-sans text-xs">
        <div className="bw-container">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-border">
            
            {/* Column 1: Brand & Tagline */}
            <div className="col-span-2 md:col-span-1 space-y-3">
              <span className="font-extrabold tracking-tight text-text-1 text-base uppercase font-sans">
                PATH<span className="text-accent">FLOW</span>
              </span>
              <p className="text-text-2 text-xs leading-relaxed max-w-xs">
                Production observability and debugging for software engineering teams.
              </p>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-2.5">
              <div className="font-mono text-[11px] font-bold uppercase text-text-1 tracking-wider">Product</div>
              <ul className="space-y-2 text-text-2">
                <li><a href="#product" className="hover:text-text-1 transition-colors">Overview</a></li>
                <li><a href="#how-it-works" className="hover:text-text-1 transition-colors">How it works</a></li>
                <li><a href="#capabilities" className="hover:text-text-1 transition-colors">Capabilities</a></li>
                <li><a href="#pricing" className="hover:text-text-1 transition-colors">Pricing</a></li>
                <li><a href={appUrl} className="text-accent hover:underline font-semibold">Live App Dashboard →</a></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="space-y-2.5">
              <div className="font-mono text-[11px] font-bold uppercase text-text-1 tracking-wider">Resources</div>
              <ul className="space-y-2 text-text-2">
                <li>
                  <a 
                    href="https://github.com/anothercodingguy/pathflow" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-text-1 transition-colors flex items-center gap-1"
                  >
                    <span>GitHub Repository</span>
                    <ExternalLink className="w-3 h-3 text-text-3" />
                  </a>
                </li>
                <li><a href={appUrl} className="hover:text-text-1 transition-colors">API Keys & Docs</a></li>
                <li><a href="#how-it-works" className="hover:text-text-1 transition-colors">Workflow Guide</a></li>
                <li><a href="https://thepathflow.online/robots.txt" className="hover:text-text-1 transition-colors">Robots.txt</a></li>
                <li><a href="https://thepathflow.online/sitemap.xml" className="hover:text-text-1 transition-colors">Sitemap.xml</a></li>
              </ul>
            </div>

            {/* Column 4: Contact & Legal */}
            <div className="space-y-2.5">
              <div className="font-mono text-[11px] font-bold uppercase text-text-1 tracking-wider">Contact</div>
              <ul className="space-y-2 text-text-2">
                <li>
                  <a href="mailto:support@thepathflow.online" className="hover:text-text-1 transition-colors">
                    support@thepathflow.online
                  </a>
                </li>
                <li className="text-text-3 font-mono text-[11px]">Deployments: iad1, bom1</li>
                <li className="text-text-3 font-mono text-[11px]">Zero tracking cookies</li>
              </ul>
            </div>

          </div>

          {/* Bottom copyright bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-text-3 text-[11px] font-mono gap-4">
            <div>
              © 2026 PathFlow. All rights reserved.
            </div>
            <div>
              Domain: <a href="https://thepathflow.online" className="text-text-2 hover:underline">thepathflow.online</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
