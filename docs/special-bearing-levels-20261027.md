# Special Bearing Plinth level follow-up - 2026-10-27

Local implementation only; not published to GitHub and no Google Sheet edits.

## Source-backed corrections

Offsets below are from RL A / Top of Pier, in metres. Increasing is U (+CH). The existing plan footprint and N/E are unchanged.

| Pier / records | Increasing | Decreasing | Visually reviewed controlling sheet |
|---|---:|---:|---|
| P-967, P-967A, P-968 | .097 | .097 | 023061-C |
| P-969 | .140 | .097 | 023095-B |
| P-974 | .097 | .140 | 023069-B |
| P-975 | .112 | .097 | 023065-B |
| P-977 / L / R | Type2 .150; middle Type1 .140 | CIS50 .112 | 039356-E sections 03/05, approved 023214-F point mapping |
| P-990 | .097 | .112 | 023077-B |
| P-991 | .140 | .097 | 023088-A |
| P-1106 | .097 | .140 | 023085-B |
| P-1107 | .112 | .097 | 023081-B |
| P-1122 | .140 | .097 | 023073-A |
| P-1142 | CP N04 excluded | CP N03 .140 | 038582-C section 3 and bearing arrangement |

P-990 correction to historical diagnosis: the actual arrow in 023077-B points **UP**, not down. The previous audit's direction statement was wrong; no U/D footprint reversal is needed. All U points are now Top Pier 90.085 + .097 = **90.182**, all D points **90.197**. Previously only UR1-4 had the special .097 rule while other groups fell through to .140.

P-1142: the detail dimension is .140 from RL A 113.260 to Top Plinth **113.400**, not .140 above Headstock 113.360. Existing .140 was retained and source-locked.

## Partial P5D corrections and information required

| Pier / records | Confirmed and implemented | Still required |
|---|---|---|
| P-1108 / L / R | D CIS50 .112 (039451-B section 03); U middle Type1 .140 (039452-B section 07) | Approved Type2 concrete-plinth height from RL A. 039453-B section 10 has no explicit vertical dimension. Do not borrow P-977's .150 by family name. |
| P-1120 / L / R | U CIS50 .112 (023233-E elevation C); D middle Type1 .140 (023232-E elevation A) | Confirmation of 039356-E applicability/revision for its Type2, or individual detail. 023232-E references 039356/039357, but without revision; this run does not assume P-977's .150 automatically applies. |
| P-966 | No guessed heights assigned | Individual CIS40/CIS70/Type1 heights or approved bearing level schedule. 023098-B refers to VIA00-ST-0801 Detail A. The retrieved Rev30 standard expressly varies plinth height with instantaneous longitudinal gradient; its example is not a P-966 setting-out control. |

P-1108 middle U groups are UL9-12 / UR1-4. P-1120 middle D groups are DL9-12 / DR1-4. Other Type2 groups retain legacy data **unverified**; the form now explicitly warns not to set out Type2 from those levels in both Bearing Plinth and Elastomeric views. P-966 has its own unverified-level warning.

## Remaining footprint evidence requests (22 application records)

- P-892, P-1043, P-1056, P-1088, P-1098, P-1099: approved Pier Head plan/schedule identifying the Pier and bearing arrangement.
- P-973, P-978, P-979, P-980, P-981, P-984, P-985, P-991A: approved plan or schedule explicitly assigning the Pier to the arrangement; a family label alone is insufficient.
- P-989 / L / R: approved combined-head center N/E, current plan 023216 and rotated-bearing orientation / L-R reference reconciliation.
- P-1048: approved Pier-specific plan resolving 023151 applicability.
- P-1049 and P-1050: remain skipped at the user's prior instruction until approved plans are available.
- P-1051: corrected plan whose title/Pier identity matches P-1051. Its separately confirmed Top Pier 103.238 does not validate a conflicting plan footprint.
- P-1104: approved 023180 plan/schedule and Pier assignment.

These 22 are not additive to every level limitation. Previously individually controlled BR/Pot records are retained, not newly certified by this batch.

## Validation

- `check-confirmed-plinth-levels.cjs`: **71 full-control records**, 142 selector cases, **2,728 point-level checks**, displayed table = CSV, stale online rules blocked, 12 Blender selections; **264 partial-group checks** for P-1108/P-1120, including visible Type2 warnings in both works.
- `check-p6-head-islands.cjs`: 6 Piers / 96 point cases passed again.
- Read-only audit: 381 records, **1,469 matched offset groups, 0 conflicting groups, 121 unresolved groups**. This is NOT 381 certified Piers: source-null groups and missing/ambiguous datum evidence remain unresolved. COLUMN_TEXT_MATCH is not rendered absolute-level certification.
- Bearing / Elastomeric Blender templates regenerated; P-990, P-977 and P-1142 rendered views inspected. Long multi-bearing heads retain dense leader lines and partial schematic lower profiles.
- Levels derive from the approved Top Pier and group rule; Elastomeric retains project +.067 above the corrected Plinth. Elastomeric N/E and unresolved support alignment were not silently altered.
