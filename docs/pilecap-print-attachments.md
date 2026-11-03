# Pile / Pile Cap drawing references and print attachments

Source: Drive folder `1Dp0ACQLktfVogMTmOjQc6lUy0jSvIsqT`, read 2026-11-03.
The supplied register is `Pile Cap Drawing list.csv`, not an Excel workbook.
No Drive source files were modified.

The register maps 357 named Pier entries to 366 PDF drawings (368 pages).
The CSV controls the displayed drawing/revision. P-1132 / 022464 is the sole
revision exception: CSV B, source PDF C, user explicitly confirmed C on
2026-11-03. `listedRevision` retains the source B for traceability.
P-828 / 020015 and P-833 / 020050 contain malformed drawing numbers in the
CSV; the source drawing title blocks were rendered and visually checked.
Other punctuation in drawing identifiers is normalized only when the six
digits match exactly one file from the supplied folder inventory.

Scope: Pile cap and Bored Pile only. No coordinates, levels, dimensions or
other work-specific references are changed. Exact NB/SB/A identifiers are
retained. L/R aliases are limited to the eight previously user-confirmed
combined-head families, not a general suffix fallback.

Print / PDF loads all source page images before starting print. The form is
first, followed by each registered drawing in CSV order. Multi-sheet entries
are retained. Missing records/images stop printing with an explicit message;
the app never silently prints an incomplete package. Source pages are 3600px
JPEG renders from the PDFs, not redrawn engineering geometry. The original
PDFs remain available from their recorded Drive IDs. Browser display/print
uses local static assets, avoiding Drive login and cross-origin PDF embedding.
The user explicitly approved publishing these drawing images on GitHub Pages.

Tests: 714 work/reference cases, image existence/signatures for every page,
unrelated Pier Head reference retention, exact NB source and combined L/R
resolution, and missing-source rejection. Printed P-826 Pile cap = 2 pages;
P-989 Pile cap = 3 pages; P-1094 Bored Pile = 2 pages. The attachment page
was rendered and visually checked for full title-block/edge visibility.
