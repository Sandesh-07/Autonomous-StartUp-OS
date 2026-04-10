import json


def sync_cap_table():
    # Search Bookkeeping log for the EUR25,000 Founder Equity injection
    with open("finance/BOOKKEEPING_LOG.md", "r", encoding="utf-8") as f:
        log = f.read()

    if "Founder_Equity_Deposit: 25000" in log:
        cap_table = {
            "entity": "CyberBerlin Robotics GmbH",
            "shares": 25000,
            "shareholders": [{"name": "Founder", "equity": "100%", "status": "ISSUED"}]
        }
        with open("legal/CAP_TABLE.json", "w", encoding="utf-8") as f:
            json.dump(cap_table, f, indent=2)
        return "CAP_TABLE_UPDATED"
    return "EQUITY_DEPOSIT_NOT_FOUND"


if __name__ == "__main__":
    print(sync_cap_table())
