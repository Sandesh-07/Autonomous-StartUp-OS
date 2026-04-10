import json
import sys
from datetime import datetime, timedelta
from pathlib import Path


WORKSPACE_ROOT = Path(__file__).resolve().parents[4]
AGENTS_FILE = WORKSPACE_ROOT / "agents.md"


def emit(payload):
    print(json.dumps(payload, ensure_ascii=True))


def calculate_runway(balance, expenses):
    total_monthly_burn = sum(expenses.values())

    if total_monthly_burn <= 0:
        return {
            "status": "FAIL",
            "reason": "Data missing",
            "warning": "No burn detected.",
        }

    months_left = balance / total_monthly_burn
    zero_date = datetime.now() + timedelta(days=int(months_left * 30.44))

    return {
        "status": "PASS",
        "reason": "Runway forecast generated successfully.",
        "current_balance": balance,
        "monthly_burn": total_monthly_burn,
        "breakdown": expenses,
        "runway_months": round(months_left, 1),
        "zero_cash_date": zero_date.strftime("%Y-%m-%d"),
        "health_status": "CRITICAL" if months_left < 6 else "WARNING" if months_left < 12 else "HEALTHY",
    }


def parse_agents_finance():
    if not AGENTS_FILE.exists():
        return None

    balance = None
    expenses = {}
    inside_expenses = False

    for raw_line in AGENTS_FILE.read_text(encoding="utf-8").splitlines():
        line = raw_line.rstrip()
        stripped = line.strip()

        if stripped.startswith("current_balance_eur:"):
            balance = float(stripped.split(":", 1)[1].strip())
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
            emit(calculate_runway(data["balance"], data["expenses"]))
    except Exception:
        emit({"status": "FAIL", "reason": "Data missing"})
