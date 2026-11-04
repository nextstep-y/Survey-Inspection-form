# Column drawing references and print attachments

Source: user-supplied Drive folder `1qRQHVEiuMHdxZwbL3Hp51kvZZ_AlJcB_`, locally synced as `SURVEY CP-N03 SHARE DRIVE/Pier Column`. Checked 2026-11-04.

Both `Pier Column (1st-Lift)` and `Pier Column (2nd Lift)` use the same supplied Column concrete/section drawing set. These PDFs do not define separate lift-specific drawing sets. This feature identifies source evidence; it does not certify lift elevations or change geometry, coordinates, levels, tolerances, or models.

## Matching and evidence

- Inspected text from 716 PDFs. Pier names are taken only from the PDF title block, including space-separated NB/SB suffixes; never from a numeric offset to a Pile Cap drawing.
- Included 714 Column drawings, one source page each, in 373 app Pier records. The eight previously user-confirmed combined-head families (976, 977, 1101, 1102, 1103, 1108, 1120, 1121) share their source set with L/R. No generic suffix stripping is used. Whitespace in the existing P-1108 key is trimmed only for reference lookup.
- Filename/title conflicts were visually inspected in rendered PDFs: 021394 and 021395 are B (filenames A); 022241 and 022242 are D (filenames C); 022298 is B (filename C). Display and print use the actual rendered title-block revision, not the misleading filename. Original source files are not renamed or modified.
- 021471-A is superseded by the supplied 021471 Rev.B. 022534-H is a Pile Cap drawing, excluded from the Column set. P-1142 uses 022535/022536.
- All PDFs were text-inspected, but not all 714 sheets were individually visually reviewed. The five conflicts above and representative generated print packages received visual review. The register reflects the supplied folder, not a claim of an exhaustive latest-revision audit across Aconex.
- Source SHA256 values are retained in the catalog. `column-drawing-print-coverage.json` is the machine-readable source receipt.

## Not mapped

The current app has 11 entries with no confirmed Column source set in this folder: P-892, P-989L, P-989R, P-1043, P-1056, P-1088, P-1098, P-1099, MT03-ABUT, MT03-1, MT03-2. The last three are outside the P-numbered Column attachment workflow. Missing entries show NOT VERIFIED rather than falling through to a Pile Cap drawing. No generic parent-Pier assumption is made for P-989L/R.

## App and print behavior

The form and DWG panel display independent drawing numbers/revisions and page-view links. Reviewed Sheet Column references can be selected, but printing requires an exact locally packaged revision that is also mapped to that Pier. Missing revision, missing source image, and wrong-Pier reference stop the print before a partial package is started.

Images are preloaded before printing. The form remains first, then complete source sheets including title blocks. Screen mobile layout and print-grid fixes remain in place. Only catalog metadata loads on startup; source images load on demand. 2400-pixel WebP source pages keep the release below the GitHub Pages size limit while retaining full-page content. Original PDFs remain in Drive.

## Verification

`scripts/check-column-drawing-print.cjs` checks both lifts for all app records, every WebP file signature, DWG page links, six generated PDF packages (P-826, P-1093, P-976L, P-1113SB, P-1142, P-1012), and guards against no reference, wrong revision and wrong Pier. Representative packages have 3 pages: one form plus two drawings. Existing Head/Plinth and Pile Cap/Bored Pile print checks are run as regressions.

Pending unrelated P-1012 foundation/model edits are excluded from this release. Its Column references are the supplied 021471-B / 021472-B, not the separate foundation drawing 021470-C.
