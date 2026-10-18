# BR Dowel center-axis audit - 2026-10-18

Status: 9 individually checked Pier Head plans, 72 calculated plan axes. P-1049 and P-1050 are excluded at the user's request because their Pier Head layouts are not finalized. P-1051 is withheld: the PDF found under its folder identifies P-1048 in the official title block. No inferred replacement layout is used.

## Drawing controls

The source drawings below use the prefix `NSCR-ITD-N03-ZWD-DWG-ST-`. Each plan was rendered and visually checked for official Pier ID/revision, bearing IDs, bearing centers, and the printed bottom Dowel grid. All dimensions in the table are metres except the square grid spacing in millimetres. There are four axes per bearing.

| Pier | Drawing | Bearing | Center CH | Center OS | Dowel grid mm |
|---|---|---|---:|---:|---:|
| P-888 | 023177-A | BC01 S3 | +0.925 | -2.400 | 378 x 378 |
| P-888 | 023177-A | BC01 S1 | +0.925 | +2.400 | 414 x 414 |
| P-889 | 023011-B | BC01 S5 | 0 | -2.000 | 873 x 873 |
| P-889 | 023011-B | BC01 S4 | 0 | +2.000 | 902 x 902 |
| P-890 | 023159-A | BC01 S6 | 0 | -2.000 | 795 x 795 |
| P-890 | 023159-A | BC01 S2 | 0 | +2.000 | 852 x 852 |
| P-891 | 023158-B | BC01 S3 | -0.925 | -2.400 | 378 x 378 |
| P-891 | 023158-B | BC01 S1 | -0.925 | +2.400 | 414 x 414 |
| P-1048 | 023003-B | BC02 S3 | +0.925 | -2.400 | 400 x 400 |
| P-1048 | 023003-B | BC02 S1 | +0.925 | +2.400 | 449 x 449 |
| P-1091 | 023165-C | BC03 S3 | +0.925 | -2.400 | 453 x 453 |
| P-1091 | 023165-C | BC03 S1 | +0.925 | +2.400 | 488 x 488 |
| P-1092 | 023167-B | BC03 S5 | 0 | -2.000 | 1004 x 1004 |
| P-1092 | 023167-B | BC03 S4 | 0 | +2.000 | 1047 x 1047 |
| P-1093 | 023162-B | BC03 S6 | 0 | -2.000 | 933 x 933 |
| P-1093 | 023162-B | BC03 S2 | 0 | +2.000 | 1004 x 1004 |
| P-1094 | 023170-B | BC03 S3 | -0.925 | -2.400 | 453 x 453 |
| P-1094 | 023170-B | BC03 S1 | -0.925 | +2.400 | 488 x 488 |

Direction cross-check: `The Direction of Pot Bearing.pdf`, pages 1-3, bearing keyplans MCRP-DWG-BC01-ST-2050 / BC02-ST-3055 / BC03-ST-4055, revision 31. Their explicit Increasing Chainage arrow establishes bearing order and transverse sides. Only direction/identity is reused from these older keyplans: the newer per-pier plans control center offsets and Dowel grids. Thus Main Pier 3 (P-890/P-1093) has S6 at negative OS and S2 at positive OS, despite opposite left/right positions on its rotated plan sheet.

Detail cross-check: `BCPotdrawings_Scale1to1-MO-REVISED by P Num (1).pdf`. This drawing distinguishes bottom Dowel axes from top attachment bolt axes. Fixed-bearing details may be rotated relative to the Pier plan; the plan's dimensioned square grid controls, not an unrotated generic bearing symbol. P-1092 S4 uses the plan's printed 1047 mm grid.

023003-B's official title block identifies P-1048 / BR112 and its BC02 details agree with the 400/449 mm Pot drawing. An internal plan caption contains copied P-1091 text; this discrepancy is recorded rather than using that caption as a Pier mapping. The same file under P-1051's folder does not establish a P-1051 layout.

## Calculation and point identity

For bearing center `(CHc,OSc)` and square grid `s` metres:

- D1 = `(CHc+s/2, OSc-s/2)`
- D2 = `(CHc+s/2, OSc+s/2)`
- D3 = `(CHc-s/2, OSc+s/2)`
- D4 = `(CHc-s/2, OSc-s/2)`

Names are `S1-D1` through `S1-D4`, etc. With the current Pier center `N0/E0` and WCB `a`, the same canonical model supplies form and CSV:

`N = N0 + CH*sin(a) + OS*cos(a)`

`E = E0 - CH*cos(a) + OS*sin(a)`

CSV retains existing `Point,Easting,Northing,Z` column order, metre units, and 3 decimal places for N/E. Dowel design Z is blank, not Top of Pier or zero. No source CSV is imported. Existing T coordinates and elevations are preserved.

## Model / safety boundaries

Blue crosses show plan-axis projections, not Dowel diameter, embedment length, top elevation, or fabrication geometry. The generic projection plane is the head datum; P-1091/P-1094 use the checked low plinth-top display plane +0.124 m. These display planes never become survey Z values. Projection markers draw in front so upstands cannot conceal an axis.

P-1091 retains the approved detailed head/upstands/plinth meshes, with a shortened display column and newly arranged leader rails. Its legacy Head T display uses reversed CH; only the Dowel visual copy compensates for that frame. Dowel survey CH/N/E remain in the bearing/keyplan chainage frame, consistent with bearing center controls. No T coordinate is silently reversed to accommodate the new axes.

Overall head plan envelopes are 6.000 x 5.000 m (main) and 6.480 x 3.500 m (transition), from the individual plans. Existing T extents are not reinterpreted as those concrete dimensions. P-1048 currently lacks canonical T controls, so its model shows the verified plan envelope and Dowel axes only; it does not manufacture new T survey points. Lower head profiles remain PARTIAL review envelopes outside the detailed P-1091 prototype. This update does not certify all existing T controls, plinth footprints, or Pot Bearing assembly heights.

Runtime guards compare the complete local model to its prepared Blender geometry. A live edit that changes geometry falls back to calculated Canvas rather than displaying a stale image. Existing structural, Bearing Plinth and Elastomeric model inventories are unchanged. Point tables use continuation pages when necessary; no Dowel or T row is dropped.

## Verification

- `scripts/check-dowel-model.cjs`: independent per-pier spacing and center controls; 72 calculated axes; exact N/E formula; blank Z; unique labels; excluded piers; image freshness guards.
- Existing Head, Bearing Plinth and Elastomeric regression checks remain passing.
- UI readback verifies table values against the model and exported CSV; actual A4 landscape PDFs are rendered for review.
- All nine reviewed Pier Head + Dowel forms were printed to PDF: each is one A4 landscape page, and PDF text readback contains all eight Dowel names. The 18-row print CSS and pagination limit are checked together to prevent silently hiding rows 17-18.
- `scripts/audit-br-dowel-sources.py` captures rendered evidence under ignored `output/br-dowel-audit/`; it is a read-only capture, not an automatic approval engine.
