'use client';

import React, { useState } from "react";
import ProductScreenshot from "@/components/ProductScreenshot";
import SiteHeader from "@/components/SiteHeader";
import { TabList, tabPanelProps } from "@/components/Tabs";
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
  Search, 
  Zap, 
  FileCode, 
  ExternalLink, 
  Clock, 
  DollarSign, 
  Server, 
  Split
} from "lucide-react";

type HeroTab = "trace" | "rootcause" | "patch";
type DemoTab = "timeline" | "evidence" | "fix";
type ScreenshotTab = "dashboard" | "trace" | "failure" | "investigation" | "billing" | "settings";

// Tabs of the dark "Investigation" window in the hero.
const HERO_TABS: { value: HeroTab; label: string }[] = [
  { value: "trace", label: "Execution Trace" },
  { value: "rootcause", label: "Root Cause" },
  { value: "patch", label: "Suggested Patch" },
];

// One entry per tab in the Screenshots section. The tab row and the picture
// shown under it are both rendered from this list, so they cannot drift apart.
const SCREENSHOTS: {
  value: ScreenshotTab;
  label: string;
  src: string;
  alt: string;
  title: string;
  caption: string;
  badge: string;
  urlPath: string;
}[] = [
  {
    value: "dashboard",
    label: "Runs Dashboard",
    src: "/screenshots/screenshot_dashboard.png",
    alt: "PathFlow Production Runs Dashboard",
    title: "Real-Time Execution Runs & Token Economics",
    caption: "See every production execution in one place. Monitor status, model family, duration, token usage, and quality scores at a glance.",
    badge: "Runs Dashboard",
    urlPath: "/app/runs",
  },
  {
    value: "trace",
    label: "Trace Waterfall",
    src: "/screenshots/screenshot_trace.png",
    alt: "PathFlow Interactive Trace Waterfall",
    title: "Interactive Trace Waterfall & Span Hierarchy",
    caption: "Follow the execution path step by step. Inspect child spans, tool invocations, prompts, token breakdowns, and latency bottlenecks.",
    badge: "Trace Waterfall",
    urlPath: "/app/runs/path-1",
  },
  {
    value: "failure",
    label: "Incident Failure",
    src: "/screenshots/screenshot_failure.png",
    alt: "PathFlow Production Incident Failure Diagnostics",
    title: "Pinpoint Failure Points & Retry Loops",
    caption: "See where things actually went wrong. Isolate 429 rate limits, bad tool schemas, and unclosed event loop leaks instantly.",
    badge: "Incident Diagnostics",
    urlPath: "/app/runs/path-3",
  },
  {
    value: "investigation",
    label: "Root Cause",
    src: "/screenshots/screenshot_investigation.png",
    alt: "PathFlow Root Cause Diagnosis",
    title: "Verifiable Root Cause Diagnosis with Evidence",
    caption: "Each investigation lists what was observed, what was inferred, and a recommended next step, with a rule-based confidence score.",
    badge: "Root Cause Diagnosis",
    urlPath: "/app/runs/path-3?tab=investigation",
  },
  {
    value: "billing",
    label: "Billing & Plans",
    src: "/screenshots/screenshot_billing.png",
    alt: "PathFlow Subscription & Billing Management",
    title: "Subscription & Plan Management",
    caption: "Transparent monthly subscriptions in Indian Rupees (INR). Select Pro or Team tier and manage billing seamlessly.",
    badge: "Billing & Plans",
    urlPath: "/app/settings/billing",
  },
  {
    value: "settings",
    label: "SDK Setup",
    src: "/screenshots/screenshot_settings.png",
    alt: "PathFlow SDK Telemetry & Ingestion Settings",
    title: "Zero-Friction Ingestion & API Keys",
    caption: "Connect PathFlow to the way your team already works. Export PATHFLOW_API_KEY and wrap your agent in 2 lines of Python code.",
    badge: "SDK & Ingestion",
    urlPath: "/app/settings",
  },
];

// The code sample in the Integrations section. Shown on the page and copied by
// the Copy button, so what you see is exactly what you get.
const SDK_SNIPPET = `from pathflow import PathFlow

# Reads PATHFLOW_API_KEY from your environment
pf = PathFlow()

# Each call to this function is recorded as one run
@pf.trace(name="Checkout", project="backend-service")
def process_checkout(user_id, cart):
    with pf.span(name="Charge card", type="Tool") as span:
        span.set_input({"user_id": user_id})
        return billing_service.charge(user_id, cart)`;

export default function HomePage() {
  const [activeHeroTab, setActiveHeroTab] = useState<HeroTab>("trace");
  const [activeScenario, setActiveScenario] = useState<number>(0);
  const [activeDemoTab, setActiveDemoTab] = useState<DemoTab>("timeline");
  const [copiedSdk, setCopiedSdk] = useState(false);
  const [activeScreenshotTab, setActiveScreenshotTab] = useState<ScreenshotTab>("dashboard");

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
      confidence: 78,
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
      confidence: 85,
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
      confidence: 78,
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
  const currentScreenshot = SCREENSHOTS.find((shot) => shot.value === activeScreenshotTab) ?? SCREENSHOTS[0];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-black/10 flex flex-col">
      
      {/* ========================================================================= */}
      {/* 1. NAVIGATION BAR (src/components/SiteHeader.tsx) */}
      {/* ========================================================================= */}
      <SiteHeader appUrl={appUrl} />

      <main id="main" className="flex-1">
        
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
              <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-accent" /> No credit card required</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">Connects via Python SDK, REST API, or OpenTelemetry</span>
            </div>

            {/* Realistic Investigation Hero Window */}
            <div id="product" className="mt-14 w-full max-w-5xl text-left">
              <div className="on-dark rounded-2xl border border-border bg-panel text-white shadow-2xl overflow-hidden">
                
                {/* Window Topbar */}
                <div className="px-4 py-3 bg-panel-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5" aria-hidden="true">
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
                      production
                    </span>
                  </div>
                </div>

                {/* Subheader: Incident Target */}
                <div className="px-4 sm:px-5 py-3.5 bg-panel-2 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-mono font-semibold text-zinc-200">
                      <span className="text-blue-400 font-bold">POST</span>
                      <span className="[overflow-wrap:anywhere]">/api/checkout/process</span>
                    </div>
                    <div className="text-xs text-red-400 font-mono mt-1 [overflow-wrap:anywhere]">
                      TypeError: Cannot read properties of null (reading &apos;customer_id&apos;)
                    </div>
                  </div>

                  {/* Interactive Inspector Tabs */}
                  <TabList
                    idBase="hero"
                    label="Investigation views"
                    tabs={HERO_TABS}
                    value={activeHeroTab}
                    onChange={setActiveHeroTab}
                    className="grid w-full grid-cols-3 sm:flex sm:w-auto bg-white/5 p-1 rounded-lg border border-white/10 text-xs font-mono"
                    tabClassName={(selected) =>
                      `px-2 sm:px-3 py-1.5 sm:py-1 rounded leading-tight transition-colors ${selected ? "bg-accent text-white font-medium shadow-sm" : "text-zinc-400 hover:text-white"}`
                    }
                  />
                </div>

                {/* Tab Content 1: Execution Trace Waterfall */}
                {activeHeroTab === "trace" && (
                  <div {...tabPanelProps("hero", "trace")} className="p-4 sm:p-5 space-y-3 font-mono text-xs focus-visible:-outline-offset-2">
                    <div className="text-[11px] text-zinc-400 uppercase font-semibold tracking-wider flex items-center justify-between gap-3 pb-1 border-b border-white/5">
                      <span>Span Execution Hierarchy</span>
                      <span>Latency & Status</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex min-w-0 items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                          <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                            <span className="text-zinc-300 font-semibold [overflow-wrap:anywhere]">1. AuthMiddleware.verifySession</span>
                            <span className="text-[10px] text-zinc-400 px-1.5 py-0.5 rounded bg-white/5">JWT Auth</span>
                          </div>
                        </div>
                        <span className="shrink-0 text-zinc-400">18ms</span>
                      </div>

                      <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors ml-2 sm:ml-3">
                        <div className="flex min-w-0 items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                          <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                            <span className="text-zinc-300 font-semibold [overflow-wrap:anywhere]">2. CartService.calculateTotals</span>
                            <span className="text-[10px] text-zinc-400 px-1.5 py-0.5 rounded bg-white/5">PostgreSQL</span>
                          </div>
                        </div>
                        <span className="shrink-0 text-zinc-400">45ms</span>
                      </div>

                      <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 hover:border-red-500/50 transition-colors ml-4 sm:ml-6 shadow-sm">
                        <div className="flex min-w-0 items-start gap-2.5">
                          <XCircle className="w-4 h-4 mt-0.5 text-red-400 shrink-0" />
                          <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                            <span className="text-red-300 font-semibold [overflow-wrap:anywhere]">3. StripeCustomerLookup</span>
                            <span className="text-[10px] text-red-400 px-1.5 py-0.5 rounded bg-red-500/20 font-bold">
                              CRITICAL FAILURE
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 text-red-400 font-bold">184ms</span>
                      </div>

                      <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 text-zinc-400 ml-6 sm:ml-9">
                        <div className="flex min-w-0 items-start gap-2.5">
                          <div aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0 rounded-full border border-zinc-700 flex items-center justify-center text-[9px] text-zinc-500">4</div>
                          <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                            <span className="line-through [overflow-wrap:anywhere]">4. PaymentIntent.create</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5">Skipped</span>
                          </div>
                        </div>
                        <span>--</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content 2: Root Cause Diagnosis */}
                {activeHeroTab === "rootcause" && (
                  <div {...tabPanelProps("hero", "rootcause")} className="p-4 sm:p-5 space-y-4 font-sans text-xs focus-visible:-outline-offset-2">
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-blue-400 font-semibold font-mono uppercase text-xs">
                          <Zap className="w-4 h-4" /> Root Cause Identified
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-mono font-bold">
                          78% Confidence
                        </span>
                      </div>
                      <p className="text-zinc-200 text-sm leading-relaxed">
                        A recent migration altered the user profile payload, omitting <code className="bg-black/30 px-1 py-0.5 rounded text-blue-300 font-mono">customer_id</code> during guest-checkout sessions. The payment worker expected customer_id unconditionally.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-mono uppercase text-zinc-400 font-semibold">Evidence Collected:</div>
                      <ul className="space-y-1.5 text-zinc-300 font-mono text-xs">
                        <li className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-400" />
                          <span className="min-w-0 [overflow-wrap:anywhere]">Failure location isolated to <code className="text-blue-300">services/billing/stripe_handler.ts:42</code></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-400" />
                          <span className="min-w-0 [overflow-wrap:anywhere]">Request payload contains <code className="text-zinc-400">isGuest: true</code> with missing foreign key</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Tab Content 3: Suggested Patch */}
                {activeHeroTab === "patch" && (
                  <div {...tabPanelProps("hero", "patch")} className="p-4 sm:p-5 font-mono text-xs space-y-3 focus-visible:-outline-offset-2">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-zinc-400 pb-1 border-b border-white/10">
                      <span>services/billing/stripe_handler.ts</span>
                      <span className="text-[11px] text-emerald-400 font-sans font-semibold">Ready to apply</span>
                    </div>
                    <pre tabIndex={0} aria-label="Example patch" className="p-4 rounded-xl bg-black/40 border border-white/5 overflow-x-auto text-zinc-300 leading-relaxed">
{`@@ -41,3 +41,5 @@ export async function handlePayment(req) {
-  const customerId = user.profile.customer_id;
+  const customerId = user?.profile?.customer_id ?? await createGuestCustomer(user.email);
+  if (!customerId) throw new PaymentError("Unable to establish customer identity");
   return stripe.paymentIntents.create({ customer: customerId, ... });`}
                    </pre>
                  </div>
                )}

              </div>
              <p className="mt-3 text-center text-xs font-mono text-text-3">
                Illustrative example. Real captures are in the screenshots below.
              </p>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. TRUST & CREDIBILITY SECTION */}
        {/* ========================================================================= */}
        
        {/* ========================================================================= */}
        {/* PRODUCTION PRODUCT SCREENSHOTS & WALKTHROUGH                              */}
        {/* ========================================================================= */}
        <section id="screenshots" className="on-dark py-24 border-b border-border bg-ink text-white">
          <div className="bw-container">
            <div className="text-center max-w-3xl mx-auto mb-12">

              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                Real engineering tooling for production agents.
              </h2>
              <p className="mt-3 text-base text-zinc-400">
                Explore high-resolution captures of the live PathFlow platform—from real-time execution waterfall traces to automated root cause investigations.
              </p>

              {/* Interactive Screenshot Selector Tabs */}
              <TabList
                idBase="screenshots"
                label="Product screenshots"
                tabs={SCREENSHOTS}
                value={activeScreenshotTab}
                onChange={setActiveScreenshotTab}
                className="mt-8 flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-xl bg-white/[0.04] border border-white/10 max-w-2xl mx-auto"
                tabClassName={(selected) =>
                  `px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-colors ${
                    selected
                      ? "bg-accent text-white shadow-md shadow-blue-500/20"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`
                }
              />
            </div>

            {/* Rendered Screenshot Item */}
            <div {...tabPanelProps("screenshots", currentScreenshot.value)} className="max-w-5xl mx-auto rounded-xl">
              <ProductScreenshot
                key={currentScreenshot.value}
                src={currentScreenshot.src}
                alt={currentScreenshot.alt}
                title={currentScreenshot.title}
                caption={currentScreenshot.caption}
                badge={currentScreenshot.badge}
                urlPath={currentScreenshot.urlPath}
                priority={currentScreenshot.value === "dashboard"}
              />
            </div>
          </div>
        </section>


        <section className="py-14 border-b border-border bg-surface-subtle">
          <div className="bw-container text-center">
            <p className="text-xs font-mono uppercase tracking-widest text-text-3 font-semibold mb-6">
              Built around the signals engineers already use to debug production
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-4xl mx-auto text-left font-mono">
              <div className="p-3.5 rounded-xl bg-surface border border-border shadow-xs hover:border-text-3 transition-colors">
                <div className="text-xs font-bold text-text-1 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-accent" /> Errors
                </div>
                <div className="text-[11px] text-text-2 mt-1">Exception messages on failed spans</div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-border shadow-xs hover:border-text-3 transition-colors">
                <div className="text-xs font-bold text-text-1 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-accent" /> Traces
                </div>
                <div className="text-[11px] text-text-2 mt-1">Waterfall spans & critical paths</div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-border shadow-xs hover:border-text-3 transition-colors">
                <div className="text-xs font-bold text-text-1 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-accent" /> Inputs & Outputs
                </div>
                <div className="text-[11px] text-text-2 mt-1">Per span, known secret patterns redacted</div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-border shadow-xs hover:border-text-3 transition-colors">
                <div className="text-xs font-bold text-text-1 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-accent" /> Tokens & Cost
                </div>
                <div className="text-[11px] text-text-2 mt-1">Token counts & spend per span</div>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-surface border border-border shadow-xs hover:border-text-3 transition-colors">
                <div className="text-xs font-bold text-text-1 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-accent" /> Environments
                </div>
                <div className="text-[11px] text-text-2 mt-1">Project & environment labels on every run</div>
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
              <div className="p-6 sm:p-8 rounded-2xl bg-surface-2 border border-border space-y-6">
                <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-bold font-mono">
                  PF
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-text-1">
                    PathFlow connects that context into a single investigation.
                  </h3>
                  <p className="text-text-2 text-sm leading-relaxed">
                    Instead of jumping between disconnected dashboards, PathFlow puts a run&apos;s spans, errors, and detections in one investigation, so you can see where it failed.
                  </p>
                </div>

                <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-mono text-text-2">
                  <span>Zero guesswork</span>
                  <span aria-hidden="true">•</span>
                  <span>Evidence-backed</span>
                  <span aria-hidden="true">•</span>
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

            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Step 1 */}
              <li className="p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-transform">
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
              </li>

              {/* Step 2 */}
              <li className="p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-transform">
                <div className="space-y-3">
                  <div className="text-xs font-mono text-accent font-bold uppercase tracking-wider">
                    02 — Investigate
                  </div>
                  <h3 className="text-base font-semibold text-text-1">Collects relevant context</h3>
                  <p className="text-xs text-text-2 leading-relaxed">
                    Records each span&apos;s latency and any exception, plus the inputs, outputs, tokens, and cost you attach.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 text-[11px] font-mono text-text-3">
                  Context correlation
                </div>
              </li>

              {/* Step 3 */}
              <li className="p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-transform">
                <div className="space-y-3">
                  <div className="text-xs font-mono text-warning font-bold uppercase tracking-wider">
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
              </li>

              {/* Step 4 */}
              <li className="p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-transform">
                <div className="space-y-3">
                  <div className="text-xs font-mono text-accent font-bold uppercase tracking-wider">
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
              </li>

              {/* Step 5 */}
              <li className="sm:col-span-2 lg:col-span-1 p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-transform">
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
              </li>

            </ol>
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
                Switch between three example scenarios to see how PathFlow lays out a failed run. The data shown is illustrative.
              </p>
            </div>

            {/* Scenario Switcher Tabs */}
            <TabList
              idBase="scenario"
              label="Example scenarios"
              tabs={scenarios.map((sc, idx) => ({
                value: sc.id,
                label: (
                  <>
                    <span className="mr-2 font-bold">{idx + 1}.</span>
                    <span>{sc.title}</span>
                  </>
                ),
              }))}
              value={currentScenario.id}
              onChange={(id) => {
                setActiveScenario(scenarios.findIndex((sc) => sc.id === id));
                setActiveDemoTab("timeline");
              }}
              className="flex flex-wrap gap-2 mb-6"
              tabClassName={(selected) =>
                `px-4 py-2.5 rounded-xl border text-xs font-mono transition-colors ${selected ? "bg-black text-white border-black shadow-sm font-semibold" : "bg-surface text-text-2 border-border hover:bg-surface-subtle"}`
              }
            />

            {/* Interactive Shell */}
            <div {...tabPanelProps("scenario", currentScenario.id)} className="rounded-2xl border border-border bg-surface-2 p-4 sm:p-6 shadow-xl">
              
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-mono font-bold text-text-1">
                    <span className="px-2 py-0.5 rounded bg-black text-white text-xs">{currentScenario.method}</span>
                    <span className="[overflow-wrap:anywhere]">{currentScenario.endpoint}</span>
                    <span className="text-xs text-error font-semibold">({currentScenario.status})</span>
                  </div>
                  <div className="text-xs text-text-2 mt-1">
                    {currentScenario.subtitle}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-md bg-surface border border-border text-text-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-text-3" /> {currentScenario.duration}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-surface border border-border text-text-2 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-text-3" /> {currentScenario.cost}
                  </span>
                </div>
              </div>

              {/* Subtabs */}
              <TabList
                idBase="demo"
                label="Scenario details"
                tabs={[
                  { value: "timeline", label: `Span Waterfall (${currentScenario.spans.length} spans)` },
                  { value: "evidence", label: "Root Cause Diagnosis" },
                  { value: "fix", label: "Verified Patch" },
                ]}
                value={activeDemoTab}
                onChange={setActiveDemoTab}
                className="flex flex-wrap gap-2 my-4"
                tabClassName={(selected) =>
                  `px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${selected ? "bg-surface text-text-1 border-border font-bold shadow-xs" : "border-transparent text-text-2 hover:text-text-1"}`
                }
              />

              {/* Tab 1: Timeline */}
              {activeDemoTab === "timeline" && (
                <div {...tabPanelProps("demo", "timeline")} className="space-y-2.5 font-mono text-xs rounded-xl">
                  {currentScenario.spans.map((sp, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${sp.status === "error" ? "bg-red-500/10 border-red-500/30 text-red-900" : sp.status === "skipped" ? "bg-black/[0.02] border-border text-text-3 line-through" : "bg-surface border-border text-text-1"}`}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        {sp.status === "error" ? (
                          <AlertTriangle className="w-4 h-4 mt-0.5 text-error shrink-0" />
                        ) : sp.status === "skipped" ? (
                          <div aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0 rounded-full border border-border-hover text-center text-[10px] text-text-3 leading-none flex items-center justify-center">∅</div>
                        ) : (
                          <CheckCircle2 className="w-4 h-4 mt-0.5 text-success shrink-0" />
                        )}
                        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-semibold [overflow-wrap:anywhere]">{sp.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 text-text-2 font-normal">{sp.type}</span>
                          {sp.error && (
                            <span className="text-[10px] font-bold text-error px-1.5 py-0.5 rounded bg-error/10 uppercase">
                              {sp.error}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 font-semibold">{sp.duration}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Root Cause */}
              {activeDemoTab === "evidence" && (
                <div {...tabPanelProps("demo", "evidence")} className="p-4 sm:p-6 rounded-xl bg-surface border border-border space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border">
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
                      <span className="text-text-3 block text-[10px] uppercase font-bold">First Failing Span</span>
                      <span className="text-text-1 font-semibold [overflow-wrap:anywhere]">{currentScenario.spans.find((sp) => sp.status === "error")?.name}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-subtle border border-border">
                      <span className="text-text-3 block text-[10px] uppercase font-bold">Source Location</span>
                      <span className="text-accent font-semibold [overflow-wrap:anywhere]">{currentScenario.file}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Fix */}
              {activeDemoTab === "fix" && (
                <div {...tabPanelProps("demo", "fix")} className="space-y-3 font-mono text-xs rounded-xl">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-text-2">
                    <span className="[overflow-wrap:anywhere]">{currentScenario.file}</span>
                    <span className="text-success font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Patch generated from trace evidence
                    </span>
                  </div>
                  <pre tabIndex={0} aria-label="Example patch" className="p-4 rounded-xl bg-surface border border-border overflow-x-auto text-text-1 leading-relaxed">
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
              <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs hover:-translate-y-1 transition-transform flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center">
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
              <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs hover:-translate-y-1 transition-transform flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center">
                    <Search className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-1">Investigate failures automatically</h3>
                  <p className="text-sm text-text-2 leading-relaxed">
                    Bring a run&apos;s spans, errors, retries, and detections together into one investigation.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 text-xs font-mono text-text-3">
                  Unified context capture
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs hover:-translate-y-1 transition-transform flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center">
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
              <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs hover:-translate-y-1 transition-transform flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-1">Track tokens and cost</h3>
                  <p className="text-sm text-text-2 leading-relaxed">
                    Every span can record its token count and cost, so you can see which step made a run slow or expensive.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 text-xs font-mono text-text-3">
                  Per-span tokens & cost
                </div>
              </div>

              {/* Card 5 */}
              <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs hover:-translate-y-1 transition-transform flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center">
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
              <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs hover:-translate-y-1 transition-transform flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center">
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
            <div className="grid grid-cols-1 lg:grid-cols-[400px_minmax(0,1fr)] gap-12 items-center">
              
              <div className="space-y-4">

                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-1">
                  Works with the systems your team already runs.
                </h2>
                <p className="text-text-2 text-base leading-relaxed">
                  No migration needed. The Python SDK wraps a function with one decorator. Other stacks can send runs through the REST API or OpenTelemetry.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-3 py-1 rounded-lg bg-surface-2 border border-border text-xs font-mono text-text-1">Python SDK</span>
                  <span className="px-3 py-1 rounded-lg bg-surface-2 border border-border text-xs font-mono text-text-1">OpenTelemetry</span>
                  <span className="px-3 py-1 rounded-lg bg-surface-2 border border-border text-xs font-mono text-text-1">REST API</span>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="on-dark min-w-0 rounded-2xl border border-border bg-panel text-white p-4 sm:p-5 shadow-xl font-mono text-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-zinc-400">
                  <span>app.py</span>
                  <button 
                    type="button"
                    onClick={() => handleCopyCode(SDK_SNIPPET)}
                    className="flex items-center gap-1.5 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedSdk ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span aria-live="polite">{copiedSdk ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <pre tabIndex={0} aria-label="Python code sample" className="text-zinc-300 leading-relaxed overflow-x-auto rounded">
{SDK_SNIPPET}
                </pre>

                <div className="pt-2 text-[11px] text-zinc-400 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <span>pip install pathflow</span>
                  <span className="text-emerald-400">No dependencies · Python 3.9+</span>
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
            <div role="table" aria-label="Traditional observability compared with PathFlow" className="max-w-4xl mx-auto rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
              <div role="row" className="grid grid-cols-2 gap-4 text-xs font-mono font-bold uppercase tracking-wider border-b border-border bg-surface-subtle p-4">
                <span role="columnheader" className="text-text-3">Traditional Observability</span>
                <span role="columnheader" className="text-accent flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 shrink-0" /> PathFlow Debugger
                </span>
              </div>

              <div role="rowgroup" className="divide-y divide-border text-sm">
                <div role="row" className="grid grid-cols-2 gap-4 p-4 items-center">
                  <span role="cell" className="text-text-2 text-xs">Alert fires (PagerDuty / Slack)</span>
                  <span role="cell" className="font-semibold text-text-1 text-xs">Failed runs recorded with their spans and error messages</span>
                </div>
                <div role="row" className="grid grid-cols-2 gap-4 p-4 items-center bg-surface-subtle/50">
                  <span role="cell" className="text-text-2 text-xs">Search through disconnected logs manually</span>
                  <span role="cell" className="font-semibold text-text-1 text-xs">Correlated execution path mapped from entry point</span>
                </div>
                <div role="row" className="grid grid-cols-2 gap-4 p-4 items-center">
                  <span role="cell" className="text-text-2 text-xs">Inspect raw distributed waterfall spans</span>
                  <span role="cell" className="font-semibold text-text-1 text-xs">Critical path & bottleneck highlighting</span>
                </div>
                <div role="row" className="grid grid-cols-2 gap-4 p-4 items-center bg-surface-subtle/50">
                  <span role="cell" className="text-text-2 text-xs">Compare a bad run with a good one by hand</span>
                  <span role="cell" className="font-semibold text-text-1 text-xs">Side-by-side run comparison</span>
                </div>
                <div role="row" className="grid grid-cols-2 gap-4 p-4 items-center">
                  <span role="cell" className="text-text-2 text-xs">Guess the cause under incident pressure</span>
                  <span role="cell" className="font-semibold text-text-1 text-xs">Evidence-backed root cause with confidence score</span>
                </div>
                <div role="row" className="grid grid-cols-2 gap-4 p-4 items-center bg-surface-subtle/50">
                  <span role="cell" className="text-text-2 text-xs">Manual trial-and-error debugging</span>
                  <span role="cell" className="font-semibold text-accent text-xs">Move directly toward verified patch</span>
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
                  See why a run failed without digging through log archives, so a small team can get back to building.
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
          <div className="bw-container">
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
              <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between shadow-xs">
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
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 mt-0.5 text-success shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <a href={appUrl + "/login"} className="btn-secondary w-full py-2.5 text-xs font-semibold">
                    {PLANS.FREE.ctaText}
                  </a>
                </div>
              </div>

              {/* Pro Plan (Featured) */}
              <div className="on-dark p-6 rounded-2xl bg-black text-white border-2 border-accent flex flex-col justify-between shadow-2xl relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-accent text-white px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shadow-md">
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
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 mt-0.5 text-emerald-400 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <a 
                    href={appUrl + "/login?callbackUrl=%2Fsettings%2Fbilling%3Fplan%3Dpro"} 
                    className="btn-primary bg-accent hover:bg-accent-hover w-full py-2.5 text-xs font-semibold shadow-lg shadow-blue-500/20"
                  >
                    {PLANS.PRO.ctaText}
                  </a>
                </div>
              </div>

              {/* Team Plan */}
              <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between shadow-xs">
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
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 mt-0.5 text-success shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <a 
                    href={appUrl + "/login?callbackUrl=%2Fsettings%2Fbilling%3Fplan%3Dteam"}
                    className="btn-secondary w-full py-2.5 text-xs font-semibold"
                  >
                    {PLANS.TEAM.ctaText}
                  </a>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between shadow-xs">
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
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 mt-0.5 text-success shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <a 
                    href={PLANS.ENTERPRISE.ctaHref}
                    className="btn-secondary w-full py-2.5 text-xs font-semibold"
                  >
                    {PLANS.ENTERPRISE.ctaText}
                  </a>
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
                  <a href="mailto:support@thepathflow.online" className="hover:text-text-1 transition-colors [overflow-wrap:anywhere]">
                    support@thepathflow.online
                  </a>
                </li>
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
