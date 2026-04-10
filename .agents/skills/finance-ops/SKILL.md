---
name: finance-ops
description: Autonomous CFO for German Startups. Handles ZUGFeRD e-invoices, VAT prep, and runway forecasting.
---

# Finance Pillar Logic

## 1. Data Ingestion (ZUGFeRD/XRechnung)
When a file is added to `finance/inbox/`:
- **Action:** Extract XML metadata (Vendor, VAT 19%/7%, Amount, Due Date).
- **Compliance:** Log entry in `finance/BOOKKEEPING_LOG.md` for GoBD compliance.

## 2. Runway Forecasting
Execute `scripts/finance_engine.py` whenever `agents.md` balance or expenses change.
- **Goal:** Maintain the "Live Dashboard" in `finance/FORECAST.md`.
- **Threshold:** If `runway_months` < 6, trigger 'Hiring Freeze' recommendation.

## 3. VAT (Umsatzsteuer) Automation
- **Action:** Every 1st of the month, scan `finance/BOOKKEEPING_LOG.md`.
- **Logic:** Calculate total "Input VAT" (VAT paid on expenses).
- **Output:** Generate `finance/reports/UST_VORANMELDUNG_APRIL_2026.md`.
- **Threshold:** If total VAT > €1,000, flag for "Manual Review" before ELSTER submission.

## 4. Bank Sync (FinTS/XS2A)
- **Action:** Mock connection to bank to verify the €12,500 deposit milestone.
- **State Change:** Once verified, update `agents.md` -> `capital_deposited: true`.

## 4. Grant Scavenger Protocol (IBB Focus)
- **Periodic Task:** Run `scripts/grant_scavenger.py` every Friday.
- **Action:** If a document is 'MISSING', the agent must draft a skeleton version using the Robotics Consultant's logs.
- **CEO Alert:** If the readiness score is 100%, notify the CEO: "Grant Submission Window is open. Documents are verified in /legal/finance/grants/."

## 5. Grant Search & Collect
- **Action:** Search for IBB GründungsBONUS Plus 2026 guidelines.
- **Collection:** Automatically download and save the official PDF checklists and business plan templates to `legal/finance/grants/`.
- **Gap Analysis:** Compare our current `agents.md` state against the 2026 eligibility rules:
- `[ ]` Company < 18 months old? (Check)
- `[ ]` Innovation level? (Robotics = High)
- `[ ]` Founder majority? (Check)
- **Pre-Drafting:** Use the consultant's work logs to draft the "Technical Innovation" section of the application.
