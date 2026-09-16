"""ACIE shared constants and lifecycle definitions."""

# Lifecycle states (spec section 9)
LIFECYCLE = [
    "NEW", "DISCOVERED", "RESOLVED", "VERIFIED", "SCORED",
    "OUTREACH_READY", "REPLIED", "BOUNCED", "UNSUBSCRIBED",
    "JOB_CHANGE", "STALE",
]

# Decision thresholds (spec section 6 / 11)
HIGH_CONFIDENCE = 90
REVIEW_THRESHOLD = 75

# Confidence factor weights (spec section 6)
WEIGHTS = {
    "identity": 0.25,
    "employment": 0.20,
    "verification": 0.20,     # email/phone verification
    "freshness": 0.15,
    "provider_agreement": 0.10,
    "domain_health": 0.05,
    "historical": 0.05,       # historical performance / feedback
}

# Verification tokens that mean "verifiable, not a guess"
VERIFIED_SOURCES = ("web", "doh", "apollo", "hunter", "smtp", "twilio_lookup")

# Role-based local parts (low priority, role detection)
ROLE_RE = r"^(info|contact|sales|hello|admin|office|support|careers|marketing|billing|hr|press|pr|jobs|team|help|noc|ops|enquiries)$"

# Known disposable domains (never outreach)
DISPOSABLE_DOMAINS = {
    "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
    "yopmail.com", "sharklasers.com", "temp-mail.org", "throwawaymail.com",
    "getnada.com", "maildrop.cc", "inboxbear.com", "trashmail.com", "33mail.com",
}
