# Pier Head label release — 2026-10-30

Scope: P-826 through P-1142, including suffix records (381 program records).
This is a software correspondence / rendering audit, not a fresh PDF approval
of all underlying survey geometry.

P-1091 follows the user's confirmed CSV correction:

| Point | Easting | Northing | EL |
|---|---:|---:|---:|
| T1 | 455095.942 | 1677391.202 | 115.110 |
| T3 | 455096.426 | 1677387.736 | 115.710 |

N/E are calculated from CH/OS and WCB, not stored as absolute overrides.
The approved display-only `modelCH` retains T1 on the low/up side and T3 on
the high/down side. It does not enter CSV coordinate calculations. Blender
now preserves this display contract rather than silently dropping it.
No other point coordinates or elevations are changed in this release.

372 records have current Blender head geometry. Six stale head snapshots were
rebuilt: P-976, P-1101, P-1102, P-1103, P-1120, P-1121. P-1091 was rebuilt
with its corrected survey/display point contract. Labels are constrained to
canvas bounds and fallback leaders are ordered by actual projected height.

Nine records have no head geometry and are not certified or fabricated:
P-892, P-1043, P-1049, P-1050, P-1051, P-1056, P-1088, P-1098, P-1099.

Checks: `check-all-head-labels.cjs` (381 records, 372 matching snapshots),
`check-head-label-rendering.cjs` (381 form renders, no clipped point text),
`check-p1091-head-display.cjs` (actual exported CSV),
`check-head-leader-scenes.py` with `PIER_IDS=P-1091,P-976,P-1101,P-1102,P-1103,P-1120,P-1121`
(all 7 rebuilt scenes passed, 122 point leader origins). The full historical
scene-file scan was stopped; the all-record audit compares active geometry,
label identities and rendered text, not every historical .blend file.
These checks do not establish drawing correctness for the nine missing heads.
Pending P-1012 foundation changes and unrelated Clark/Sigcom edits are excluded.
