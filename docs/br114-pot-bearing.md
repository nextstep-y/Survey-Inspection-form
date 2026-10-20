# BR114 Pot Bearing controls

Added P-888--P-891 as a separate work element. No Dowel controls are restored
to Pier Head forms. PBL is negative OS; PBR is positive OS. Side midpoints
1--4 run counterclockwise from positive CH, as in the existing BR115 workflow.

## Sources

Rendered NSCR-ITD-N03-ZWD-DWG-ST-066040-B through 066045-B (one page each,
S1 through S6 respectively), BC01/BR114. Overall top outlines, not bottom
Dowel grids, control these points. Dimensions below are metres.

| Type | OS width | CH length | Steel height |
| --- | ---: | ---: | ---: |
| S1 | 0.535 | 0.850 | 0.128 |
| S2 | 1.055 | 1.420 | 0.233 |
| S3 | 0.510 | 0.670 | 0.126 |
| S4 | 1.275 | 1.275 | 0.213 |
| S5 | 1.900 | 1.065 | 0.233 |
| S6 | 1.010 | 1.090 | 0.218 |

S4 is a fixed circular bearing with mounting lugs; its setting-out controls
use the overall 1.275 m envelope. S5's long axis is transverse (OS).
Undimensioned internal thicknesses and lug proportions in Blender are schematic.

Centers follow the newer individual Pier Head plans 023177-A, 023011-B,
023159-A, 023158-B, previously reviewed against their elevations. The older
bearing keyplan shows 2.250 m main-pier offsets; those do not overwrite the
2.000 m offsets in the newer individual plans. Transition offsets are 2.400 m
with CH +0.925 (P-888) and -0.925 (P-891).

Height source: SUMMARY HEIGHT OF BC 1 2 3.xlsx, RL A BC!G4:K11.
Top Pot = current Top Pier + concrete plinth + bottom grout + steel height.
Top grout is retained as metadata but excluded. Bottom grout is 0.050 m.
No workbook edits were made.

| Pier | PBL / PBR | Top Pot PBL | Top Pot PBR |
| --- | --- | ---: | ---: |
| P-888 | S3 / S1 | 64.636 | 64.638 |
| P-889 | S5 / S4 | 62.945 | 62.925 |
| P-890 | S6 / S2 | 62.930 | 62.945 |
| P-891 | S3 / S1 | 64.698 | 64.700 |

Blender context includes the existing head, island, concrete plinths and
separate bottom grout. Exact runtime geometry guards prevent stale images
after source changes. The four new forms each print on one A4 landscape page.
Regression covers all eight enabled Pot Bearing piers, N/E calculations,
CSV, CCW labels, dimensions, heights and Blender routing.
