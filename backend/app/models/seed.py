from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.schema import Lead, Proposal, Company, Contact, Notification, AgentLog, Connector


def seed_all(db: Session) -> dict:
    existing_leads = db.query(Lead).count()
    if existing_leads > 0:
        return {"message": "Database already seeded", "skipped": True}

    now = datetime.utcnow()

    leads = [
        Lead(
            id="lead-001",
            title="E-Commerce Platform Redesign",
            description="Looking for a team to completely redesign our e-commerce platform with modern UI/UX, improved performance, and mobile-first approach. Must include payment gateway integration, inventory management, and analytics dashboard.",
            client_name="Sarah Mitchell",
            company="TechRetail Inc.",
            email="sarah.mitchell@techretail.com",
            phone="+1-555-0123",
            country="United States",
            budget_min=25000,
            budget_max=45000,
            deadline="2026-10-15",
            technologies=["React", "Next.js", "Node.js", "PostgreSQL", "Stripe"],
            skills=["Full Stack Development", "UI/UX Design", "E-Commerce", "Payment Integration"],
            platform="LinkedIn",
            job_type="contract",
            status="qualified",
            urgency="high",
            difficulty=65,
            success_probability=78,
            risk_level="low",
            expected_revenue=35000,
            competition=12,
            project_size="large",
            payment_method="Escrow",
            client_history="Verified company, 5 years in business, 200+ employees",
            url="https://linkedin.com/jobs/example",
            found_at=now - timedelta(days=1),
            analyzed_at=now - timedelta(hours=12),
            notes="High priority client. They mentioned budget flexibility for the right team.",
            tags=["e-commerce", "react", "enterprise", "high-budget"],
        ),
        Lead(
            id="lead-002",
            title="AI-Powered Customer Support Chatbot",
            description="Need an AI chatbot solution for our customer support that can handle queries in multiple languages, integrate with our CRM, and provide intelligent responses using our knowledge base.",
            client_name="Marcus Weber",
            company="GlobalServ GmbH",
            email="m.weber@globalserv.de",
            phone="+49-30-12345678",
            country="Germany",
            budget_min=15000,
            budget_max=30000,
            deadline="2026-11-01",
            technologies=["Python", "OpenAI", "LangChain", "FastAPI", "React"],
            skills=["AI/ML", "NLP", "Chatbot Development", "API Integration"],
            platform="Upwork",
            job_type="contract",
            status="proposal_sent",
            urgency="medium",
            difficulty=55,
            success_probability=82,
            risk_level="low",
            expected_revenue=22000,
            competition=8,
            project_size="medium",
            payment_method="Milestone",
            client_history="Active Upwork client, 95% hire rate, $100k+ spent",
            url="https://upwork.com/freelance-jobs/example",
            found_at=now - timedelta(days=2),
            analyzed_at=now - timedelta(days=1),
            notes="Client is very responsive. Proposal sent with AI demo.",
            tags=["ai", "chatbot", "nlp", "enterprise"],
        ),
        Lead(
            id="lead-003",
            title="Government Digital Services Portal",
            description="Federal government tender for building a citizen services portal. Must comply with Section 508 accessibility, FedRAMP security standards, and support 10M+ users.",
            client_name="James Rodriguez",
            company="US Digital Service",
            email="j.rodriguez@usds.gov",
            phone="+1-202-555-0199",
            country="United States",
            budget_min=200000,
            budget_max=500000,
            deadline="2027-03-01",
            technologies=["React", "Java Spring", "AWS", "Kubernetes", "PostgreSQL"],
            skills=["Government Projects", "Cloud Architecture", "Security Compliance", "Large Scale Systems"],
            platform="SAM.gov",
            job_type="contract",
            status="analyzing",
            urgency="critical",
            difficulty=90,
            success_probability=45,
            risk_level="medium",
            expected_revenue=350000,
            competition=25,
            project_size="enterprise",
            payment_method="Government Contract",
            client_history="Federal agency, established procurement process",
            url="https://sam.gov/example",
            found_at=now - timedelta(days=3),
            analyzed_at=now - timedelta(days=2),
            notes="Requires security clearance. Large contract potential.",
            tags=["government", "enterprise", "high-budget", "aws"],
        ),
        Lead(
            id="lead-004",
            title="Mobile App UI/UX Redesign",
            description="We need a complete UI/UX redesign for our fitness tracking mobile app. Looking for modern, clean design with improved user flows and accessibility.",
            client_name="Emma Thompson",
            company="FitLife Studios",
            email="emma@fitlifestudios.com",
            phone="+44-20-7946-0958",
            country="United Kingdom",
            budget_min=8000,
            budget_max=15000,
            deadline="2026-09-30",
            technologies=["Figma", "React Native", "Swift", "Kotlin"],
            skills=["UI/UX Design", "Mobile Design", "Prototyping", "User Research"],
            platform="Dribbble",
            job_type="freelance",
            status="new",
            urgency="medium",
            difficulty=35,
            success_probability=88,
            risk_level="low",
            expected_revenue=12000,
            competition=15,
            project_size="small",
            payment_method="Bank Transfer",
            client_history="Startup, seed-funded, looking for long-term design partner",
            url="https://dribbble.com/jobs/example",
            found_at=now - timedelta(hours=10),
            analyzed_at=None,
            notes="Great opportunity for portfolio building. Client values creativity.",
            tags=["mobile", "ui-ux", "design", "startup"],
        ),
        Lead(
            id="lead-005",
            title="QA Automation Framework",
            description="Building comprehensive QA automation framework for our SaaS platform. Need end-to-end testing, API testing, performance testing, and CI/CD integration.",
            client_name="David Park",
            company="CloudScale Solutions",
            email="d.park@cloudscale.io",
            phone="+1-415-555-0167",
            country="United States",
            budget_min=18000,
            budget_max=28000,
            deadline="2026-11-15",
            technologies=["Playwright", "Jest", "Cypress", "GitHub Actions", "Docker"],
            skills=["QA Automation", "CI/CD", "Testing Strategy", "Performance Testing"],
            platform="Indeed",
            job_type="contract",
            status="new",
            urgency="high",
            difficulty=50,
            success_probability=75,
            risk_level="low",
            expected_revenue=23000,
            competition=7,
            project_size="medium",
            payment_method="Escrow",
            client_history="Series B startup, 50 engineers, growing fast",
            url="https://indeed.com/jobs/example",
            found_at=now - timedelta(hours=2),
            analyzed_at=None,
            notes="Fast-paced team. Quick turnaround expected.",
            tags=["qa", "automation", "testing", "ci-cd"],
        ),
        Lead(
            id="lead-006",
            title="Database Migration & Optimization",
            description="Migrate legacy Oracle database to PostgreSQL, optimize queries, implement proper indexing, and set up monitoring and backup strategies.",
            client_name="Anika Patel",
            company="FinanceCore Ltd",
            email="anika.patel@financecore.com",
            phone="+91-22-555-0145",
            country="India",
            budget_min=12000,
            budget_max=20000,
            deadline="2026-12-01",
            technologies=["PostgreSQL", "Oracle", "Python", "Docker", "Grafana"],
            skills=["Database Administration", "Data Migration", "Performance Tuning", "SQL"],
            platform="Freelancer",
            job_type="contract",
            status="qualified",
            urgency="high",
            difficulty=60,
            success_probability=80,
            risk_level="low",
            expected_revenue=16000,
            competition=10,
            project_size="medium",
            payment_method="Milestone",
            client_history="Established financial services firm, 500+ employees",
            url="https://freelancer.com/projects/example",
            found_at=now - timedelta(hours=12),
            analyzed_at=now - timedelta(hours=6),
            notes="Critical migration project. Client is very detail-oriented.",
            tags=["database", "postgresql", "migration", "finance"],
        ),
        Lead(
            id="lead-007",
            title="Sales Dashboard & CRM Integration",
            description="Build a comprehensive sales dashboard that integrates with Salesforce and HubSpot. Real-time data visualization, forecasting, and team performance tracking.",
            client_name="Michael Chen",
            company="Velocity Sales Co",
            email="m.chen@velocitysales.com",
            phone="+1-310-555-0189",
            country="United States",
            budget_min=20000,
            budget_max=35000,
            deadline="2026-10-30",
            technologies=["React", "D3.js", "Node.js", "Salesforce API", "HubSpot API"],
            skills=["Data Visualization", "CRM Integration", "Sales Analytics", "Frontend Development"],
            platform="Glassdoor",
            job_type="contract",
            status="new",
            urgency="medium",
            difficulty=55,
            success_probability=72,
            risk_level="low",
            expected_revenue=27500,
            competition=9,
            project_size="medium",
            payment_method="Escrow",
            client_history="Growing sales company, 100+ reps, data-driven culture",
            url="https://glassdoor.com/jobs/example",
            found_at=now - timedelta(hours=4),
            analyzed_at=None,
            notes="Data-heavy project. Client wants impressive visualizations.",
            tags=["sales", "dashboard", "crm", "data-visualization"],
        ),
        Lead(
            id="lead-008",
            title="Telemarketing Automation System",
            description="Develop an automated telemarketing system with AI-driven call scripts, lead scoring, call recording analytics, and integration with our existing telephony infrastructure.",
            client_name="Roberto Silva",
            company="ContactPro Brasil",
            email="r.silva@contactpro.com.br",
            phone="+55-11-5555-0123",
            country="Brazil",
            budget_min=10000,
            budget_max=18000,
            deadline="2026-12-15",
            technologies=["Python", "Twilio", "OpenAI", "FastAPI", "Vue.js"],
            skills=["Telephony Integration", "AI", "Backend Development", "Telecom"],
            platform="Guru",
            job_type="freelance",
            status="new",
            urgency="low",
            difficulty=45,
            success_probability=70,
            risk_level="medium",
            expected_revenue=14000,
            competition=5,
            project_size="small",
            payment_method="Milestone",
            client_history="Contact center with 200 agents, expanding operations",
            url="https://guru.com/jobs/example",
            found_at=now - timedelta(hours=1, minutes=30),
            analyzed_at=None,
            notes="Niche market opportunity. Good for telecom portfolio.",
            tags=["telemarketing", "automation", "ai", "telecom"],
        ),
        Lead(
            id="lead-009",
            title="Enterprise Cloud Migration",
            description="Complete migration of on-premise infrastructure to AWS cloud. Includes migration of 50+ microservices, database migration, security audit, and DevOps pipeline setup.",
            client_name="Jennifer Walsh",
            company="DataFort Systems",
            email="j.walsh@datafort.com",
            phone="+1-617-555-0134",
            country="United States",
            budget_min=150000,
            budget_max=300000,
            deadline="2027-06-01",
            technologies=["AWS", "Kubernetes", "Terraform", "Docker", "Jenkins"],
            skills=["Cloud Architecture", "DevOps", "Migration", "Security"],
            platform="Wellfound",
            job_type="contract",
            status="analyzing",
            urgency="critical",
            difficulty=85,
            success_probability=55,
            risk_level="medium",
            expected_revenue=225000,
            competition=18,
            project_size="enterprise",
            payment_method="Net 30",
            client_history="Fortune 500 company, established vendor relationships",
            url="https://wellfound.com/jobs/example",
            found_at=now - timedelta(days=4),
            analyzed_at=now - timedelta(days=3),
            notes="Major enterprise deal. Long sales cycle expected.",
            tags=["cloud", "aws", "enterprise", "devops", "high-budget"],
        ),
        Lead(
            id="lead-010",
            title="Telecommunications Network Monitor",
            description="Build a real-time network monitoring dashboard for our telecom infrastructure. Must support 10,000+ nodes, real-time alerts, and predictive maintenance capabilities.",
            client_name="Hans Mueller",
            company="EuroTel AG",
            email="h.mueller@eurotel.de",
            phone="+49-89-555-0178",
            country="Germany",
            budget_min=35000,
            budget_max=60000,
            deadline="2027-01-15",
            technologies=["React", "Go", "Prometheus", "Grafana", "Kafka"],
            skills=["Network Engineering", "Real-time Systems", "Data Visualization", "Telecom"],
            platform="Dice",
            job_type="contract",
            status="new",
            urgency="medium",
            difficulty=70,
            success_probability=65,
            risk_level="low",
            expected_revenue=47500,
            competition=6,
            project_size="large",
            payment_method="Bank Transfer",
            client_history="Major telecom provider, 10,000+ employees",
            url="https://dice.com/jobs/example",
            found_at=now - timedelta(hours=8),
            analyzed_at=None,
            notes="Specialized telecom project. Premium pricing justified.",
            tags=["telecom", "monitoring", "real-time", "enterprise"],
        ),
    ]

    proposals = [
        Proposal(
            id="prop-001",
            lead_id="lead-002",
            title="AI-Powered Customer Support Chatbot Solution",
            cover_letter="""Dear Marcus,

Thank you for the opportunity to propose our AI-powered customer support chatbot solution for GlobalServ GmbH. With extensive experience in building enterprise-grade AI solutions, we are confident in delivering a chatbot that will transform your customer support operations.

Our team has successfully delivered 15+ AI chatbot projects for companies across Europe and North America, reducing customer support costs by an average of 40% while improving response times by 300%.

We understand the importance of multilingual support and seamless CRM integration, and our proposed solution addresses both requirements with cutting-edge NLP technology.""",
            introduction="""We are a team of 12 AI engineers and conversational designers specializing in building intelligent customer support systems. Our flagship product has processed over 2 million customer interactions across 8 languages.

Key Differentiators:
- Proven track record with enterprise clients
- Multilingual AI capabilities (12+ languages)
- Seamless CRM integration experience
- 24/7 support and maintenance packages""",
            technical_plan="""Phase 1: Discovery & Design (2 weeks)
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
- Monitoring setup""",
            timeline="10 weeks total delivery",
            cost_estimate="$22,000 - Breakdown:\n- Discovery & Design: $3,000\n- Core Development: $9,000\n- Integration: $5,000\n- Testing & Deployment: $3,000\n- 3 months post-launch support: $2,000",
            portfolio_suggestions=["FinTech AI Chatbot - Reduced support tickets by 45%", "E-Commerce Assistant - Handles 10K daily queries", "Healthcare Triage Bot - FDA compliant AI system"],
            call_to_action="""I would love to schedule a 30-minute call to walk you through our demo chatbot and discuss how we can tailor this solution specifically for GlobalServ GmbH.

Are you available this Thursday or Friday afternoon?

Looking forward to hearing from you.""",
            win_probability=82,
            status="submitted",
            created_at=now - timedelta(days=1),
            submitted_at=now - timedelta(hours=12),
        ),
        Proposal(
            id="prop-002",
            lead_id="lead-001",
            title="E-Commerce Platform Redesign - Complete Solution",
            cover_letter="""Dear Sarah,

I am excited to present our proposal for the TechRetail Inc. e-commerce platform redesign. Having worked with several leading retail brands, we understand the critical balance between aesthetics, performance, and conversion optimization that modern e-commerce demands.

Our team has delivered e-commerce platforms generating over $50M in combined annual revenue, and we are ready to bring that expertise to TechRetail.""",
            introduction="""Our team combines 8 years of e-commerce development experience with a deep understanding of modern retail technology. We have worked with Shopify Plus, WooCommerce, and custom-built platforms serving millions of customers.

Portfolio Highlights:
- FashionNova Clone: Custom React platform processing $2M/month
- B2B Marketplace: Multi-vendor platform with 500+ sellers
- Subscription Box Platform: Custom billing and inventory management""",
            technical_plan="""Phase 1: Strategy & Design (3 weeks)
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
- Production deployment""",
            timeline="14 weeks total delivery",
            cost_estimate="$35,000 - Breakdown:\n- Strategy & Design: $5,000\n- Frontend Development: $10,000\n- Backend & Integration: $12,000\n- Analytics & Launch: $4,000\n- 6 months support & maintenance: $4,000",
            portfolio_suggestions=["LuxeFashion E-Commerce - 200% conversion increase", "TechGadgets Store - Custom inventory system", "OrganicMarket - Subscription commerce platform"],
            call_to_action="""I would be thrilled to schedule a demo of our recent e-commerce project and discuss the specific needs of TechRetail.

Could we arrange a call early next week?

Best regards""",
            win_probability=78,
            status="draft",
            created_at=now - timedelta(days=2),
            submitted_at=None,
        ),
    ]

    companies = [
        Company(
            id="comp-1",
            name="TechRetail Inc.",
            industry="Retail / E-Commerce",
            country="United States",
            website="https://techretail.com",
            revenue=35000,
            status="active",
            notes="Major e-commerce redesign project in progress.",
            created_at=now - timedelta(days=1),
        ),
        Company(
            id="comp-2",
            name="GlobalServ GmbH",
            industry="Technology Services",
            country="Germany",
            website="https://globalserv.de",
            revenue=22000,
            status="active",
            notes="AI chatbot project. Very responsive client.",
            created_at=now - timedelta(days=2),
        ),
    ]

    contacts = [
        Contact(id="cont-1", name="Sarah Mitchell", email="sarah.mitchell@techretail.com", phone="+1-555-0123", role="CTO", company_id="comp-1"),
        Contact(id="cont-2", name="Marcus Weber", email="m.weber@globalserv.de", phone="+49-30-12345678", role="Head of Innovation", company_id="comp-2"),
        Contact(id="cont-3", name="James Rodriguez", email="j.rodriguez@usds.gov", phone="+1-202-555-0199", role="Project Director", company_id=None),
        Contact(id="cont-4", name="Emma Thompson", email="emma@fitlifestudios.com", phone="+44-20-7946-0958", role="Founder", company_id=None),
        Contact(id="cont-5", name="David Park", email="d.park@cloudscale.io", phone="+1-415-555-0167", role="VP Engineering", company_id=None),
        Contact(id="cont-6", name="Anika Patel", email="anika.patel@financecore.com", phone="+91-22-555-0145", role="CTO", company_id=None),
        Contact(id="cont-7", name="Michael Chen", email="m.chen@velocitysales.com", phone="+1-310-555-0189", role="Sales Director", company_id=None),
        Contact(id="cont-8", name="Roberto Silva", email="r.silva@contactpro.com.br", phone="+55-11-5555-0123", role="Operations Manager", company_id=None),
    ]

    notifications = [
        Notification(
            id="notif-1",
            type="high_value",
            title="High-Value Enterprise Lead Found!",
            message="Cloud Migration project worth $225,000 discovered on Wellfound from DataFort Systems",
            lead_id="lead-009",
            read=False,
            priority="high",
            created_at=now - timedelta(minutes=30),
        ),
        Notification(
            id="notif-2",
            type="urgent",
            title="Government Tender Deadline Approaching",
            message="US Digital Service portal tender closes in 45 days. Action needed.",
            lead_id="lead-003",
            read=False,
            priority="high",
            created_at=now - timedelta(hours=1),
        ),
        Notification(
            id="notif-3",
            type="system",
            title="Agent Performance Report",
            message="All 3 AI agents operating at 94%+ efficiency. 23 new leads discovered today.",
            lead_id=None,
            read=False,
            priority="medium",
            created_at=now - timedelta(hours=2),
        ),
        Notification(
            id="notif-4",
            type="follow_up",
            title="Follow-Up Required",
            message="Proposal for GlobalServ GmbH was opened 3 times. Consider follow-up email.",
            lead_id="lead-002",
            read=True,
            priority="medium",
            created_at=now - timedelta(days=1),
        ),
        Notification(
            id="notif-5",
            type="agent",
            title="Opportunity Hunter: New Platform Detected",
            message="Found 15 new freelance projects on a newly discovered platform matching your criteria.",
            lead_id=None,
            read=True,
            priority="low",
            created_at=now - timedelta(days=2),
        ),
    ]

    agent_logs = [
        AgentLog(id="log-1", agent_id="agent-1", action="Lead Discovered", details="Found QA Automation Framework posting on Indeed", status="success", timestamp=now - timedelta(minutes=10)),
        AgentLog(id="log-2", agent_id="agent-1", action="Platform Scan", details="Completed scan of Upwork - 23 new opportunities found", status="success", timestamp=now - timedelta(minutes=20)),
        AgentLog(id="log-3", agent_id="agent-2", action="Lead Analyzed", details="Completed analysis for Mobile App UI/UX Redesign - 88% success rate", status="success", timestamp=now - timedelta(minutes=30)),
        AgentLog(id="log-4", agent_id="agent-3", action="Proposal Generated", details="Created proposal for AI Customer Support Chatbot - $22,000", status="success", timestamp=now - timedelta(minutes=40)),
        AgentLog(id="log-5", agent_id="agent-1", action="API Rate Limit", details="LinkedIn API rate limit reached. Switching to fallback sources.", status="info", timestamp=now - timedelta(minutes=50)),
        AgentLog(id="log-6", agent_id="agent-2", action="Analysis Complete", details="Database Migration lead analyzed - Budget: $16,000, Risk: Low", status="success", timestamp=now - timedelta(hours=1)),
        AgentLog(id="log-7", agent_id="agent-1", action="New Source Added", details="Added Dice.com to monitoring list for telecom jobs", status="success", timestamp=now - timedelta(hours=1, minutes=10)),
        AgentLog(id="log-8", agent_id="agent-3", action="Proposal Updated", details="E-Commerce Redesign proposal updated with client feedback", status="success", timestamp=now - timedelta(hours=1, minutes=20)),
    ]

    connectors = [
        Connector(id="conn-001", name="Upwork Scraper", type="scraper", platform="upwork", status="active", config={"keywords": ["react", "next.js", "full stack"], "minBudget": 5000}, last_sync_at=now - timedelta(hours=2), sync_count=47, leads_found=231, created_at=now - timedelta(days=30)),
        Connector(id="conn-002", name="Indeed Monitor", type="scraper", platform="indeed", status="active", config={"keywords": ["software engineer", "frontend"], "countries": ["US", "UK"]}, last_sync_at=now - timedelta(hours=6), sync_count=120, leads_found=584, created_at=now - timedelta(days=45)),
        Connector(id="conn-003", name="LinkedIn RSS", type="rss", platform="linkedin", status="inactive", config={"feeds": ["remote-jobs"]}, last_sync_at=now - timedelta(days=3), sync_count=12, leads_found=45, created_at=now - timedelta(days=15)),
        Connector(id="conn-004", name="Freelancer API", type="api", platform="freelancer", status="error", config={"apiKey": "placeholder"}, last_sync_at=now - timedelta(days=1), sync_count=5, leads_found=18, error_message="API key expired — please update credentials", created_at=now - timedelta(days=10)),
        Connector(id="conn-005", name="Dice.com Crawler", type="scraper", platform="dice", status="active", config={"keywords": ["devops", "cloud", "aws"]}, last_sync_at=now - timedelta(hours=1), sync_count=89, leads_found=412, created_at=now - timedelta(days=60)),
    ]

    db.add_all(leads)
    db.add_all(proposals)
    db.add_all(companies)
    db.add_all(contacts)
    db.add_all(notifications)
    db.add_all(agent_logs)
    db.add_all(connectors)
    db.commit()

    return {
        "message": "Database seeded successfully",
        "skipped": False,
        "counts": {
            "leads": len(leads),
            "proposals": len(proposals),
            "companies": len(companies),
            "contacts": len(contacts),
            "notifications": len(notifications),
            "agent_logs": len(agent_logs),
            "connectors": len(connectors),
        },
    }
