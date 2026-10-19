# BR114 drawing reconciliation - 2026-10-20

Scope: Pier Head and Bearing Plinth forms/models for P-888 through P-891.
Seven user-supplied single-page PDFs were text-extracted and rendered; the
rendered dimensions and official title blocks control, not filename alone.

| Pier | Plan | Elevation / schedule | Head step | Island rise above its side |
|---|---|---|---|---|
| P-888 | 023177-A | same sheet | 0.200 m, decreasing side high | 0.297 m |
| P-889 | 023011-B | 023012-B | none | 0.405 m |
| P-890 | 023159-A | 023160-A / 023156-A | none | 0.405 m |
| P-891 | 023158-B | same sheet | 0.200 m, increasing side high | 0.297 m |

Drawing prefix: NSCR-ITD-N03-ZWD-DWG-ST. P-890 schedule 023156-A explicitly
gives RL A / Top Pier 62.540 m. Existing approved column-derived absolute
datums for the other three Piers are preserved. No unprinted absolute datum
is inferred from the elevation sketches.

For transition heads T2/T4 lie on the construction-joint boundary and use
the high surface (+0.200 m), following the previously confirmed boundary
rule. Island points use their own CH side plus 0.297 m. Thus P-888's positive
CH T1/T6/T7 are low; P-891's positive CH points are high. Main heads use
T2/T4 at datum and T1/T3/T5-T8 at +0.405 m. Local N/E is calculated from
the same WCB transform for the table and CSV. Existing S1/S2 axes are kept;
Dowel design Z remains blank.

## Concrete bearing footprints

Dimensions below are original drawing faces, before the user's previously
approved 30 mm outward enlargement on each edge. The new per-pier controls
are expanded once only; they bypass already-expanded shared arrays.

- P-888: +CH 0.925 m low Pot pair at OS -2.400 (S3, 0.880 square) and
  +2.400 (S1, 0.950 square), both +0.119 m. -CH 0.925 m high Viaduct pair
  at OS +/-1.700, CH size0.450 x OS size0.550, absolute rise +0.350 m.
- P-891: -CH 0.925 m low Pot pair, same S3/S1 sizes and offsets; +CH
  0.925 m high Viaduct pair with the same 0.450 x0.550 footprint.
- P-889: CH0, OS -2.000 S5 1.550 square; OS +2.000 S4 1.620 square.
  Both top concrete levels are datum +0.122 m (023012-B).
- P-890: CH0, OS -2.000 S6 1.430 square; OS +2.000 S2 1.510 square.
  Both datum +0.122 m (023160-A).

The Increasing Chainage orientation is reconciled with the BC01 keyplan
already recorded in br-dowel-audit.md. P-888's rotated plan puts its Pot
pair on positive CH; P-891 puts its Pot pair on negative CH. Raw page
left/right is not reused as the global CH direction.

## Rendering and verification

Drawing-specific controls override stale live Sheet values for these Piers.
Only their Bearing and Dowel/Pier Head manifest records are regenerated;
unrelated records are preserved. Lower head profiles remain explicitly
schematic review context, not new fabrication controls. Main heads no
longer show a false construction-joint line merely because an Island is raised.

scripts/check-br114-drawings.cjs checks eight real forms in 2D and Blender3D:
per-T levels, each Plinth center, drawing sizes +60 mm overall, exact N/E
transform, and prepared-model freshness. Eight landscape A4 PDF exports
are visually reviewed and each has one page. Existing Dowel audit also passes.
