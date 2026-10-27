# P6 Pier Head Island and T controls — 2026-10-26

Implemented locally for P-992, P-993, P-1021, P-1022, P-1130 and P-1131. Not published to GitHub.

## Drawing controls

Visually checked shared-drive PIERHEAD/P6 drawings: schedule 023240-D, plan 023241-E, sections 039531-E. Island rises **0.300 m** above its own supporting surface; the two surfaces differ by **0.600 m**. The joint lies **0.350 m toward the high side** from CH zero. Island width is 1.200 m (OS ±0.600); head envelope is CH ±1.750 and OS ±3.300 m.

The P-1094 principle applies, not its 0.317 m Island dimension. T2/T4 are on the actual joint and take the higher surface, without Island rise. T1/T6/T7 are at +CH on Island; T3/T5/T8 are at −CH on Island.

| Pier | +CH T1/T6/T7 | Joint T2/T4 | −CH T3/T5/T8 | Joint CH |
|---|---:|---:|---:|---:|
| P-992 | 90.205 | 90.505 | 90.805 | −0.350 |
| P-993 | 91.272 | 90.972 | 90.672 | +0.350 |
| P-1021 | 100.945 | 101.245 | 101.545 | −0.350 |
| P-1022 | 101.651 | 101.351 | 101.051 | +0.350 |
| P-1130 | 116.080 | 116.380 | 116.680 | −0.350 |
| P-1131 | 116.460 | 116.160 | 115.860 | +0.350 |

All values in metres. T5/T6/T7/T8 naming follows P-1094: T5=(−CH,+OS), T6=(+CH,+OS), T7=(+CH,−OS), T8=(−CH,−OS). N/E are recalculated from the approved local CH/OS and pier azimuth; they are not copied from CSV. This intentionally changes old generic corner naming and T2/T4 CH positions.

## Verification and limits

- `scripts/check-p6-head-islands.cjs`: six Piers, 48 T points checked twice (normal and injected stale online controls), 96 point cases; table/CSV N/E/Z, joint geometry, Island dimensions, and Blender view selection passed.
- `scripts/check-confirmed-plinth-levels.cjs`: 56 records, 112 selector cases, 1,960 point-level checks and nine Blender samples passed after this change.
- P-992 and P-993 rendered views visually inspected for opposite high-side orientations and readable point leaders.
- Pier Head, Bearing Plinth and Elastomeric supporting Island models regenerated. S1/S2 levels remain unknown where not source-confirmed; lower body profile remains explicitly schematic. This is not certification of every Pier or unresolved footprint.
- Approved local P6 controls override stale online T/Top Pier values. Google Sheets were not edited.
