import sys
import json
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


def check_name(company_name):
    try:
        from deutschland.handelsregister import Handelsregister
    except ImportError as exc:
        raise RuntimeError(
            "Handelsregister lookup is unavailable in this environment. "
            "Use a verified manual check before treating the name as binding."
        ) from exc

    hr = Handelsregister()
    results = hr.search(company_name)
    # If results are found, the name might be taken
    return len(results) == 0


def generate_musterprotokoll(data):
    # Standard German 'Musterprotokoll' Template (simplified)
    template = f"""
    GRÜNDUNGSPROTOKOLL
    Company: {data['name']}
    Seat: {data['city']}
    Capital: {data['capital']} EUR
    Shareholders: {', '.join([s['name'] for s in data['shareholders']])}
    """
    drafts_dir = Path("legal") / "drafts"
    drafts_dir.mkdir(parents=True, exist_ok=True)
    base_name = f"{data['name']}_Musterprotokoll"
    output_path = drafts_dir / f"{base_name}.md"
    pdf_path = drafts_dir / f"{base_name}.pdf"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(template)

    pdf = canvas.Canvas(str(pdf_path), pagesize=A4)
    text = pdf.beginText(50, 800)
    for line in template.strip().splitlines():
        text.textLine(line.strip())
    pdf.drawText(text)
    pdf.save()

    return {"markdown": str(output_path), "pdf": str(pdf_path)}


def draft_pin_reset_guide(location="Berlin"):
    guide = f"""
    # ACTION REQUIRED: eID PIN Reset (Bürgeramt {location})
    Your Online-ID is currently blocked. To proceed with the Autonomous Startup OS:
    1. Visit any Bürgeramt in {location}.
    2. Bring your physical ID card.
    3. Request a 'PIN-Rücksetzbrief' or an immediate PIN reset.
    4. Note: This is free of charge.

    Once reset, tell the agent: 'PIN is active' to resume online incorporation.
    """
    correspondence_dir = Path("legal") / "correspondence"
    correspondence_dir.mkdir(parents=True, exist_ok=True)
    with open(correspondence_dir / "PIN_RESET_GUIDE.md", "w", encoding="utf-8") as f:
        f.write(guide)
    return "Drafted PIN reset guide in /legal/correspondence/"


if __name__ == "__main__":
    # Codex passes arguments as JSON strings via CLI
    task = sys.argv[1]
    payload = json.loads(sys.argv[2])

    if task == "check_name":
        print(json.dumps({"available": check_name(payload['name'])}))
    elif task == "generate":
        paths = generate_musterprotokoll(payload)
        print(json.dumps({"status": "success", "paths": paths}))
    elif task == "draft_pin_reset":
        print(
            json.dumps(
                {
                    "status": "success",
                    "message": draft_pin_reset_guide(payload.get("location", "Berlin")),
                }
            )
        )
