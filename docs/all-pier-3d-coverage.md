# Per-pier 3D review views - 2026-10-16

Superseded for rendering on 2026-10-17 by [the Blender batch](structural-blender-batch.md) and [current per-pier coverage](structural-blender-coverage.md). The data limitations below remain relevant.

User authorized extending the three work families to all piers. This rollout is a live, code-generated review visualization, not a full drawing certification or a Blender asset batch.

- Pier Head: existing per-pier surface/elevation renderer, 367 valid embedded head geometries; P-1091 retains the approved Blender V5 image. Unknown depths remain labelled schematic in the existing renderer.
- Column: 369 embedded profiles can produce a clipped upper-shaft 3D review. Labels only, white background, no full-height shaft. Neither lift boundary nor lift design elevation is invented. Current tables/exports are unchanged.
- Pile Cap: 372 embedded outlines can produce a projected 3D top surface with corners, column footprint and pile-axis markers where present. No unverified cap thickness is reused from P-1091. P-1091 retains its source-verified solid preview.
- Live overrides are used at runtime. Embedded coverage counts are not guarantees that a particular live row has all inputs. Degenerate/missing geometry falls back to the existing view; no geometry is fabricated.

## Embedded gaps

Column: P-892, MT03-ABUT, P-976, P-989, P-1043, P-1056, P-1088, P-1098, P-1099, P-1101, P-1102, P-1103, `P-1108 `, P-1120, P-1121. Some are parent entries with populated L/R child piers; they are not silently merged.

Pile Cap: P-892, P-976, P-1043, P-1056, P-1088, P-1098, P-1099, P-1101, P-1102, P-1103, P-1120, P-1121.

Remaining work for full Blender-quality solids: audit controlling concrete PDFs for cap thickness/chamfers, special head details/island footprints, column lift construction joints, and missing profile records per pier. No full-set PDF audit has been performed in this rollout.

## Tests

`node scripts/check-p1091-geometry.js`: 172 independent P-1091 controls, 367 head models, 731 legacy structural renders, plus Column/Cap live-render checks across all 384 embedded records. Rendering preserves input point arrays and produces finite Canvas positions.

Actual application checks: P-826, P-1094, P-1101L x Pier Head, Column Lift 1, Column Lift 2, Pile cap = 12 PDF runs through printDoc, each A4 landscape one page. 2D/3D switches preserve currentArray, no JS errors. These representative print checks do not certify every live override or custom form entry.
