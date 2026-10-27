# P5D Bearing Plinth combined-head reference audit

Date: 2026-10-26. Local update, not yet published.

## Reference decision

The user confirmed that the main Pier coordinate refers to the combined head, not an individual column. This applies to P-976, P-977, P-1101, P-1102, P-1103, P-1108, P-1120 and P-1121, including their L/R application records (24 records).

- Empty main records inherit head metadata only when L/R N/E agree exactly. No averaging or pile/column geometry copying is performed.
- P-1108 uses its existing main coordinate: E 454957.488, N 1678030.064. Its L/R local CH/OS are transformed so the physical Bearing Plinth coordinates equal the main record, while the original column coordinates remain untouched.
- P-1121 uses the user-confirmed head coordinate: E 454880.370, N 1678492.912. Its L/R coordinates are preserved; Bearing Plinth CH/OS are transformed to the same head reference.
- The existing WCB is retained. Rotated plinths use the drawing's bearing alignment WCB minus the main-line WCB. Point order remains clockwise in the existing Bearing Plinth labeling convention.

## Controlling drawings visually checked

| Pier | Plan | Revision | Plinth count | Main dimensional controls (before enlargement) |
|---|---|---|---:|---|
| P-976 | 023211 | B | 8 | CH +/-925; upper OS +/-7710, +/-2753; lower +/-7570, +/-2707; 654 CH x 814 OS |
| P-977 | 023214 | F | 10 | Upper rotated pairs around OS -9091/+9081; alignment 25d35m45s / 37d00m09s; 400x500; middle 450x550 at +/-1700; lower 654x814 at +/-9401, +/-3318 |
| P-1101 | 023220 | A | 4 | CH +/-925, OS +/-1700; asymmetric head extends OS -16525 to +9587 from main-line reference |
| P-1102 | 023223 | A | 4 | CH +/-925, OS +/-1700; head OS -12048 to +14065 |
| P-1103 | 023226 | A | 4 | CH +/-925, OS +/-1700; head OS -7580 to +18532; 023227-A section checked |
| P-1108 | 023229 | B | 10 | Upper inner rotated centers OS -5890/+5891; alignment 70d31m45s / 81d56m35s; outer left CH 807.25 and inner right CH 1045.91; middle +/-1700; lower +/-7402, +/-2651 |
| P-1120 | 023232 | E | 10 | Upper OS +/-9526, +/-3359; lower rotated pairs about OS +/-9237, alignment 76d09m39s / 87d35m39s; middle +/-1700 |
| P-1121 | 023235 | B | 7 | Upper OS -5850/0/+5850; lower +/-6007, +/-2186; detail 039489-C confirms 654x814, 039491-D confirms 694x834 |

Units in the table are millimetres. Type-1 450 CH x 550 OS is retained from the previously checked common Type-1 detail (023000-B); no elevation certification is implied.

The +30 mm offset is applied once along each actual edge, including rotated rectangles. It is not applied to an axis-aligned bounding box. The combined head envelope is used for Bearing Plinth contextual Blender views; lower profiles, support stubs and legacy island details remain schematic/partial.

## Scope and verification

This update changes Bearing Plinth plan geometry/reference and its Blender context. It does not certify or alter the existing plinth elevations, Elastomeric survey geometry, column setting-out coordinates, or Pier Head T controls.

Automated checks cover unique labels, true rotated edge lengths, one-time enlargement, imported-data precedence, matching main/L/R physical coordinates, displayed table versus CSV, and Blender image selection for all 24 records. See scripts/check-p5d-plinth.cjs and scripts/check-all-plinth-audit.cjs.
