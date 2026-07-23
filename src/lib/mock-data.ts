import { Lead, Proposal, Agent, Notification, CRMCompany, ActivityLog, AnalyticsData } from './types'

export const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Global Opportunity Hunter',
    type: 'opportunity_hunter',
    status: 'scanning',
    lastActive: new Date(Date.now() - 30000).toISOString(),
    tasksCompleted: 1247,
    currentTask: 'Scanning LinkedIn & Indeed for React developer positions...',
    uptime: 99.7,
    efficiency: 94.2,
    description: 'Continuously searches worldwide job boards, platforms, and websites for new opportunities across all IT and business categories.',
    icon: '🌐'
  },
  {
    id: 'agent-2',
    name: 'Lead Analyzer',
    type: 'lead_analyzer',
    status: 'analyzing',
    lastActive: new Date(Date.now() - 15000).toISOString(),
    tasksCompleted: 892,
    currentTask: 'Analyzing budget & success probability for lead #3847...',
    uptime: 99.9,
    efficiency: 97.1,
    description: 'Deep analyzes each discovered lead to extract client details, assess viability, calculate success probability, and determine expected revenue.',
    icon: '🔍'
  },
  {
    id: 'agent-3',
    name: 'Proposal Generator',
    type: 'proposal_generator',
    status: 'generating',
    lastActive: new Date(Date.now() - 45000).toISOString(),
    tasksCompleted: 634,
    currentTask: 'Generating proposal for E-Commerce Platform Redesign...',
    uptime: 99.5,
    efficiency: 92.8,
    description: 'Creates customized, professional proposals with technical plans, timelines, cost estimates, and compelling cover letters for each qualified lead.',
    icon: '📝'
  }
]

export const mockLeads: Lead[] = [
  {
    id: 'lead-001',
    title: 'E-Commerce Platform Redesign',
    description: 'Looking for a team to completely redesign our e-commerce platform with modern UI/UX, improved performance, and mobile-first approach. Must include payment gateway integration, inventory management, and analytics dashboard.',
    clientName: 'Sarah Mitchell',
    company: 'TechRetail Inc.',
    email: 'sarah.mitchell@techretail.com',
    phone: '+1-555-0123',
    country: 'United States',
    budget: { min: 25000, max: 45000 },
    deadline: '2026-10-15',
    technologies: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Stripe'],
    skills: ['Full Stack Development', 'UI/UX Design', 'E-Commerce', 'Payment Integration'],
    platform: 'LinkedIn',
    jobType: 'contract',
    status: 'qualified',
    urgency: 'high',
    difficulty: 65,
    successProbability: 78,
    riskLevel: 'low',
    expectedRevenue: 35000,
    competition: 12,
    projectSize: 'large',
    paymentMethod: 'Escrow',
    clientHistory: 'Verified company, 5 years in business, 200+ employees',
    url: 'https://linkedin.com/jobs/example',
    foundAt: new Date(Date.now() - 86400000).toISOString(),
    analyzedAt: new Date(Date.now() - 43200000).toISOString(),
    notes: 'High priority client. They mentioned budget flexibility for the right team.',
    tags: ['e-commerce', 'react', 'enterprise', 'high-budget']
  },
  {
    id: 'lead-002',
    title: 'AI-Powered Customer Support Chatbot',
    description: 'Need an AI chatbot solution for our customer support that can handle queries in multiple languages, integrate with our CRM, and provide intelligent responses using our knowledge base.',
    clientName: 'Marcus Weber',
    company: 'GlobalServ GmbH',
    email: 'm.weber@globalserv.de',
    phone: '+49-30-12345678',
    country: 'Germany',
    budget: { min: 15000, max: 30000 },
    deadline: '2026-11-01',
    technologies: ['Python', 'OpenAI', 'LangChain', 'FastAPI', 'React'],
    skills: ['AI/ML', 'NLP', 'Chatbot Development', 'API Integration'],
    platform: 'Upwork',
    jobType: 'contract',
    status: 'proposal_sent',
    urgency: 'medium',
    difficulty: 55,
    successProbability: 82,
    riskLevel: 'low',
    expectedRevenue: 22000,
    competition: 8,
    projectSize: 'medium',
    paymentMethod: 'Milestone',
    clientHistory: 'Active Upwork client, 95% hire rate, $100k+ spent',
    url: 'https://upwork.com/freelance-jobs/example',
    foundAt: new Date(Date.now() - 172800000).toISOString(),
    analyzedAt: new Date(Date.now() - 86400000).toISOString(),
    proposalId: 'prop-001',
    notes: 'Client is very responsive. Proposal sent with AI demo.',
    tags: ['ai', 'chatbot', 'nlp', 'enterprise']
  },
  {
    id: 'lead-003',
    title: 'Government Digital Services Portal',
    description: 'Federal government tender for building a citizen services portal. Must comply with Section 508 accessibility, FedRAMP security standards, and support 10M+ users.',
    clientName: 'James Rodriguez',
    company: 'US Digital Service',
    email: 'j.rodriguez@usds.gov',
    phone: '+1-202-555-0199',
    country: 'United States',
    budget: { min: 200000, max: 500000 },
    deadline: '2027-03-01',
    technologies: ['React', 'Java Spring', 'AWS', 'Kubernetes', 'PostgreSQL'],
    skills: ['Government Projects', 'Cloud Architecture', 'Security Compliance', 'Large Scale Systems'],
    platform: 'SAM.gov',
    jobType: 'contract',
    status: 'analyzing',
    urgency: 'critical',
    difficulty: 90,
    successProbability: 45,
    riskLevel: 'medium',
    expectedRevenue: 350000,
    competition: 25,
    projectSize: 'enterprise',
    paymentMethod: 'Government Contract',
    clientHistory: 'Federal agency, established procurement process',
    url: 'https://sam.gov/example',
    foundAt: new Date(Date.now() - 259200000).toISOString(),
    analyzedAt: new Date(Date.now() - 172800000).toISOString(),
    notes: 'Requires security clearance. Large contract potential.',
    tags: ['government', 'enterprise', 'high-budget', 'aws']
  },
  {
    id: 'lead-004',
    title: 'Mobile App UI/UX Redesign',
    description: 'We need a complete UI/UX redesign for our fitness tracking mobile app. Looking for modern, clean design with improved user flows and accessibility.',
    clientName: 'Emma Thompson',
    company: 'FitLife Studios',
    email: 'emma@fitlifestudios.com',
    phone: '+44-20-7946-0958',
    country: 'United Kingdom',
    budget: { min: 8000, max: 15000 },
    deadline: '2026-09-30',
    technologies: ['Figma', 'React Native', 'Swift', 'Kotlin'],
    skills: ['UI/UX Design', 'Mobile Design', 'Prototyping', 'User Research'],
    platform: 'Dribbble',
    jobType: 'freelance',
    status: 'new',
    urgency: 'medium',
    difficulty: 35,
    successProbability: 88,
    riskLevel: 'low',
    expectedRevenue: 12000,
    competition: 15,
    projectSize: 'small',
    paymentMethod: 'Bank Transfer',
    clientHistory: 'Startup, seed-funded, looking for long-term design partner',
    url: 'https://dribbble.com/jobs/example',
    foundAt: new Date(Date.now() - 36000000).toISOString(),
    notes: 'Great opportunity for portfolio building. Client values creativity.',
    tags: ['mobile', 'ui-ux', 'design', 'startup']
  },
  {
    id: 'lead-005',
    title: 'QA Automation Framework',
    description: 'Building comprehensive QA automation framework for our SaaS platform. Need end-to-end testing, API testing, performance testing, and CI/CD integration.',
    clientName: 'David Park',
    company: 'CloudScale Solutions',
    email: 'd.park@cloudscale.io',
    phone: '+1-415-555-0167',
    country: 'United States',
    budget: { min: 18000, max: 28000 },
    deadline: '2026-11-15',
    technologies: ['Playwright', 'Jest', 'Cypress', 'GitHub Actions', 'Docker'],
    skills: ['QA Automation', 'CI/CD', 'Testing Strategy', 'Performance Testing'],
    platform: 'Indeed',
    jobType: 'contract',
    status: 'new',
    urgency: 'high',
    difficulty: 50,
    successProbability: 75,
    riskLevel: 'low',
    expectedRevenue: 23000,
    competition: 7,
    projectSize: 'medium',
    paymentMethod: 'Escrow',
    clientHistory: 'Series B startup, 50 engineers, growing fast',
    url: 'https://indeed.com/jobs/example',
    foundAt: new Date(Date.now() - 7200000).toISOString(),
    notes: 'Fast-paced team. Quick turnaround expected.',
    tags: ['qa', 'automation', 'testing', 'ci-cd']
  },
  {
    id: 'lead-006',
    title: 'Database Migration & Optimization',
    description: 'Migrate legacy Oracle database to PostgreSQL, optimize queries, implement proper indexing, and set up monitoring and backup strategies.',
    clientName: 'Anika Patel',
    company: 'FinanceCore Ltd',
    email: 'anika.patel@financecore.com',
    phone: '+91-22-555-0145',
    country: 'India',
    budget: { min: 12000, max: 20000 },
    deadline: '2026-12-01',
    technologies: ['PostgreSQL', 'Oracle', 'Python', 'Docker', 'Grafana'],
    skills: ['Database Administration', 'Data Migration', 'Performance Tuning', 'SQL'],
    platform: 'Freelancer',
    jobType: 'contract',
    status: 'qualified',
    urgency: 'high',
    difficulty: 60,
    successProbability: 80,
    riskLevel: 'low',
    expectedRevenue: 16000,
    competition: 10,
    projectSize: 'medium',
    paymentMethod: 'Milestone',
    clientHistory: 'Established financial services firm, 500+ employees',
    url: 'https://freelancer.com/projects/example',
    foundAt: new Date(Date.now() - 43200000).toISOString(),
    analyzedAt: new Date(Date.now() - 21600000).toISOString(),
    notes: 'Critical migration project. Client is very detail-oriented.',
    tags: ['database', 'postgresql', 'migration', 'finance']
  },
  {
    id: 'lead-007',
    title: 'Sales Dashboard & CRM Integration',
    description: 'Build a comprehensive sales dashboard that integrates with Salesforce and HubSpot. Real-time data visualization, forecasting, and team performance tracking.',
    clientName: 'Michael Chen',
    company: 'Velocity Sales Co',
    email: 'm.chen@velocitysales.com',
    phone: '+1-310-555-0189',
    country: 'United States',
    budget: { min: 20000, max: 35000 },
    deadline: '2026-10-30',
    technologies: ['React', 'D3.js', 'Node.js', 'Salesforce API', 'HubSpot API'],
    skills: ['Data Visualization', 'CRM Integration', 'Sales Analytics', 'Frontend Development'],
    platform: 'Glassdoor',
    jobType: 'contract',
    status: 'new',
    urgency: 'medium',
    difficulty: 55,
    successProbability: 72,
    riskLevel: 'low',
    expectedRevenue: 27500,
    competition: 9,
    projectSize: 'medium',
    paymentMethod: 'Escrow',
    clientHistory: 'Growing sales company, 100+ reps, data-driven culture',
    url: 'https://glassdoor.com/jobs/example',
    foundAt: new Date(Date.now() - 14400000).toISOString(),
    notes: 'Data-heavy project. Client wants impressive visualizations.',
    tags: ['sales', 'dashboard', 'crm', 'data-visualization']
  },
  {
    id: 'lead-008',
    title: 'Telemarketing Automation System',
    description: 'Develop an automated telemarketing system with AI-driven call scripts, lead scoring, call recording analytics, and integration with our existing telephony infrastructure.',
    clientName: 'Roberto Silva',
    company: 'ContactPro Brasil',
    email: 'r.silva@contactpro.com.br',
    phone: '+55-11-5555-0123',
    country: 'Brazil',
    budget: { min: 10000, max: 18000 },
    deadline: '2026-12-15',
    technologies: ['Python', 'Twilio', 'OpenAI', 'FastAPI', 'Vue.js'],
    skills: ['Telephony Integration', 'AI', 'Backend Development', 'Telecom'],
    platform: 'Guru',
    jobType: 'freelance',
    status: 'new',
    urgency: 'low',
    difficulty: 45,
    successProbability: 70,
    riskLevel: 'medium',
    expectedRevenue: 14000,
    competition: 5,
    projectSize: 'small',
    paymentMethod: 'Milestone',
    clientHistory: 'Contact center with 200 agents, expanding operations',
    url: 'https://guru.com/jobs/example',
    foundAt: new Date(Date.now() - 5400000).toISOString(),
    notes: 'Niche market opportunity. Good for telecom portfolio.',
    tags: ['telemarketing', 'automation', 'ai', 'telecom']
  },
  {
    id: 'lead-009',
    title: 'Enterprise Cloud Migration',
    description: 'Complete migration of on-premise infrastructure to AWS cloud. Includes migration of 50+ microservices, database migration, security audit, and DevOps pipeline setup.',
    clientName: 'Jennifer Walsh',
    company: 'DataFort Systems',
    email: 'j.walsh@datafort.com',
    phone: '+1-617-555-0134',
    country: 'United States',
    budget: { min: 150000, max: 300000 },
    deadline: '2027-06-01',
    technologies: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'Jenkins'],
    skills: ['Cloud Architecture', 'DevOps', 'Migration', 'Security'],
    platform: 'Wellfound',
    jobType: 'contract',
    status: 'analyzing',
    urgency: 'critical',
    difficulty: 85,
    successProbability: 55,
    riskLevel: 'medium',
    expectedRevenue: 225000,
    competition: 18,
    projectSize: 'enterprise',
    paymentMethod: 'Net 30',
    clientHistory: 'Fortune 500 company, established vendor relationships',
    url: 'https://wellfound.com/jobs/example',
    foundAt: new Date(Date.now() - 345600000).toISOString(),
    analyzedAt: new Date(Date.now() - 259200000).toISOString(),
    notes: 'Major enterprise deal. Long sales cycle expected.',
    tags: ['cloud', 'aws', 'enterprise', 'devops', 'high-budget']
  },
  {
    id: 'lead-010',
    title: 'Telecommunications Network Monitor',
    description: 'Build a real-time network monitoring dashboard for our telecom infrastructure. Must support 10,000+ nodes, real-time alerts, and predictive maintenance capabilities.',
    clientName: 'Hans Mueller',
    company: 'EuroTel AG',
    email: 'h.mueller@eurotel.de',
    phone: '+49-89-555-0178',
    country: 'Germany',
    budget: { min: 35000, max: 60000 },
    deadline: '2027-01-15',
    technologies: ['React', 'Go', 'Prometheus', 'Grafana', 'Kafka'],
    skills: ['Network Engineering', 'Real-time Systems', 'Data Visualization', 'Telecom'],
    platform: 'Dice',
    jobType: 'contract',
    status: 'new',
    urgency: 'medium',
    difficulty: 70,
    successProbability: 65,
    riskLevel: 'low',
    expectedRevenue: 47500,
    competition: 6,
    projectSize: 'large',
    paymentMethod: 'Bank Transfer',
    clientHistory: 'Major telecom provider, 10,000+ employees',
    url: 'https://dice.com/jobs/example',
    foundAt: new Date(Date.now() - 28800000).toISOString(),
    notes: 'Specialized telecom project. Premium pricing justified.',
    tags: ['telecom', 'monitoring', 'real-time', 'enterprise']
  }
]

export const mockProposals: Proposal[] = [
  {
    id: 'prop-001',
    leadId: 'lead-002',
    title: 'AI-Powered Customer Support Chatbot Solution',
    coverLetter: `Dear Marcus,

Thank you for the opportunity to propose our AI-powered customer support chatbot solution for GlobalServ GmbH. With extensive experience in building enterprise-grade AI solutions, we are confident in delivering a chatbot that will transform your customer support operations.

Our team has successfully delivered 15+ AI chatbot projects for companies across Europe and North America, reducing customer support costs by an average of 40% while improving response times by 300%.

We understand the importance of multilingual support and seamless CRM integration, and our proposed solution addresses both requirements with cutting-edge NLP technology.`,
    introduction: `We are a team of 12 AI engineers and conversational designers specializing in building intelligent customer support systems. Our flagship product has processed over 2 million customer interactions across 8 languages.

Key Differentiators:
- Proven track record with enterprise clients
- Multilingual AI capabilities (12+ languages)
- Seamless CRM integration experience
- 24/7 support and maintenance packages`,
    technicalPlan: `Phase 1: Discovery & Design (2 weeks)
- Requirements analysis and knowledge base mapping
- Conversation flow design
- NLP model selection and training data preparation

Phase 2: Core Development (4 weeks)
- AI engine setup with OpenAI and custom fine-tuning
- Multi-language NLP pipeline
- Knowledge base integration
- Response generation system

Phase 3: Integration (2 weeks)
- CRM integration (Salesforce/HubSpot)
- API development and documentation
- Webhook configuration

Phase 4: Testing & Deployment (2 weeks)
- UAT with your support team
- Performance optimization
- Production deployment
- Monitoring setup`,
    timeline: '10 weeks total delivery',
    costEstimate: "$22,000 - Breakdown:\n- Discovery & Design: $3,000\n- Core Development: $9,000\n- Integration: $5,000\n- Testing & Deployment: $3,000\n- 3 months post-launch support: $2,000",
    portfolioSuggestions: ['FinTech AI Chatbot - Reduced support tickets by 45%', 'E-Commerce Assistant - Handles 10K daily queries', 'Healthcare Triage Bot - FDA compliant AI system'],
    callToAction: `I would love to schedule a 30-minute call to walk you through our demo chatbot and discuss how we can tailor this solution specifically for GlobalServ GmbH. 

Are you available this Thursday or Friday afternoon?

Looking forward to hearing from you.`,
    winProbability: 82,
    status: 'submitted',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    submittedAt: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: 'prop-002',
    leadId: 'lead-001',
    title: 'E-Commerce Platform Redesign - Complete Solution',
    coverLetter: `Dear Sarah,

I am excited to present our proposal for the TechRetail Inc. e-commerce platform redesign. Having worked with several leading retail brands, we understand the critical balance between aesthetics, performance, and conversion optimization that modern e-commerce demands.

Our team has delivered e-commerce platforms generating over $50M in combined annual revenue, and we are ready to bring that expertise to TechRetail.`,
    introduction: `Our team combines 8 years of e-commerce development experience with a deep understanding of modern retail technology. We have worked with Shopify Plus, WooCommerce, and custom-built platforms serving millions of customers.

Portfolio Highlights:
- FashionNova Clone: Custom React platform processing $2M/month
- B2B Marketplace: Multi-vendor platform with 500+ sellers
- Subscription Box Platform: Custom billing and inventory management`,
    technicalPlan: `Phase 1: Strategy & Design (3 weeks)
- UX audit and competitor analysis
- User journey mapping
- Wireframes and high-fidelity mockups
- Design system creation

Phase 2: Frontend Development (5 weeks)
- Next.js 14 with App Router
- Responsive design implementation
- Performance optimization (Core Web Vitals)
- Accessibility compliance (WCAG 2.1)

Phase 3: Backend & Integration (4 weeks)
- Node.js API development
- PostgreSQL database design
- Stripe payment integration
- Inventory management system

Phase 4: Analytics & Launch (2 weeks)
- Analytics dashboard
- A/B testing setup
- Performance monitoring
- Production deployment`,
    timeline: '14 weeks total delivery',
    costEstimate: "$35,000 - Breakdown:\n- Strategy & Design: $5,000\n- Frontend Development: $10,000\n- Backend & Integration: $12,000\n- Analytics & Launch: $4,000\n- 6 months support & maintenance: $4,000",
    portfolioSuggestions: ['LuxeFashion E-Commerce - 200% conversion increase', 'TechGadgets Store - Custom inventory system', 'OrganicMarket - Subscription commerce platform'],
    callToAction: `I would be thrilled to schedule a demo of our recent e-commerce project and discuss the specific needs of TechRetail. 

Could we arrange a call early next week?

Best regards`,
    winProbability: 78,
    status: 'draft',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
]

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'high_value',
    title: 'High-Value Enterprise Lead Found!',
    message: 'Cloud Migration project worth $225,000 discovered on Wellfound from DataFort Systems',
    leadId: 'lead-009',
    read: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    priority: 'high'
  },
  {
    id: 'notif-2',
    type: 'urgent',
    title: 'Government Tender Deadline Approaching',
    message: 'US Digital Service portal tender closes in 45 days. Action needed.',
    leadId: 'lead-003',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    priority: 'high'
  },
  {
    id: 'notif-3',
    type: 'system',
    title: 'Agent Performance Report',
    message: 'All 3 AI agents operating at 94%+ efficiency. 23 new leads discovered today.',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    priority: 'medium'
  },
  {
    id: 'notif-4',
    type: 'follow_up',
    title: 'Follow-Up Required',
    message: 'Proposal for GlobalServ GmbH was opened 3 times. Consider follow-up email.',
    leadId: 'lead-002',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    priority: 'medium'
  },
  {
    id: 'notif-5',
    type: 'agent',
    title: 'Opportunity Hunter: New Platform Detected',
    message: 'Found 15 new freelance projects on a newly discovered platform matching your criteria.',
    read: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    priority: 'low'
  }
]

export const mockCompanies: CRMCompany[] = [
  {
    id: 'comp-1',
    name: 'TechRetail Inc.',
    industry: 'Retail / E-Commerce',
    country: 'United States',
    website: 'https://techretail.com',
    contacts: [
      { id: 'cont-1', name: 'Sarah Mitchell', email: 'sarah.mitchell@techretail.com', phone: '+1-555-0123', role: 'CTO', companyId: 'comp-1' }
    ],
    leads: ['lead-001'],
    revenue: 35000,
    status: 'active',
    notes: 'Major e-commerce redesign project in progress.',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'comp-2',
    name: 'GlobalServ GmbH',
    industry: 'Technology Services',
    country: 'Germany',
    website: 'https://globalserv.de',
    contacts: [
      { id: 'cont-2', name: 'Marcus Weber', email: 'm.weber@globalserv.de', phone: '+49-30-12345678', role: 'Head of Innovation', companyId: 'comp-2' }
    ],
    leads: ['lead-002'],
    revenue: 22000,
    status: 'active',
    notes: 'AI chatbot project. Very responsive client.',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
]

export const mockActivityLog: ActivityLog[] = [
  { id: 'log-1', agentId: 'agent-1', action: 'Lead Discovered', details: 'Found QA Automation Framework posting on Indeed', timestamp: new Date(Date.now() - 600000).toISOString(), status: 'success' },
  { id: 'log-2', agentId: 'agent-1', action: 'Platform Scan', details: 'Completed scan of Upwork - 23 new opportunities found', timestamp: new Date(Date.now() - 1200000).toISOString(), status: 'success' },
  { id: 'log-3', agentId: 'agent-2', action: 'Lead Analyzed', details: 'Completed analysis for Mobile App UI/UX Redesign - 88% success rate', timestamp: new Date(Date.now() - 1800000).toISOString(), status: 'success' },
  { id: 'log-4', agentId: 'agent-3', action: 'Proposal Generated', details: 'Created proposal for AI Customer Support Chatbot - $22,000', timestamp: new Date(Date.now() - 2400000).toISOString(), status: 'success' },
  { id: 'log-5', agentId: 'agent-1', action: 'API Rate Limit', details: 'LinkedIn API rate limit reached. Switching to fallback sources.', timestamp: new Date(Date.now() - 3000000).toISOString(), status: 'info' },
  { id: 'log-6', agentId: 'agent-2', action: 'Analysis Complete', details: 'Database Migration lead analyzed - Budget: $16,000, Risk: Low', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'success' },
  { id: 'log-7', agentId: 'agent-1', action: 'New Source Added', details: 'Added Dice.com to monitoring list for telecom jobs', timestamp: new Date(Date.now() - 4200000).toISOString(), status: 'success' },
  { id: 'log-8', agentId: 'agent-3', action: 'Proposal Updated', details: 'E-Commerce Redesign proposal updated with client feedback', timestamp: new Date(Date.now() - 4800000).toISOString(), status: 'success' }
]

export const mockAnalytics: AnalyticsData = {
  totalLeads: 347,
  totalProposals: 89,
  winRate: 67.4,
  totalRevenue: 428500,
  avgDealSize: 24800,
  conversionRate: 25.6,
  topCountries: [
    { country: 'United States', count: 142, revenue: 245000 },
    { country: 'Germany', count: 45, revenue: 68000 },
    { country: 'United Kingdom', count: 38, revenue: 52000 },
    { country: 'India', count: 35, revenue: 28500 },
    { country: 'Canada', count: 28, revenue: 35000 }
  ],
  topTechnologies: [
    { tech: 'React', count: 89 },
    { tech: 'Python', count: 76 },
    { tech: 'Node.js', count: 65 },
    { tech: 'PostgreSQL', count: 48 },
    { tech: 'AWS', count: 42 },
    { tech: 'TypeScript', count: 38 }
  ],
  monthlyRevenue: [
    { month: 'Jan', revenue: 28000, proposals: 8 },
    { month: 'Feb', revenue: 42000, proposals: 11 },
    { month: 'Mar', revenue: 35000, proposals: 9 },
    { month: 'Apr', revenue: 51000, proposals: 14 },
    { month: 'May', revenue: 48000, proposals: 12 },
    { month: 'Jun', revenue: 62000, proposals: 16 },
    { month: 'Jul', revenue: 55000, proposals: 15 },
    { month: 'Aug', revenue: 45000, proposals: 10 },
    { month: 'Sep', revenue: 38000, proposals: 8 },
    { month: 'Oct', revenue: 12500, proposals: 6 }
  ],
  platformBreakdown: [
    { platform: 'LinkedIn', leads: 89 },
    { platform: 'Upwork', leads: 67 },
    { platform: 'Indeed', leads: 52 },
    { platform: 'Freelancer', leads: 41 },
    { platform: 'Glassdoor', leads: 35 },
    { platform: 'Wellfound', leads: 28 },
    { platform: 'Dice', leads: 21 },
    { platform: 'Other', leads: 14 }
  ],
  agentPerformance: [
    { agent: 'Opportunity Hunter', efficiency: 94.2, tasks: 1247 },
    { agent: 'Lead Analyzer', efficiency: 97.1, tasks: 892 },
    { agent: 'Proposal Generator', efficiency: 92.8, tasks: 634 }
  ],
  industryTrends: [
    { industry: 'AI/ML', growth: 34.5, opportunities: 89 },
    { industry: 'Cloud Services', growth: 28.2, opportunities: 72 },
    { industry: 'E-Commerce', growth: 22.1, opportunities: 56 },
    { industry: 'Healthcare Tech', growth: 19.8, opportunities: 41 },
    { industry: 'FinTech', growth: 17.5, opportunities: 38 }
  ]
}
