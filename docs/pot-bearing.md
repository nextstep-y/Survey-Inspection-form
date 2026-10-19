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
Top Pier + 0.120 m verified plinth rise + assembly height. At the current
Top Pier 113.346 m this gives S6 113.716 m and S2 113.735 m.
The 30 mm concrete plinth enlargement does not apply to steel bearings.

P-1091 through P-1094 are enabled. Other Piers return no points; do not infer layouts
from family names. Pot Bearing acceptance tolerance and ITP are not yet
verified, so no default tolerance is declared.

The 3D view uses four real Blender scenes under assets/models/pot-blender.
White-background renders are under assets/pot-blender. Source-controlled top
surfaces and assembly-height wire envelopes are shown, not invented internal
mechanical parts. S4's shaped plate is an overall-axis outline reference only.
Images are shown only when every source point matches the manifest, including
absolute design Z; changed data falls back to 2D instead of stale labels.
The model also includes the existing head body/islands and all concrete
plinth footprints (including the 30 mm edge enlargement). Pot bottom equals
its centered supporting plinth top; the Blender builder asserts this for all
eight assemblies. Context changes also invalidate the image manifest.
P-1092 uses one shared per-bearing rise in the Plinth form, CSV, Elastomeric,
Pot Bearing and 3D context: S5/BL/CL = +0.120 m, S4/BR/CR = +0.124 m.
Controlling detail: NSCR-ITD-N03-ZWD-DWG-ST-038136-C, sheet 17/24,
sections D1 (S5) and D2 (S4), revision 07 Nov 2025, NNO 09 Dec 2025.
Source file: Downloads/NSCR-ITD-N03-ZWD-DWG-ST-038136 - RevC.pdf.
Rev B contains the same 120/124 mm dimensions. These are measured from
RL A Top of Pier to top plinth; horizontal 150 mm on 023168-B is not a height.
This supersedes the earlier incorrect statement that both bases were 120 mm.
At Top Pier 112.626 m: Plinth S5 112.746, S4 112.750; Top Pot S5 113.015,
S4 112.995 m. N/E coordinates and the 30 mm edge enlargement are unchanged.
The drawing-specific rule precedes generic type or conflicting Sheet fallback.
Rebuild: node scripts/export-pot-blender.cjs then Blender --background
--python-exit-code 1 --python scripts/build-pot-blender.py.

QA: electron scripts/check-pot-bearing.cjs; regression check-p1091-geometry.js.

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

Center controls: head plans 023165-C, 023167-B and 023170-B respectively.
Transition Pot Bearings sit on the low row: increasing side of P-1091,
decreasing side of P-1094. Do not apply the opposite high plinth rise 0.750.
The plan view is centered on the bearing row for legibility; the actual
CH offset is printed and preserved in table/CSV calculations.
