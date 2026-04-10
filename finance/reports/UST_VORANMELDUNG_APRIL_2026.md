# USt Voranmeldung Draft - April 2026

Generated on: 2026-04-09
Status: Draft for Steuerberater review
Period: April 2026

## Assumptions
- Consultant invoice of 5,000 EUR is treated as a gross invoice amount pending XML extraction.
- Office_Berlin expense of 800 EUR is treated as a gross monthly expense estimate.
- Standard German input VAT rate of 19% applied.
- Input VAT estimated with gross-to-net formula: gross * 19 / 119.

## Input VAT Summary
| Expense | Gross Amount (EUR) | VAT Rate | Estimated Input VAT (EUR) |
| --- | ---: | ---: | ---: |
| Senior Robotics Consultant | 5,000.00 | 19% | 798.32 |
| Office_Berlin | 800.00 | 19% | 127.73 |
| **Total** | **5,800.00** |  | **926.05** |

## ELSTER Readiness
- Manual review required: No
- Threshold check: Total input VAT is below 1,000 EUR.
- Note: Replace estimated values with exact XML-derived figures once the ZUGFeRD/XRechnung payloads are available in `finance/inbox/`.

## Suggested Next Step
- Send this draft to the Steuerberater after the source invoices are attached or parsed.
