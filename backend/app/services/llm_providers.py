"""Multi-provider LLM registry and runtime configuration.

Any AI feature in MBPW (lead analysis, proposal generation, AI search,
insights, outreach copy) resolves its model provider through this module
instead of hard-coding OpenAI.

Providers are grouped by wire protocol:

- ``openai``      OpenAI Chat Completions protocol. Used by OpenAI itself and
                  by every OpenAI-compatible gateway (DeepSeek, xAI, Groq,
                  Mistral, OpenRouter, Together, Ollama, LM Studio, custom).
- ``anthropic``   Anthropic Messages API (native, via HTTP).
- ``gemini``      Google Gemini ``generateContent`` API (native, via HTTP).

Configuration is resolved with the following precedence (first hit wins):

1. Explicit override passed by the caller (used by the Settings "Test" button
   so users can try an unsaved key).
2. Database ``app_config`` rows written by the Settings UI:
   ``llm_provider``, ``llm_api_key_<id>``, ``llm_model_<id>``,
   ``llm_base_url_<id>``.
3. Generic environment variables: ``LLM_PROVIDER``, ``LLM_API_KEY``,
   ``LLM_MODEL``, ``LLM_BASE_URL``.
4. Provider-specific environment variables (``OPENAI_API_KEY``,
   ``ANTHROPIC_API_KEY``, ``GEMINI_API_KEY`` ...).
5. The provider's built-in default model / base URL.

API keys are stored server-side only; the API never returns them in full
(masked tail is exposed so the UI can show "Active (…ab12)").
"""

from __future__ import annotations

import os
import threading
import time
from typing import Any, Dict, List, Optional

PROTOCOL_OPENAI = "openai"
PROTOCOL_ANTHROPIC = "anthropic"
PROTOCOL_GEMINI = "gemini"
PROTOCOL_DEEPGRAM = "deepgram_think"
PROTOCOL_VERTEX = "vertex_gemini"

# --- Provider registry -------------------------------------------------------
# ``models`` is a convenience list for the UI dropdown; every provider also
# accepts a free-typed model name so new model releases work immediately.

PROVIDERS: Dict[str, Dict[str, Any]] = {
    "openai": {
        "id": "openai",
        "label": "OpenAI",
        "emoji": "🟠",
        "protocol": PROTOCOL_OPENAI,
        "base_url": "https://api.openai.com/v1",
        "env_keys": ["OPENAI_API_KEY"],
        "default_model": "gpt-4o-mini",
        "models": ["gpt-4o-mini", "gpt-4o", "gpt-4.1", "gpt-4.1-mini", "o4-mini"],
        "requires_key": True,
        "site": "https://platform.openai.com/api-keys",
        "blurb": "GPT-4o / GPT-4.1 / o-series",
    },
    "anthropic": {
        "id": "anthropic",
        "label": "Anthropic Claude",
        "emoji": "🟣",
        "protocol": PROTOCOL_ANTHROPIC,
        "base_url": "https://api.anthropic.com/v1",
        "env_keys": ["ANTHROPIC_API_KEY"],
        "default_model": "claude-sonnet-4-0",
        "models": ["claude-sonnet-4-0", "claude-opus-4-0", "claude-3-7-sonnet-latest", "claude-3-5-haiku-latest"],
        "requires_key": True,
        "site": "https://console.anthropic.com/settings/keys",
        "blurb": "Claude Sonnet / Opus / Haiku",
    },
    "gemini": {
        "id": "gemini",
        "label": "Google Gemini",
        "emoji": "🔵",
        "protocol": PROTOCOL_GEMINI,
        "base_url": "https://generativelanguage.googleapis.com/v1beta",
        "env_keys": ["GEMINI_API_KEY", "GOOGLE_API_KEY"],
        "default_model": "gemini-2.5-flash",
        "models": ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro", "gemini-3.0-flash"],
        "requires_key": True,
        "site": "https://aistudio.google.com/apikey",
        "blurb": "Gemini Flash / Pro",
    },
    "gemini_vertex": {
        "id": "gemini_vertex",
        "label": "Gemini (Vertex AI)",
        "emoji": "🔷",
        "protocol": PROTOCOL_VERTEX,
        # Vertex paths are project-scoped: the user supplies
        # https://{region}-aiplatform.googleapis.com/v1/projects/{project}/locations/{region}
        "base_url": "https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT/locations/us-central1",
        "env_keys": ["VERTEX_API_KEY"],
        "default_model": "gemini-2.5-flash",
        "models": ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"],
        "requires_key": True,
        "site": "https://console.cloud.google.com/apis/credentials",
        "blurb": "Same Gemini models · billed to your Google Cloud credits",
    },
    "deepseek": {
        "id": "deepseek",
        "label": "DeepSeek",
        "emoji": "🐋",
        "protocol": PROTOCOL_OPENAI,
        "base_url": "https://api.deepseek.com/v1",
        "env_keys": ["DEEPSEEK_API_KEY"],
        "default_model": "deepseek-chat",
        "models": ["deepseek-chat", "deepseek-reasoner"],
        "requires_key": True,
        "site": "https://platform.deepseek.com/api_keys",
        "blurb": "DeepSeek Chat / Reasoner",
    },
    "deepinfra": {
        "id": "deepinfra",
        "label": "DeepInfra",
        "emoji": "🟢",
        "protocol": PROTOCOL_OPENAI,
        "base_url": "https://api.deepinfra.com/v1/openai",
        "env_keys": ["DEEPINFRA_API_KEY"],
        "default_model": "meta-llama/Llama-3.3-70B-Instruct",
        "models": [
            "meta-llama/Llama-3.3-70B-Instruct",
            "deepseek-ai/DeepSeek-V3",
            "deepseek-ai/DeepSeek-R1",
            "Qwen/Qwen2.5-72B-Instruct",
            "mistralai/Mistral-Small-24B-Instruct-2501",
            "google/gemma-3-27b-it",
        ],
        "requires_key": True,
        "site": "https://deepinfra.com/dashboard",
        "blurb": "200+ open models, cheap inference",
    },
    "deepgram": {
        "id": "deepgram",
        "label": "Deepgram LLM",
        "emoji": "🎙️",
        "protocol": PROTOCOL_DEEPGRAM,
        "base_url": "https://agent.deepgram.com/v1",
        "env_keys": ["DEEPGRAM_API_KEY"],
        "default_model": "think-fast",
        "models": ["think-fast", "phonellm-mini-alpha-2-fp8"],
        "requires_key": True,
        "site": "https://console.deepgram.com",
        "blurb": "One Deepgram key · Think-Fast · free in Early Access",
    },
    "xai": {
        "id": "xai",
        "label": "xAI Grok",
        "emoji": "⚡",
        "protocol": PROTOCOL_OPENAI,
        "base_url": "https://api.x.ai/v1",
        "env_keys": ["XAI_API_KEY"],
        "default_model": "grok-3",
        "models": ["grok-3", "grok-3-mini", "grok-4", "grok-2-latest"],
        "requires_key": True,
        "site": "https://console.x.ai/keys",
        "blurb": "Grok 3 / Grok 4",
    },
    "groq": {
        "id": "groq",
        "label": "Groq",
        "emoji": "🚀",
        "protocol": PROTOCOL_OPENAI,
        "base_url": "https://api.groq.com/openai/v1",
        "env_keys": ["GROQ_API_KEY"],
        "default_model": "llama-3.3-70b-versatile",
        "models": ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "qwen-2.5-72b-instruct"],
        "requires_key": True,
        "site": "https://console.groq.com/keys",
        "blurb": "Ultra-fast Llama / Qwen",
    },
    "mistral": {
        "id": "mistral",
        "label": "Mistral",
        "emoji": "🌪️",
        "protocol": PROTOCOL_OPENAI,
        "base_url": "https://api.mistral.ai/v1",
        "env_keys": ["MISTRAL_API_KEY"],
        "default_model": "mistral-large-latest",
        "models": ["mistral-large-latest", "mistral-small-latest", "open-mistral-nemo"],
        "requires_key": True,
        "site": "https://console.mistral.ai/api-keys",
        "blurb": "Mistral Large / Small",
    },
    "openrouter": {
        "id": "openrouter",
        "label": "OpenRouter",
        "emoji": "🔀",
        "protocol": PROTOCOL_OPENAI,
        "base_url": "https://openrouter.ai/api/v1",
        "env_keys": ["OPENROUTER_API_KEY"],
        "default_model": "openrouter/auto",
        "models": [
            "openrouter/auto",
            "openai/gpt-4o-mini",
            "anthropic/claude-sonnet-4",
            "google/gemini-2.0-flash-001",
            "meta-llama/llama-3.3-70b-instruct",
        ],
        "requires_key": True,
        "site": "https://openrouter.ai/keys",
        "blurb": "One key, 200+ models",
    },
    "together": {
        "id": "together",
        "label": "Together AI",
        "emoji": "🤝",
        "protocol": PROTOCOL_OPENAI,
        "base_url": "https://api.together.xyz/v1",
        "env_keys": ["TOGETHER_API_KEY"],
        "default_model": "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        "models": [
            "meta-llama/Llama-3.3-70B-Instruct-Turbo",
            "Qwen/Qwen2.5-72B-Instruct-Turbo",
            "deepseek-ai/DeepSeek-V3",
        ],
        "requires_key": True,
        "site": "https://api.together.ai/settings/api-keys",
        "blurb": "Open models (Llama, Qwen, DeepSeek)",
    },
    "ollama": {
        "id": "ollama",
        "label": "Ollama (local)",
        "emoji": "🦙",
        "protocol": PROTOCOL_OPENAI,
        "base_url": "http://localhost:11434/v1",
        "env_keys": [],
        "default_model": "llama3.2",
        "models": ["llama3.2", "llama3.1", "qwen2.5", "mistral"],
        "requires_key": False,
        "site": "https://ollama.com/download",
        "blurb": "Free · runs on your machine",
    },
    "lmstudio": {
        "id": "lmstudio",
        "label": "LM Studio (local)",
        "emoji": "🖥️",
        "protocol": PROTOCOL_OPENAI,
        "base_url": "http://localhost:1234/v1",
        "env_keys": [],
        "default_model": "local-model",
        "models": ["local-model"],
        "requires_key": False,
        "site": "https://lmstudio.ai",
        "blurb": "Free · local GUI server",
    },
    "custom": {
        "id": "custom",
        "label": "Custom (OpenAI-compatible)",
        "emoji": "🧩",
        "protocol": PROTOCOL_OPENAI,
        "base_url": "",
        "env_keys": ["LLM_API_KEY"],
        "default_model": "gpt-4o-mini",
        "models": [],
        "requires_key": False,
        "site": "",
        "blurb": "Any OpenAI-compatible endpoint",
    },
}

DEFAULT_PROVIDER = "openai"

# --- app_config keys ---------------------------------------------------------

CFG_PROVIDER = "llm_provider"


def cfg_key_key(provider_id: str) -> str:
    return f"llm_api_key_{provider_id}"


def cfg_model_key(provider_id: str) -> str:
    return f"llm_model_{provider_id}"


def cfg_base_key(provider_id: str) -> str:
    return f"llm_base_url_{provider_id}"


# --- small TTL cache for the active config -----------------------------------
# AI calls happen in bursts (a whole lead batch); one tiny read per call is
# wasteful on Postgres. 5 seconds keeps Settings changes effectively instant.

_CACHE_TTL = 5.0
_cache_lock = threading.Lock()
_cache_at = 0.0
_cache_data: Optional[Dict[str, Any]] = None


def invalidate_cache() -> None:
    """Drop the cached active config (call after saving settings)."""
    global _cache_at, _cache_data
    with _cache_lock:
        _cache_at = 0.0
        _cache_data = None


# --- storage helpers ---------------------------------------------------------

def _db_get(key: str) -> Optional[str]:
    """Read one app_config value; returns None when unset or DB unavailable."""
    try:
        from app.models.database import SessionLocal
        from app.models.schema import AppConfig

        db = SessionLocal()
        try:
            row = db.query(AppConfig).filter(AppConfig.key == key).first()
            if row is None or row.value is None:
                return None
            value = row.value.strip()
            return value or None
        finally:
            db.close()
    except Exception:  # noqa: BLE001 - config reads must never break AI calls
        return None


def _db_set(key: str, value: str) -> None:
    from app.models.database import SessionLocal
    from app.models.schema import AppConfig

    db = SessionLocal()
    try:
        row = db.query(AppConfig).filter(AppConfig.key == key).first()
        if row is None:
            row = AppConfig(key=key)
            db.add(row)
        row.value = value
        from datetime import datetime

        row.updated_at = datetime.utcnow()
        db.commit()
    finally:
        db.close()


def mask_key(value: str) -> str:
    if not value:
        return ""
    if len(value) <= 8:
        return "*" * len(value)
    return ("*" * max(0, len(value) - 4)) + value[-4:]


# --- resolution ---------------------------------------------------------------

def get_active_provider_id() -> str:
    pid = _db_get(CFG_PROVIDER) or os.getenv("LLM_PROVIDER") or DEFAULT_PROVIDER
    return pid if pid in PROVIDERS else DEFAULT_PROVIDER


def resolve_provider(
    provider_id: Optional[str] = None,
    *,
    api_key: Optional[str] = None,
    model: Optional[str] = None,
    base_url: Optional[str] = None,
) -> Dict[str, Any]:
    """Resolve the full runtime config for a provider.

    Passing ``provider_id=None`` resolves the *active* provider (cached).
    Explicit ``api_key``/``model``/``base_url`` arguments act as one-off
    overrides (used by the Settings test endpoint for unsaved values).
    """
    overrides = any(v is not None for v in (api_key, model, base_url))

    if provider_id is None and not overrides:
        global _cache_at, _cache_data
        with _cache_lock:
            if _cache_data is not None and (time.time() - _cache_at) < _CACHE_TTL:
                return dict(_cache_data)
        cfg = _resolve_uncached(None, None, None, None)
        with _cache_lock:
            _cache_at = time.time()
            _cache_data = dict(cfg)
        return cfg

    return _resolve_uncached(provider_id, api_key, model, base_url)


def _resolve_uncached(
    provider_id: Optional[str],
    api_key: Optional[str],
    model: Optional[str],
    base_url: Optional[str],
) -> Dict[str, Any]:
    pid = provider_id or get_active_provider_id()
    meta = PROVIDERS.get(pid) or PROVIDERS[DEFAULT_PROVIDER]
    pid = meta["id"]

    # 1) explicit override  2) database  3) generic env  4) provider env
    if api_key is None:
        api_key = _db_get(cfg_key_key(pid))
    if api_key is None:
        api_key = (os.getenv("LLM_API_KEY") or "").strip() or None
    if api_key is None:
        for env_name in meta.get("env_keys", []):
            val = (os.getenv(env_name) or "").strip()
            if val:
                api_key = val
                break

    if model is None:
        model = _db_get(cfg_model_key(pid))
    if model is None:
        generic_model = (os.getenv("LLM_MODEL") or "").strip()
        if generic_model and pid == get_active_provider_id():
            model = generic_model
    if model is None and pid == "openai":
        env_model = (os.getenv("OPENAI_MODEL") or "").strip()
        if env_model:
            model = env_model
    if not model:
        model = meta["default_model"]

    if base_url is None:
        base_url = _db_get(cfg_base_key(pid))
    if base_url is None:
        generic_base = (os.getenv("LLM_BASE_URL") or "").strip()
        if generic_base and pid == get_active_provider_id():
            base_url = generic_base
    if not base_url:
        base_url = meta.get("base_url") or ""

    requires_key = bool(meta.get("requires_key", True))

    return {
        "provider": pid,
        "label": meta["label"],
        "emoji": meta.get("emoji", ""),
        "protocol": meta.get("protocol", PROTOCOL_OPENAI),
        "api_key": api_key or "",
        "model": model,
        "base_url": base_url,
        "requires_key": requires_key,
        "configured": bool(api_key) or not requires_key,
    }


def resolve_active() -> Dict[str, Any]:
    """Resolved config for whichever provider is currently selected."""
    return resolve_provider(None)


# --- Settings API helpers ----------------------------------------------------

def public_settings() -> Dict[str, Any]:
    """Shape returned to the frontend: providers + key status (never raw keys)."""
    active = get_active_provider_id()
    providers: List[Dict[str, Any]] = []
    for meta in PROVIDERS.values():
        pid = meta["id"]
        stored = _db_get(cfg_key_key(pid)) or ""
        env_val = ""
        for env_name in meta.get("env_keys", []):
            val = (os.getenv(env_name) or "").strip()
            if val:
                env_val = val
                break
        source = "saved" if stored else ("env" if env_val else "")
        shown = stored or env_val
        providers.append(
            {
                "id": pid,
                "label": meta["label"],
                "emoji": meta.get("emoji", ""),
                "protocol": meta.get("protocol", ""),
                "blurb": meta.get("blurb", ""),
                "site": meta.get("site", ""),
                "models": meta.get("models", []),
                "defaultModel": meta.get("default_model", ""),
                "model": _db_get(cfg_model_key(pid)) or "",
                "baseUrl": _db_get(cfg_base_key(pid)) or "",
                "defaultBaseUrl": meta.get("base_url", ""),
                "requiresKey": bool(meta.get("requires_key", True)),
                "keySet": bool(shown),
                "keyMasked": mask_key(shown),
                "keySource": source,
                "active": pid == active,
            }
        )

    active_cfg = resolve_active()
    return {
        "active": active,
        "providers": providers,
        "configured": bool(active_cfg.get("configured")),
        "model": active_cfg.get("model", ""),
        "protocol": active_cfg.get("protocol", ""),
        "label": active_cfg.get("label", ""),
    }


def save_settings(
    provider: Optional[str] = None,
    api_key: Optional[str] = None,
    model: Optional[str] = None,
    base_url: Optional[str] = None,
) -> Dict[str, Any]:
    """Persist settings written from the frontend. Empty strings clear a value."""
    target = provider or get_active_provider_id()
    if provider is not None and provider not in PROVIDERS:
        raise ValueError(f"Unknown provider: {provider}")

    if provider is not None:
        _db_set(CFG_PROVIDER, provider)
    if api_key is not None:
        _db_set(cfg_key_key(target), api_key.strip())
    if model is not None:
        _db_set(cfg_model_key(target), model.strip())
    if base_url is not None:
        _db_set(cfg_base_key(target), base_url.strip())

    invalidate_cache()
    return public_settings()
