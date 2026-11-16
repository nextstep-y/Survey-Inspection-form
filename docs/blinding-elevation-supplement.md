# Blinding Concrete Elevation Check supplement

Prepared for GitHub publication 2026-11-16.

Source: user-supplied `03-Elevation Check.docx`, SHA256 `c1a6c9a82521ad89b47ebccde11a22b5e2eed80f0f14ae4550badf710ad2ddb9`.

The original DOCX was rendered with the bundled document renderer / LibreOffice runtime. Only page 1 of the two-page source was converted from the rendered PDF into `assets/forms/blinding-elevation-check-page-1.svg` with pdftocairo. Text glyphs and table rules are vector paths rather than a raster screenshot, so they remain sharp at print zoom. Full original content, blank fields, diagram, signatures and document footer are preserved. The DOCX itself is unchanged. No document text is treated as an instruction to the application.

`BlindingElevationPrint.prepare()` preloads the image only when work is exactly `Blinding Concrete`. It adds a blank supplemental form after the application's form and its continuations; it is not a Drawing and does not replace the Drawing name/reference. The image is not filled with computed elevations or user values. No coordinate, level or model logic changes.

The supplement uses an isolated named A4 portrait print page; the existing application form keeps its landscape orientation. The shared after-print cleanup removes the supplement to prevent accumulation on repeat prints. Missing image/module stops the print rather than silently omitting the requested page.

`scripts/check-blinding-elevation-print.cjs` passed at viewport widths 390 and 1500. Both P-826 examples have 2 pages, with page 1 landscape and page 2 portrait. The original first-page render and both pages of the generated package were visually inspected. The vector output was rerendered for visual QA; pdfimages shows no raster images on the supplement page. Cleanup and exclusion from other work types were checked. Browser emulation is not a direct iPhone/Safari test; named mixed-page orientation depends on the print engine.
