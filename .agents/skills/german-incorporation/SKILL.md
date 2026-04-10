---
name: german-incorporation
description: Autonomous GmbH/UG formation engine for Germany.
version: 1.0.0
---

# German Incorporation Workflow

## Step 1: Name Validation (Handelsregister)
Call `scripts/core_legal.py check_name` with the proposed company name.
- **Agent Action:** If unavailable, search the Handelsregister for similar names and suggest 3 alternatives that avoid trademark collision..
"Agent Action: If the user is in a hurry, offer to draft a 'Name Inquiry' email to the local IHK (e.g., IHK Berlin) to get a non-binding confirmation of name admissibility before the notary appointment."
## Step 2: Automated Drafting
When the user confirms, collect:
- Share capital (default: 25,000 EUR for GmbH).
- Shareholder JSON list: `[{"name": "...", "address": "...", "shares": "..."}]`.
- **Execution:** Run `scripts/core_legal.py generate`.
- **Artifact:** Save the resulting `.md` and a generated `.pdf` version to `legal/drafts/`.

## Step 3: Notary & eID Orchestration
Germany uses **online.notar.de**. Provide the user with a tailored "Notary Packet":
1. Open the [Notary Search](https://www.notar.de) and find 3 notaries in the user's city.
2. Draft the "Initial Contact Email" for the notary, including the path to the generated draft.
3. **Mandatory Check:** Ask the user if they have a valid **eID (Personalausweis with chip)** or an EU-equivalent, as this is required for the video-session.

## Step 4: Financial Loop (The "12.5k Milestone")
Monitor the `agents.md` file for the `bank_account_ready` status.
- Once the account exists, prompt the user to deposit **€12,500** (for GmbH).
- Remind the user to send the **Deposit Receipt (Einzahlungsbeleg)** to the Notary to trigger the Commercial Register filing.

# Compliance Rules
- Use UTF-8 encoding for all German special characters (ä, ö, ü, ß).
- Never proceed to Step 3 without Step 1 being "GREEN" in `agents.md`.Run the 'generate' function in scripts/core_legal.py to create the draft.

Tell the user the draft is ready in legal/drafts/ and explain the next step for online.notar.de."

Step 2: Test the "Autonomous" Loop
Once that file is created, you are ready for your first "live" run. Type this into the chat:

"@agent I want to start a company called 'CyberBerlin Robotics GmbH'. Run the name check and if it's clear, generate the documents with me as the sole shareholder, 25k capital, based in Berlin."
