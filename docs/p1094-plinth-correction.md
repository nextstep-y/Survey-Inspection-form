# P-1094 Bearing Plinth footprint correction, 2026-10-24

Source: NSCR-ITD-N03-ZWD-DWG-ST-023170-B, plan and elevation, page 1.
Plan increasing chainage points upwards; the viaduct (UL/UR) pair is on
the high side. BC03 S3/S1 (DL/DR) is on the low side.

Dimensions are CH x OS in metres. The user's approved enlargement adds
0.030 m per face, hence 0.060 m overall, exactly once.

| Group | Drawing outline | Correct enlarged outline | Center CH, OS |
| --- | --- | --- | --- |
| UL | 0.450 x 0.550 | 0.510 x 0.610 | +0.925, -1.700 |
| UR | 0.450 x 0.550 | 0.510 x 0.610 | +0.925, +1.700 |
| DL / S3 | 0.980 x 0.980 | 1.040 x 1.040 | -0.925, -2.400 |
| DR / S1 | 1.050 x 1.050 | 1.110 x 1.110 | -0.925, +2.400 |

The legacy shared array supplied UL/UR as 0.700 x 0.625 before enlargement
(0.760 x 0.685 afterwards). A per-Pier drawing-controlled footprint now
replaces that fallback, for both table and canvas, including imported paths.
The DL/DR dimensions were already correct and are unchanged. No elevations,
center coordinates, Pot Bearing outlines, or other Pier controls were changed.

Regenerated the P-1094 Bearing Plinth Blender template and its dependent
Pot Bearing contextual plinth model. Geometry guards remain enabled.
Tests cover TYPE1/TYPE2, once-only enlargement, centers, unchanged levels,
calculated CSV N/E, Blender routing and the full bearing model inventory.
