# Bearing Plinth +30 mm per side - 2026-10-16

User instruction: extend every Bearing Plinth edge outward 0.030 m. Overall rectangular width and length each increase 0.060 m. Center, orientation, labels and design EL remain unchanged. Elastomeric, pot-bearing assembly and other work geometry are NOT enlarged.

Implementation: shared `expandBearingPlinthEdges` after canonical per-pier orientation, consumed by form, Canvas and exports. Four-corner groups are identified using existing prefix/four-point numbering. Offset each polygon edge along its true outward normal and intersect adjacent shifted edges, so rotated plinths retain their bearing. No bounding-box substitution. New arrays are returned without changing original source arrays. A marker prevents a second expansion; P-1091 is rebuilt from its original canonical controls before applying the shared offset once.

Invalid/incomplete groups remain unaltered rather than guessed. Current embedded regression validates all 1,555 complete plinth groups: every edge offset 30 mm, edges parallel, center unchanged within source precision, input arrays unchanged and repeated calls idempotent. P-1091 independent controls: UL 1.040 square, UR 1.110 square, DL/DR .510 CH x .610 OS; EL114.917 /115.543 unchanged. Elastomeric independent footprint controls remain original.

Regenerated Blender previews: P-1091 head context and bearing scene, plus all 58 shared batch templates for 363 additional piers / 726 TYPE1-TYPE2 snapshots. Runtime manifest guard still falls back if live geometry or levels differ. Existing incomplete-data exceptions remain; no unsupported pier or missing point was fabricated.

Actual app QA: P-1091 UL 1.040 x1.040, EL114.917; P-1094 UL .760 x.685, EL116.983; P-989 UL .774 x.874, EL90.059. Blender loaded, 2D/3D invariant. P-1091 PDF visually inspected and one page. CSV uses currentArray and the same coordinate rotation as table, so revised corner N/E are recalculated, not manually edited.

The enlargement is a user-specified project change applied over the drawing baseline; it is not claimed to be printed in the original concrete PDF. Head and other detailed model limitations remain PARTIAL.
