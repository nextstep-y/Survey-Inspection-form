# Bearing Plinth Blender batch - 2026-10-16

Extends Blender rendering to 363 additional piers; P-1091 retains its separate detailed approved model. 726 snapshots (TYPE1 and TYPE2) share 58 templates only where relative CH/OS, per-corner rise, head envelope and known step metadata are identical. Absolute EL and pier name are rendered by the app from the corresponding snapshot, not copied from another pier.

All views are PARTIAL app-data-derived review models. Plinth geometry and rises come from the same embedded functions as the form. Context head is a simplified top surface, split only for the existing known transition rule; no full-set concrete-PDF audit, detailed islands, wall geometry, anchors, grout, or pot bearings are certified. A negative/inconsistent base produces a top surface instead of an invented negative solid.

Runtime guard compares point count, labels, CH, OS, every design EL and Top of Pier. Live overrides differing from the snapshot, unsupported bearing type, missing assets or missing geometry fall back to the existing live Canvas view. Existing coordinates, table values and exports are unchanged. This batch covers Bearing Plinths only, not new Blender batches for Pier Head/Column/Pile Cap.

## Files and rebuild

1. `node scripts/export-bearing-blender-batch.cjs`
2. Blender background `--python scripts/build-bearing-blender-batch.py`
3. `node scripts/check-bearing-blender-batch.cjs`

Images: assets/bearing-blender. Editable Blender scenes: assets/models/bearing-blender. Manifest: assets/bearing-blender-manifest.js. Generated source intermediate: ignored output/bearing-blender-batch/source.json.

## Unresolved entries

P-889, P-890, P-892, MT03-ABUT, P-976, P-1043, P-1048, P-1049, P-1050, P-1051, P-1056, P-1088, P-1098, P-1099, P-1101, P-1102, P-1103, P-1120, P-1121, P-1142. Exact reasons are retained in manifest.skipped (missing head envelope, bearing points/levels or incomplete groups). Parent L/R records are not guessed or merged. Their existing view remains available.

## QA

Batch checker validates all 58 PNG dimensions, 58 Blender files, finite label anchors, unique names and all 726 record-to-template point sets. Existing geometry regression passes (172 independent controls, 367 head geometries, 731 structural renders).

Actual application: new Blender image loaded for P-826, P-989, P-990, P-1093, P-1094, P-1101L; P-1091 continues its own image. No JS errors; 2D/3D switching preserves currentArray. P-1094 PDF rendered and visually inspected. Standard 8-16-point forms remain one page; dense P-989/P-990 retain continuation pages. This is representative QA, not manual rendering inspection of all 363 pier forms.
