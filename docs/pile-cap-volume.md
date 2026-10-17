# Pile Cap Blender volume - 2026-10-17

User requested the same volumetric improvement for every prepared Pile Cap. Coverage is 378 pier entries including the approved P-1091 prototype. Six source records remain missing geometry, as listed in the per-pier inventory.

The review model now extrudes each pier's own cap boundary below the unchanged top datum. Column footprint and all survey/pile-axis point labels remain on the top face. When the source pile specification explicitly contains a diameter in mm followed by DIA, projected pile circles use that diameter. No pile length, cutoff position, concrete embedment or reinforcement is inferred.

Outside P-1091, cap thickness is not yet verified from controlling sections. The display depth is 20% of the smaller local cap extent, bounded to 0.600-2.500 m, and is explicitly marked `schematic` in the image and model metadata. It is not a design elevation or quantity. P-1091 retains its PDF-verified 2.500 m thickness and existing detailed preview. No thickness is copied from P-1091 to other piers.

The schematic volume affects visualization only. CH/OS, N/E, top elevation, table rows and CSV values are preserved. Runtime image guards include the complete volume and pile-circle geometry. The calculated Canvas fallback also displays a labelled schematic volume when a Blender snapshot is unavailable.

The same 900 x 480 display and print frame are retained. Camera fitting uses the complete projected solid bounds with space for leader labels. Checks cover all snapshots, saved-mesh thickness, camera bounds, unchanged point locations, the representative actual UI and printDoc workflow, and the deployed website.
