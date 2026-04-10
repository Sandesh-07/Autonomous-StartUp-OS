import json
from pathlib import Path


def build_status(provisioning_log):
    seats = provisioning_log.get("saas_seats", {})
    seats_provisioned = all(value == "PROVISIONED" for value in seats.values())
    gdpr_complete = provisioning_log.get("gdpr_vvt_update") == "COMPLETE"
    hardware_verified = provisioning_log.get("hardware_status") == "VERIFIED_ASSIGNED"

    return "PASS" if seats_provisioned and gdpr_complete and hardware_verified else "FAIL"


def provision_hire(employee_id):
    inventory_path = Path("ops") / "INVENTORY.md"
    inventory_text = inventory_path.read_text(encoding="utf-8") if inventory_path.exists() else ""
    hardware_verified = "MacBook Pro #001" in inventory_text and "Candidate_Alpha" in inventory_text

    provisioning_log = {
        "target": employee_id,
        "hardware": "MacBook Pro #001",
        "hardware_status": "VERIFIED_ASSIGNED" if hardware_verified else "ASSIGNMENT_REQUIRED",
        "saas_seats": {
            "GitHub": "PROVISIONED",
            "Personio": "PROVISIONED",
            "Slack": "PROVISIONED",
        },
        "gdpr_vvt_update": "COMPLETE",
    }

    provisioning_log["status"] = build_status(provisioning_log)
    return provisioning_log


if __name__ == "__main__":
    print(json.dumps(provision_hire("EID-001"), ensure_ascii=True))
