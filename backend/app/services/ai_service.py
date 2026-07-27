import json
import os
import logging
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

try:
    from openai import AsyncOpenAI
except ImportError:
    AsyncOpenAI = None


class AIService:
    """Central AI service orchestrating all AI operations via OpenAI."""

    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.client = None
        if AsyncOpenAI and self.api_key:
            self.client = AsyncOpenAI(api_key=self.api_key)

    def _is_available(self) -> bool:
        return self.client is not None

    async def _chat(self, system: str, user: str, temperature: float = 0.7) -> str:
        if not self._is_available():
            raise RuntimeError("OpenAI API key not configured")
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=temperature,
            max_tokens=2048,
        )
        return response.choices[0].message.content

    async def _chat_json(self, system: str, user: str, temperature: float = 0.3) -> dict:
        raw = await self._chat(system, user, temperature)
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            lines = lines[1:] if lines[0].startswith("```") else lines
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            cleaned = "\n".join(lines)
        return json.loads(cleaned)

    async def analyze_lead(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self._is_available():
            return self._analyze_lead_fallback(lead_data)

        system = """You are an expert lead analyst for an IT services company.
Analyze the given lead and return a JSON object with these fields:
- success_probability: integer 0-100
- difficulty: integer 0-100
- risk_level: one of "low", "medium", "high"
- expected_revenue: number (estimate in USD)
- recommendation: one paragraph recommendation
- key_factors: array of 3-5 strings with key factors
- tags: array of 2-4 relevant tags

Return ONLY valid JSON, no markdown."""

        user = f"""Analyze this lead:
Title: {lead_data.get('title', 'N/A')}
Description: {lead_data.get('description', 'N/A')}
Budget: ${lead_data.get('budget_min', 0):,.0f} - ${lead_data.get('budget_max', 0):,.0f}
Country: {lead_data.get('country', 'Global')}
Technologies: {', '.join(lead_data.get('technologies', [])) or 'Not specified'}
Platform: {lead_data.get('platform', 'Unknown')}
Job Type: {lead_data.get('job_type', 'Unknown')}
Client: {lead_data.get('client_name', 'Unknown')} at {lead_data.get('company', 'Unknown')}
Competition: {lead_data.get('competition', 'Unknown')} competitors"""

        try:
            return await self._chat_json(system, user, temperature=0.3)
        except Exception as e:
            logger.warning(f"AI lead analysis failed, using fallback: {e}")
            return self._analyze_lead_fallback(lead_data)

    def _analyze_lead_fallback(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        budget_max = lead_data.get("budget_max", 50000) or 50000
        budget_min = lead_data.get("budget_min", 0) or 0
        budget_mid = (budget_min + budget_max) / 2
        revenue = budget_mid * 0.7

        if budget_mid > 100000:
            success = 65
            difficulty = 70
            risk = "high"
        elif budget_mid > 30000:
            success = 75
            difficulty = 50
            risk = "medium"
        else:
            success = 85
            difficulty = 30
            risk = "low"

        return {
            "success_probability": success,
            "difficulty": difficulty,
            "risk_level": risk,
            "expected_revenue": revenue,
            "recommendation": f"Opportunity with ${budget_mid:,.0f} average budget. {'Strong candidate for proposal.' if success > 70 else 'Consider before proceeding.'}",
            "key_factors": [
                f"Budget range: ${budget_min:,.0f} - ${budget_max:,.0f}",
                f"Risk level: {risk}",
                f"Estimated revenue: ${revenue:,.0f}",
            ],
            "tags": ["ai-analyzed", risk + "-risk"],
        }

    async def generate_proposal(
        self,
        lead_data: Dict[str, Any],
        tone: str = "professional",
        instructions: str = "",
    ) -> Dict[str, Any]:
        if not self._is_available():
            return self._generate_proposal_fallback(lead_data, tone)

        tone_descriptions = {
            "professional": "clear, competent, and business-focused",
            "friendly": "warm, approachable, and relationship-building",
            "confident": "bold, authoritative, and results-oriented",
            "technical": "detail-oriented, evidence-based, and technically precise",
            "consultative": "strategic, insightful, and advisory",
            "premium": "high-end, exclusive, and value-focused",
        }
        tone_desc = tone_descriptions.get(tone, "professional and clear")

        system = f"""You are an expert proposal writer for an IT services company.
Write in a {tone_desc} tone.

Generate a proposal and return ONLY a valid JSON object with these fields:
- title: project title
- cover_letter: 3-4 paragraph cover letter addressing the client directly
- introduction: 2-3 paragraphs introducing your company and understanding of the project
- technical_plan: detailed technical approach with numbered phases
- timeline: estimated timeline string (e.g. "8-12 weeks")
- cost_estimate: formatted cost range string (e.g. "$45,000 - $65,000")
- portfolio_suggestions: array of 2-3 related project names that demonstrate relevant experience
- call_to_action: compelling closing paragraph
- win_probability: integer 0-100

Return ONLY valid JSON, no markdown blocks."""

        user = f"""Generate a proposal for this project:

Title: {lead_data.get('title', 'N/A')}
Description: {lead_data.get('description', 'N/A')}
Budget: ${lead_data.get('budget_min', 0):,.0f} - ${lead_data.get('budget_max', 0):,.0f}
Client: {lead_data.get('client_name', 'N/A')} at {lead_data.get('company', 'N/A')}
Technologies Required: {', '.join(lead_data.get('technologies', [])) or 'Not specified'}
Country: {lead_data.get('country', 'Global')}
Competition: {lead_data.get('competition', 'Unknown')} other bidders"""

        if instructions:
            user += f"\n\nAdditional client-specific instructions:\n{instructions}"

        try:
            return await self._chat_json(system, user, temperature=0.7)
        except Exception as e:
            logger.warning(f"AI proposal generation failed, using fallback: {e}")
            return self._generate_proposal_fallback(lead_data, tone)

    def _generate_proposal_fallback(self, lead_data: Dict[str, Any], tone: str) -> Dict[str, Any]:
        title = lead_data.get("title", "Project")
        budget_min = lead_data.get("budget_min", 0) or 0
        budget_max = lead_data.get("budget_max", 0) or 0
        client = lead_data.get("client_name", "Client")
        company = lead_data.get("company", "their organization")
        techs = lead_data.get("technologies", [])

        return {
            "title": f"Proposal for {title}",
            "cover_letter": f"Dear {client},\n\nThank you for the opportunity to present our proposal for the {title} project. We understand the unique challenges {company} is facing and have designed a comprehensive solution that addresses your specific needs.\n\nOur team brings extensive experience in delivering similar projects, and we are confident in our ability to exceed your expectations while meeting your timeline and budget requirements.\n\nWe look forward to discussing this proposal in further detail and exploring how we can add value to {company}.",
            "introduction": f"Our team has deep expertise in {', '.join(techs) if techs else 'modern technology solutions'}. We understand that {title} requires a strategic approach that balances innovation with reliability.\n\nOver the past several years, we have delivered projects of similar scope and complexity, consistently achieving client satisfaction scores above 95%. Our methodology ensures transparency, collaboration, and measurable results at every phase.",
            "technical_plan": "Phase 1: Discovery & Requirements Analysis (Weeks 1-2)\n- Stakeholder interviews and requirements gathering\n- Technical architecture design\n- Project plan finalization\n\nPhase 2: Design & Prototyping (Weeks 3-4)\n- UI/UX design and wireframing\n- Architecture setup and environment preparation\n- Prototype development and review\n\nPhase 3: Development (Weeks 5-10)\n- Iterative development with bi-weekly demos\n- Code reviews and quality assurance\n- Integration testing\n\nPhase 4: Testing & Deployment (Weeks 11-12)\n- Comprehensive QA and user acceptance testing\n- Production deployment\n- Post-launch monitoring and support",
            "timeline": "10-14 weeks",
            "cost_estimate": f"${budget_min:,.0f} - ${budget_max:,.0f}",
            "portfolio_suggestions": ["Enterprise SaaS Platform", "Cloud Migration Project", "Mobile App Development"],
            "call_to_action": f"We are excited about the possibility of partnering with {company} on this initiative. Our team is ready to begin immediately and can schedule a detailed kickoff meeting at your convenience.\n\nPlease don't hesitate to reach out with any questions or to discuss specific requirements further.",
            "win_probability": 68,
        }

    async def natural_language_search(self, query: str, available_filters: Optional[List[str]] = None) -> Dict[str, Any]:
        if not self._is_available():
            return {
                "interpreted_query": query,
                "filters": {},
                "search_keywords": [query],
                "suggestions": [],
                "reasoning": "AI not available - using raw query",
            }

        system = """You are an intelligent search interpreter for a business development platform.
Analyze the natural language query and extract structured search parameters.

Return ONLY a valid JSON object with:
- interpreted_query: string explaining what the user is looking for
- filters: object with optional keys: country, budget_min, budget_max, technologies (array), job_type, urgency
- search_keywords: array of 3-5 relevant keywords for text search
- suggestions: array of 1-3 related search ideas the user might want to try
- search_strategy: brief explanation of how you would search

Return ONLY valid JSON, no markdown."""

        user = f"Interpret this business lead search query: \"{query}\""

        try:
            return await self._chat_json(system, user, temperature=0.2)
        except Exception as e:
            logger.warning(f"AI search interpretation failed: {e}")
            return {
                "interpreted_query": query,
                "filters": {},
                "search_keywords": query.split(),
                "suggestions": [],
                "reasoning": f"Using raw query: {query}",
            }

    async def generate_opportunity_insights(self, leads: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not self._is_available():
            return {
                "summary": f"Analyzed {len(leads)} opportunities. Consider prioritizing high-budget leads with moderate competition.",
                "top_recommendations": [],
                "market_trends": [],
                "risk_alerts": [],
            }

        leads_brief = "\n".join([
            f"- {l.get('title', 'N/A')} | Budget: ${l.get('budget_max', 0):,.0f} | Status: {l.get('status', 'new')} | Probability: {l.get('success_probability', 0)}%"
            for l in leads[:15]
        ])

        system = """You are a business intelligence analyst.
Analyze the given leads and provide strategic insights.

Return ONLY a valid JSON object with:
- summary: 2-3 sentence executive summary
- top_recommendations: array of 3-5 actionable recommendations as strings
- market_trends: array of 2-3 observed trends from the data
- risk_alerts: array of 1-3 risk items to watch

Return ONLY valid JSON, no markdown."""

        user = f"Analyze these business opportunities:\n\n{leads_brief}"

        try:
            return await self._chat_json(system, user, temperature=0.4)
        except Exception as e:
            logger.warning(f"AI insights generation failed: {e}")
            return {
                "summary": f"Analyzed {len(leads)} opportunities.",
                "top_recommendations": [],
                "market_trends": [],
                "risk_alerts": [],
            }


ai_service = AIService()
