import json
import os
from datetime import datetime


def check_readiness():
    checklist = {
        "Business_Plan": {
            "path": "legal/drafts/Business_Plan.md",
            "keywords": ["Wettbewerbsanalyse", "Skalierbarkeit", "Vertriebskanaele"],
        },
        "Liquidity_Plan_24m": {
            "path": "finance/FORECAST.md",
            "keywords": ["Liquiditaetssaldo", "Tranchen", "Personalaufwand"],
        },
        "Technisches_Innovationsprofil": {
            "path": "legal/finance/grants/TECHNICAL_INNOVATION.md",
            "keywords": ["KI-basiert", "Robotik", "Alleinstellungsmerkmal"],
        },
        "Musterprotokoll": {"path": "legal/drafts/CyberBerlin Robotics GmbH_Musterprotokoll.md"},
        "Founder_CV": {"path": "legal/personal/CV_Founder.pdf"},
    }

    audit_report = {}
    ready_count = 0

    for doc, info in checklist.items():
        path = info["path"]
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") if path.endswith(".md") else open(os.devnull) as handle:
                content = handle.read() if path.endswith(".md") else ""
                missing_keywords = [kw for kw in info.get("keywords", []) if kw not in content]

            if not missing_keywords:
                audit_report[doc] = "READY"
                ready_count += 1
            else:
                audit_report[doc] = {
                    "status": "CONTENT_GAP",
                    "missing": missing_keywords,
                }
        else:
            audit_report[doc] = "MISSING"

    all_ready = ready_count == len(checklist)

    return {
        "status": "PASS" if all_ready else "READY",
        "score": f"{(ready_count / len(checklist)) * 100:.1f}%",
        "audit_report": audit_report,
        "next_step": "Ready for CEO review" if all_ready else "Draft missing documents",
        "timestamp": datetime.now().isoformat(),
    }


if __name__ == "__main__":
    print(json.dumps(check_readiness(), ensure_ascii=True))
