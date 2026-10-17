# Central Island in Bearing Plinth Blender views - 2026-10-17

Bearing Plinth views now include the central raised Island surfaces from the same pier's Pier Head model. The shared `islandsFor` contract includes plan corners, base level, top rise and incomplete-data status. The app compares this entire contract before selecting a render. P-1091 retains its approved model, which already contains both the low and high central Islands.

The new batch uses separate blue-grey Island material, concrete head material and gold plinths. Camera fitting includes all Island vertices. Plinth top coordinates/elevations are unchanged, as is the 30 mm outward expansion on each edge. Where a plinth is supported by a modeled Island, its visible base can start at that surface without changing its top design level.

Special transition Islands are split at the head level joint and retain each side's existing rise. P-1094 uses +0.317 / +0.917 relative to Top of Pier. The existing P-1092 live-data render variant is also supported in the Bearing view, so the live +0.439 Island and the embedded fallback are matched to the active data, not interchanged. P-1091's reversed head/bearing CH convention is converted only for display.

The same validation is used in Head and Bearing geometry: complete consecutive four-point T groups, distinct corners, nonzero area and a closed parallelogram within the source rounding tolerance. Actual valid corners are used, including skew, rather than expanding them to an axis-aligned bounding box. Invalid or incomplete groups are omitted and explicitly marked as incomplete. No survey coordinates or elevations are repaired by this visualization change.

Incomplete groups currently occur in P-966, P-976R, P-977R, P-989R, the main `P-1108 ` record, P-1108R, P-1120L, P-1120R and P-1121R. Most retain three valid Island groups. The main P-1108 and P-1120L/R cannot currently produce a verified Island footprint/height. In particular P-1120L/R contain duplicate/malformed source corners; these are not turned into a large false Island that intersects bearing tops. The controlling source drawing/data needs reconciliation for these groups.

Coverage of Bearing views remains 364 prepared pier entries including P-1091. Other missing bearing source records remain in the per-pier coverage inventory. Saved-model checks compare Island min/max Z and plan bounds, bearing survey controls and full camera visibility. Browser QA covers live data selection and actual print layouts.
