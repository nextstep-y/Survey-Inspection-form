# P-1091 canvas geometry audit

Verified on 2026-10-15 against the rendered drawing **NSCR-ITD-N03-ZWD-DWG-ST-023165-C**, sheet 01/01, revision C, “Pier Head BR115 (P-1091) — Transition Pier Concrete Details — Plan and Elevation”.

- Recorded source file: [023165-C on Google Drive](https://drive.google.com/file/d/1UtsV1iNB4GOC6Lmg_hp950KZLo48FOXe/view).
- Source folder: [PIER HEAD CONCRETE DETAILS](https://drive.google.com/drive/folders/1nA83W8NGDXXQnRjzoec6HCE4k2DyqJlU).
- Inspection used the locally downloaded PDF and its rendered plan, elevation and side elevation; the filename and visible drawing title/revision identify the evidence.

## Direction and coordinate convention

The **SIDE ELEVATION** shows INCREASING CHAINAGE pointing left, toward B.C. BRIDGE. In the **PLAN**, B.C. BRIDGE points down. These are different views: the side-elevation arrow must not be applied as a left/right axis in the plan.

The source plan is oriented to display increasing chainage upward. Survey CH/OS are local offsets used with the element's WCB; their signs are retained from the approved survey geometry. The P-1091 Pier Head paper view displays negative survey CH upward and explicitly labels `VIEW -CH UP`. Bearing templates retain their existing local frame. Camera direction is configured separately from survey coordinates.

## Bearing plinth controls

All dimensions and offsets below are metres. Centre coordinates are relative to Center Pier. Rise is relative to the low Top of Pier datum.

| Group | Source identification | Center CH | Center OS | Size along CH | Size along OS | Rise above Top of Pier |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| UL | Pot bearing S3 | +0.925 | -2.400 | 0.980 | 0.980 | 0.124 |
| UR | Pot bearing S1 | +0.925 | +2.400 | 1.050 | 1.050 | 0.124 |
| DL | Viaduct bearing, small plinth | -0.925 | -1.700 | 0.450 | 0.550 | 0.750 |
| DR | Viaduct bearing, small plinth | -0.925 | +1.700 | 0.450 | 0.550 | 0.750 |

Both increasing-chainage plinths are on the low side. Both down-chainage plinths are on the high side. The high pier surface is +0.600 m, and its small plinths are another +0.150 m, giving +0.750 m. The low-side pot plinths rise +0.124 m.

The source plan places S1 on the left and S3 on the right before rotation. After rotation to increasing-chainage-up, S3 is UL and S1 is UR. The source plan dimensions 1.700 and 2.400 are transverse offsets; 0.925 is the chainage offset for both pairs.

The small plinth footprint is dimensioned 0.550 along OS and 0.450 along CH in the plan. The elevation's 0.550 dimension terminates at the faces of the 0.150-high plinth below the narrower bearing. The nearby 0.625 plan dimension describes the jacking area. Do not use it as the plinth width. The summary's Type 1 concrete volume of 0.065 m³ is inconsistent with the dimensioned footprint and height; do not derive a replacement footprint from that volume.

## Pier head and column proportions

The single canonical Pier Head geometry places **T7/T1/T6** at survey CH -1.750 m and EL 115.110 m (Top of Pier 114.793 +0.317), and **T8/T3/T5** at survey CH +1.750 m and EL 115.710 m (Top of Pier +0.600 +0.317). T2/T4 remain on the joint and take EL 115.393 m. The T labels and latest levels follow the user's clarification; the physical surfaces and 0.600 m step are verified from 023165-C.

The user confirmed the N/E coordinates in `P-1091_Pier_Head_Design.csv` (downloaded 2026-10-15 at 08:06) while retaining the latest elevations above. S1 retains CH +0.925 m and S2 CH -0.925 m. `getPierHeadModel` builds immutable points containing one CH/OS pair and the N/E/Z calculated by `getPierHeadPointDesign`. The form, exports and Canvas consume this same model. No second `surveyCh`/diagram-CH set or per-label drawing map remains. `getCanvasCamera` supplies one CH-axis sign for projection, applied uniformly to every point including S1/S2. The CSV is a reconciliation reference, not an input file read at runtime; its old Z column is superseded by the latest user choice.

| Element | Width along OS | Depth along CH | Vertical dimension |
| --- | ---: | ---: | --- |
| Pier head envelope | 6.480 m | 3.500 m | Low Top of Pier to bottom: 2.900 m |
| Column / bottom of head | 3.000 m | 2.000 m | Column height is separate from the displayed head depth |

The head's 2.900 m depth consists of a 0.400 m vertical portion below the low datum and a 2.500 m tapered portion. Canvas proportions should use these actual plan dimensions rather than the bearing-corner envelope or a fixed pixel width for the column.

## Verification rules and scope

- Check plan, elevation and side elevation together before mapping the increasing-chainage arrow to CH/OS.
- Keep geometry, elevation and labels under the same per-pier direction convention; check both members of each chainage pair.
- Check plinth centres, footprint dimensions and the pier/column envelope independently against dimension lines.
- Check Canvas, survey rows and exported coordinates against the same canonical controls; a display rotation must not alter survey coordinates.
- This audit verifies **P-1091 only**. It does not establish the same direction, sizes or levels for P-1094 or other special piers.
- The program's Elastomeric addition of **0.067 m above plinth** is a user-specified rule from this conversation, not a dimension verified from drawing 023165-C. The audit does not certify pot-bearing assembly heights or separate elastomeric footprints.

## Implementation checks

- The user clarified that CH/OS must remain in metres, with only abnormally long floating-point tails removed. Display formatting keeps up to four decimals, including half-millimetre source values; it does not round coordinates to whole metres.
- `node scripts/check-p1091-geometry.js` passes 172 source and point-mapping controls, validates 367 stored pier geometries, and executes 731 mocked Canvas renders with finite coordinates. Checks include model immutability, actual geometry changes recalculating N/E, and camera changes leaving survey results intact. This full-set test is a software regression check, not a fresh drawing audit for all piers.
- Browser verification covered P-1091 Bearing Plinths in 2D and 3D, Pier Head in 3D, Elastomeric table readback, and the dense P-989 plinth layout. No browser runtime errors were observed.
- P-1091 table readback: UL/UR plinths 114.917 m, DL/DR 115.543 m; corresponding Elastomeric values under the retained +0.067 m rule are 114.984 m and 115.610 m.
- The 3D camera keeps the requested paper direction vertical and equal-CH/equal-elevation points horizontally aligned. The view's CH-axis sense is shown in the caption. Head/column surfaces are simplified and the displayed shaft is shortened; unsourced head depth is explicitly marked schematic.
- An enlarged Canvas preview is available through the expand button. Reference markers without a sourced design elevation show `REF`, not an assumed elevation.
- After the T-point correction, actual application Canvas output was checked in both 2D and 3D. Both corresponding A4 landscape PDFs remain one page and their survey rows contain the corrected CH and elevation values. The 2D level-break legend has dedicated bottom space and states the physical 0.600 m step separately from the 0.317 m island rise.
- Following the user's coordinate-source confirmation, an actual application runtime comparison verified all 10 form N/E values against the approved downloaded CSV, and all 10 form N/E/Z values against a fresh CSV export. Both comparisons had zero mismatches. PDF text readback verified the approved N/E with the latest Z values; printing remains one page.
- The application was switched through 2D, 3D, 2D and 3D again. All four CSV exports were identical and the canonical point records remained unchanged. Every modeled point across the 367-pier regression set also has finite calculated N/E.
