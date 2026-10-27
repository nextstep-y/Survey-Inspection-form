# BR115 Pot Bearing outline recheck - 2026-10-27

P-1091 through P-1094. Local changes only; not published. Original downloaded CSV remains untouched; subsequent application exports use the corrected calculation.

## Direct drawing readings

Source: NSCR-GCR-N03-ZWD-DRC-ST-001714 Rev B, sheets 066052-B through 066057-B (PDF pages 6-11). Pages rendered at 4000 px; S4/S5 dimension strings additionally cropped and inspected at full resolution. These are Top Plate outer dimensions, not anchor/dowel center spacings or bottom-plate diameters.

| ID | Top Plate outer dimensions mm | Bolt centers shown on top half-plan mm | Result |
|---|---|---|---|
| S1 | 1025 x 630 | 925 x 540 | Existing size retained |
| S2 | 1675 x 1250 | 1475 x 1065 | Existing size retained |
| S3 | 815 x 595 | 735 x 515 | Existing size retained |
| S4 | 1480 x 1480 overall envelope | Do not infer top-lug bolt pattern from bottom 1047 values | Existing size retained |
| S5 | **1565 x 1250** | **1365 x 1065** | Corrected misread 1865 to 1565 |
| S6 | 1275 x 1165 | 1135 x 1025 | Existing size retained |

The plan is a half-TOP / half-BOTTOM representation. Lower-half dowel spacing must not be substituted for the upper Top Plate envelope.

P-1091/P-1094 use S3 left, S1 right; P-1093 uses S6 left, S2 right. Their size controls remain unchanged. P-1092 uses S5 left, S4 right.

## Pot Bearing orientation - latest user instruction supersedes plan override

066056-B identifies the long dimension as transverse, while 023167-B plan depicts the 1250 direction across the head (OS). After initially choosing the plan, the user explicitly superseded that choice: use **LONGITUDINAL=CH and TRANSVERSE=OS from each bearing detail for every Pier**. Therefore S5 is now **CH 1250 / OS 1565**. S1/S2/S3/S6 keep their detail longitudinal dimension along CH; S4 retains its symmetric envelope. The rule applies to all eight supported Pot Bearing Piers (P-888 through P-891, P-1091 through P-1094), with BR114's own dimensions retained separately.

Earlier chat claims that all P-1092 controls were correct, and then that a 90-degree rotation was conclusively required, were premature. The numeric correction is confirmed independently; the orientation conflict must be resolved separately.

All four PBL points are recalculated: PBL1/PBL3 at CH +/-625 mm and PBL2/PBL4 at OS +/-782.5 mm relative to S5 center. Center N/E and approved levels are unchanged. Bearing Plinth +30 mm enlargement is not applied to Pot Bearing plates.

## Verification

The application checker independently uses the newly transcribed outer dimensions, checks all eight BR114/BR115 Piers for midpoint dimensions, centers, CCW naming, transformed N/E, table/CSV identity and Blender selection. BR114 source dimensions remain separate and unchanged. Only P-1091 through P-1094 Blender records/variants are rebuilt; lower profiles and internal component thicknesses remain schematic.

Latest axis-rule follow-up: all eight supported Piers and available variants were rebuilt. BR114 sheets 066040-B/066041-B/066042-B/066044-B/066045-B were rendered and visually rechecked for the plan-arrow axes; their existing mappings already comply. All eight Pier tests passed after the S5 BR115 axis change. P-1092 rendered final view inspected; CSV exports derive from the same rotated points. Original downloaded CSV files are not overwritten. No GitHub upload performed.
