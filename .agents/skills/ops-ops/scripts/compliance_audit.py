import json


def audit_tool_stack(tools):
    """
    tools: dict of {tool_name: {"dpa": bool, "residency": str, "scc": bool}}
    """
    audit_results = {}
    for name, specs in tools.items():
        issues = []
        warnings = []

        if not specs["dpa"]:
            issues.append("Missing DPA")

        if specs["residency"] not in ["Germany", "EU"]:
            if specs.get("scc"):
                warnings.append(f"Non-EU Residency ({specs['residency']}) covered by SCC")
            else:
                issues.append(f"Non-EU Residency ({specs['residency']})")

        audit_results[name] = {
            "status": "PASS" if not issues else "FAIL",
            "issues": issues,
            "warnings": warnings,
        }
    return audit_results


if __name__ == "__main__":
    current_stack = {
        "Lexware_Office": {"dpa": True, "residency": "Germany", "scc": False},
        "Personio": {"dpa": True, "residency": "Germany", "scc": False},
        "GitHub": {"dpa": True, "residency": "USA", "scc": True},
    }
    print(json.dumps(audit_tool_stack(current_stack), indent=2))
