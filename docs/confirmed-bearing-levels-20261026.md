# Confirmed level corrections - 2026-10-26

User-confirmed drawing values implemented locally. Not uploaded to GitHub.

| Control | New value / rule |
|---|---|
| P-992 Top of Pier | 89.905 m; 023240-D / 021331-A |
| P-1051 Top of Pier | 103.238 m; 021744-A |
| P2 (44 NB/SB records) | Top Plinth = Top Pier +0.150 m; 023031-A |
| P-976 / L / R | Top Plinth = Top Pier +0.112 m; 023211-B |
| P-1121 / L / R increasing | Top Plinth = Top Pier +0.097 m; 039491-D |
| P-1121 / L / R decreasing | Top Plinth = Top Pier +0.112 m; 039489-C |
| P6 six Piers | CIS60 low side +0.049 m; Type1 high side +0.600+0.140 = +0.740 m; 023240-D / 023241-E |

P6: CIS60 is increasing for P-992/P-1021/P-1130 and decreasing for P-993/P-1022/P-1131. Blender context includes the 600 mm step, with the break 350 mm from CH zero toward the high side. Follow-up on 2026-10-26 completed the P6 Island and T1-T8 controls; see [P6 Island controls](p6-head-island-controls.md). Lower body profiles remain schematic, not complete construction solids.

P-992 Top Plinth: increasing UL/UR = 89.954 m; decreasing DL/DR = 90.645 m.

P-976 Top Plinth = 88.671 m. P-1121 increasing Top Plinth = 116.947 m; decreasing = 116.962 m.

Confirmed controls take precedence over the global bearing selector and stale online/cache wildcard rules. Online Reference Top Pier rows cannot revert the six P6 schedule levels or P-1051. The Google Sheet itself has not been edited. Existing Elastomeric +0.067 m increments are derived from the corrected supporting Plinth level for these confirmed groups; pad N/E geometry is unchanged and remains independently guarded.

Validation: 56 Bearing Plinth records x two selectors = 112 cases; 1,960 point-level checks; stale online Top Pier and Bearing rules injected; displayed table equals CSV; 9 representative Blender views including all six P6 Piers. P5D main/L/R coordinate equivalence checked separately across 24 records. Supporting structural models for P-992/P-1051 regenerated and merged without replacing unrelated records.

The preceding diagnostic report is historical before these corrections. Remaining unconfirmed cases were not assigned guessed levels.
