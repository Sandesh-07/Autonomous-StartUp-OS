import json
from datetime import datetime, timedelta


def execute_offboarding(employee_id, employee_name):
    return {
        "status": "SUCCESS",
        "timestamp": datetime.now().isoformat(),
        "employee_id": employee_id,
        "employee": employee_name,
        "actions": [
            {
                "tool": "GitHub",
                "action": "REVOKE_ACCESS",
                "status": "REVOKE_ACCESS",
                "priority": "HIGH",
                "ui_tone": "warning",
            },
            {
                "tool": "Personio",
                "action": "ARCHIVE_RECORD",
                "status": "COMPLETED",
                "priority": "MEDIUM",
                "ui_tone": "neutral",
            },
            {
                "tool": "Asset_Inventory",
                "action": "COMPLETE_HARDWARE_RECLAMATION",
                "status": "RECLAIMED",
                "priority": "HIGH",
                "ui_tone": "success",
            },
        ],
        "hardware_status": "RECLAIMED",
        "deletion_date": (datetime.now() + timedelta(days=30)).date().isoformat(),
        "retention_policy": "Retaining tax records for 10 years; deleting Slack/Email PII in 30 days.",
    }


if __name__ == "__main__":
    print(json.dumps(execute_offboarding("CID-002", "Contractor_Beta"), ensure_ascii=True))
