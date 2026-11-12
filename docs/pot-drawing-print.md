# Pot Bearing drawing print packages

Prepared for GitHub publication 2026-11-12. No geometry, coordinates, elevations, tolerances or bearing rotations changed.

## Sources

- BR114: six original PDFs 066040–066045 Rev.B in the user's OneDrive `21.Balance Cantiliver/BR114` folder.
- BR115: drawing pages 6–11 of `NSCR-GCR-N03-ZWD-DRC-ST-001714 (Rev. B)(1).pdf`, in `21.Balance Cantiliver/BR115`. These are 066052–066057 Rev.B, not the five preceding cover/review/transmittal pages.
- The builder verifies each extracted page has the exact drawing number, Rev.B suffix and Pot Bearing title. Full source sheets, including title blocks, approval stamps and existing annotations, are preserved as 3000-pixel WebP pages. Original PDFs are not modified. SHA256 and source PDF page numbers are in the catalog receipt.

## Scope

The active app supports eight Pot Bearing Piers. Packages follow existing work-specific references, in their existing order:

| Pier | Drawing numbers (all Rev.B) |
| --- | --- |
| P-888, P-891 | 066042, 066040 |
| P-889 | 066044, 066043 |
| P-890 | 066045, 066041 |
| P-1091, P-1094 | 066054, 066052 |
| P-1092 | 066056, 066055 |
| P-1093 | 066057, 066053 |

Other Piers are not newly assigned a Pot Bearing type by this feature. A missing Pot reference remains NOT VERIFIED and cannot print a partial package.

## Behavior and validation

- The DWG panel links to the exact packaged drawing pages.
- Print preloads both source images and appends them after the form. The current selected Pier/work is checked again before printing.
- Wrong revision, wrong Pier, missing references and unavailable images fail closed through the shared print pipeline. Duplicate references are deduplicated.
- `scripts/check-pot-drawing-print.cjs` checks all eight Piers, twelve source image signatures, page links, exact reference guards and deduplication. Each generated A4 landscape PDF has three pages: form, detail 1, detail 2.
- Representative BR114 and BR115 source pages and a generated P-1092 PDF page were visually inspected for full title block and no clipping. Desktop/Electron verification does not replace a final Safari/iPhone print check.
- Before publication, the dedicated Pot check passed all eight packages again and Head/Plinth regression passed all six packages (706 source-ready work cases, zero missing exact PDF revisions). Full Column and Pile Cap regression reruns stalled in the desktop test browser and were interrupted; a complete regression pass for those two is not claimed.

Rebuild: run `scripts/export-pot-drawing-refs.cjs` with Electron, then `python3 scripts/build-pot-drawing-pages.py`. Source coverage is in `pot-drawing-print-coverage.json`.
