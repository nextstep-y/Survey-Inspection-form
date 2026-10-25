# Bearing Plinth audit: P-826 through P-835

Date: 2026-10-24. Scope: concrete plan footprints, centers, CH/OS orientation,
once-only 30 mm edge enlargement, table/CSV consistency and 2D/3D views.
This is not certification of all Pier works or of later Piers.

## Drawing evidence

Each individual drawing below was rendered and its visible Pier title and
explicit Pier Head detail reference to NSCR-ITD-N03-ZWD-DWG-ST-023000 checked.
The controlling detail inspected is 023000-B, page 1/12, Pier Type P1,
Plan and Elevations A/B (NON stamp 28 October 2022).

| Pier | Individual column/concrete drawing | Referenced head detail |
| --- | --- | --- |
| P-826 | 020002-A | 023000 |
| P-827 | 020009-A | 023000 |
| P-828 | 020016-A | 023000 |
| P-829 | 020023-A | 023000 |
| P-830 | 020030-A | 023000 |
| P-831 | 020037-A | 023000 |
| P-832 | 020044-A | 023000 |
| P-833 | 020051-B | 023000 |
| P-834 | 020058-A | 023000 |
| P-835 | 020065-A | 023000 |

All drawing numbers have prefix NSCR-ITD-N03-ZWD-DWG-ST-.
Individual files are in the shared-drive local Pier Column folder. 023000-B
is in ITD CP N03 TEAM DRIVE/SUBSTRUCTURE/PIERHEAD/P1/B/PDF.
Rendered evidence and text extraction are in output/first10-plinth-audit/.

## Result applying to all ten Piers

- Drawing footprint: CH 450 x OS 550 mm.
- Approved enlargement: 30 mm perpendicular to every edge, once.
- Correct final footprint: CH 510 x OS 610 mm, all four bases.
- Previous app footprint: CH 570 x OS 670 mm, all four bases.
- Center UL (+0.925, -1.700), UR (+0.925, +1.700),
  DL (-0.925, -1.700), DR (-0.925, +1.700), in (CH, OS) metres.
- Plan Increasing Chainage points up. U is positive CH; L is negative OS.
- Center coordinates, azimuth and existing level calculations were not changed.

Cause: legacy shared BP_P1 arrays already contained 510 x 610 mm footprints,
but lacked expansion metadata. The later edge-offset function enlarged them
again. The ten individually mapped Piers now start from the drawing's original
450 x 550 mm controls, then pass through the existing idempotent offset once.
Other P1 Piers are deliberately not changed or labelled verified by this batch.

The P1 detail shows a 140 mm plinth rise, matching the existing TYPE1 calculation.
The optional TYPE2 calculation remains +150 mm as before; its height is not
newly certified by this footprint audit. Actual bearing-type assignment and
other works are outside this change.

## Verification and model updates

scripts/check-first10-plinth.cjs checks 20 Pier/type combinations: four bases,
independent dimensions and center controls, repeated expansion, imported-path
protection, table levels, computed N/E and CSV, and Blender model availability.
It also checks that unrelated manifest records are unchanged.
Two new Bearing Plinth templates and two dependent Elastomeric-context templates
cover the ten records; Elastomeric pad survey points are unchanged. White model
background and existing print proportions are retained. This update has not
been published to GitHub unless separately requested and confirmed.
