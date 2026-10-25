# Bearing Plinth audit: P-836 through P-845

Date: 2026-10-24. This second batch covers concrete plan footprints, centers,
CH/OS direction, 30 mm edge enlargement, CSV and 2D/3D consistency.
It does not certify unrelated works or Piers outside the audited batches.

## Individually rendered drawing evidence

| Pier | Column/concrete drawing | Visible head detail reference |
| --- | --- | --- |
| P-836 | 020072-A | 023000 |
| P-837 | 020079-A | 023000 |
| P-838 | 020086-A | 023000 |
| P-839 | 020093-A | 023000 |
| P-840 | 020100-B | 023000 |
| P-841 | 020107-A | 023000 |
| P-842 | 020114-B | 023000 |
| P-843 | 020121-B | 023000 |
| P-844 | 020128-B | 023000 |
| P-845 | 020135-B | 023000 |

Drawing prefix: NSCR-ITD-N03-ZWD-DWG-ST-. Each visible Pier title and reference
was checked, not inferred from filename alone. Evidence render/text files are
under output/next10-plinth-audit/. The source detail inspected is 023000-B,
page 1/12, Plan Pier Head Type P1 and Elevations A/B.

## Finding and correction (all ten Piers)

The drawing footprint is CH 450 x OS 550 mm. The approved 30 mm per-face
enlargement gives CH 510 x OS 610 mm, not CH 570 x OS 670 mm.
The previous shared-array values already included the enlargement and were
enlarged a second time by the runtime offset function.

All four groups now start from the original drawing footprint and pass through
the existing offset function exactly once. Centers in (CH, OS) metres remain:
UL (+0.925, -1.700), UR (+0.925, +1.700), DL (-0.925, -1.700),
DR (-0.925, +1.700). U is increasing chainage; L is negative OS.
The change is limited to the explicit P-836--P-845 allowlist extension.
P-826--P-835 retain their previous correction.

No center, azimuth, Top Pier or elevation rule is changed. The P1 drawing's
140 mm plinth rise matches the existing TYPE1 rule. The optional TYPE2 rule
remains 150 mm; this footprint audit does not certify its applicability.

## Verification

Run AUDIT_START=836 with scripts/check-first10-plinth.cjs. It checks 20
Pier/type cases for independent dimensions and centers, once-only offset,
table/CSV calculated coordinates, existing levels, 2D/3D model routing and
dependent Elastomeric supporting-plinth context. Live Sheet requests are
blocked in the deterministic local test; the production freshness guard stays
enabled and can correctly fall back when a live elevation overrides a snapshot.
Only contextual concrete plinth geometry changes in Elastomeric models;
Elastomeric pad survey points are not changed.

The audited footprint range is now P-826--P-845 (20 Piers). Later Piers remain
unverified. No GitHub publication is implied by this local audit.
