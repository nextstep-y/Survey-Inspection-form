# Bearing Plinth 3D review update - 2026-10-16

Shared per-pier Canvas renderer, not a Blender image reused across piers. Uses the current CH/OS point set and `getWorkPointElev` for each point. No table/export coordinates or levels changed.

- White background, black labels with names and EL, compact increasing-chainage compass at upper right.
- Close-up of plinths; column omitted and head context visually cropped. Context depth is a display crop, not a new structural dimension. Existing simplified island/head context remains PARTIAL and is not newly drawing-certified.
- Group tops use every corner's own elevation, not a flat plane copied from corner 1. Context surfaces remain simplified; special per-pier geometry rules are unchanged.
- Point labels ordered by projected position rather than name order, keeping rails on the appropriate side. Pair levels remain based on the same computed design data as the form.
- Known 16-point cases print in one A4 landscape page. Dense records retain continuation pages rather than dropping point rows.

Runtime QA: P-826 (16), P-989 (40), P-990 (28), P-1091 (16), P-1093 (8), P-1094 (16), P-1101L (16). Source point counts refer to current application records. P-989 uses three pages, P-990 two; other tested records one. P-1091 rendered PDF visually inspected after white-background/compass fixes. No JS errors; 2D/3D toggles preserve currentArray. Existing 172 independent controls / 367 head geometries / 731 structural renders pass.

This update does not certify all concrete PDFs, pot-bearing assemblies, anchors, grout thickness, or unresolved special-pier surfaces. The view labels its head context PARTIAL.
