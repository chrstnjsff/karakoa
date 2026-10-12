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
  /** URL segment under /services/. */
  slug: string;
  title: string;
  /** Page title for the service page, under 60 characters. */
  seoTitle: string;
  /** Meta description for the service page, 120 to 160 characters. */
  seoDescription: string;
  /** H1 on the service page. */
  heading: string;
  summary: string;
  /** Opening paragraphs on the service page. */
  intro: string[];
  includes: string[];
  stack: string[];
  /** Kinds of systems, never client or product names. */
  examples: string[];
  faq: { q: string; a: string }[];
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

export type ChannelId = "email" | "calendly" | "messenger";

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
  tagline: "Websites, mobile apps, and custom systems, built in the Philippines and shipped on time.",
  description:
    "Founder-led software studio in Metro Manila. Websites, mobile apps, custom software, and capstone or thesis systems for Philippine businesses and students.",
  email: "chrstnjsff@gmail.com",
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

/** Full pages, linked from the footer and the About card. */
export const PAGES: NavItem[] = [
  { href: "/guides/", label: "Guides" },
  { href: "/about/", label: "About" },
];

export const hero = {
  eyebrow: "Founder-led software studio, Metro Manila, Philippines",
  title: SITE.tagline,
  lede: "Karakoa is a software development company in the Philippines. We design and build websites, mobile apps, and custom systems for businesses, startups, and students with a capstone or thesis to defend.",
  primary: { href: "#contact", label: "Start a project" },
  secondary: { href: "#work", label: "See systems we have built" },
  statsNote: "Figures from production systems the founder has built and operated.",
};

// Real figures from the founder's production work; nothing estimated.
export const stats: Stat[] = [
  { value: "7+", label: "years building and running production systems" },
  { value: "99.95%", label: "uptime on platforms we operate" },
  { value: "3.6M+", label: "users served by platforms we have run" },
  { value: "12", label: "agencies in 5 US states on one platform we built" },
];

// Facts checked against Alcina's Historia de las islas e indios de Bisayas
// (1668) as summarised on Wikipedia's Karakoa article, 2026-10-12.
export const heritage = {
  eyebrow: "The name",
  title: "What a karakoa is, and why we named the studio after it",
  intro:
    "The karakoa was the great outrigger warship of the precolonial Visayans and Kapampangans. Spanish chroniclers in the 1600s recorded ships that reached 12 to 15 knots, carried a hundred or more rowers and warriors, and could be built by local shipwrights without a single nail. It is the boat on our mascot, and it is the standard we hold the work to.",
  facts: [
    {
      fact: "Planks were joined with wooden dowels and fiber lashings, never nails, so the hull flexed and absorbed collisions that would shatter a rigid one.",
      lesson: "We build systems the same way: clear parts, well joined, able to take change without breaking.",
    },
    {
      fact: "Its sleek crescent hull and double outriggers made it faster than any other balangay, with estimated speeds of 12 to 15 knots.",
      lesson: "Speed comes from the design. Our sites and apps are fast because they are built lean, not because corners were cut.",
    },
    {
      fact: "Bow and stern were identical, so the crew could reverse direction by turning around in their seats.",
      lesson: "We keep decisions reversible: small milestones, version control, and infrastructure you can roll back.",
    },
    {
      fact: "Rowers kept rhythm to chants below while the warriors stood on the raised burulan platform above, each crew with a clear job.",
      lesson: "One founder steers every project, and design, QA, and documentation specialists join only when the brief calls for them.",
    },
  ],
  sources: "Sources: Francisco Ignacio Alcina, Historia de las islas e indios de Bisayas (1668); Wikipedia, Karakoa.",
};

export const about = {
  eyebrow: "Why Karakoa",
  title: "Founder-led, built to ship",
  body: "One senior engineer owns your project from the first call to launch, with design, QA, and documentation help brought in when the brief needs it. Scope is written down first, progress is reported in plain language, and every build ships with deployment, monitoring, and a clean handover.",
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
    slug: "website-development-philippines",
    title: "Website design and development",
    seoTitle: "Website Design and Development, Philippines | Karakoa",
    seoDescription:
      "Responsive, fast, SEO-ready websites for Philippine businesses: landing pages, company sites, portfolios, and dashboards, designed and built by a senior engineer.",
    heading: "Website design and development in the Philippines",
    summary:
      "Fast, responsive, modern websites that look right on every screen and are ready for search engines from day one.",
    intro: [
      "Karakoa designs and builds websites for businesses, startups, and professionals in the Philippines that need to look credible and load fast. Every site is responsive on phones, tablets, and desktops, set up for search engines from the first deploy, and hosted on infrastructure that stays up.",
      "We write the structure and copy with you, design the pages around your real content, and launch on your own domain with analytics, a contact form, and the technical SEO basics done.",
    ],
    includes: ["Responsive design", "SEO and performance", "Content and forms", "Hosting and launch"],
    stack: ["Astro", "Next.js", "Tailwind CSS", "TypeScript", "Cloudflare"],
    examples: ["Company and service websites", "Landing pages for campaigns", "Portfolios and personal brands", "Admin dashboards and client portals"],
    faq: [
      {
        q: "How long does a website take?",
        a: "A landing page or small business site usually takes 2 to 4 weeks from the first call to launch. Larger sites with many pages or a portal take longer, and the timeline is confirmed after the first call.",
      },
      {
        q: "Do you handle the domain and hosting?",
        a: "Yes. We register or connect your domain, set up hosting, SSL, email forwarding if you need it, and hand you the credentials. The site stays in your name.",
      },
      {
        q: "Can I update the content myself?",
        a: "Yes. Depending on the site we either set up a simple content system you can edit, or keep the content in plain files and include a short guide on how to change text and images.",
      },
    ],
    icon: "web",
  },
  {
    id: "mobile-apps",
    slug: "mobile-app-development-philippines",
    title: "Mobile app development",
    seoTitle: "Mobile App Development Company, Philippines | Karakoa",
    seoDescription:
      "iOS and Android apps from one codebase for Philippine businesses and startups: backend, push notifications, payments, and store submission included.",
    heading: "Mobile app development in the Philippines",
    summary:
      "iOS and Android apps from one codebase, with the backend, push notifications, and store submission handled.",
    intro: [
      "Karakoa builds mobile apps for Philippine businesses and startups that need to reach customers on iOS and Android without paying for two separate builds. We use React Native with Expo, so one codebase ships to both stores and stays maintainable.",
      "The build covers the app, the backend it talks to, sign-in, payments, push notifications, and the App Store and Play Store submissions, so you launch with a working product and not just a prototype.",
    ],
    includes: ["iOS and Android", "Push notifications", "Payments and sign-in", "App Store and Play Store submission"],
    stack: ["React Native", "Expo", "TypeScript", "Supabase", "Firebase"],
    examples: ["Customer apps for shops and services", "Booking and reservation apps", "Delivery and ordering apps", "Internal apps for field staff"],
    faq: [
      {
        q: "How long does a mobile app take?",
        a: "A focused first version usually takes 6 to 10 weeks. Apps with many roles, offline use, or complex payments take longer. We confirm the timeline after scoping the screens together.",
      },
      {
        q: "Do you publish the app under my account?",
        a: "Yes. The app is published under your own Apple Developer and Google Play accounts, so you own the listing, the reviews, and the updates.",
      },
      {
        q: "What happens after launch?",
        a: "Every build includes a support window for bug fixes. After that you can keep us on monthly for updates, new features, and keeping the app compatible with new iOS and Android versions.",
      },
    ],
    icon: "mobile",
  },
  {
    id: "capstone",
    slug: "capstone-thesis-system",
    title: "Capstone and thesis systems with consultation",
    seoTitle: "Capstone and Thesis System Developer, Philippines | Karakoa",
    seoDescription:
      "Working capstone and thesis systems for IT, CS, and IS students in the Philippines, with consultation, documentation support, source code, and defense prep.",
    heading: "Capstone and thesis system development with consultation, Philippines",
    summary:
      "A working system for your capstone or thesis, built with you, plus the documentation support and defense prep to get it approved.",
    intro: [
      "Karakoa builds working capstone and thesis systems for IT, CS, and IS students in the Philippines, from proposal to defense. You get the full source code, documentation that matches the system, and a walkthrough before your panel.",
      "This is for BSIT, BSCS, BSIS, and ACT students, solo or in a group, at the proposal, pre-oral, or final defense stage. We work in the stack your school requires, help you explain every part of the system, and revise after panel feedback until it is approved.",
      "You stay the author of your paper and the presenter of your system. Karakoa consults, builds, and coaches so you understand what you are defending.",
    ],
    includes: [
      "Proposal and system design help",
      "Full system build with source code",
      "Documentation and diagram support",
      "Defense prep and revisions after panel feedback",
    ],
    stack: ["PHP and MySQL", "Java", "Python", "Node.js", "React", "Flutter"],
    examples: [
      "Inventory and point of sale systems",
      "Enrollment, grading, and school portals",
      "Clinic, barangay, and records management",
      "Online ordering and reservation systems",
      "Attendance and monitoring with QR codes",
      "Mobile apps and AI-assisted systems",
    ],
    faq: [
      {
        q: "Can you work from our approved proposal?",
        a: "Yes. Send the approved proposal or the chapters you have, and we build to match it. If the scope needs adjusting to be realistic for your deadline, we tell you before starting.",
      },
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
    icon: "capstone",
  },
  {
    id: "custom-software",
    slug: "custom-software-development-philippines",
    title: "Custom software and web applications",
    seoTitle: "Custom Software Development, Philippines | Karakoa",
    seoDescription:
      "Custom software for Philippine businesses: internal tools, portals, dashboards, SaaS products, and APIs, built by a senior engineer and deployed with monitoring.",
    heading: "Custom software development in the Philippines",
    summary:
      "Internal tools, portals, dashboards, and SaaS products shaped to how your business actually works.",
    intro: [
      "Karakoa builds custom software for businesses in the Philippines that have outgrown spreadsheets and off-the-shelf tools. Internal systems, customer portals, dashboards, and SaaS products are designed around your actual process, not the other way round.",
      "Every build comes with an API-first architecture, a deployment pipeline, monitoring, and documentation, so the system keeps working after launch and another developer can maintain it.",
    ],
    includes: ["Custom architecture", "Admin dashboards and portals", "APIs and integrations", "SaaS and multi-tenant setups"],
    stack: ["React", "Next.js", "Node.js", "Django", "PostgreSQL", "AWS"],
    examples: ["Operations platforms for service businesses", "Workforce and monitoring tools", "Executive dashboards", "Multi-tenant SaaS products"],
    faq: [
      {
        q: "Can you integrate with the tools we already use?",
        a: "Yes. We connect to accounting, messaging, payment, and scheduling tools through their APIs, and we build imports for the spreadsheets you use today.",
      },
      {
        q: "Who owns the code?",
        a: "You do. The repository, the infrastructure accounts, and the documentation are handed over in your name at the end of the project.",
      },
      {
        q: "How do you keep the system running after launch?",
        a: "Every build ships with deployment, monitoring, and alerting. A support window covers bug fixes, and a monthly retainer is available for maintenance and new features.",
      },
    ],
    icon: "software",
  },
  {
    id: "ecommerce",
    slug: "ecommerce-app-development",
    title: "E-commerce and marketplace apps",
    seoTitle: "E-commerce Website and App Development, PH | Karakoa",
    seoDescription:
      "Online stores and marketplace apps for Philippine sellers: storefront, local payments, inventory, orders, and vendor roles, on web and mobile.",
    heading: "E-commerce website and app development in the Philippines",
    summary:
      "Online stores and marketplaces with payments, inventory, and the vendor and customer roles that keep them running.",
    intro: [
      "Karakoa builds online stores and marketplaces for Philippine sellers who need more than a marketplace listing: your own storefront, local payment methods, inventory that stays accurate, and an admin side your staff can run.",
      "Builds range from a single-brand shop on web and mobile to a multi-vendor marketplace with seller onboarding, commissions, and order tracking.",
    ],
    includes: ["Storefront and catalog", "Payments and checkout", "Inventory and orders", "Vendor and multi-user roles"],
    stack: ["Next.js", "React Native", "Shopify API", "Stripe or PayMongo", "PostgreSQL"],
    examples: ["Single-brand online stores", "Multi-vendor marketplaces", "Ordering apps with delivery tracking", "B2B ordering portals"],
    faq: [
      {
        q: "Which payment methods can you support?",
        a: "Cards, GCash, Maya, bank transfer, and cash on delivery through providers such as PayMongo, plus international cards through Stripe where needed.",
      },
      {
        q: "Should I use Shopify or a custom store?",
        a: "Shopify fits most single-brand stores and we build on it when it does. A custom store makes sense for marketplaces, unusual pricing, or deep integration with your own systems. We recommend after the first call.",
      },
      {
        q: "Can the store have a mobile app too?",
        a: "Yes. The same backend can power a web storefront and an iOS and Android app, built from one codebase.",
      },
    ],
    icon: "cart",
  },
  {
    id: "ai-automation",
    slug: "ai-automation",
    title: "AI and automation",
    seoTitle: "AI and Automation Development, Philippines | Karakoa",
    seoDescription:
      "Chatbots, AI assistants, agent workflows, and business process automation for Philippine companies, built on current models and deployed with monitoring.",
    heading: "AI and automation development in the Philippines",
    summary:
      "Chatbots, assistants, and workflow automation that take repetitive work off your team, built on current AI models.",
    intro: [
      "Karakoa builds AI features and automation for businesses in the Philippines that want to cut repetitive work: customer chatbots, internal assistants that answer from your documents, agents that run multi-step tasks, and pipelines that classify, extract, and route data.",
      "We build on current models from Anthropic, OpenAI, and Google, pick the one that fits the job and the budget, and deploy with logging and guardrails so the system behaves in production.",
    ],
    includes: ["Chatbots and assistants", "Agent workflows with tool use", "Document and data processing", "Business process automation"],
    stack: ["Claude", "OpenAI", "Gemini", "Amazon Bedrock", "Python", "TypeScript"],
    examples: ["Customer support chatbots", "Document extraction and classification", "AI reports from screenshots or logs", "Lead qualification and follow-up automation"],
    faq: [
      {
        q: "Will the AI see our private data?",
        a: "Only what the feature needs, and we choose providers and regions with data handling that fits your requirements. Sensitive fields can be masked before anything leaves your system.",
      },
      {
        q: "How do you keep AI output reliable?",
        a: "Structured outputs, validation, retries, and logging of every call, plus human review steps where a wrong answer would be costly.",
      },
      {
        q: "What does an AI project cost to run?",
        a: "Model usage is billed per request by the provider. We estimate the monthly cost from your expected volume before building and design the system to keep it predictable.",
      },
    ],
    icon: "sparkles",
  },
  {
    id: "cloud-devops",
    slug: "cloud-devops",
    title: "Cloud, DevOps and hosting",
    seoTitle: "Cloud and DevOps Services, Philippines | Karakoa",
    seoDescription:
      "Cloud setup, CI/CD pipelines, monitoring, security hardening, and cost control on AWS, Google Cloud, and Azure for Philippine companies, by a senior DevOps engineer.",
    heading: "Cloud and DevOps services in the Philippines",
    summary:
      "Deployment, pipelines, monitoring, and cost control for the systems we build and the ones you already run.",
    intro: [
      "Karakoa is led by a senior DevOps engineer with 7+ years running production systems on AWS, Google Cloud, and Azure. We set up cloud environments, deployment pipelines, monitoring, and backups for the systems we build and for the ones you already run.",
      "Typical work includes moving a system to the cloud, automating deployments with CI/CD, adding monitoring and alerting, hardening security, and cutting cloud bills by rightsizing and tagging.",
    ],
    includes: ["Cloud setup on AWS, GCP, or Azure", "CI/CD pipelines", "Monitoring and alerting", "Security hardening and cost control"],
    stack: ["AWS", "Kubernetes", "Terraform", "OpenTofu", "GitLab CI", "GitHub Actions"],
    examples: ["Infrastructure as code for whole environments", "Zero-downtime deployment pipelines", "Uptime and cost dashboards", "Kubernetes operations and upgrades"],
    faq: [
      {
        q: "Can you take over infrastructure someone else built?",
        a: "Yes. We start with an audit of what exists, document it, put it under version control, and then improve it in small, reversible steps.",
      },
      {
        q: "Do you offer ongoing operations?",
        a: "Yes. A monthly retainer covers monitoring, patching, incident response during our hours, and planned improvements.",
      },
      {
        q: "Can you reduce our cloud bill?",
        a: "Usually. We tag resources, find idle and oversized services, add budgets and alerts, and report the savings each month.",
      },
    ],
    icon: "cloud",
  },
  {
    id: "consultation",
    slug: "consultation",
    title: "Consultation and technical review",
    seoTitle: "Software Consultation and Code Review | Karakoa",
    seoDescription:
      "Architecture reviews, code audits, roadmap advice, and thesis or capstone consultation from a senior engineer in the Philippines, hourly or per sprint.",
    heading: "Software consultation and technical review",
    summary:
      "A second pair of senior eyes before a costly decision: architecture reviews, code audits, and roadmap advice.",
    intro: [
      "Karakoa offers short, high-leverage consultations for teams and students who need a senior opinion before committing: an architecture review before a build, a code audit before a launch, a roadmap check before hiring, or a capstone consultation before the proposal is due.",
      "Engagements are hourly or per sprint and end with a written report you can act on, whether or not you continue with us.",
    ],
    includes: ["Architecture and code review", "Roadmap and trade-off advice", "Thesis and capstone consultation", "Short advisory sprints"],
    stack: ["Written report", "Call or chat", "Hourly or per sprint"],
    examples: ["Pre-launch code and security audit", "Stack and architecture decision for a new product", "Capstone proposal and system design review", "Cloud cost and reliability review"],
    faq: [
      {
        q: "What do I get at the end?",
        a: "A written report with findings, prioritized recommendations, and the trade-offs, plus a call to walk through it.",
      },
      {
        q: "Do you need access to our code?",
        a: "For a code audit, yes, read-only access to the repository and, if relevant, the infrastructure. For architecture or roadmap advice, documents and a call are enough.",
      },
      {
        q: "Can a consultation turn into a build?",
        a: "Yes, and the review usually shortens the build because the scope is already clear. There is no obligation either way.",
      },
    ],
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
  photoAlt: "Christian Josef Aquino seated at a marble table, hands folded, with pine trees and hills behind him.",
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
// No phone number is published anywhere on the site, by the owner's choice.
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

export const aboutPage = {
  seoTitle: "About Karakoa and the founder | Karakoa",
  seoDescription:
    "Karakoa is a founder-led software studio in Metro Manila, Philippines, run by senior DevOps engineer Christian Josef Aquino. How we work and what we build.",
  heading: "About Karakoa",
  intro:
    "Karakoa is a founder-led software development studio in Metro Manila, Philippines. We build websites, mobile apps, custom systems, and capstone or thesis systems, and we run the cloud infrastructure underneath them.",
  nameStory:
    "The karakoa was the great outrigger warship of the precolonial Visayans and Kapampangans: built without nails so the hull could flex, double-ended so it could reverse in a moment, and fast enough that Spanish chroniclers recorded 12 to 15 knots. The mascot on this site is one, and the name is the standard we hold the work to. Build it well, keep it fast, and ship it.",
  howWeWork: [
    "One senior engineer owns your project from the first call to launch. Design, QA, and documentation specialists join only when the brief needs them.",
    "Scope is written down before work starts, with milestones and a fixed quote. You see progress in plain language, not tickets.",
    "Every build ships with deployment, monitoring, and a clean handover, so the system keeps working after launch and someone else can maintain it.",
    "Students get the same engineering standard, plus help with the documentation and the defense. You stay the author and the presenter.",
  ],
  certifications: ["HashiCorp Certified Terraform Associate", "AWS Certified Cloud Practitioner"],
};

export const footer = {
  line: "Founder-led software development studio in Metro Manila, Philippines: websites, mobile apps, custom systems, and capstone projects.",
  links: [
    { href: "/guides/", label: "Guides" },
    { href: "/about/", label: "About" },
    { href: "/privacy/", label: "Privacy" },
    { href: "https://christianaquino.dev", label: "Founder portfolio", external: true },
  ],
};
