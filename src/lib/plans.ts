export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PlanConfig {
  id: "FREE" | "PRO" | "TEAM" | "ENTERPRISE";
  name: string;
  badge?: string;
  priceInr: number;
  priceFormatted: string;
  period: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  highlighted?: boolean;
}

export const PLANS: Record<string, PlanConfig> = {
  FREE: {
    id: "FREE",
    name: "Free Developer",
    priceInr: 0,
    priceFormatted: "₹0",
    period: "/ month",
    description: "For personal projects, solo experimentation, and small prototypes.",
    features: [
      "1 Active Project",
      "500 Runs / month",
      "7-day Trace Retention",
      "Basic Error Logging & Spans",
      "Python & TypeScript SDKs",
      "Community Discord Support",
    ],
    ctaText: "Start Free",
    ctaHref: "/app/login",
    highlighted: false,
  },
  PRO: {
    id: "PRO",
    name: "Pro Engineer",
    badge: "RECOMMENDED",
    priceInr: 2499,
    priceFormatted: "₹2,499",
    period: "/ month",
    description: "For developers and creators running autonomous agents in production.",
    features: [
      "Unlimited Projects",
      "10,000 Runs / month",
      "30-day Trace Retention",
      "AI Root Cause Investigation",
      "Automated Failure Detections",
      "Git Diff & Commit Attribution",
      "Priority Email & Chat Support",
    ],
    ctaText: "Upgrade to Pro →",
    ctaHref: "/app/login?callbackUrl=%2Fsettings%2Fbilling%3Fplan%3Dpro",
    highlighted: true,
  },
  TEAM: {
    id: "TEAM",
    name: "Engineering Team",
    badge: "BEST FOR TEAMS",
    priceInr: 7999,
    priceFormatted: "₹7,999",
    period: "/ month",
    description: "For engineering teams debugging complex multi-agent workflows together.",
    features: [
      "5 Included Team Seats",
      "50,000 Runs / month",
      "90-day Trace Retention",
      "Real-time Incident Webhooks & Slack Alerts",
      "Multi-Agent Comparative Profiler",
      "Custom Alerting Thresholds",
      "Dedicated Slack Channel Support",
    ],
    ctaText: "Upgrade to Team →",
    ctaHref: "/app/login?callbackUrl=%2Fsettings%2Fbilling%3Fplan%3Dteam",
    highlighted: false,
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Enterprise",
    badge: "CUSTOM",
    priceInr: 0,
    priceFormatted: "Custom",
    period: "",
    description: "For high-scale enterprises with custom volume, compliance, and SLA needs.",
    features: [
      "Unlimited Runs & Team Seats",
      "365-day Custom Data Retention",
      "Self-Hosted VPC / Dedicated On-Premises",
      "SOC2 Type II & HIPAA Compliance",
      "Custom SSO (SAML, Okta, Azure AD)",
      "99.99% Uptime SLA Guarantee",
      "Dedicated Solutions Architect",
    ],
    ctaText: "Contact Enterprise Sales",
    ctaHref: "mailto:enterprise@thepathflow.online?subject=PathFlow%20Enterprise%20Inquiry",
    highlighted: false,
  },
};
