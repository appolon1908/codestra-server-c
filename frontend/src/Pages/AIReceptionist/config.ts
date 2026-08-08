export type PricingPlan = {
  name: string;
  monthlyPrice: string;
  includedMinutes: string;
  additionalMinuteRate: string;
  receptionists: string;
  concurrentCalls: string;
  languages: string;
  integrations: string;
  analytics: string;
  support: string;
  cta: string;
};

export const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    monthlyPrice: "Configured quote",
    includedMinutes: "Configurable",
    additionalMinuteRate: "Configurable",
    receptionists: "1",
    concurrentCalls: "Configured",
    languages: "English and Spanish",
    integrations: "Calendar",
    analytics: "Core outcomes",
    support: "Business hours",
    cta: "Start",
  },
  {
    name: "Professional",
    monthlyPrice: "Configured quote",
    includedMinutes: "Configurable",
    additionalMinuteRate: "Configurable",
    receptionists: "Multiple",
    concurrentCalls: "Configured",
    languages: "Four languages",
    integrations: "Odoo, calendar, automation",
    analytics: "Advanced",
    support: "Priority",
    cta: "Choose Professional",
  },
  {
    name: "Call Center",
    monthlyPrice: "Contact sales",
    includedMinutes: "Volume-based",
    additionalMinuteRate: "Volume-based",
    receptionists: "Campaign-based",
    concurrentCalls: "High volume",
    languages: "Four languages",
    integrations: "Odoo, VICIdial, n8n",
    analytics: "Campaign analytics",
    support: "Implementation team",
    cta: "Contact Sales",
  },
  {
    name: "Enterprise",
    monthlyPrice: "Custom",
    includedMinutes: "Custom",
    additionalMinuteRate: "Custom",
    receptionists: "Custom",
    concurrentCalls: "Custom",
    languages: "Configured",
    integrations: "Custom approved integrations",
    analytics: "Custom reporting",
    support: "Dedicated",
    cta: "Request a Quote",
  },
];

export type IndustrySolution = {
  id: string;
  label: string;
  headline: string;
  description: string;
  intake: string[];
  actions: string[];
  routing: string[];
};

export const industrySolutions: IndustrySolution[] = [
  {
    id: "transportation",
    label: "Transportation and logistics",
    headline: "Keep freight and customer conversations moving",
    description:
      "Capture quote requests, schedule pickups, identify customers or carriers, and route calls to the right office or terminal.",
    intake: ["Origin and destination", "Shipment type", "Pickup timing"],
    actions: [
      "Create shipping inquiry",
      "Schedule callback",
      "Confirm contact details",
    ],
    routing: ["Office or terminal", "Customer or carrier", "Urgent operations"],
  },
  {
    id: "healthcare",
    label: "Healthcare and senior products",
    headline: "A calmer first response for every caller",
    description:
      "Handle approved general questions and scheduling while escalating clinical or sensitive conversations to trained employees.",
    intake: [
      "Reason for calling",
      "Preferred appointment time",
      "Existing or new customer",
    ],
    actions: ["Schedule request", "Send confirmation", "Escalate safely"],
    routing: ["Scheduling", "Product support", "Human escalation"],
  },
  {
    id: "professional",
    label: "Professional services",
    headline: "Qualify new inquiries without interrupting billable work",
    description:
      "Collect the essentials, answer approved service questions, and schedule the right consultation.",
    intake: ["Service needed", "Company size", "Preferred meeting time"],
    actions: ["Qualify inquiry", "Book consultation", "Create Odoo lead"],
    routing: ["Sales", "Existing client support", "Specialist"],
  },
  {
    id: "real-estate",
    label: "Real estate",
    headline: "Respond while buyer and seller interest is highest",
    description:
      "Capture property interest, preferred locations, budgets, and viewing requests before routing to the right agent.",
    intake: ["Buy, sell, or rent", "Location", "Timeline"],
    actions: [
      "Capture property criteria",
      "Request viewing",
      "Create follow-up",
    ],
    routing: ["Listing agent", "Buyer team", "Property management"],
  },
  {
    id: "retail",
    label: "Retail and e-commerce",
    headline: "Answer product and order questions around the clock",
    description:
      "Use approved catalog and policy content to answer common questions and route exceptions to your team.",
    intake: [
      "Order or product inquiry",
      "Order reference",
      "Preferred resolution",
    ],
    actions: [
      "Answer approved FAQ",
      "Capture support request",
      "Send follow-up",
    ],
    routing: ["Sales", "Order support", "Returns team"],
  },
  {
    id: "call-centers",
    label: "Call centers",
    headline: "Add intelligent coverage to every campaign",
    description:
      "Support campaign greetings, lead qualification, overflow, after-hours response, closer transfers, and approved automation.",
    intake: ["Campaign source", "Qualification answers", "Callback preference"],
    actions: ["Sync Odoo lead", "Sync VICIdial call", "Trigger n8n workflow"],
    routing: ["Campaign closer", "Overflow queue", "After-hours team"],
  },
];

export const faqItems = [
  [
    "What is an AI receptionist?",
    "It is a voice and messaging assistant configured to answer approved questions, capture information, schedule appointments, and route conversations.",
  ],
  [
    "How is it different from a traditional IVR?",
    "Instead of requiring callers to navigate fixed menus, it can understand natural requests while staying inside configured business rules.",
  ],
  [
    "Can I keep my existing phone number?",
    "In many setups, yes. Number porting or forwarding depends on your carrier and technical configuration.",
  ],
  [
    "Which languages are supported?",
    "The planned language set is English, Spanish, and French. Final language activation is confirmed during implementation.",
  ],
  [
    "Can the AI switch languages during a call?",
    "It can be configured to detect and switch supported languages when that behavior is approved and tested.",
  ],
  [
    "Can it schedule and reschedule appointments?",
    "Yes, through an approved calendar connection and defined availability and cancellation rules.",
  ],
  [
    "Can it transfer callers to employees?",
    "Yes. Transfers can use department, employee, location, language, campaign, intent, availability, or urgency rules.",
  ],
  [
    "What happens when it cannot answer a question?",
    "It can capture the question, offer a callback, send the conversation context, or transfer to an employee.",
  ],
  [
    "Does it integrate with Odoo, VICIdial, and n8n?",
    "These integrations are supported or planned depending on your environment. Each is confirmed, mapped, and tested before activation.",
  ],
  [
    "Are calls recorded and transcribed?",
    "Recording and transcription are configurable. Consent messages and retention settings must be approved for your business and jurisdiction.",
  ],
  [
    "How is customer information protected?",
    "The solution supports encrypted connections, restricted access, secret management, rate limits, audit history, and configurable retention.",
  ],
  [
    "How long does setup take?",
    "Timing depends on call flows, integrations, languages, and testing requirements. A specialist provides a scoped implementation plan.",
  ],
  [
    "How does pricing work?",
    "Pricing is configured around call volume, concurrency, languages, integrations, analytics, and support requirements.",
  ],
  [
    "Can the system be tested before activation?",
    "Yes. Calls, transfers, scheduling, CRM updates, fallbacks, and escalation paths should be tested in staging before live activation.",
  ],
] as const;
