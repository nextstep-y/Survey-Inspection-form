# P-1091 Pile Cap prototype

2026-10-16: visually reviewed `NSCR-ITD-N03-ZWD-DWG-ST-022023-B.pdf` in Downloads, page 01/01, title P-1091 Pile and Pile Cap Concrete Details & Setting Out, revision B. Plan, section 1 and coordinate tables are the controls.

- Cap CH 7.200 m, OS 11.700 m, thickness 2.500 m.
- Top 102.923 m, bottom 100.423 m; pile head 100.498 m, 0.075 m above bottom.
- Six piles diameter 1.200 m; spacing CH 4.500 m and OS 4.500 m; end margins 1.350 m.
- Column footprint 2.000 CH by 3.000 OS, 0.500 m corner cuts.
- Ten app-calculated N/E pairs (A-D, P1-P6) match source coordinate tables within 1.1 mm. Source table rounding is retained as evidence, not substituted into calculations.
- Current coordinates remain calculated from Center Pier and WCB. The model local Y is cap CH; increasing-chainage compass follows this cap frame, not Pier Head's separate display frame.

PARTIAL: sharp concrete envelope and projected top-face survey controls only. Circles are pile-axis projections, NOT actual pile-head elevation. No full pile length, reinforcing steel, blinding/gravel or 20 mm typical edge chamfer modeled. The old top-of-column level printed in this pile/cap drawing is not applied over the later controlling column/head corrections.

App integration: P-1091 > Pile cap > 3D only; 2D and other piers retain existing rendering. Snapshot guard compares all 18 displayed CH/OS controls and top-of-cap elevation. Image bundled in assets for offline operation. No table coordinates/elevations changed. Runtime image load / 2D-3D switch / unchanged point arrays passed, no JS errors; A4 landscape print verified one page with all twelve cap-table rows and signatures.
