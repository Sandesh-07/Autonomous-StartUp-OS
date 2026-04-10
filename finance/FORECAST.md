# Finance Forecast Dashboard

Generated on: 2026-04-09
Pillar status: ACTIVE

## Cash Position
- Starting balance: 25,000 EUR
- Monthly burn: 9,850 EUR
- Runway: 7.1 months
- Zero cash date: 2026-11-12
- Health status: CRITICAL

## Burn Breakdown
| Category | Monthly Cost (EUR) |
| --- | ---: |
| SaaS | 150 |
| Legal_Retainer | 300 |
| Cloud_Infra | 100 |
| Office_Berlin | 800 |
| Lead_Engineer_Alpha | 8,500 |
| **Total** | **9,850** |

## Interpretation
- Runway has dropped below the 6-month threshold and now requires immediate intervention.
- Lead_Engineer_Alpha is now the dominant cost driver following the Candidate_Alpha hire.
- Growth mode override: Hiring Freeze recommendation is cancelled in favor of an aggressive growth strategy backed by planned capital inflows.

## Scenario Planning
| Scenario | Monthly Burn (EUR) | Runway (Months) | Zero Cash Date | Health Status | Implication |
| --- | ---: | ---: | --- | --- | --- |
| Current Plan | 9,850 | 7.1 | 2026-11-12 | CRITICAL | Sensor fusion evidence has unlocked the next 10,000 EUR tranche in the active cash path. |
| Consultant Reduced | 3,850 | 6.5 | 2026-10-23 | WARNING | Buys time, but still requires disciplined cost control. |
| Consultant-to-Hire | 9,850 | 2.5 | 2026-06-25 | CRITICAL | This scenario is now active after hiring Candidate_Alpha. |
| Office Downsized | 5,950 | 4.2 | 2026-08-14 | CRITICAL | Helps only marginally because office cost is not the main burn driver. |

## Capital Influx Plan
- Additional Founder Equity: 25,000 EUR targeted for May 2026
- GründungsBONUS Plus grant: +50,000 EUR targeted to arrive in July 2026 with 50% success probability
- Grant disbursement assumption: 5 Tranchen of 10,000 EUR each after approval and proof milestones
- July Grant status: CLAIM_READY
- Tranche trigger: `product/scripts/milestone_check.py` must detect the `Autonomy Beta` milestone in `src/autonomy_core/`, including `sensor_fusion.py`
- Tranche-adjusted zero cash date after the next 10,000 EUR claim: 2026-11-12
- Zero cash date if both funds land and the new employee cost remains at 8,500 EUR/month: 2027-03-16
- Probability-adjusted reference case using expected grant value only: 2026-11-10

```text
Projected Cash Balance (claim-ready path after Candidate_Alpha hire)
2026-04-09  25,000 EUR  ##########
2026-05-01  42,881 EUR  #################
2026-06-01  32,850 EUR  #############
2026-07-01  33,142 EUR  #############
2026-08-01  23,111 EUR  #########
2026-09-01  13,080 EUR  #####
2026-10-01   3,372 EUR  #
2026-11-01     341 EUR  .
```

## Aggressive Growth Readout
- Candidate_Alpha is now hired as Lead Robotics Engineer and the consultant cost has been removed from the active plan.
- The founder equity bridge in May 2026 is essential to avoid the original August 2026 cash-out.
- The July 2026 tranche is now claim-ready because navigation, perception, and sensor fusion evidence are all present.
- Grant preparation should begin immediately to improve the odds on the 50% success assumption.
- With the planned 25,000 EUR founder equity and 50,000 EUR grant secured, the active hire path extends zero cash to 2027-03-16.

## Liquiditätsplanung Highlights
- Liquiditätssaldo before founder equity bridge would have reached zero in August 2026.
- The GründungsBONUS Plus is modeled as 5 Tranchen to reflect staged reimbursement logic.
- Personalaufwand remains the key sensitivity driver because Lead_Engineer_Alpha now represents the majority of monthly burn.
