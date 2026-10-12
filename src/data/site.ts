// Every word on the site lives here. Sections take their slice as props
// and src/pages/index.astro is the only importer, so copy changes never
// touch markup. src/data/site.test.ts guards the rules (no em dashes, no
// real client or product names, valid link formats).

export type IconName =
  | "web"
  | "mobile"
  | "capstone"
  | "software"
  | "cart"
  | "sparkles"
  | "cloud"
  | "compass"
  | "mail"
  | "whatsapp"
  | "viber"
  | "messenger"
  | "calendar"
  | "github"
  | "linkedin"
  | "globe"
  | "arrow"
  | "external"
  | "check";

export interface NavItem {
  href: string;
  label: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Service {
  id: string;
  title: string;
  summary: string;
  includes: string[];
  stack: string[];
  icon: IconName;
}

export interface WorkItem {
  id: string;
  /** What kind of system it is; never a product or client name. */
  kind: string;
  industry: string;
  challenge: string;
  approach: string;
  results: string[];
}

export interface ProcessStep {
  title: string;
  body: string;
  deliverable: string;
}

export interface Package {
  id: string;
  name: string;
  tagline: string;
  meta: [string, string];
  includes: string[];
  cta: string;
  featured?: boolean;
}

export interface FaqGroup {
  group: string;
  items: { q: string; a: string }[];
}

export type ChannelId = "email" | "whatsapp" | "viber" | "calendly" | "messenger";

export interface Channel {
  id: ChannelId;
  label: string;
  /** What the visitor sees next to the label; empty hides the channel. */
  value: string;
  href: string;
  icon: IconName;
  external: boolean;
  note?: string;
}

export const SITE = {
  name: "Karakoa",
  domain: "karakoa.dev",
  url: "https://karakoa.dev",
  tagline: "Websites, mobile apps, and systems, built to ship.",
  description:
    "Karakoa is a founder-led software studio in the Philippines. We design and build websites, mobile apps, and custom systems for businesses, startups, and students with a capstone or thesis to defend.",
  email: "chrstnjsff@gmail.com",
  phoneDisplay: "[redacted]",
  /** Digits only, international format, for wa.me and viber links. */
  phoneDigits: "[redacted]",
  location: { locality: "Metro Manila", region: "NCR", country: "PH", label: "Metro Manila, Philippines" },
  founded: 2026,
  githubUrl: "https://github.com/chrstnjsff",
} as const;

// Public by design: Web3Forms keys only let a page send mail to the inbox
// they were created for. Replace with the key created for SITE.email.
export const WEB3FORMS_ACCESS_KEY = "41b60b5c-5b0f-4556-af6e-02cbb129f06a";

export const NAV: NavItem[] = [
  { href: "#services", label: "Services" },
  { href: "#work", label: "Work" },
  { href: "#process", label: "Process" },
  { href: "#packages", label: "Packages" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export const hero = {
  eyebrow: "Founder-led software studio, Philippines",
  title: SITE.tagline,
  lede: SITE.description,
  primary: { href: "#contact", label: "Start a project" },
  secondary: { href: "#work", label: "See our work" },
};

// Real figures from the founder's production work; nothing estimated.
export const stats: Stat[] = [
  { value: "7+", label: "years building and running production systems" },
  { value: "99.95%", label: "uptime on platforms we operate" },
  { value: "3.6M+", label: "users served by platforms we have run" },
  { value: "12", label: "agencies in 5 US states on one platform we built" },
];

export const about = {
  eyebrow: "Why Karakoa",
  title: "Founder-led, built to ship",
  body: "A karakoa is the precolonial Filipino warship: light, fast, and crewed by people who knew the water. We build software the same way. One senior engineer owns your project from the first call to launch, with design, QA, and documentation help brought in when the brief needs it.",
  points: [
    {
      title: "One owner, start to finish",
      body: "Architecture, product judgment, and implementation stay with the same person instead of being split across layers.",
    },
    {
      title: "Taste in the details",
      body: "Design quality matters as much as the code underneath it, especially for anything your customers or your panel will see.",
    },
    {
      title: "Built to hold up",
      body: "Every build ships with deployment, monitoring, and clean handover, so it keeps working after launch and someone else can maintain it.",
    },
    {
      title: "Students welcome",
      body: "Capstone and thesis systems get the same engineering standard, plus help with the documentation and the defense.",
    },
  ],
};

export const services: Service[] = [
  {
    id: "websites",
    title: "Website design and development",
    summary:
      "Fast, responsive, modern websites that look right on every screen and are ready for search engines from day one.",
    includes: ["Responsive design", "SEO and performance", "Content and forms", "Hosting and launch"],
    stack: ["Astro", "Next.js", "Tailwind CSS", "TypeScript", "Cloudflare"],
    icon: "web",
  },
  {
    id: "mobile-apps",
    title: "Mobile app development",
    summary:
      "iOS and Android apps from one codebase, with the backend, push notifications, and store submission handled.",
    includes: ["iOS and Android", "Push notifications", "Payments and sign-in", "App Store and Play Store submission"],
    stack: ["React Native", "Expo", "TypeScript", "Supabase", "Firebase"],
    icon: "mobile",
  },
  {
    id: "capstone",
    title: "Capstone and thesis systems with consultation",
    summary:
      "A working system for your capstone or thesis, built with you, plus the documentation support and defense prep to get it approved.",
    includes: [
      "Proposal and system design help",
      "Full system build with source code",
      "Documentation and diagram support",
      "Defense prep and revisions after panel feedback",
    ],
    stack: ["Web or mobile", "PHP or Node.js", "MySQL or PostgreSQL", "React", "Flutter"],
    icon: "capstone",
  },
  {
    id: "custom-software",
    title: "Custom software and web applications",
    summary:
      "Internal tools, portals, dashboards, and SaaS products shaped to how your business actually works.",
    includes: ["Custom architecture", "Admin dashboards and portals", "APIs and integrations", "SaaS and multi-tenant setups"],
    stack: ["React", "Next.js", "Node.js", "Django", "PostgreSQL", "AWS"],
    icon: "software",
  },
  {
    id: "ecommerce",
    title: "E-commerce and marketplace apps",
    summary:
      "Online stores and marketplaces with payments, inventory, and the vendor and customer roles that keep them running.",
    includes: ["Storefront and catalog", "Payments and checkout", "Inventory and orders", "Vendor and multi-user roles"],
    stack: ["Next.js", "React Native", "Shopify API", "Stripe or PayMongo", "PostgreSQL"],
    icon: "cart",
  },
  {
    id: "ai-automation",
    title: "AI and automation",
    summary:
      "Chatbots, assistants, and workflow automation that take repetitive work off your team, built on current AI models.",
    includes: ["Chatbots and assistants", "Agent workflows with tool use", "Document and data processing", "Business process automation"],
    stack: ["Claude", "OpenAI", "Gemini", "Amazon Bedrock", "Python", "TypeScript"],
    icon: "sparkles",
  },
  {
    id: "cloud-devops",
    title: "Cloud, DevOps and hosting",
    summary:
      "Deployment, pipelines, monitoring, and cost control for the systems we build and the ones you already run.",
    includes: ["Cloud setup on AWS, GCP, or Azure", "CI/CD pipelines", "Monitoring and alerting", "Security hardening and cost control"],
    stack: ["AWS", "Kubernetes", "Terraform", "OpenTofu", "GitLab CI", "GitHub Actions"],
    icon: "cloud",
  },
  {
    id: "consultation",
    title: "Consultation and technical review",
    summary:
      "A second pair of senior eyes before a costly decision: architecture reviews, code audits, and roadmap advice.",
    includes: ["Architecture and code review", "Roadmap and trade-off advice", "Thesis and capstone consultation", "Short advisory sprints"],
    stack: ["Written report", "Call or chat", "Hourly or per sprint"],
    icon: "compass",
  },
];

// Described by kind only. No product, client, or app names anywhere.
export const work: WorkItem[] = [
  {
    id: "home-care-platform",
    kind: "Operations platform for home care agencies",
    industry: "Healthcare, United States",
    challenge:
      "Agencies across several states needed one system for clients, caregivers, and signed paperwork, with patient data protected throughout.",
    approach:
      "A Python API and React portal on AWS, all infrastructure as code, pipelines with security scans, nightly automated tests, and monitoring that scrubs patient data.",
    results: ["12 agencies", "5 US states", "3 cloud accounts"],
  },
  {
    id: "workforce-monitoring",
    kind: "Live workforce monitoring app",
    industry: "Remote staffing",
    challenge:
      "Managers of remote staff needed to see who was working right now and how productive each shift was, without guessing.",
    approach:
      "A React and TypeScript app with a Node.js API: live screen viewing, idle detection, and AI productivity reports that classify shift screenshots. Every admin view is audit-logged.",
    results: ["340+ automated tests", "live in production"],
  },
  {
    id: "uptime-dashboard",
    kind: "Executive uptime and delivery dashboard",
    industry: "Internal tooling",
    challenge:
      "Leadership had no single view of whether every site was up or how each project was moving.",
    approach:
      "A scheduled serverless job checks every site and pulls project progress from the ticket tracker, and a static page shows uptime and delivery on one screen.",
    results: ["27 endpoints checked", "5-minute refresh"],
  },
  {
    id: "spend-dashboard",
    kind: "Cloud and software spend dashboard",
    industry: "Finance operations",
    challenge:
      "Spend was spread across three cloud accounts and fourteen software vendors, with no view of what each product cost against budget.",
    approach:
      "A daily job reads cloud billing and budgets, splits cost per product by tag, and a protected static page adds budget meters and subscription costs.",
    results: ["3 cloud accounts", "14 vendors", "daily refresh"],
  },
  {
    id: "self-service-cloud",
    kind: "Self-service cloud platform for application teams",
    industry: "IT services",
    challenge:
      "Onboarding new projects and provisioning cloud resources was slow, and deployments differed from one environment to the next.",
    approach:
      "An internal developer platform for self-service provisioning, backed by reusable infrastructure modules for ten-plus cloud services.",
    results: ["onboarding -60%", "provisioning -65%"],
  },
  {
    id: "gitops-delivery",
    kind: "GitOps delivery with observability built in",
    industry: "Enterprise platforms",
    challenge:
      "Workloads on two clouds needed faster, safer releases and an alert-driven view of production health.",
    approach:
      "Infrastructure as code, Kubernetes with autoscaling and GitOps delivery, and a metrics and alerting setup with on-call escalation.",
    results: ["40% faster deploys", "99.99% availability"],
  },
];

export const process: ProcessStep[] = [
  {
    title: "Discovery and planning",
    body: "We start with your goals, your users, the constraints, and what you have already tried, so the scope is grounded in real requirements.",
    deliverable: "Scope and timeline",
  },
  {
    title: "Design and architecture",
    body: "Screens and system structure are shaped together so the product feels coherent and the build has no surprises.",
    deliverable: "Design and system plan",
  },
  {
    title: "Build",
    body: "The product is built in milestones with modern tooling and plain-language progress updates you can act on.",
    deliverable: "Working milestones",
  },
  {
    title: "Testing and QA",
    body: "Every release is checked for correctness, resilience, and polish before it gets near real users or a panel.",
    deliverable: "Tested release",
  },
  {
    title: "Launch and support",
    body: "Launch is part of the job: deployment, monitoring, handover, and a support window so it holds up after release.",
    deliverable: "Live system and support",
  },
];

export const packages: Package[] = [
  {
    id: "website",
    name: "Website build",
    tagline: "For a business site, landing page, or portfolio that needs to look right and load fast.",
    meta: ["2 to 4 weeks", "30 days support"],
    includes: ["Responsive design on every screen", "Content, forms, and SEO basics", "Hosting setup and launch"],
    cta: "Scope a website",
  },
  {
    id: "app",
    name: "App or system build",
    tagline: "For a mobile app, web application, or custom system with ownership from concept to release.",
    meta: ["4 to 10 weeks", "30 days support"],
    includes: ["Clear scope and milestones", "Design-sensitive implementation", "Deployment and monitoring included"],
    cta: "Scope a build",
    featured: true,
  },
  {
    id: "capstone",
    name: "Capstone and thesis package",
    tagline: "For students who need a working system, documentation that matches it, and a confident defense.",
    meta: ["Fits your school calendar", "Revisions until panel approval"],
    includes: ["System build with full source code", "Documentation and diagram support", "Defense prep and panel revisions"],
    cta: "Ask about capstone",
  },
  {
    id: "support",
    name: "Support and advisory",
    tagline: "For teams that need senior capacity, a review before a big decision, or ongoing maintenance.",
    meta: ["Monthly or hourly", "Report included"],
    includes: ["Architecture and code review", "Maintenance and new features", "Direct access, fast feedback"],
    cta: "Discuss capacity",
  },
];

export const pricingNote =
  "Pricing is quoted after a short call, based on scope. Projects run on a deposit, milestone payments, and a final payment on handover.";

export const founder = {
  eyebrow: "Who you work with",
  name: "Christian Josef Aquino",
  role: "Founder and lead engineer",
  bio: "Senior DevOps engineer with 7+ years building and running production systems on AWS, Google Cloud, and Azure for healthcare, enterprise, and telecom platforms. Christian leads every Karakoa project and stays hands-on in the code.",
  note: "Projects stay founder-led, with design, QA, and documentation specialists brought in only when the brief calls for it.",
  links: [
    { label: "christianaquino.dev", href: "https://christianaquino.dev", icon: "globe" as IconName },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/cjosefaquino/", icon: "linkedin" as IconName },
    { label: "GitHub", href: SITE.githubUrl, icon: "github" as IconName },
  ],
  skills: ["AWS", "Kubernetes", "Terraform", "React", "Node.js", "Python", "Django", "TypeScript", "React Native", "Claude"],
};

export const faq: FaqGroup[] = [
  {
    group: "General",
    items: [
      {
        q: "What do you build?",
        a: "Websites, mobile apps, web applications, e-commerce stores, AI and automation tools, and the cloud setup underneath them. We also build capstone and thesis systems for students, with consultation included.",
      },
      {
        q: "How long does a project take?",
        a: "A website usually takes 2 to 4 weeks, an app or system 4 to 10 weeks, and a larger platform longer. Timelines are confirmed after the first call so they match the real scope.",
      },
      {
        q: "Do you provide support after launch?",
        a: "Yes. Every build includes a support window for bug fixes. After that you can keep us on monthly for maintenance, performance work, and new features.",
      },
    ],
  },
  {
    group: "Students",
    items: [
      {
        q: "Do you help with the documentation and the defense?",
        a: "Yes. We help with the system design chapters, diagrams, and screenshots so the paper matches the system, and we walk you through the system before your defense so you can present it with confidence.",
      },
      {
        q: "Do we get the source code?",
        a: "Yes. You receive the full source code, the database, and setup instructions on handover. It is your system.",
      },
      {
        q: "What if the panel asks for changes?",
        a: "Revisions from panel feedback are part of the capstone package. Tell us what the panel asked for and we work through the changes with you.",
      },
      {
        q: "When should we reach out?",
        a: "As early as you can, ideally at the proposal stage. Starting early keeps the timeline comfortable and gives us room for panel revisions before your deadline.",
      },
    ],
  },
  {
    group: "Process and payment",
    items: [
      {
        q: "How do you scope and price a project?",
        a: "We talk first, agree on the scope, then send a fixed quote with milestones. Pricing depends on what is being built, not on a rate card, so it is quoted after the call.",
      },
      {
        q: "How does payment work?",
        a: "A deposit to start, milestone payments as parts are delivered, and a final payment on handover. Terms are written down before any work begins.",
      },
      {
        q: "Can you work with our existing team?",
        a: "Yes. We can plug into your sprints, your repo, and your review process, or take a scoped piece of work end to end.",
      },
    ],
  },
  {
    group: "Technical",
    items: [
      {
        q: "What technologies do you use?",
        a: "Typically React, Next.js, Astro, React Native with Expo, Node.js, Django, PostgreSQL, and AWS or Cloudflare for hosting. For student systems we work with whatever your course requires, including PHP and MySQL.",
      },
      {
        q: "Do you handle app store submission?",
        a: "Yes. App Store and Play Store submission, screenshots, and listing copy can be part of a mobile app build.",
      },
      {
        q: "How do you keep the code quality high?",
        a: "Code review, automated tests, deployment pipelines, and documentation on every build, so the system still feels solid long after launch and another developer can pick it up.",
      },
    ],
  },
];

export const hours = "Mon to Fri, 2:00 PM to 9:00 PM, Philippine time (GMT+8)";

// A channel with an empty value is not rendered. Messenger stays hidden
// until the Facebook Page exists; set its value and href to show it.
export const channels: Channel[] = [
  {
    id: "email",
    label: "Email",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    icon: "mail",
    external: false,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    value: SITE.phoneDisplay,
    href: `https://wa.me/${SITE.phoneDigits}`,
    icon: "whatsapp",
    external: true,
  },
  {
    id: "viber",
    label: "Viber",
    value: SITE.phoneDisplay,
    href: `viber://chat?number=%2B${SITE.phoneDigits}`,
    icon: "viber",
    external: false,
    note: "opens the Viber app",
  },
  {
    id: "calendly",
    label: "Book a call",
    value: "30 minutes on Calendly",
    href: "https://calendly.com/chrstnjsff/30min",
    icon: "calendar",
    external: true,
    note: hours,
  },
  {
    id: "messenger",
    label: "Messenger",
    value: "",
    href: "",
    icon: "messenger",
    external: true,
  },
];

export const calendlyUrl = channels.find((c) => c.id === "calendly")!.href;

export const contact = {
  eyebrow: "Start a project",
  title: "Tell us what you are building",
  lede: "Share the product, the deadline, and what is blocking you. You get a reply within one working day with a recommended way to start.",
  formTitle: "Send the details",
  services: ["Website", "Mobile app", "Capstone or thesis system", "Custom software", "E-commerce", "AI or automation", "Cloud or DevOps", "Consultation", "Not sure yet"],
  scales: [
    "Small (landing page, single feature, or MVP)",
    "Medium (full website or application)",
    "Large (platform or multi-part system)",
    "Ongoing (support or retainer)",
    "Not sure yet, help me figure it out",
  ],
};

export const footer = {
  line: "Founder-led software studio in the Philippines: websites, mobile apps, custom systems, and capstone projects.",
  links: [
    { href: "/privacy/", label: "Privacy" },
    { href: "https://christianaquino.dev", label: "Founder portfolio", external: true },
  ],
};
