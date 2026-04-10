import json
import sys
from pathlib import Path


WORKSPACE_ROOT = Path(__file__).resolve().parents[4]
AGENTS_FILE = WORKSPACE_ROOT / "agents.md"


def emit(payload):
    print(json.dumps(payload, ensure_ascii=True))


def calculate_runway(finance_state):
    balance = finance_state["balance"]
    expenses = finance_state["expenses"]
    total_monthly_burn = sum(expenses.values())

    if total_monthly_burn <= 0:
        return {
            "status": "FAIL",
            "reason": "Data missing",
            "warning": "No burn detected.",
        }

    months_left = finance_state.get("runway_months")
    zero_cash_date = finance_state.get("zero_cash_date")
    health_status = finance_state.get("health_status")

    if months_left is None:
        months_left = round(balance / total_monthly_burn, 1)

    if not zero_cash_date:
        zero_cash_date = ""

    if not health_status:
        health_status = (
            "CRITICAL"
            if months_left < 6
            else "WARNING"
            if months_left < 12
            else "HEALTHY"
        )

    return {
        "status": "PASS",
        "reason": "Runway forecast generated successfully.",
        "current_balance": balance,
        "monthly_burn": total_monthly_burn,
        "breakdown": expenses,
        "runway_months": round(months_left, 1),
        "zero_cash_date": zero_cash_date,
        "health_status": health_status,
    }


def parse_agents_finance():
    if not AGENTS_FILE.exists():
        return None

    balance = None
    monthly_burn = None
    runway_months = None
    zero_cash_date = None
    health_status = None
    expenses = {}
    inside_expenses = False

    for raw_line in AGENTS_FILE.read_text(encoding="utf-8").splitlines():
        line = raw_line.rstrip()
        stripped = line.strip()

        if stripped.startswith("current_balance_eur:"):
            balance = float(stripped.split(":", 1)[1].strip())
            continue

        if stripped.startswith("monthly_burn_eur:"):
            monthly_burn = float(stripped.split(":", 1)[1].strip())
            continue

        if stripped.startswith("runway_months:"):
            runway_months = float(stripped.split(":", 1)[1].strip())
            continue

        if stripped.startswith("zero_cash_date:"):
            zero_cash_date = stripped.split(":", 1)[1].strip()
            continue

        if stripped.startswith("health_status:"):
            health_status = stripped.split(":", 1)[1].strip()
            continue

        if stripped == "expenses:":
            inside_expenses = True
            continue

        if inside_expenses:
            if not line.startswith("    ") or ":" not in stripped:
                inside_expenses = False
                continue

            name, value = stripped.split(":", 1)
            expenses[name] = float(value.strip())

    if balance is None or not expenses:
        return None

    return {
        "balance": balance,
        "monthly_burn": monthly_burn,
        "runway_months": runway_months,
        "zero_cash_date": zero_cash_date,
        "health_status": health_status,
        "expenses": expenses,
    }


def load_input():
    if len(sys.argv) > 1 and sys.argv[1].strip():
        try:
            data = json.loads(sys.argv[1])
        except json.JSONDecodeError:
            return None

        if isinstance(data, dict) and "balance" in data and "expenses" in data:
            return data

    return parse_agents_finance()


if __name__ == "__main__":
    try:
        data = load_input()

        if not data:
            emit({"status": "FAIL", "reason": "Data missing"})
        else:
            emit(calculate_runway(data))
    except Exception:
        emit({"status": "FAIL", "reason": "Data missing"})
