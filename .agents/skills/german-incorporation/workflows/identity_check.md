# ID Verification & Contingency Workflow

## Phase A: Pre-Flight Check
1. **Device Audit:** - Ask the user: "Is your smartphone NFC-enabled and do you have the 'Notary App' installed?"
   - Confirm the PC browser is Chrome, Edge, or Safari (required for online.notar.de).
2. **Document Audit:**
   - Confirm ID type: [German Personalausweis / EU eID / eAT].
   - **Verification:** "Does your ID have the chip symbol? Was it issued after Aug 2, 2021?"

## Phase B: Real-Time State Update
- **If User confirms eID is READY:** - Set `eid_status: ACTIVE` in `agents.md`.
  - Trigger `scripts/notary_outreach.py --mode online`.
- **If User reports PIN BLOCKED:** - Set `eid_status: BLOCKED` in `agents.md`.
  - **Action:** Draft `legal/correspondence/Buergeramt_PIN_Reset_Request.md`.
  - **Action:** Provide the Berlin Bürgeramt appointment link: `service.berlin.de/terminvereinbarung/`.
- **If User chooses OFFLINE:** - Set `eid_status: OFFLINE_ONLY` in `agents.md`.
  - **The "Offline Pivot":**
    1. Delete `legal/drafts/*_Initial_Contact_Email.md` (Online version).
    2. Execute `scripts/find_local_notary.py --city Berlin`.
    3. Notify Finance Agent: "Delay detected. Adjust runway forecast by +14 days for physical notarization."
