import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)


def _html_from_text(text: str) -> str:
    escaped = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    paragraphs = [f"<p>{p.strip()}</p>" for p in escaped.split("\n\n") if p.strip()]
    body = "\n".join(paragraphs)
    return (
        "<!DOCTYPE html><html><body style=\"font-family:Inter,Arial,sans-serif;"
        "color:#111;line-height:1.6\">" + body +
        "<p style=\"margin-top:24px;color:#666;font-size:12px\">"
        "MMA Business Prosperity Weapon</p></body></html>"
    )


def send_email(recipient: str, subject: str, body_text: str, body_html: str | None = None) -> dict:
    """Send a real email via SMTP when configured, otherwise return a simulated result.

    Honors the same env vars used by proposals.py:
    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL, SMTP_FROM_NAME.
    """
    smtp_host = os.getenv("SMTP_HOST", "")
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_from = os.getenv("SMTP_FROM_EMAIL", "noreply@mbpw.ai")
    smtp_from_name = os.getenv("SMTP_FROM_NAME", "MMA Business Prosperity Weapon")

    if not recipient or "@" not in recipient:
        return {"sent": False, "simulated": False, "reason": "Invalid recipient email."}

    if not smtp_host or not smtp_user or not smtp_password:
        logger.warning("SMTP not configured — simulating send for %s", recipient)
        return {
            "sent": False,
            "simulated": True,
            "reason": "SMTP not configured; message prepared and logged (simulated send).",
        }

    html = body_html or _html_from_text(body_text)
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{smtp_from_name} <{smtp_from}>"
    msg["To"] = recipient
    msg.attach(MIMEText(body_text, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_from, [recipient], msg.as_string())
        return {"sent": True, "simulated": False, "reason": "Delivered via SMTP."}
    except Exception as e:  # noqa: BLE001
        logger.error("SMTP send failed: %s", e)
        return {"sent": False, "simulated": False, "reason": f"SMTP error: {e}"}
