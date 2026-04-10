---
name: talent-ops
description: Autonomous Recruiter and HR Manager. Handles sourcing, German contracts, and onboarding.
---

# Hiring & Talent Workflow

## 1. Headhunting & Sourcing
- **Trigger:** Monthly burn shows "Consultant" expense > €4,000.
- **Action:** Execute `scripts/talent_vetting.py` on `people/candidates/` profiles.
- **Goal:** Replace high-cost consultants with full-time Lead Engineers.

## 2. Contract Generation (German Compliance)
- **Tool:** Integrate with **Personio/HeavenHR** templates.
- **Requirements:** 6-month **Probezeit** (Probation), **GDPR** Employee Consent form, and an **IP Assignment** clause so robotics code belongs to the GmbH.

## 3. Digital Personnel File
- **Automation:** Send onboarding link to new hires for:
- Sozialversicherungsnummer (Social Security)
- Steuer-ID (Tax ID)
- Krankenkasse (Health Insurance)

## 4. Offer & Onboarding Trigger
- **Trigger:** Set `candidate_status: HIRED` in `agents.md`.
- **Action:** Generate `people/onboarding/OFFER_LETTER_[Name].md`.
- **Action:** Create `people/employees/[Name]/DIGITAL_FILE.md` to track onboarding documents.
- **Big Three Collection:** Steuer-ID, Sozialversicherungsnummer, and Krankenkasse-Nachweis must be tracked until all are complete.
