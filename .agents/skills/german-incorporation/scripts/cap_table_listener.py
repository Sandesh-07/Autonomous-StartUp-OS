import json
from pathlib import Path


def founder_equity_recorded(bookkeeping_log_path):
    content = Path(bookkeeping_log_path).read_text(encoding="utf-8")
    required_markers = [
        "Additional Founder Equity",
        "25,000 EUR",
    ]
    confirmation_markers = [
        "received",
        "deposited",
        "recorded",
        "posted",
    ]
    return all(marker in content for marker in required_markers) and any(
        marker in content.lower() for marker in confirmation_markers
    )


def generate_share_certificate(output_path):
    certificate = """# Share Certificate 001

Certificate Number: 001
Company: CyberBerlin Robotics GmbH
Issued To: Roger Binny
Share Allocation: 100 out of 100 shares
Ownership: 100%

Statement:
This certificate confirms that Roger Binny is recorded as the sole shareholder of CyberBerlin Robotics GmbH according to the current cap table and founder equity structure.

Issued on: 2026-04-09
"""
    Path(output_path).write_text(certificate, encoding="utf-8")
    return output_path


def run_listener():
    bookkeeping_log = Path("finance") / "BOOKKEEPING_LOG.md"
    output_path = Path("legal") / "SHARE_CERTIFICATE_001.md"

    if not bookkeeping_log.exists():
        return {"status": "waiting", "reason": "BOOKKEEPING_LOG.md not found"}

    if founder_equity_recorded(bookkeeping_log):
        generate_share_certificate(output_path)
        return {
            "status": "generated",
            "certificate": str(output_path).replace("\\", "/"),
        }

    return {
        "status": "waiting",
        "reason": "Founder equity injection not yet recorded in bookkeeping log",
    }


if __name__ == "__main__":
    print(json.dumps(run_listener(), indent=2))
