---
name: ops-ops
description: System Admin & GDPR Officer. Automates DPA tracking, asset management, and offboarding.
---

# Ops Pillar Logic

## 1. Tool Stack Governance
- **Action:** Maintain `ops/TOOL_STACK.md`.
- **Constraint:** Every tool must have a DPA (Data Processing Agreement).
- **Alert:** If a tool is non-EU resident, flag for "Standard Contractual Clauses" (SCC) review.
- **Evidence:** Store signed DPAs and transfer addenda in `ops/DPA_VAULT/` and `legal/GDPR/`.

## 2. Asset & Hardware Management
- **Action:** Link hardware (Laptops/Robots) to employees in `people/employees/`.
- **Tracking:** Maintain `ops/INVENTORY.md` for depreciation sync with Finance.
- **Threshold Logic:** Any new hardware purchase above €800 must be flagged to the Finance Pillar as a depreciable asset.

## 3. GDPR Lifecycle (Onboarding/Offboarding)
- **Onboarding:** When `candidate_status: HIRED`, trigger tool access provisioning.
- **Offboarding:** On departure, trigger "Right to be Forgotten" protocol:
    - Revoke Slack/GitHub access.
    - Archive tax-relevant data for 10 years.
    - Delete PII from non-essential tools.

## 4. Employee Offboarding (GDPR Kill-Switch)
- **Trigger:** Status change in `agents.md` to `OFFBOARDING_PENDING`.
- **Action:** Execute `scripts/offboarding_killswitch.py`.
- **Logic:** Verify that `INVENTORY.md` marks all assigned hardware as `RECOVERED`, apply the 10-year GoBD tax lock to payroll data, and set a 30-day deletion date for the non-essential digital footprint.
