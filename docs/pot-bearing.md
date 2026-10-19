# Pot Bearing - BR115 P-1091 through P-1094

Source: NSCR-GCR-N03-ZWD-DRC-ST-001714 Rev B, pages 7 and 11;
manufacturer drawings 066053-B (S2) and 066057-B (S6).

Increasing chainage is always up in the plan. PBL is OS-negative (S6),
PBR is OS-positive (S2). Both rotation centers are CH 0, OS +/-2.000 m,
as confirmed by the BR115 keyplan and P-1093 head plan 023162-B.

Points are side midpoints, NOT corners. User confirmed numbering:
1 top, 2 left, 3 bottom, 4 right, counterclockwise.

S6 top outline: OS 1165 mm x CH 1275 mm, assembly height 250 mm.
S2 top outline: OS 1250 mm x CH 1675 mm, assembly height 269 mm.
Manufacturer plan is half-top / half-bottom; these dimensions describe
the full top plate, not the bottom Dowel grid.

N/E is calculated with the existing WCB survey transform. Top Pot is
Top Pier + concrete plinth + bottom grout + assembly height. The controlling
stack now comes from SUMMARY HEIGHT OF BC 1 2 3.xlsx, 'RL A BC' rows 25-32.
At Top Pier 113.346 m, S6 = 113.346 + .119 + .050 + .250 = 113.765 m;
S2 = 113.346 + .120 + .050 + .269 = 113.785 m.
TOP grout (G) is above the Pot Bearing and is NOT part of Top Pot elevation.
This supersedes all previous formulas that omitted the 50 mm bottom grout.
The 30 mm concrete plinth enlargement does not apply to steel bearings.

P-1091 through P-1094 are enabled. Other Piers return no points; do not infer layouts
from family names. Pot Bearing acceptance tolerance and ITP are not yet
verified, so no default tolerance is declared.

The 3D view uses four real Blender scenes under assets/models/pot-blender.
White-background renders are under assets/pot-blender. Source-controlled top
external review solids are shown: bottom plate, pot housing and top plate.
S4 uses a circular top with four mounting lugs instead of an empty wire square.
Outline extents, centers, total assembly height and survey markers are controlled.
Undimensioned housing diameters, component-thickness splits and lug widths are
explicitly schematic visual proportions, not fabrication dimensions or new
stakeout data. Internal seals, pistons and embedment are not modeled.
S1/S2 guide direction is longitudinal; S5 is transverse. Labels and elevations
are app overlays (24/21 logical px) rather than tiny baked image text. The column
stub is shortened for display only; survey geometry and print aspect are retained.
Images are shown only when every source point matches the manifest, including
absolute design Z; changed data falls back to 2D instead of stale labels.
The model also includes the existing head body/islands and all concrete
plinth footprints (including the 30 mm edge enlargement). Pot bottom equals
its centered supporting plinth top plus bottom grout; the Blender builder asserts this for all
eight assemblies. Context changes also invalidate the image manifest.
P-1092 uses one shared per-bearing rise in the Plinth form, CSV, Elastomeric,
Pot Bearing and 3D context: S5/BL/CL = +0.120 m, S4/BR/CR = +0.124 m.
Controlling detail: NSCR-ITD-N03-ZWD-DWG-ST-038136-C, sheet 17/24,
sections D1 (S5) and D2 (S4), revision 07 Nov 2025, NNO 09 Dec 2025.
Source file: Downloads/NSCR-ITD-N03-ZWD-DWG-ST-038136 - RevC.pdf.
Rev B contains the same 120/124 mm dimensions. These are measured from
RL A Top of Pier to top plinth; horizontal 150 mm on 023168-B is not a height.
This supersedes the earlier incorrect statement that both bases were 120 mm.
At Top Pier 112.626 m: Plinth S5 112.746, S4 112.750; Top Pot S5 113.065,
S4 113.045 m including bottom grout. N/E and the 30 mm edge enlargement are unchanged.
The drawing-specific rule precedes generic type or conflicting Sheet fallback.
Rebuild: node scripts/export-pot-blender.cjs then Blender --background
--python-exit-code 1 --python scripts/build-pot-blender.py.

QA: electron scripts/check-pot-bearing.cjs; regression check-p1091-geometry.js.

## Excel stack reconciliation (2026-10-19)

Source workbook is read only. Sheet 'RL A BC': G = top grout, H = bearing ID,
I = bearing height, J = bottom grout, K = concrete plinth, L = SUM(G,I,J,K).
Top Pot = current Top Pier + (I+J+K)/1000; do not add G or count grout twice.
P-1093 row 29 (S2): G=30/I=269/J=50/K=120; row 30 (S6): G=50/I=250/J=50/K=119 mm.
Both complete stacks including top grout equal 469 mm. Top Pot heights differ
because top grout differs. P-1091 rows25/26 and P-1094 rows31/32 total367 mm.
BR115_POT_STACK is the shared source for Pot levels and main-pier plinth rises.
Bottom grout is a distinct schematic-footprint mesh, not extra concrete.
No geometry or elevation changes are made for BC01/BC02 in this update.

## Additional verified layouts

All dimensions below are OS x CH, metres. Source is the same Rev B submittal,
pages 6 (S1 / 066052), 8 (S3 / 066054), 9 (S4 / 066055), 10 (S5 / 066056).

| Pier | PBL / PBR | Center CH | Centers OS | Plinth rise above Top Pier |
|---|---|---:|---|---:|
| P-1091 | S3 / S1 | +0.925 | -2.400 / +2.400 | 0.124 |
| P-1092 | S5 / S4 | 0 | -2.000 / +2.000 | 0.120 / 0.124 |
| P-1094 | S3 / S1 | -0.925 | -2.400 / +2.400 | 0.124 |

S1: 0.630 x 1.025, height 0.147.
S3: 0.595 x 0.815, height 0.143.
S4: 1.480 x 1.480 overall top outline, height 0.245.
S5: 1.865 x 1.250, height 0.269. The long axis is TRANSVERSE (OS),
unlike S2's longitudinal plate. Never reuse the unrotated page axes.
S4 has a shaped top outline; the four points represent its overall axis-edge
midpoints, not an assertion that the actual plate has a rectangular perimeter.
QA also runs scripts/check-pot-blender-scenes.py in Blender to verify all five
saved scenes (four Piers plus P-1092 live Island variant): solid components,
eight source markers, total height and separate 50 mm grout solids.

Center controls: head plans 023165-C, 023167-B and 023170-B respectively.
Transition Pot Bearings sit on the low row: increasing side of P-1091,
decreasing side of P-1094. Do not apply the opposite high plinth rise 0.750.
The plan view is centered on the bearing row for legibility; the actual
CH offset is printed and preserved in table/CSV calculations.
