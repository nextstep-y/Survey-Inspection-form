# Form / printed drawing reference consistency

Checked 2026-11-14. The packaged source drawing number and revision are authoritative for work types with drawing attachments: Bored Pile, Pile cap, both Column lifts, Pier Head, Bearing Plinths and Pot Bearing.

Previously the form could accept a reviewed live Column/Head/Plinth register reference while the attachment pipeline validated a separate packaged PDF catalog. A reviewed Sheet row did not necessarily have a corresponding packaged source page. The change removes this divergence; it does not assert a specific historical user PDF was wrong without seeing that file.

`PilecapDrawingPrint.selectionFor()` now supplies the same ordered, deduplicated source records and reference text to the form and the print pipeline. The source catalogs and images are unchanged. Design controls remain separate and continue to govern calculations; no coordinate, geometry, elevation, tolerance, model or source drawing is changed.

For supported attachment works, online/local reference changes cannot replace the displayed number until the corresponding source drawing is added to the packaged catalog. This is deliberate: the user requested the form to follow the drawing actually attached to the print. Existing reviewed register imports are retained for inspection and unsupported workflows; they do not silently relabel a different attached drawing. Missing sources remain NOT VERIFIED, not replaced by an older revision.

Before printing, stale supplied reference arrays are rejected. After source image loading, the form text is compared to the prepared attachment snapshot and refreshed immediately before the print form is built. Missing-source and changed-Pier/work guards remain.

## Verification

`scripts/check-drawing-reference-consistency.cjs` compares every app Pier across seven attachment works with the exact packaged selection and merged form values. 2,206 source-ready Pier/work pairs passed:

- Pile cap 373; Bored Pile 373
- Column 1st 373; Column 2nd 373
- Pier Head 353; Bearing Plinths 353
- Pot Bearing 8

The check injects wrong online/local overrides and a reviewed Column revision not packaged with the app; none changes the form reference. Actual screen/print/attachment text checks passed for P-1132 Pile cap (C), P-1093 Column (A/A), P-1092 Plinth (C/B/B), P-992 Head (E/D/D), P-1093 Pot (B/B). The generated P-1093 PDF was text-extracted and visually reviewed: form references 066057-B / 066053-B match both attached source captions; the form stays on one page. This is a software consistency audit, not a fresh visual review of every original drawing sheet.

`scripts/check-work-drawings.cjs` passed 1,163 checks across 1,152 Head/Plinth/Pot work records, with the register test updated to retain imported evidence without letting unpackaged revisions override printed-form references.

Machine-readable coverage, including unverified entries, is in `drawing-reference-consistency-audit.json`. Existing unverified source boundaries are unchanged. Unrelated pending P-1012 geometry edits are excluded from publication.
