# P-1091 review models

PARTIAL survey-review prototypes, not certified fabrication/construction models. Units metres; local origin, not globally oriented CAD geometry. Scene custom properties record origin and source notes. See docs/p1091-canvas-geometry-audit.md and docs/p1091-pilecap-model-audit.md.

- PARTIAL-v5: Pier Head, white background and large labels.
- COLUMN-PARTIAL-v1: full shaft file; app crops to upper detail, labels only. Lift split not defined.
- PILECAP-PARTIAL-v1: dimensioned sharp concrete envelope; pile circles are axis projections.
- BEARING-PARTIAL-v1: plinth close-up; edge walls hidden in rendered view, retained in Blender. No pot bearing, anchors or grout.

Blender models in this folder are P-1091 ONLY. Other piers use live per-pier Canvas review views with explicit limitations, not copies of this geometry. Scripts under scripts/build-p1091-*.py rebuild from scripts/export-p1091-model.cjs output. Generated intermediate source JSON and images are in ignored output/p1091-blender; production preview images are tracked directly in assets.
