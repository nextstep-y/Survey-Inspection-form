# Drawing references by survey work

Implemented locally 2026-10-27 for Pier Head, Bearing Plinths and Pot Bearing. Not uploaded in this change.

- One resolver, `getWorkDrawingReferences`, supplies both the form and print Drawing Number fields. The DWG panel lists each reference's role, revision and source.
- Source-linked embedded controls work offline. No default Column/Pile Schedule or generic local override is substituted for these three works. Missing work references display `DRAWING NOT VERIFIED` rather than a plausible unrelated drawing.
- Multiple references keep their own revisions (e.g. P6 023241-E, 023240-D, 039531-E). No shared revision is appended to a mixed list.
- P-1092 Bearing Plinth: 038136-C detail is primary, with 023167-B / 023168-B plan/elevation references. This fixes the previously unreachable detail override.
- Pot Bearing derives its per-bearing reference from the active source controls (BC01 and BC03 stay separate). P-1092 uses 066056-B S5 and 066055-B S4.
- Existing footprint plan controls may be listed as a plan reference for Pier Head/Plinth. This identifies source evidence; it does not certify all dimensions, levels or every point of that work. Existing engineering warnings remain.

## Existing Google Drawing Register integration

Read-only use of the existing `DRAWING REGISTER` tab. No Sheet data was written. Existing columns are retained: A type, B comma-separated exact Pier IDs, C drawing number, D revision, E filename, I status.

Accepted work types now include `Pier Head`, `Bearing Plinth` / `Bearing Plinths`, and `Pot Bearing` (existing Column/Schedule routing remains). Only `VISUALLY REVIEWED` rows are accepted. Add a separate row for each reference to retain independent revisions; multiple detail rows no longer overwrite one another. Both six-digit numbers and full document numbers are normalized without duplicate prefixes. Invalid identifiers are rejected; absent revision stays explicitly unconfirmed, not invented as Rev.0.

Embedded controlled references take precedence for known works; reviewed typed Plinth detail rows can add references, and reviewed typed work rows fill gaps. Generic local Drawing overrides remain available for other work types but do not override these work-specific references. The DWG panel explicitly states this precedence.

## Verification

`scripts/check-work-drawings.cjs` checks every runtime Pier record across all three works, mixed revisions, missing drawings, typed register rows, duplicates, invalid/unreviewed input and generic override isolation. Displayed header and print field agree for representative P-1092/P6/missing cases. P6 multi-reference print was rendered and checked to fit one page. Pot Bearing coordinate/CSV/model regression passes unchanged.
