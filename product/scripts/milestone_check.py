import os
import json


def verify_grant_readiness():
    # The July Grant Milestone requires the Autonomy Core source files
    required_files = [
        "src/autonomy_core/navigation.py",
        "src/autonomy_core/perception.py",
        "src/autonomy_core/sensor_fusion.py",
    ]
    missing = [f for f in required_files if not os.path.exists(f)]

    status = "CLAIM_READY" if not missing else "PENDING"

    # Logic: If ready, update the Finance Pillar's visibility
    with open("finance/GRANT_EVIDENCE.md", "w", encoding="utf-8") as f:
        f.write(f"# Grant Evidence Log\nStatus: {status}\nMissing: {missing}")

    return status


if __name__ == "__main__":
    print(f"Current July Tranche Status: {verify_grant_readiness()}")
