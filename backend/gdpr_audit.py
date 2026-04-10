import json
import os
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI


BACKEND_ROOT = Path(__file__).resolve().parent
ENV_PATH = BACKEND_ROOT / ".env"
SAMPLE_DPA_PATH = BACKEND_ROOT / "data" / "sample_dpa.txt"
MODEL = "gpt-4o"
SYSTEM_PROMPT = """
You are an Autonomous Data Privacy Officer. Audit the provided text for GDPR compliance.
Check for standard clauses like data breach notification timelines and data subject rights.
You must respond ONLY with a valid JSON object in this exact format:
{ "status": "PASS" or "FAIL", "reason": "A concise 1-sentence summary of your finding.", "risk_level": "LOW", "MEDIUM", or "HIGH" }
"""


def emit_json(payload):
    print(json.dumps(payload, ensure_ascii=True))


def normalize_payload(payload):
    status = str(payload.get("status", "FAIL")).upper()
    if status not in {"PASS", "FAIL", "ERROR"}:
        status = "FAIL"

    reason = str(payload.get("reason", "")).strip() or "The audit returned an empty summary."

    risk_level = str(payload.get("risk_level", "HIGH")).upper()
    if risk_level not in {"LOW", "MEDIUM", "HIGH"}:
        risk_level = "HIGH"

    return {
        "status": status,
        "reason": reason,
        "risk_level": risk_level,
    }


def run_gdpr_audit():
    try:
        load_dotenv(ENV_PATH)
        api_key = os.getenv("OPENAI_API_KEY")

        if not api_key:
            emit_json(
                {
                    "status": "ERROR",
                    "reason": "OPENAI_API_KEY is missing from backend/.env.",
                    "risk_level": "HIGH",
                }
            )
            return

        document_text = SAMPLE_DPA_PATH.read_text(encoding="utf-8").strip()
        if not document_text:
            emit_json(
                {
                    "status": "ERROR",
                    "reason": "The sample DPA file is empty.",
                    "risk_level": "HIGH",
                }
            )
            return

        client = OpenAI(api_key=api_key)

        response = client.chat.completions.create(
            model=MODEL,
            response_format={"type": "json_object"},
            temperature=0.2,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT.strip()},
                {"role": "user", "content": f"Audit this document:\n\n{document_text}"},
            ],
        )

        result_json = response.choices[0].message.content or "{}"
        emit_json(normalize_payload(json.loads(result_json)))
    except FileNotFoundError as exc:
        emit_json(
            {
                "status": "ERROR",
                "reason": f"Agent failed to execute: {exc}",
                "risk_level": "HIGH",
            }
        )
    except Exception as exc:
        emit_json(
            {
                "status": "ERROR",
                "reason": f"Agent failed to execute: {exc}",
                "risk_level": "HIGH",
            }
        )


if __name__ == "__main__":
    run_gdpr_audit()
