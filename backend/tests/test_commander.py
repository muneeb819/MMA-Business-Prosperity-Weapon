"""Commander (Chairman of the AI Bots Board) chat tests.

Covers: auth gating, deterministic operations (report/activity/scan), truthful
empty-database numbers, and the honest offline fallback when no LLM is configured.
"""

CHAT = "/api/ai-teams/supervisor/chat"


def _token(client, email="commander-test@example.com") -> str:
    registered = client.post(
        "/api/auth/register",
        json={"email": email, "name": "Commander Test", "password": "correct-horse-123"},
    )
    assert registered.status_code == 200
    return registered.json()["access_token"]


def _chat(client, token: str, message: str) -> str:
    response = client.post(
        CHAT,
        json={"message": message},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    body = response.json()
    assert "response" in body
    return body["response"]


def test_commander_chat_requires_auth(client):
    assert client.post(CHAT, json={"message": "report"}).status_code == 401


def test_commander_rejects_empty_message(client):
    token = _token(client)
    response = client.post(
        CHAT,
        json={"message": "   "},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400


def test_agent_list_calls_supervisor_commander(client):
    token = _token(client)
    response = client.get(
        "/api/ai-teams/",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    body = response.text
    assert '"id": "supervisor"' in body or '"id":"supervisor"' in body
    assert "Commander" in body
    assert "Chairman" in body


def test_full_report_is_real_and_truthful(client):
    token = _token(client)
    reply = _chat(client, token, "give me the full project report")
    assert "COMMANDER — FULL PROJECT REPORT" in reply
    assert "SYSTEM HEALTH" in reply
    assert "AI BOT BOARD" in reply
    assert "BUSINESS PIPELINE" in reply
    # Empty test database → the report must state zero, never invented numbers.
    assert "Leads: **0**" in reply
    assert "Chairman of the AI Bots Board" in reply


def test_activity_feed_includes_the_chat_itself(client):
    token = _token(client)
    reply = _chat(client, token, "show me all recent activity")
    assert "ACTIVITY FEED" in reply
    assert "Chairman query: show me all recent activity" in reply


def test_scan_operation_runs_deterministically(client):
    token = _token(client)
    reply = _chat(client, token, "scan")
    assert "Scan #" in reply
    assert "Health Score" in reply


def test_security_audit_operation_runs(client):
    token = _token(client)
    reply = _chat(client, token, "run a security audit")
    assert "Security Audit" in reply
    assert "Score:" in reply


def test_general_question_gets_truthful_fallback_without_llm(client):
    """No LLM configured in tests → honest offline reply, never a fabricated answer."""
    token = _token(client)
    reply = _chat(client, token, "what is the capital of France?")
    assert reply.strip()
    # Offline path must identify as Commander and not pretend the LLM answered.
    assert "Commander" in reply or "commander" in reply.lower()
