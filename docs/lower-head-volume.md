# Lower Pier Head volume in both Blender work views

2026-10-17. User requested more visible lower-head geometry in every prepared Pier Head and Bearing Plinth view.

Both families now share `StructuralBlender.bodyFor` and the Blender mesh builder `scripts/blender_head_body.py`. The display includes the upper rim, taper toward this pier's own column profile, and a shortened column connection. P-1091 retains its previously approved detailed head/body preview. Where no column profile exists, the lower volume remains an extruded head envelope rather than inventing a column shape.

The lower depth is calculated as Top of Pier minus (Top of Pile Cap + column height) when all controlling levels/height are available and the result is plausible. Otherwise a proportional display depth is used and marked schematic. Rim thickness and taper surfaces outside the approved prototype are review geometry, not PDF-verified concrete details. This status appears on the image. Full column height is not displayed.

Top survey points, N/E coordinates, point elevations, island rises, bearing offsets, the 30 mm per-edge plinth enlargement, and print dimensions are preserved. P-1094's high-side step is shown as a solid volume down to the underlying head, not a floating plane. No pile-cap model thickness changes are included.

The complete body geometry participates in template hashing and runtime image guards. A changed column profile or controlling height therefore invalidates the prior image. Saved Blender scenes are checked for actual underside depth, point locations and camera-visible leaders. The coverage remains 367 Head views and 364 Bearing views including P-1091; missing source records remain listed in `structural-blender-coverage.md`.
