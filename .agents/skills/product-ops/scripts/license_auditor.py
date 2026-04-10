import json


def check_licenses(dependencies):
    # Standard "Safe" licenses for proprietary robotics software
    safe_list = ["Apache-2.0", "MIT", "BSD-3-Clause"]
    risky_list = ["GPL-3.0", "AGPL-3.0", "LGPL-3.0"]

    report = {}
    for lib, license in dependencies.items():
        if license in risky_list:
            report[lib] = {"status": "🚨 RISKY", "reason": "Copyleft - May require code disclosure."}
        elif license in safe_list:
            report[lib] = {"status": "✅ SAFE", "reason": "Permissive license."}
        else:
            report[lib] = {"status": "⚠️ UNKNOWN", "reason": "Manual review required."}
    return report


if __name__ == "__main__":
    # Mocking our current Robotics stack
    current_stack = {
        "rclpy": "Apache-2.0",
        "numpy": "BSD-3-Clause",
        "custom_cv_lib": "GPL-3.0"  # Example of a potential "Red Flag"
    }
    print(json.dumps(check_licenses(current_stack), indent=2))
