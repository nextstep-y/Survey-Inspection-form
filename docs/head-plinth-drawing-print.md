# Pier Head / Bearing Plinth drawing attachments — 2026-11-04

This release extends the existing Pile cap / Bored Pile print pipeline. The
selected work's exact drawing number AND revision select the source pages.
All confirmed references are printed after the form, in displayed order.
The DWG panel has page links. Missing references or assets stop complete-package
printing with a named error; no older or unrelated drawing is substituted.
Coordinates, elevations, model geometry and engineering tolerances are unchanged.

## Aconex evidence

Read-only search/download in the already-open Aconex app, project NSCR - N03.
No documents, review status or transmittals were changed. Revision boxes in
downloaded PDFs were rendered and visually checked, not inferred from a DRC
package revision or an omitted filename suffix.

| Document suffix | Revision observed | Aconex version | Evidence |
|---|---|---:|---|
| 023241 | E | 27 | P6 concrete plan/elevation, 15-Aug-2023 |
| 023240 | D | 20 | P6 schedule, 06-Jun-2026 |
| 039531 | D | 22 | P6 sections N/O/P and plinth, 15-Aug-2023; history checked |
| 038582 | B | 11 | P13 Bearing Plinth, 24-Mar-2023 |
| 023031 | A | 4 | P2 plan/elevation, 07-Oct-2022 |
| 023181 | B | 12 | P-1100 P12 plan/elevation, 13-Aug-2026 |
| 023085 | B | 7 | P-1106 plan/elevation, 17-Feb-2025 |
| 023081 | B | 7 | P-1107 plan/elevation, 12-Aug-2024 |
| 023073 | A | 4 | P-1122 plan/elevation, 17-Feb-2024 |
| 023217 | B | 8 | P-989 P5D plan/elevation, 21-Jun-2024 |

Reference corrections only: 039531 E -> D, 038582 C -> B, 023181 C -> B.
P-1106/1107/1122 were reconfirmed against Aconex; their plan numbers are not
the unresolved P5D references below. P-989 and its L/R work references now use
the explicitly identified combined-head P-989 plan 023217-B.

023000's filename omits the revision; its rendered title block explicitly reads
B. Aconex downloads 023031/023241/039531 also omit filename revisions; the
catalog uses their observed register/title-block revisions, not a default 0.

## Unconfirmed references retained as unavailable

The historical placeholders 023220-A / 023223-A / 023226-A for P-1101 / P-1102 /
P-1103 (including L/R) were not found by exact number or P5D plan search in
Aconex. The P5D plan list returned six explicitly named Piers: P-976, P-977,
P-989, P-1108, P-1120 and P-1121. This is not proof that no other drawing exists;
it is insufficient evidence to print one as a confirmed P-1101/1102/1103 plan.
Their geometry is retained, but unverified drawing placeholders no longer
appear as confirmed references. A reviewed work-specific register may supply a
new reference later, which still requires the matching PDF asset.

## Coverage and checks

35 exact source PDF revisions, 35 rendered pages. 706 Pier/work cases ready;
62 cases lack a confirmed work reference (includes legacy/abutment records).
See `head-drawing-print-coverage.json` for the exact per-Pier/work list.
No confirmed reference is missing its matching page asset.

Print tests cover P-826 head (2 total pages), P-1092 head (3), P-1092 Plinth (4),
P-1094 Plinth (2), P-992 head (4), P-1142 Plinth (3), plus the existing foundation
print tests. Revision mismatch rejection, DWG page links and all image files
are checked. This is reference/print validation, not a new geometry audit.
