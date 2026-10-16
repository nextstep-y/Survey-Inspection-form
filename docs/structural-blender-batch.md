# Blender rendering for all prepared pier geometry

2026-10-17. Replaces the earlier Canvas-only rollout for Pier Head, Column and Pile Cap. Bearing Plinths keep their existing Blender batch and 30 mm outward edge expansion. P-1091 keeps its approved detailed previews.

The new batch renders geometry in Blender and saves both `.blend` files and 1800 x 1000 PNGs. Templates are shared only when their complete relative geometry, labels and status are identical. Absolute head elevations are overlaid from current application data. Both column lift forms use the shortened upper-shaft view with names only. White backgrounds and print sizes are preserved.

`assets/structural-blender-geometry.js` supplies the same deterministic geometry to the exporter and runtime validity check. The browser compares all points, surfaces, relative elevations and orientation before choosing an image. Changed Sheet geometry cannot silently reuse an obsolete image. The model status next to the 2D/3D controls distinguishes Blender from the calculated fallback.

The exporter loads the same pile-cap CH/OS override asset as the app. Six head records have incomplete T elevations: those levels stay null, their markers are grey and explicitly labelled `?`, and no island solid is generated from the unresolved group. No cap thickness or full head underside is transferred from P-1091 to other piers.

The P-1092 live Sheet gives T5-T8 a rise of 0.439 m, whereas the embedded fallback gives 0.300 m. A read-only observed render variant covers the live state; it does not modify the Sheet, table, CSV, or embedded elevation calculation. The complete geometry comparison selects the appropriate version.

See [per-pier coverage](structural-blender-coverage.md) for every available and missing work. P-1142 has Blender views for Head, Column and Pile Cap; its Bearing Plinth source points/levels are still missing.

## Rebuild and checks

1. `node scripts/export-structural-blender-batch.cjs`
2. Blender background: `scripts/build-structural-blender-batch.py`
3. `node scripts/check-structural-blender-batch.cjs`
4. `node scripts/check-p1091-geometry.js`
5. `node scripts/check-bearing-blender-batch.cjs`
6. Blender background: `scripts/check-structural-blender-scenes.py` (opens every saved model and verifies marker positions and annotation visibility through its actual camera).

Browser QA must additionally exercise the actual display and printDoc path. Review representative ordinary, transition, dense and split pier forms, as well as P-1142. Missing source geometry remains a data gap, not a successful full concrete model.

## Verification on 2026-10-17

- 1,111 new pier/work snapshots match their complete geometry contract; 96 saved Blender scenes pass actual-camera checks for survey markers, leader endpoints and chainage arrows.
- All 1,111 new records render through the browser Blender path. Existing bearing records also match the live application data. Cold-load switching between piers redraws the current selection when a shared image finishes loading.
- Twelve actual application/print examples passed without JavaScript errors: ordinary P-826, transition P-1094, P-1142 Column and Cap, P-989 Bearing, split P-1101L Cap, live P-1092 Head, partial P-976R Head, and all four P-1091 prototypes.
- Standard samples remain one A4 landscape page, including table/signatures. P-989 Bearing retains three pages for 40 points; P-976R Head retains two pages for 30 points. No rows are dropped to force a single page.
- Existing 172 source controls, 1,555 expanded plinth groups and the bearing batch regression checks still pass.
