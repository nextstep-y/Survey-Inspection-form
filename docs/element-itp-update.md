# Element MS ITP reference update

Source: supplied `Element - Excel Program.xlsx`, Sheet2 A2:D13, checked 2026-11-18. The source workbook is unchanged. Exact normalized records and source SHA256 are in `element-itp-source.json`; only trailing whitespace in the Elastomeric label is trimmed.

The file lists Method Statement, Inspection Test Plan and ITP Item Number for each Element. It does not provide a separate numeric Element ID. Existing matching references are retained. Added Pot Bearing (B10:D10) and Final Alignment (B12:D12) references, and the literal dash for Other (D13). Empty Other MS/ITP values stay unavailable, not invented.

Final Alignment is not currently in this app's Element menu. Its supplied reference is stored in the mapping only; this update does not invent a new alignment calculation workflow or add an unsupported menu option. All currently selectable matching works display the supplied references in the header and printed form. Names, Drawing references, coordinates, elevations, geometry and models are unchanged. Pending unrelated P-1012 edits are excluded from publication.

`scripts/check-element-itp.cjs --source <xlsx>` verifies the source file hash and each exact source row, all 12 reference mappings, live header fields for selectable works, and a generated Pot Bearing PDF.
